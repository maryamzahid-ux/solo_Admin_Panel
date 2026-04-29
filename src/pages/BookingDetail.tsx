import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Calendar, Clock, MapPin, User,
  RefreshCcw, Pause, Play, AlertTriangle,
  UserX, ShieldAlert, Wallet
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../components/Modal';
import {
  useGetBookingDetails,
  useUpdateBookingStatus,
  useUpdateBookingNote,
  useAdminPaymentAction,
  useHandleNoShow,
  useMarkInDispute
} from '../api/booking.api';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import './BookingDetail.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
const BOOKING_STATUSES = [
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'NO_SHOW', label: 'No Show' },
  { value: 'IN_DISPUTE', label: 'In Dispute' },
];

const canHold = (s: string) => ['IN_ESCROW', 'PENDING'].includes(s);
const canRelease = (s: string, bookingStatus: string) =>
  s === 'ON_HOLD' && bookingStatus !== 'IN_DISPUTE';
const canRefund = (s: string) => ['IN_ESCROW', 'ON_HOLD', 'PENDING'].includes(s);

// ─────────────────────────────────────────────────────────────────────────────

const BookingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();

  const { getBookingDetails, loading } = useGetBookingDetails();
  const { updateBookingStatus, loading: statusLoading, error: statusError } = useUpdateBookingStatus();
  const { updateBookingNote, loading: noteLoading } = useUpdateBookingNote();
  const { performPaymentAction, loading: paymentLoading, error: paymentError } = useAdminPaymentAction();
  const { handleNoShow, loading: noShowLoading, error: noShowError } = useHandleNoShow();
  const { markInDispute, loading: disputeLoading, error: disputeError } = useMarkInDispute();

  const [booking, setBooking] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState('');
  const [newNote, setNewNote] = useState('');

  // ── Generic confirm modal ─────────────────────────────────────────────────
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    desc: string;
    type: 'success' | 'warning' | 'danger' | 'info';
    icon?: React.ReactNode;
    onConfirm: () => void;
  }>({ open: false, title: '', desc: '', type: 'info', onConfirm: () => { } });

  const [activeModalType, setActiveModalType] = useState<'NONE' | 'NO_SHOW' | 'DISPUTE' | 'GENERIC'>('NONE');

  const openModal = (cfg: Omit<typeof modal, 'open'>) => {
    setModal({ ...cfg, open: true });
    setActiveModalType('GENERIC');
  };
  const closeModal = () => {
    setModal(m => ({ ...m, open: false }));
    setActiveModalType('NONE');
  };

  // Use refs for values needed in imperative modals to avoid stale closure
  const noShowPartyRef = useRef<'CUSTOMER' | 'PROFESSIONAL'>('CUSTOMER');
  const disputeReasonRef = useRef('');

  const [noShowParty, setNoShowPartyState] = useState<'CUSTOMER' | 'PROFESSIONAL'>('CUSTOMER');
  const [disputeReason, setDisputeReasonState] = useState('');

  const setNoShowParty = (val: 'CUSTOMER' | 'PROFESSIONAL') => {
    noShowPartyRef.current = val;
    setNoShowPartyState(val);
  };

  const setDisputeReason = (val: string) => {
    disputeReasonRef.current = val;
    setDisputeReasonState(val);
  };

  // ── Load booking ──────────────────────────────────────────────────────────
  useEffect(() => { if (id) fetchBooking(); }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await getBookingDetails(id!);
      if (res?.success) {
        const b = res.data.booking;
        setBooking(b);
        setBookingStatus(b.status);
        setNewNote('');
      }
    } catch (e) { console.error(e); }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleNoteSave = async () => {
    if (!id || !newNote.trim()) return;
    const res = await updateBookingNote(id, newNote);
    if (res?.success) { showToast('Note added'); fetchBooking(); }
  };

  const handleStatusUpdate = () => {
    if (bookingStatus === 'NO_SHOW') {
      openNoShowModal();
      return;
    }
    if (bookingStatus === 'IN_DISPUTE') {
      openDisputeModal();
      return;
    }

    openModal({
      title: 'Update Booking Status',
      desc: `Change status to "${BOOKING_STATUSES.find(s => s.value === bookingStatus)?.label}"?`,
      type: 'info',
      icon: <RefreshCcw size={24} />,
      onConfirm: async () => {
        const res = await updateBookingStatus(id!, bookingStatus);
        if (res?.success) {
          showToast('Status updated');
          fetchBooking();
          closeModal();
        } else {
          showToast(statusError || 'Failed to update status', 'error');
        }
      }
    });
  };

  const handlePaymentAction = (action: 'HOLD' | 'RELEASE' | 'REFUND') => {
    const cfg = {
      HOLD: { title: 'Hold Payout', desc: 'Payout will be paused and moved to On Hold.', type: 'warning' as const, icon: <Pause size={24} /> },
      RELEASE: { title: 'Release Payout', desc: 'Funds will be released and approved for the professional.', type: 'success' as const, icon: <Play size={24} /> },
      REFUND: { title: 'Initiate Refund', desc: 'A full refund will be processed to the customer.', type: 'danger' as const, icon: <RefreshCcw size={24} /> },
    }[action];

    openModal({
      ...cfg,
      onConfirm: async () => {
        const res = await performPaymentAction(id!, action);
        if (res?.success) {
          showToast(cfg.title + ' successful');
          fetchBooking();
          closeModal();
        } else {
          showToast(paymentError || 'Action failed', 'error');
        }
      }
    });
  };

  const openNoShowModal = () => {
    openModal({
      title: 'Record No-Show',
      desc: '',
      type: 'warning',
      icon: <UserX size={24} />,
      onConfirm: async () => {
        const res = await handleNoShow(id!, noShowPartyRef.current);
        if (res?.success) {
          showToast(`No-show recorded: ${noShowPartyRef.current === 'CUSTOMER' ? 'Customer' : 'Professional'}`);
          fetchBooking();
          closeModal();
        } else {
          showToast(noShowError || 'Failed to record no-show', 'error');
        }
      }
    });
    setActiveModalType('NO_SHOW');
  };

  const openDisputeModal = () => {
    setDisputeReason('');
    openModal({
      title: 'Mark as In Dispute',
      desc: 'Payout will be paused while the dispute is active.',
      type: 'danger',
      icon: <ShieldAlert size={24} />,
      onConfirm: async () => {
        const res = await markInDispute(id!, disputeReasonRef.current);
        if (res?.success) {
          showToast('Booking marked as In Dispute');
          fetchBooking();
          closeModal();
        } else {
          showToast(disputeError || 'Failed to mark in dispute', 'error');
        }
      }
    });
    setActiveModalType('DISPUTE');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading && !booking) return <Loader />;
  if (!booking) return <div className="text-center" style={{ marginTop: 100 }}>Booking not found.</div>;

  const payment = booking.payments?.[0];
  const firstSlot = booking.slots?.[0];
  const bookingDate = firstSlot?.bookingDate
    ? new Date(firstSlot.bookingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const bookingTime = firstSlot?.serviceAvailability
    ? `${firstSlot.serviceAvailability.startTime} – ${firstSlot.serviceAvailability.endTime}`
    : 'N/A';

  const currentPayStatus = payment?.status || 'PENDING';
  const isActionLoading = paymentLoading || noShowLoading || disputeLoading;


  return (
    <div>
      {/* ── Header ── */}
      <div className="detail-header">
        <div className="flex items-center gap-4">
          <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
          <span className="detail-title">Booking Detail</span>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="booking-detail-card main-glass-card">
        <div className="booking-header-row">
          <div className="booking-header-main">
            <div className="booking-id-row">
              <div className="booking-id-badge">#{booking.id.slice(-8).toUpperCase()}</div>
              <div className="booking-badges">
                <span className={`booking-badge badge-${bookingStatus.toLowerCase().replace(/_/g, '-')}`}>
                  {bookingStatus.replace(/_/g, ' ')}
                </span>
                <span className={`payment-badge badge-${currentPayStatus.toLowerCase().replace(/_/g, '-')}`}>
                  <Wallet size={11} /> {currentPayStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
            <h1 className="booking-service-title">{booking.servicesData?.service?.name || 'Service Deleted'}</h1>
            <div className="booking-service-desc">{booking.jobTitle || 'No title provided'}</div>
            {booking.cancelReason && (
              <div className="cancel-reason-pill">
                <AlertTriangle size={13} /> {booking.cancelReason}
              </div>
            )}
          </div>
        </div>

        <div className="booking-points-grid">
          <div className="point-item">
            <div className="point-icon"><Calendar size={18} /></div>
            <div className="point-content"><label>Date</label><span>{bookingDate}</span></div>
          </div>
          <div className="point-item">
            <div className="point-icon"><Clock size={18} /></div>
            <div className="point-content"><label>Time Slot</label><span>{bookingTime}</span></div>
          </div>
          <div className="point-item">
            <div className="point-icon" style={{ fontSize: '1.1rem', fontWeight: 700 }}>€</div>
            <div className="point-content"><label>Total Price</label><span>€{booking.totalPrice?.toFixed(2)}</span></div>
          </div>
          <div className="point-item">
            <div className="point-icon"><MapPin size={18} /></div>
            <div className="point-content"><label>Location</label><span>{booking.address || 'Not specified'}</span></div>
          </div>
        </div>
      </div>

      {/* ── Customer Note ── */}
      {booking.description && (
        <div className="customer-notes-card highlight-card">
          <div className="notes-header">
            <div className="notes-icon-box"><User size={16} /></div>
            <div className="notes-label">Job Required</div>
          </div>
          <div className="notes-text">{booking.description}</div>
        </div>
      )}


      {/* ── Participants + Payment Breakdown ── */}
      <div className="detail-two-col">
        <div className="detail-card glass-card">
          <div className="card-title">Participants</div>
          <div className="participants-grid">
            {[
              { role: 'Customer', data: booking.customer, cls: 'customer' },
              { role: 'Professional', data: booking.professional, cls: 'pro' }
            ].map(({ role, data, cls }) => (
              <div key={role} className={`participant-box participant-${cls}`}>
                <div className={`person-avatar-box ${cls === 'pro' ? 'pro-icon' : ''}`}>
                  {data?.avatar ? <img src={data.avatar} alt="Avatar" className="avatar-img" /> : <User size={20} />}
                </div>
                <div className="person-info">
                  <div className={`person-role-tag ${cls}`}>{role}</div>
                  <div className="person-name">
                    {data?.firstName} {data?.lastName}
                    {data?.isDeleted && <span className="deleted-tag"> (Deleted)</span>}
                    {data?.isBlocked && <span className="blocked-tag"> (Deactivated)</span>}
                  </div>
                  <div className="person-contact">{data?.email}</div>
                  <div className="person-contact">{data?.number}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-card glass-card payment-breakdown-card">
          <div className="card-title">Payment Breakdown</div>
          <div className="payment-stack">
            <div className="payment-row">
              <span className="text-muted">Service Price</span>
              <span className="payment-value">€{booking.totalPrice?.toFixed(2)}</span>
            </div>
            {payment ? (
              <>
                <div className="payment-row fee-row">
                  <span className="text-muted">Stripe Fee</span>
                  <span className="payment-value danger-text">-€{(payment.stripeFee || 0).toFixed(2)}</span>
                </div>
                <div className="payment-row fee-row" style={{ marginBottom: '8px' }}>
                  <span className="text-muted">After Stripe Fee</span>
                  <span className="payment-value">€{(payment.afterStripeFee || booking.totalPrice).toFixed(2)}</span>
                </div>
                <div className="payment-row fee-row">
                  <span className="text-muted">Platform Fee (10% of After Stripe)</span>
                  <span className="payment-value danger-text">-€{payment.platformFee?.toFixed(2)}</span>
                </div>
                <div className="divider-light total-divider" />
                <div className="payment-row total-row">
                  <span className="total-label">Net Payout</span>
                  <span className="total-value">€{payment.netAmount?.toFixed(2)}</span>
                </div>
                <div className="payment-row" style={{ marginTop: 8 }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Payment Status</span>
                  <span className={`payment-badge badge-${currentPayStatus.toLowerCase().replace(/_/g, '-')}`} style={{ fontSize: '0.72rem' }}>
                    {currentPayStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </>
            ) : (
              <div className="empty-payment-state">
                <Pause size={24} />
                <p>No payment processed for this booking yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Admin Notes ── */}
      <div className="detail-card full-width glass-card mb-6 notes-section">
        <div className="card-title">Admin Notes</div>

        {booking.adminNotes?.length > 0 && (
          <div className="notes-history" style={{ marginBottom: 24 }}>
            {booking.adminNotes
              .map((note: any) => {
                const author = note.admin
                  ? `${note.admin.firstName || ''} ${note.admin.lastName || ''}`.trim() || note.admin.email
                  : 'System';
                return (
                  <div key={note.id} className="note-item">
                    <div className="note-header">
                      <div className="note-author">{author}</div>
                      <div className="note-time">{new Date(note.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="note-content">{note.note}</div>
                  </div>
                );
              })}
          </div>
        )}

        <div className="notes-input-area" style={{
          borderTop: booking.adminNotes?.length > 0 ? '1px solid var(--border-color)' : 'none',
          paddingTop: booking.adminNotes?.length > 0 ? 24 : 0
        }}>
          <textarea
            className="notes-textarea"
            placeholder="Add internal notes about this booking..."
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-save-notes" onClick={handleNoteSave} disabled={noteLoading || !newNote.trim()}>
              {noteLoading ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Admin Actions ── */}
      <div className="admin-actions-section">
        <div className="management-section">

          {/* Status Override */}
          <div className="management-group">
            <div className="action-group-header">
              <div className="action-group-icon"><RefreshCcw size={20} /></div>
              <span className="action-group-title">Booking Status Override</span>
            </div>
            <div className="status-update-controls">
              <div className="dropdown-with-label">
                <label>Select New Status <span>*</span></label>
                <select
                  className="form-select-premium"
                  value={bookingStatus}
                  onChange={e => setBookingStatus(e.target.value)}
                >
                  {BOOKING_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={statusLoading || bookingStatus === booking.status}
              >
                <RefreshCcw size={16} />
                {statusLoading ? 'Updating…' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Financial Controls */}
          <div className="management-group">
            <div className="action-group-header">
              <div className="action-group-icon"><Wallet size={20} /></div>
              <span className="action-group-title">Financial &amp; Escrow Controls</span>
            </div>
            <div className="payment-eligibility-bar">
              <span>Current Payment State:</span>
              <span className={`payment-badge badge-${currentPayStatus.toLowerCase().replace(/_/g, '-')}`}>
                {currentPayStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="payment-actions-grid">
              <button
                className="action-card-btn btn-outline-hold"
                onClick={() => handlePaymentAction('HOLD')}
                disabled={isActionLoading || !canHold(currentPayStatus)}
                title={!canHold(currentPayStatus) ? `Cannot hold: status is ${currentPayStatus}` : ''}
              >
                <Pause size={16} />
                <span>Hold Payout</span>
              </button>
              <button
                className="action-card-btn btn-outline-release"
                onClick={() => handlePaymentAction('RELEASE')}
                disabled={isActionLoading || !canRelease(currentPayStatus, bookingStatus)}
                title={!canRelease(currentPayStatus, bookingStatus) ? 'Can only release ON_HOLD payments (not in dispute)' : ''}
              >
                <Play size={16} />
                <span>Release Payout</span>
              </button>
              <button
                className="action-card-btn btn-outline-refund"
                onClick={() => handlePaymentAction('REFUND')}
                disabled={isActionLoading || !canRefund(currentPayStatus)}
                title={!canRefund(currentPayStatus) ? `Cannot refund: status is ${currentPayStatus}` : ''}
              >
                <RefreshCcw size={16} />
                <span>Initiate Refund</span>
              </button>
            </div>
          </div>

          {/* Incident Controls */}
          <div className="management-group">
            <div className="action-group-header">
              <div className="action-group-icon"><AlertTriangle size={20} /></div>
              <span className="action-group-title">Incident Handling</span>
            </div>
            <div className="payment-actions-grid">
              <button
                className="action-card-btn btn-outline-noshow"
                onClick={openNoShowModal}
                disabled={isActionLoading || booking.status === 'NO_SHOW'}
                title={booking.status === 'NO_SHOW' ? 'Already recorded as No Show' : ''}
              >
                <UserX size={16} />
                <span>Record No-Show</span>
              </button>
              <button
                className="action-card-btn btn-outline-dispute"
                onClick={openDisputeModal}
                disabled={isActionLoading || booking.status === 'IN_DISPUTE'}
                title={booking.status === 'IN_DISPUTE' ? 'Already in dispute' : ''}
              >
                <ShieldAlert size={16} />
                <span>Mark In Dispute</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Confirm Modal ── */}
      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        description={modal.desc}
        confirmText="Confirm"
        type={modal.type}
        icon={modal.icon}
      >
        {activeModalType === 'NO_SHOW' && (
          <div className="modal-custom-content">
            <label className="modal-label">Select Party Who Failed to Attend</label>
            <div className="noshow-party-options">
              <button
                className={`noshow-party-btn ${noShowParty === 'CUSTOMER' ? 'active' : ''}`}
                onClick={() => setNoShowParty('CUSTOMER')}
              >
                <User size={16} /> Customer No-Show
                <span className="noshow-hint">No refund issued</span>
              </button>
              <button
                className={`noshow-party-btn ${noShowParty === 'PROFESSIONAL' ? 'active-pro' : ''}`}
                onClick={() => setNoShowParty('PROFESSIONAL')}
              >
                <UserX size={16} /> Professional No-Show
                <span className="noshow-hint">Full refund to customer</span>
              </button>
            </div>
          </div>
        )}

        {activeModalType === 'DISPUTE' && (
          <div className="modal-custom-content">
            <label className="modal-label">Dispute Reason</label>
            <textarea
              className="modal-textarea-styled"
              placeholder="Explain why this booking is in dispute..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
          </div>
        )}
      </Modal>

      <div style={{ height: 80 }} />
    </div>
  );
};

export default BookingDetail;
