import { useState } from 'react';
import { fileData } from '../data/dummyData';

const FolderComp = ({ data, activeIds, onClick }: any) => {
  if (!data) return;
  return data.map((file: any) => (
    <div
      key={file.id}
      style={{ paddingLeft: '16px' }}
      onClick={(e) => {
        e.stopPropagation();
        file.children?.length && onClick(file.id);
      }}
    >
      <div> {file.type === 'folder' ? '📁' : '🗒️'} {file.name} </div>
      {file.children?.length > 0 && activeIds.includes(file.id) && (
        <FolderComp
          data={file.children}
          activeIds={activeIds}
          onClick={onClick}
        />
      )}
    </div>
  ));
};

export const FileExplorer = () => {
//   const [files, setFiles] = useState(JSON.parse(JSON.stringify(fileData)));
  const [activeIds, setActiveIds] = useState<Array<string>>([]);

  const onClick = (id: string) => {
    const updated = [...activeIds];
    if (activeIds.includes(id)) {
      setActiveIds(updated.filter((data) => data !== id));
    } else {
      updated.push(id);
      setActiveIds(updated);
    }
  };

  return (
    <div
      style={{
        margin: '10px',
        padding: '10px',
      }}
    >
      <FolderComp data={fileData} activeIds={activeIds} onClick={onClick} />
    </div>
  );
}
