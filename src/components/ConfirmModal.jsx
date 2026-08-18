import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';
import '../styles/confirm-modal.css';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'info' 
}) {
  if (!isOpen) return null;

  const icons = {
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />,
    danger: <Trash2 size={20} />
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-white/10 transition-all" onClick={onClose}>
              <X size={16} />
            </button>

            <div className={`modal-icon ${type}`}>
              {icons[type]}
            </div>

            <h3>{title}</h3>
            <p>{message}</p>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>
                {cancelText}
              </button>
              <button 
                className={`btn-confirm ${type === 'danger' ? 'danger' : ''}`}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
