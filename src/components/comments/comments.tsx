import {
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
} from 'react';
import './comments.css';

/** =========================
 *  Types
 *  ========================= */
type CommentID = number;
const ROOT = 'root' as const;
type ParentKey = CommentID | typeof ROOT;

interface CommentEntity {
  id: CommentID;
  user: string;
  text: string;
  time: string;
  parentId: CommentID | null;
}

interface NormalizedState {
  byId: Record<CommentID, CommentEntity>;
  childrenById: Record<ParentKey, CommentID[]>;
  rootIds: CommentID[];
}

interface NormalizedWithMax extends NormalizedState {
  maxId: number;
}

/** =========================
 *  Sample nested data (your config)
 *  ========================= */
const nestedConfig: Array<{
  id: number;
  user: string;
  text: string;
  time: string;
  replies: any[];
}> = [
  {
    id: 1,
    user: 'John Doe',
    text: 'This is the first comment.',
    time: '2 hours ago',
    replies: [
      {
        id: 2,
        user: 'Priya',
        text: 'Thanks! This helped me a lot.',
        time: '1 hour ago',
        replies: [],
      },
    ],
  },
  {
    id: 3,
    user: 'Alex',
    text: 'Great explanation!',
    time: '3 hours ago',
    replies: [
      {
        id: 4,
        user: 'Sam',
        text: 'Agreed, very helpful.',
        time: '2 hours ago',
        replies: [
          {
            id: 5,
            user: 'Kavya',
            text: 'I also found this useful.',
            time: '1 hour ago',
            replies: [],
          },
        ],
      },
    ],
  },
];

/** =========================
 *  Normalization
 *  ========================= */
function normalizeComments(nested: typeof nestedConfig): NormalizedWithMax {
  const byId: NormalizedState['byId'] = {};
  const childrenById: NormalizedState['childrenById'] = { [ROOT]: [] };
  let maxId = 0;

  const visit = (list: typeof nestedConfig, parentId: CommentID | null = null) => {
    for (const node of list) {
      const { id, user, text, time, replies = [] } = node;

      byId[id] = { id, user, text, time, parentId };
      const parentKey: ParentKey = parentId === null ? ROOT : parentId;

      if (!childrenById[parentKey]) childrenById[parentKey] = [];
      childrenById[parentKey].push(id);

      maxId = Math.max(maxId, id);
      if (replies.length) visit(replies as any, id);
    }
  };

  visit(nested, null);
  const rootIds = childrenById[ROOT] || [];
  return { byId, childrenById, rootIds, maxId };
}

/** =========================
 *  Immutable update helpers
 *  ========================= */
function addRootComment(state: NormalizedState, newComment: CommentEntity): NormalizedState {
  const { id } = newComment;
  return {
    byId: { ...state.byId, [id]: { ...newComment, parentId: null } },
    childrenById: {
      ...state.childrenById,
      [ROOT]: [...(state.childrenById[ROOT] || []), id],
    },
    rootIds: [...state.rootIds, id],
  };
}

function addReplyComment(
  state: NormalizedState,
  parentId: CommentID,
  newComment: CommentEntity
): NormalizedState {
  const { id } = newComment;
  return {
    byId: { ...state.byId, [id]: { ...newComment, parentId } },
    childrenById: {
      ...state.childrenById,
      [parentId]: [...(state.childrenById[parentId] || []), id],
    },
    rootIds: state.rootIds,
  };
}

function updateCommentText(
  state: NormalizedState,
  id: CommentID,
  newText: string
): NormalizedState {
  const target = state.byId[id];
  if (!target) return state;
  return {
    ...state,
    byId: { ...state.byId, [id]: { ...target, text: newText } },
  };
}

function collectSubtreeIds(state: NormalizedState, id: CommentID): CommentID[] {
  const acc: CommentID[] = [];
  const walk = (nodeId: CommentID) => {
    acc.push(nodeId);
    const kids = state.childrenById[nodeId] || [];
    kids.forEach(walk);
  };
  walk(id);
  return acc;
}

function deleteSubtree(state: NormalizedState, id: CommentID): {
  nextState: NormalizedState;
  deletedIds: CommentID[];
} {
  const toDelete = collectSubtreeIds(state, id);

  const byId: NormalizedState['byId'] = { ...state.byId };
  const childrenById: NormalizedState['childrenById'] = { ...state.childrenById };

  // Remove descendants & their children lists
  toDelete.forEach((n) => {
    delete byId[n];
    delete childrenById[n];
  });

  const parentId = state.byId[id]?.parentId ?? null;
  const parentKey: ParentKey = parentId === null ? ROOT : parentId;

  // Remove this id from its parent's children
  if (parentKey in childrenById) {
    childrenById[parentKey] = (childrenById[parentKey] || []).filter((c) => c !== id);
  }

  // Update rootIds if a root is deleted
  const rootIds =
    parentId === null ? state.rootIds.filter((r) => r !== id) : state.rootIds;

  return { nextState: { byId, childrenById, rootIds }, deletedIds: toDelete };
}

