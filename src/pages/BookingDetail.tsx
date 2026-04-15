import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, DollarSign, MapPin, User, RefreshCcw, Pause, Play, Ban, XCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import './BookingDetail.css';

const BookingDetail: React.FC = () => {
  const navigate = useNavigate();
  // const { id } = useParams();

  // Financial State
  const basePrice = 120;
  const soloFeePercent = 15;
  const stripeFee = 3.78; // Fixed for demo

  const soloFeeAmount = (basePrice * soloFeePercent) / 100;
  const netPayout = basePrice - soloFeeAmount - stripeFee;

  // Status State
  const [bookingStatus, setBookingStatus] = useState('Accepted');
  const [paymentStatus, setPaymentStatus] = useState('In Escrow');
  const [notes, setNotes] = useState('Customer prefers morning sessions.');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'warning' | 'danger' | 'info'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalIcon, setModalIcon] = useState<React.ReactNode>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const openConfirmation = (title: string, desc: string, type: 'success' | 'warning' | 'danger' | 'info', action: () => void, icon?: React.ReactNode) => {
    setModalTitle(title);
    setModalDescription(desc);
    setModalType(type);
    setModalIcon(icon || null);
    setPendingAction(() => action);
    setIsModalOpen(true);
  };

  const handleAction = (newPaymentStatus: string, title: string, desc: string, type: 'success' | 'warning' | 'danger' | 'info', icon?: React.ReactNode) => {
    openConfirmation(title, desc, type, () => {
      setPaymentStatus(newPaymentStatus);
      setIsModalOpen(false);
    }, icon);
  };

  const handleStatusUpdate = () => {
    if (bookingStatus === 'In Dispute') {
      openConfirmation(
        'Mark as In Dispute',
        'Please provide a reason for marking this service as in dispute. This will pause the payout and restrict actions for both customer and professional.',
        'danger',
        () => setIsModalOpen(false),
        <XCircle size={24} />
      );
    } else {
      openConfirmation('Update Status', 'Record status updated successfully.', 'success', () => setIsModalOpen(false));
    }
  };

  return (
    <div>
      <div className="detail-header">
        <div className="flex items-center gap-4">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <span className="detail-title">Booking Detail</span>
        </div>
      </div>

      <div className="booking-detail-card">
        <div className="booking-header-row">
          <div className="booking-header-main">
            <div className="booking-id-row">
              <div className="booking-id">#BK1001</div>
              <div className="booking-badges">
                <span className={`booking-badge badge-${bookingStatus.toLowerCase().replace(' ', '-')}`}>{bookingStatus}</span>
                <span className={`payment-badge badge-${paymentStatus.toLowerCase().replace(' ', '-')}`}>{paymentStatus}</span>
              </div>
            </div>
            <div className="booking-service-title">Personal Training Session</div>
            <div className="booking-service-desc">1-on-1 training session focusing on strength and cardio</div>
          </div>
        </div>

        <div className="booking-points-grid">
          <div className="point-item"><Calendar size={16} /> Date: <span>April 05</span></div>
          <div className="point-item"><Clock size={16} /> Time: <span>10:00 AM</span></div>
          <div className="point-item"><DollarSign size={16} /> Price: <span>€{basePrice.toFixed(2)}</span></div>
          <div className="point-item"><MapPin size={16} /> Location: <span>Customer Site</span></div>
        </div>

      <div className="address-section green-bg mt-4">
        <div className="address-label">Address</div>
        <div className="address-text">123 Main St, Dublin, Ireland.</div>
      </div>
      </div>

      <div className="customer-notes-card mt-0 mb-4">
        <div className="notes-label">Customer Notes:</div>
        <div className="notes-text">Please bring yoga mat</div>
      </div>

      <div className="detail-two-col">
        <div className="detail-card">
          <div className="card-title">Participants</div>
          <div className="participants-grid">
            <div className="participant-box">
              <div className="person-avatar-box"><User size={20} /></div>
              <div className="person-info">
                <div className="text-muted text-xs">Customer</div>
                <div className="person-name">John Anderson</div>
                <div className="person-contact">john@email.com</div>
                <div className="person-contact">+1 234 567 8901</div>
              </div>
            </div>
            <div className="participant-box">
              <div className="person-avatar-box prof"><User size={20} /></div>
              <div className="person-info">
                <div className="text-muted text-xs">Professional</div>
                <div className="person-name">Sarah Mitchell</div>
                <div className="person-contact">sarah@email.com</div>
                <div className="person-contact">+1 234 567 8902</div>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="card-title">Payment Breakdown</div>
          <div className="payment-stack">
            <div className="payment-row">
              <span className="text-muted">Service Price</span>
              <span className="payment-value">€{basePrice.toFixed(2)}</span>
            </div>
            <div className="divider-light"></div>
            <div className="payment-row highlight">
              <span className="text-muted">Solo Fee (10%)</span>
              <span className="payment-value">-€{soloFeeAmount.toFixed(2)}</span>
            </div>
            <div className="payment-row highlight">
              <span className="text-muted">Stripe Fee</span>
              <span className="payment-value">-€{stripeFee.toFixed(2)}</span>
            </div>
            <div className="divider-light"></div>
            <div className="payment-row total text-success">
              <span className="text-muted">Net to Professional</span>
              <span className="payment-value font-bold">€{netPayout.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-card full-width mb-6">
        <div className="card-title">Admin Notes</div>
        <textarea 
          className="notes-textarea" 
          placeholder="Add internal notes about this booking..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <button className="btn btn-primary" onClick={() => openConfirmation('Save Notes', 'Administrative notes updated successfully.', 'success', () => setIsModalOpen(false))}>Save Notes</button>
        </div>
      </div>

      <div className="detail-card full-width admin-actions-section">
        <div className="management-section">
          <div>
            <span className="action-group-title">Booking Lifecycle Management</span>
            <div className="status-update-controls">
              <div className="dropdown-with-label">
                <label>Update Booking Status <span>*</span></label>
                <select className="form-input" value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)}>
                  <option>Requested</option>
                  <option>Accepted</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                  <option>Declined</option>
                  <option>In Dispute</option>
                  <option>No Show-Customer</option>
                  <option>No Show-Professional</option>
                </select>
              </div>
              <button className="btn btn-primary btn-success" onClick={handleStatusUpdate}>Update Status</button>
            </div>
          </div>

          <div className="divider-light" style={{ margin: '8px 0' }}></div>

          <div>
            <span className="card-title text-sm block mb-4">Financial & Escrow Controls</span>
            <div className="payment-actions-grid outline-buttons">
              <button className="action-card-btn btn-outline-refund" onClick={() => handleAction('Refunded', 'Initiate Refund', 'Processing customer refund...', 'danger', <RefreshCcw size={24} />)}>
                <RefreshCcw size={16} />
                <span>Initiate Refund</span>
              </button>
              <button className="action-card-btn btn-outline-hold" onClick={() => handleAction('On Hold', 'Hold Payout', 'Payout placed on hold.', 'warning', <Pause size={24} />)}>
                <Pause size={16} style={{transform: 'rotate(90deg)'}} />
                <span>Hold Payout</span>
              </button>
              <button className="action-card-btn btn-outline-release" onClick={() => handleAction('Paid Out', 'Release Payout', 'Releasing funds to professional...', 'success', <Play size={24} />)}>
                <Play size={16} />
                <span>Release Payout</span>
              </button>
              <button className="action-card-btn btn-outline-stop" onClick={() => handleAction('In Escrow', 'Stop Refund', 'Refund process halted.', 'warning', <RotateCcw size={24} />)}>
                <Ban size={16} />
                <span>Stop Refund</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={pendingAction || (() => {})}
        title={modalTitle}
        description={modalDescription}
        confirmText="Confirm"
        type={modalType}
        icon={modalIcon}
      >
        {modalTitle === 'Mark as In Dispute' && (
          <div>
            <label className="modal-label">Reason</label>
            <textarea 
              className="modal-textarea" 
              placeholder="Enter dispute reason (e.g., service quality issue, payment concern, no-show conflict)"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
          </div>
        )}
      </Modal>
      <div style={{height: 60}}></div>
    </div>
  );
};

export default BookingDetail;
