// src/components/ui/ConfirmationModal.jsx
import Modal from './Modal';
import Button from './Button';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation", 
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmText = "Confirmer",
  isDanger = false
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ color: 'var(--txt)', marginBottom: '20px', fontSize: '15px' }}>
        {message}
      </p>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button 
          type="button" 
          variant={isDanger ? 'danger' : 'primary'} 
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}