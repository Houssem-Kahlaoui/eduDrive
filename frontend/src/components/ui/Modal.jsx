export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="mb" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card mc">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--mut)' }}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}