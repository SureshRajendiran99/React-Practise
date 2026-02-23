import { useState } from "react";

export const Modal = ({ onClose }: { onClose: Function }) => {
  const [isOpen, setIsOpen] = useState(true);

  const onClickClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) {
    return null; // Don't render the modal if it's not open
  }

  // A component to render the backdrop and modal content
  return (
    <div
      style={{
        // The modal overlay that covers the entire viewport
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark semi-transparent background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        // backdropFilter: 'blur(4px)',
      }}
    >
      {/* The actual modal content container */}
      <div
        style={{
          width: '500px',
          height: '250px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          background: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '12px' }}>
          <span>Title</span>
          <button onClick={onClickClose} style={{ cursor: 'pointer' }}>
            X
          </button>
        </div>
        <div style={{ padding: '12px', flex: 1, overflow: 'auto'}}>
            <span> testing the content Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </span>
        </div>
      </div>
    </div>
  );
};