/** =========================
 *  Components
 *  ========================= */
interface CommentNodeProps {
  id: CommentID;
  byId: NormalizedState['byId'];
  childrenById: NormalizedState['childrenById'];
  depth?: number;
  onAddReply: (parentId: CommentID, payload: { user: string; text: string; time?: string }) => void;
  onEdit: (id: CommentID, newText: string) => void;
  onDelete: (id: CommentID) => void;
  expandedById: Record<CommentID, boolean>;
  onToggleExpand: (id: CommentID) => void;
  currentUser?: string;
}

const CommentNode = memo(function CommentNode({
  id,
  byId,
  childrenById,
  depth = 0,
  onAddReply,
  onEdit,
  onDelete,
  expandedById,
  onToggleExpand,
  currentUser = 'You',
}: CommentNodeProps) {
  const c = byId[id];
  const childIds = childrenById[id] || [];
  const hasChildren = childIds.length > 0;

  // default expanded unless explicitly false
  const isExpanded = expandedById[id] ?? true;

  // Local UI state per node
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(c.text);

  // Keep edit text in sync if original changes externally
  useEffect(() => {
    if (!isEditing) setEditText(c.text);
  }, [c.text, isEditing]);

  const handleSubmitReply = () => {
    const text = replyText.trim();
    if (!text) return;
    onAddReply(id, {
      user: currentUser,
      text,
      time: 'just now',
    });
    setReplyText('');
    setIsReplying(false);
  };

  const handleSaveEdit = () => {
    const text = editText.trim();
    if (!text || text === c.text) {
      setIsEditing(false);
      return;
    }
    onEdit(id, text);
    setIsEditing(false);
  };

  return (
    <div className="comment" style={{ marginLeft: depth * 16 }}>
      <div className="comment__header">
        {/* Disclosure / toggle replies */}
        {hasChildren ? (
          <button
            className="disclosure"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse replies' : 'Expand replies'}
            onClick={() => onToggleExpand(id)}
            title={isExpanded ? 'Collapse replies' : 'Expand replies'}
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="disclosure--placeholder" />
        )}

        <strong className="comment__user">{c.user}</strong>
        <span className="comment__time">{c.time}</span>

        {hasChildren && (
          <span className="comment__meta">
            {isExpanded
              ? `${childIds.length} repl${childIds.length > 1 ? 'ies' : 'y'}`
              : 'replies hidden'}
          </span>
        )}
      </div>

      <div className="comment__text">
        {isEditing ? (
          <>
            <textarea
              className="comment__input"
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div className="comment__actions">
              <button className="btn btn--primary" onClick={handleSaveEdit}>
                Save
              </button>
              <button className="btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>{c.text}</>
        )}
      </div>

      {!isEditing && (
        <div className="comment__toolbar">
          <button className="link" onClick={() => setIsReplying((v) => !v)}>
            {isReplying ? 'Cancel reply' : 'Reply'}
          </button>
          <button className="link" onClick={() => setIsEditing(true)}>
            Edit
          </button>
          <button className="link link--danger" onClick={() => onDelete(id)}>
            Delete
          </button>
        </div>
      )}

      {isReplying && (
        <div className="comment__replybox">
          <textarea
            className="comment__input"
            rows={3}
            placeholder="Write a reply…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="comment__actions">
            <button className="btn btn--primary" onClick={handleSubmitReply}>
              Submit reply
            </button>
            <button className="btn" onClick={() => setIsReplying(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Render replies if expanded */}
      {hasChildren && isExpanded && (
        <div className="comment__children">
          {childIds.map((childId) => (
            <CommentNode
              key={childId}
              id={childId}
              byId={byId}
              childrenById={childrenById}
              depth={depth + 1}
              onAddReply={onAddReply}
              onEdit={onEdit}
              onDelete={onDelete}
              expandedById={expandedById}
              onToggleExpand={onToggleExpand}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
});

interface CommentsTreeProps {
  data: NormalizedState | null;
  onAddReply: (parentId: CommentID, payload: { user: string; text: string; time?: string }) => void;
  onEdit: (id: CommentID, newText: string) => void;
  onDelete: (id: CommentID) => void;
  expandedById: Record<CommentID, boolean>;
  onToggleExpand: (id: CommentID) => void;
  currentUser: string;
}

const CommentsTree = memo(function CommentsTree({
  data,
  onAddReply,
  onEdit,
  onDelete,
  expandedById,
  onToggleExpand,
  currentUser,
}: CommentsTreeProps) {
  if (!data) return null;
  const { byId, childrenById, rootIds } = data;

  return (
    <section className="comments">
      {rootIds.map((rootId) => (
        <CommentNode
          key={rootId}
          id={rootId}
          byId={byId}
          childrenById={childrenById}
          depth={0}
          onAddReply={onAddReply}
          onEdit={onEdit}
          onDelete={onDelete}
          expandedById={expandedById}
          onToggleExpand={onToggleExpand}
          currentUser={currentUser}
        />
      ))}
    </section>
  );
});

export const Comments = () => {
  const [data, setData] = useState<NormalizedState | null>(null);
  const [rootText, setRootText] = useState<string>('');
  const [expandedById, setExpandedById] = useState<Record<CommentID, boolean>>({});
  const currentUser = 'You';

  // auto-increment id
  const nextIdRef = useRef<number>(1);

  useEffect(() => {
    const normalized = normalizeComments(nestedConfig);
    setData({
      byId: normalized.byId,
      childrenById: normalized.childrenById,
      rootIds: normalized.rootIds,
    });
    nextIdRef.current = normalized.maxId + 1;

    // Start expanded for all existing nodes
    const expandAll: Record<CommentID, boolean> = {};
    Object.keys(normalized.byId).forEach((id) => {
      expandAll[Number(id)] = true;
    });
    setExpandedById(expandAll);
  }, []);

  /** Expand/Collapse all */
  const handleExpandAll = useCallback(() => {
    if (!data) return;
    const map: Record<CommentID, boolean> = {};
    Object.keys(data.byId).forEach((id) => (map[Number(id)] = true));
    setExpandedById(map);
  }, [data]);

  const handleCollapseAll = useCallback(() => {
    if (!data) return;
    const map: Record<CommentID, boolean> = {};
    Object.keys(data.byId).forEach((id) => (map[Number(id)] = false));
    setExpandedById(map);
  }, [data]);

  /** Add a new root comment */
  const handleAddRoot = useCallback(() => {
    const text = rootText.trim();
    if (!text || !data) return;

    const id = nextIdRef.current++;
    const newComment: CommentEntity = {
      id,
      user: currentUser,
      text,
      time: 'just now',
      parentId: null,
    };

    setData((prev) => (prev ? addRootComment(prev, newComment) : prev));
    setExpandedById((prev) => ({ ...prev, [id]: true }));
    setRootText('');
  }, [rootText, data, currentUser]);

  /** Add reply to a comment */
  const handleAddReply = useCallback(
    (parentId: CommentID, payload: { user: string; text: string; time?: string }) => {
      if (!data) return;
      const id = nextIdRef.current++;
      const newComment: CommentEntity = {
        id,
        user: payload.user,
        text: payload.text,
        time: payload.time || 'just now',
        parentId,
      };

      setData((prev) => (prev ? addReplyComment(prev, parentId, newComment) : prev));
      // Ensure visibility
      setExpandedById((prev) => ({ ...prev, [parentId]: true, [id]: true }));
    },
    [data]
  );

  /** Edit */
  const handleEdit = useCallback((id: CommentID, newText: string) => {
    setData((prev) => (prev ? updateCommentText(prev, id, newText) : prev));
  }, []);

  /** Delete subtree */
  const handleDelete = useCallback((id: CommentID) => {
    setData((prev) => {
      if (!prev) return prev;
      const { nextState, deletedIds } = deleteSubtree(prev, id);
      setExpandedById((prevMap) => {
        const copy = { ...prevMap };
        deletedIds.forEach((d) => delete copy[d]);
        return copy;
      });
      return nextState;
    });
  }, []);

  /** Toggle a single node */
  const handleToggleExpand = useCallback((id: CommentID) => {
    setExpandedById((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  }, []);

  return (
    <div className="app">
      <h4 className="title">Comments</h4>

      {/* Expand/Collapse all controls */}
      <div className="controls">
        <button className="btn" onClick={handleExpandAll}>Expand all</button>
        <button className="btn" onClick={handleCollapseAll}>Collapse all</button>
      </div>

      {/* New root comment form */}
      <div className="composer">
        <textarea
          className="textarea"
          rows={4}
          placeholder="Write a comment…"
          value={rootText}
          onChange={(e) => setRootText(e.target.value)}
        />
        <div className="composer__actions">
          <button
            className="btn btn--primary"
            onClick={handleAddRoot}
            disabled={!rootText.trim()}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Thread */}
      <CommentsTree
        data={data}
        onAddReply={handleAddReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
        expandedById={expandedById}
        onToggleExpand={handleToggleExpand}
        currentUser="You"
      />
    </div>
  );
}