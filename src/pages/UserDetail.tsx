import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Calendar, Mail, MapPin, Briefcase, Phone, Medal, MoreVertical, Play, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import './UserDetail.css';

const UserDetail: React.FC = () => {
  const navigate = useNavigate();
  
  // Local state for demo purposes
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Pending');
  const [isVerified, setIsVerified] = useState(false);
  
  // Modal states
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

  const handleSaveNotes = () => {
    if (!notes.trim()) {
      alert('Please enter some notes first.');
      return;
    }
    openModal(
      'success',
      'Notes Saved',
      'The admin notes have been successfully updated for this user.',
      'Dismiss',
      () => setIsModalOpen(false)
    );
  };

  const handleMarkAsVerified = () => {
    openModal(
      'success',
      'Approve Application',
      "Are you sure you want to approve Sara Ali's verification application? They will receive a verified badge and can start accepting bookings.",
      'Approve',
      () => {
        setIsVerified(true);
        setStatus('Active');
        setIsModalOpen(false);
      }
    );
  };

  const handleDeactivate = () => {
    openModal(
      'warning',
      'Deactivate Account',
      'Are you sure you want to deactivate this account? The user will no longer be able to access the platform until reactivated.',
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
      'Delete Account',
      'This action is permanent and cannot be undone. All data related to this user will be removed from the system.',
      'Delete',
      () => {
        setIsModalOpen(false);
        navigate('/users');
      }
    );
  };

  return (
    <div>
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="detail-title">User Management Detail</span>
      </div>

      <div className="detail-main-card">
        <div className="profile-top">
          <div className="profile-info">
            <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah Mitchell" className="profile-avatar" />
            <div>
              <div className="profile-name">
                Sarah Mitchell {isVerified && <CheckCircle2 size={18} className="verified-icon" />}
              </div>
              <div className="profile-role">Professional</div>
            </div>
          </div>
          <div className="profile-status">
            <span className={`badge ${status.toLowerCase()}`}>{status}</span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <Calendar size={18} className="info-icon" /> Joined 1/15/2025
          </div>
          <div className="info-item">
            <Briefcase size={18} className="info-icon" /> 12 bookings
          </div>
          <div className="info-item">
            <Mail size={18} className="info-icon" /> sara.ali@example.com
          </div>
          <div className="info-item">
            <Phone size={18} className="info-icon" /> +353 01 12345678
          </div>
          <div className="info-item">
            <Medal size={18} className="info-icon" /> 4 years experience
          </div>
          <div className="info-item">
            <MapPin size={18} className="info-icon" /> Dublin, Ireland
          </div>
        </div>

        <div className="bio-section">
          <div className="bio-title">Bio</div>
          <div className="bio-text">
            Professional bridal makeup artist with 4 years of experience. Specialized in traditional and modern bridal looks. Certified from London School of Beauty.
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">45</div>
          <div className="metric-title">Total Bookings</div>
          <div className="metric-subtitle">42 completed • <span style={{color: '#ef4444'}}>3 cancelled</span></div>
        </div>
        <div className="metric-card">
          <div className="metric-value">$3250</div>
          <div className="metric-title">Total Revenue</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">4.8</div>
          <div className="metric-title">38 reviews</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">2</div>
          <div className="metric-title">Services Offered</div>
        </div>
      </div>

      <div className="split-section">
        <div className="video-card">
          <div className="video-header">
            <span>Video Bio</span>
            <MoreVertical size={20} className="text-muted" />
          </div>
          <div className="video-placeholder">
            <img src="https://images.unsplash.com/photo-1531123897727-8f129e1ebfa8?q=80&w=800&auto=format&fit=crop" alt="Video Bio" />
            <div className="play-btn">
              <Play size={20} fill="currentColor" />
            </div>
            <div className="duration-badge">1:24</div>
          </div>
        </div>

        <div className="side-cards">
          <div className="side-card">
            <div className="side-card-title">Verification Status</div>
            <div style={{color: isVerified ? 'var(--primary)' : '#d97706', fontWeight: 600}}>
              {isVerified ? 'Verified' : 'Pending'}
            </div>
          </div>
          <div className="side-card">
            <div className="side-card-title">Services Offered</div>
            <div className="service-tags">
              <span className="service-tag">Personal Trainer</span>
              <span className="service-tag">Babysitting</span>
            </div>
          </div>
        </div>
      </div>

      <div className="documents-section">
        <div className="docs-title">Uploaded Documents (4)</div>
        <div className="docs-grid">
          <div className="doc-card">
            <div className="doc-icon-box"><FileText size={20} /></div>
            <div>
              <div className="doc-name">ID Card</div>
              <div className="doc-file">National-id.jpg</div>
            </div>
          </div>
          <div className="doc-card">
            <div className="doc-icon-box"><FileText size={20} /></div>
            <div>
              <div className="doc-name">Certificate</div>
              <div className="doc-file">makeup-certificate.pdf</div>
            </div>
          </div>
          <div className="doc-card">
            <div className="doc-icon-box"><FileText size={20} /></div>
            <div>
              <div className="doc-name">Portfolio</div>
              <div className="doc-file">bridal_work.jpg</div>
            </div>
          </div>
          <div className="doc-card">
            <div className="doc-icon-box"><FileText size={20} /></div>
            <div>
              <div className="doc-name">License</div>
              <div className="doc-file">beauty_license.jpg</div>
            </div>
          </div>
        </div>
      </div>

      <div className="notes-section">
        <div className="notes-title">Admin Notes</div>
        <textarea 
          className="notes-textarea" 
          placeholder="Add internal notes about this user..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <button className="btn btn-primary" onClick={handleSaveNotes}>Save Notes</button>
        </div>
      </div>

      <div className="actions-section">
        <div className="actions-title">Account Actions</div>
        <div className="actions-row">
          <button 
            className="btn btn-primary" 
            onClick={handleMarkAsVerified}
            disabled={isVerified}
            style={{ opacity: isVerified ? 0.6 : 1, cursor: isVerified ? 'not-allowed' : 'pointer' }}
          >
            {isVerified ? 'Already Verified' : 'Mark as Verified'}
          </button>
          <button className="btn btn-outline btn-outline-warning" onClick={handleDeactivate}>Deactivate Account</button>
          <button className="btn btn-outline btn-outline-danger" onClick={handleDelete}>Delete Account</button>
        </div>
      </div>
      <div style={{height: 40}}></div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={pendingAction || (() => {})}
        title={modalTitle}
        description={modalDescription}
        confirmText={modalConfirmText}
        type={modalType}
      />
    </div>
  );
};

export default UserDetail;
