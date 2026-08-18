import { useEffect, useState } from 'react';
import { Check, X, ShoppingCart, Trash2, AlertCircle, XCircle } from 'lucide-react';
import '../styles/toast.css';

export default function Toast({ message, type = 'success', image, onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 400);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 400);
  };

  const config = {
    success: {
      icon: <ShoppingCart size={18} />,
      accent: '#10b981',
      label: 'Added to cart',
    },
    signup: {
      icon: <Check size={18} strokeWidth={3} />,
      accent: '#22c55e',
      label: 'Account Created',
    },
    remove: {
      icon: <Trash2 size={18} />,
      accent: '#ef4444',
      label: 'Removed from cart',
    },
    error: {
      icon: <AlertCircle size={18} />,
      accent: '#ef4444',
      label: 'Error',
    },
    cancelled: {
      icon: <X size={18} />,
      accent: '#f59e0b',
      label: 'Payment Cancelled',
    },
    info: {
      icon: <Check size={18} />,
      accent: '#EAB308',
      label: 'Notice',
    },
    payment_failed: {
      icon: <XCircle size={18} />,
      accent: '#ef4444',
      label: 'Payment Unsuccessful',
    },
  };

  const c = config[type] || config.success;

  return (
    <div
      className={`ae-toast ${exiting ? 'ae-toast-exit' : ''}`}
      style={{ '--toast-accent': c.accent }}
    >
      <div className="ae-toast-progress" style={{ background: c.accent }} />

      {image && (
        <div className="ae-toast-img">
          <img src={image} alt="" />
        </div>
      )}

      <div className="ae-toast-icon" style={{ background: `${c.accent}18`, color: c.accent }}>
        {c.icon}
      </div>

      <div className="ae-toast-body">
        <span className="ae-toast-label">{c.label}</span>
        <span className="ae-toast-msg">{message}</span>
      </div>

      <button className="ae-toast-close" onClick={handleClose} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
