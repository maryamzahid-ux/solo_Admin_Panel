import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import './UserDetail.css';

const CustomerDetail: React.FC = () => {
  const navigate = useNavigate();
  
  // Local state for demo purposes
  const [status, setStatus] = useState('Active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'warning' | 'danger'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalConfirmText, setModalConfirmText] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const openModal = (
    type: 'success' | 'warning' | 'danger', 
    title: string, 
    desc: string, 
    confirm: string, 
    action: () => void
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalDescription(desc);
    setModalConfirmText(confirm);
    setPendingAction(() => action);
    setIsModalOpen(true);
  };

  const handleDeactivate = () => {
    openModal(
      'warning',
      'Deactivate Customer Account',
      'Are you sure you want to deactivate this account? The customer will no longer be able to book services until reactivated.',
      'Deactivate',
      () => {
        setStatus('Inactive');
        setIsModalOpen(false);
      }
    );
  };

  const handleDelete = () => {
    openModal(
      'danger',
      'Delete Customer Account',
      'This action is permanent and cannot be undone. All booking history and personal data for this customer will be removed.',
      'Delete',
      () => {
        setIsModalOpen(false);
        navigate('/users');
      }
    );
  };

  return (
    <div className="customer-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="detail-title">Customer Detail</span>
      </div>

      <div className="detail-main-card">
        <div className="profile-top">
          <div className="profile-info">
            <img src="https://i.pravatar.cc/150?u=john" alt="John Anderson" className="profile-avatar" />
            <div>
              <div className="profile-name">John Anderson</div>
              <div className="user-role role-customer">Customer</div>
            </div>
          </div>
          <div className="profile-status">
            <span className={`badge ${status.toLowerCase()}`}>{status}</span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <Mail size={18} className="info-icon" /> john.anderson@email.com
          </div>
          <div className="info-item">
            <Phone size={18} className="info-icon" /> +353 01 12345678
          </div>
          <div className="info-item">
            <Calendar size={18} className="info-icon" /> Joined 1/15/2025
          </div>
          <div className="info-item">
            <Briefcase size={18} className="info-icon" /> 2 Services Availed
          </div>
        </div>
      </div>

      <div className="split-section">
        <div className="side-card">
          <div className="side-card-title">Services Chosen (Interests)</div>
          <div className="service-tags">
            <span className="service-tag">Personal Training</span>
            <span className="service-tag">Physiotherapy</span>
            <span className="service-tag">Yoga</span>
            <span className="service-tag">Nutritionist</span>
          </div>
        </div>
        
        <div className="side-card">
          <div className="side-card-title">Services Availed (History)</div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-2 border-bottom">
              <div>
                <div className="font-semibold text-sm">Personal Training</div>
                <div className="text-muted text-xs">Professional: Sarah Mitchell</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold">April 05, 2025</div>
                <div style={{ color: 'var(--primary)' }}>Completed</div>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-bottom">
              <div>
                <div className="font-semibold text-sm">Yoga Session</div>
                <div className="text-muted text-xs">Professional: Lisa Rodriguez</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold">March 28, 2025</div>
                <div style={{ color: 'var(--primary)' }}>Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="actions-section">
        <div className="actions-title">Account Actions</div>
        <div className="actions-row">
          <button className="btn btn-outline btn-outline-warning" onClick={handleDeactivate}>Deactivate Account</button>
          <button className="btn btn-outline btn-outline-danger" onClick={handleDelete}>Delete Account</button>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={pendingAction || (() => {})}
        title={modalTitle}
        description={modalDescription}
        confirmText={modalConfirmText}
        type={modalType}
      />
      <div style={{ height: 40 }}></div>
    </div>
  );
};

export default CustomerDetail;

