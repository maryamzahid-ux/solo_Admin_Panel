import React from 'react';
import { CheckCircle2, AlertTriangle, Trash2, XCircle, RefreshCcw, Pause, Play, RotateCcw } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText,
  type = 'success',
  icon,
  children
}) => {
  if (!isOpen) return null;

  const getDefaultIcon = () => {
    switch (type) {
      case 'danger': return <XCircle size={24} />;
      case 'warning': return <Pause size={24} />;
      case 'success': return <Play size={24} />;
      case 'info': return <RefreshCcw size={24} />;
      default: return <CheckCircle2 size={24} />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-icon-container">
          <div className={`modal-pulse-circle ${type}`}>
            <div className="modal-pulse-inner">
              {icon || getDefaultIcon()}
            </div>
          </div>
        </div>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-description">{description}</p>
        
        {children && <div className="modal-custom-content">{children}</div>}

        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className={`modal-btn modal-btn-confirm ${type}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
