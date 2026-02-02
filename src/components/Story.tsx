import { useState, useEffect, useRef } from 'react';

const colors = {
  success: 'limegreen',
  error: 'red',
  warning: 'orange',
};

type StatusType = 'success' | 'error' | 'warning';
const storyDuration = 2 * 60 * 1000; // 2minutes

const Modal = ({ url, isOpen, onClose }: { url: string, isOpen: boolean, onClose: Function}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.4)',
        zIndex: 9999,
      }}
      onMouseDown={(e) => {
        // Close only if clicking the backdrop, not inside dialog
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #ccc',
          borderRadius: '6px',
          background: 'white',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <span> View Image </span>
          <span
            onClick={() => {
              setOpen(false);
              onClose();
            }}
          >
            {' '}
            X{' '}
          </span>
        </div>
        <img
          src={url}
          height="350px"
          width="450px"
          style={{ objectFit: 'contain' }}
        />{' '}
      </div>
    </div>
  );
};

const Notify = ({
  message = 'testing the content',
  type,
  isShow,
  duration = 60000,
  onCloseToast,
}: { message: string, type: StatusType , isShow: boolean, duration?: number, onCloseToast?: Function}) => {
  const [show, setShow] = useState(isShow);
  let timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!show) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setShow(false);
      onCloseToast?.();
    }, duration);

    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        margin: '20px',
        height: '40px',
        width: '250px',
        display: 'flex',
        padding: '0 12px',
        gap: '12px',
        borderRadius: '4px',
        alignItems: 'center',
        zIndex: 9999,
        background: colors[type],
        color: 'white',
      }}
    >
      {/* <span> i </span> */}
      <span style={{ flex: 1 }}> {message} </span>
      <div
        onClick={() => {
          setShow(false);
          onCloseToast?.();
        }}
      >
        {' '}
        X{' '}
      </div>
    </div>
  );
};

export const Story = () => {
  const [storyList, setStoryList] = useState<{url: string, id: number}[]>([]);
  const [selected, setSelected] = useState('');
  const [toast, setToast] = useState<any>({});

  const onUpload = (e: any) => {
    const file = e.target.files[0];

    if (!file?.type) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      return setToast({
        message: 'File format not supported. Upload jpg/jpeg',
        isShow: true,
        type: 'error',
      });
    }

    const story = {
      url: URL.createObjectURL(e.target.files[0]),
      id: Date.now(),
    };
    setStoryList((prev) => [story, ...prev]);
    setToast({
      message: 'Story uploaded successfully',
      isShow: true,
      type: 'success',
    });

    setTimeout(() => {
      setStoryList((prev) =>
        prev.filter((data) => {
          if (data.id === story.id) {
            URL.revokeObjectURL(story.url);
            setSelected((prev) => (prev === story.url ? '' : prev));
            return false;
          }

          return true;
        })
      );
    }, storyDuration);
  };

  const onClose = () => setSelected('');
  const onCloseToast = () => setToast({});

  return (
    <div
      style={{
        display: 'flex',
        cursor: 'pointer',
        gap: '12px',
      }}
    >
      <label
        style={{
          height: '50px',
          width: '50px',
          border: '3px solid red',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '26px', fontWeight: 600 }}> + </span>
        <input type="file" hidden onChange={onUpload} />
      </label>
      <div
        style={{
          display: 'flex',
          gap: '12px',
        }}
      >
        {storyList.map((data) => (
          <img
            key={data.id}
            src={data.url}
            height="50px"
            width="50px"
            style={{ border: '3px solid red', borderRadius: '50%' }}
            onClick={() => setSelected(data.url)}
          />
        ))}
      </div>
      {selected && <Modal url={selected} onClose={onClose} isOpen={true} />}
      {toast.isShow && <Notify {...toast} onCloseToast={onCloseToast} />}
    </div>
  );
}
