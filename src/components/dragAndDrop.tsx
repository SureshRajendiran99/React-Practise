import { useState, useRef } from 'react';

type ItemType = {
    [key: string]: string[];
}

const DragItem = ({ items, setItems }: { items: ItemType, setItems: Function}) => {
  const dragItemRef = useRef<any>({});

  return Object.keys(items).map((title) => (
    <div
      key={title}
      style={{ border: '1px solid black', height: '300px', width: '250px', background: '#e5e7eb', display: 'flex', flexDirection: 'column'}}
      onDrop={() => {
        const updatedItems = { ...items };
        updatedItems[dragItemRef.current.name] = updatedItems[
          dragItemRef.current.name
        ].filter((value) => value !== dragItemRef.current.value);

        updatedItems[title].push(dragItemRef.current.value);
        setItems(updatedItems);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div style={{ padding: '6px', borderBottom: '1px solid #cbd5e1', fontWeight: 600, textAlign: 'center' }}>
        {title}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '8px',
        }}
      >
        {items[title].map((item, i) => (
          <div
            key={i}
            style={{
              padding: '4px',
              margin: '4px',
              border: '1px solid',
              cursor: 'move',
              background: 'white',
            }}
            draggable={true}
            onDragStart={(e: any) => {
              dragItemRef.current.name = title;
              dragItemRef.current.value = item;
              e.target.style.opacity = '0.5';
            }}
            onDragEnd={(e: any) => {
              e.target.style.opacity = '1';
            }}
          >
            {' '}
            {item}{' '}
          </div>
        ))}
      </div>
    </div>
  ));
};

export const DragAndDrop = () => {
  const [items, setItems] = useState<ItemType>({
    'Todo': [
      'Design UI Mockups',
      'Test the environment',
      'Excercise',
      'DSA Revision',
    ],
    'In Progress': ['HLD Design', 'LLD Design', 'Machine Code'],
    'Completed': ['New Leraning', 'Landed in 2026'],
  });
  return (
    <div
      style={{ display: 'flex', gap: '12px', justifyContent: 'space-around' }}
    >
      <DragItem items={items} setItems={setItems} />
    </div>
  );
}
