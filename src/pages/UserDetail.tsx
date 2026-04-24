import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Calendar, Mail, MapPin, Briefcase, Phone, Medal, MoreVertical, Play, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../components/Modal';
import { useGetUserDetails, useUpdateUserStatus, useUpdateAdminNotes } from '../api/admin.api';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import './UserDetail.css';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [newNote, setNewNote] = useState('');
  const [locationName, setLocationName] = useState<string>('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'warning' | 'danger'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalConfirmText, setModalConfirmText] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const { getUserDetails, loading } = useGetUserDetails();
  const { updateUserStatus, loading: statusLoading } = useUpdateUserStatus();
  const { updateAdminNotes, loading: notesLoading } = useUpdateAdminNotes();

  const fetchLocationName = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      if (data.display_name) {
        // Extract a shorter address (e.g., City, Country or just some parts)
        const parts = data.address;
        const city = parts.city || parts.town || parts.village || parts.suburb || '';
        const country = parts.country || '';
        setLocationName(city && country ? `${city}, ${country}` : data.display_name);
      }
    } catch (error) {
      console.error("Failed to reverse geocode:", error);
    }
  };

  const fetchUser = async () => {
    if (!id) return;
    try {
      const res = await getUserDetails(id);
      if (res?.success) {
        setUser(res.data);
        if (res.data.latitude && res.data.longitude) {
          fetchLocationName(res.data.latitude, res.data.longitude);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);


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

  const handleAddNote = async () => {
    if (!id || !newNote.trim()) return;
    try {
      const res = await updateAdminNotes(id, newNote);
      if (res?.success) {
        setNewNote('');
        fetchUser(); // Refresh to show the new note in the list
        showToast('Admin note added successfully');
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleMarkAsVerified = () => {
    openModal(
      'success',
      'Approve Application',
      `Are you sure you want to approve ${user?.name}'s verification application? They will receive a verified badge and can start accepting bookings.`,
      'Approve',
      async () => {
        if (!id) return;
        const res = await updateUserStatus(id, 'VERIFIED');
        if (res?.success) {
          setUser({ ...user, isVerified: true });
          setIsModalOpen(false);
        }
      }
    );
  };

  const handleDeactivate = () => {
    const isBlocked = user?.isBlocked;
    const actionText = isBlocked ? 'Reactivate' : 'Deactivate';

    openModal(
      'warning',
      `${actionText} Account`,
      `Are you sure you want to ${actionText.toLowerCase()} this account?`,
      actionText,
      async () => {
        if (!id) return;
        const res = await updateUserStatus(id, isBlocked ? 'ACTIVE' : 'BLOCKED');
        if (res?.success) {
          setUser({ ...user, isBlocked: !isBlocked });
          setIsModalOpen(false);
        }
      }
    );
  };

  const handleDelete = () => {
    openModal(
      'danger',
      'Delete Account',
      'This action is permanent and cannot be undone. All data related to this user will be removed from the system.',
      'Delete',
      async () => {
        if (!id) return;
        const res = await updateUserStatus(id, 'DELETED');
        if (res?.success) {
          setIsModalOpen(false);
          navigate('/users');
        }
      }
    );
  };

  if (loading && !user) {
    return (
      <Loader />
    );
  }

  if (!user) {
    return <div className="text-center" style={{ marginTop: 100 }}>User not found.</div>;
  }

  const getStatus = () => {
    if (user.isBlocked) return 'Inactive';
    if (!user.isVerified && user.role === 'PROFESSIONAL') return 'Pending';
    return 'Active';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <img
              src={user.avatar || 'https://via.placeholder.com/150'}
              alt={user.name}
              className="profile-avatar"
              onError={(e: any) => { e.target.src = 'https://via.placeholder.com/150' }}
            />
            <div>
              <div className="profile-name">
                {user.name} {user.isVerified && <CheckCircle2 size={18} className="verified-icon" />}
              </div>
              <div className="profile-role">{user.role === 'PROFESSIONAL' ? 'Professional' : 'Customer'}</div>
            </div>
          </div>
          <div className="profile-status">
            <span className={`badge ${getStatus().toLowerCase()}`}>{getStatus()}</span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <Calendar size={18} className="info-icon" /> Joined {formatDate(user.createdAt)}
          </div>
          <div className="info-item">
            <Briefcase size={18} className="info-icon" /> {user.metrics?.totalBookings || 0} bookings
          </div>
          <div className="info-item">
            <Mail size={18} className="info-icon" /> {user.email}
          </div>
          <div className="info-item">
            <Phone size={18} className="info-icon" /> {user.number}
          </div>
          <div className="info-item">
            <Medal size={18} className="info-icon" /> {user.experience || 'No experience info'}
          </div>
          <div className="info-item">
            <MapPin size={18} className="info-icon" /> {locationName || user.address || 'No address info'}
          </div>
        </div>

        {user.bio && (
          <div className="bio-section">
            <div className="bio-title">Bio</div>
            <div className="bio-text">{user.bio}</div>
          </div>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{user.metrics?.totalBookings || 0}</div>
          <div className="metric-title">Total Bookings</div>
          <div className="metric-subtitle">
            {user.metrics?.completedBookings || 0} completed •
            <span style={{ color: '#ef4444' }}> {user.metrics?.cancelledBookings || 0} cancelled</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-value">€{Number(user.metrics?.totalRevenue).toFixed(2) || 0}</div>
          <div className="metric-title">Total Revenue</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{user.rating || 'N/A'}</div>
          <div className="metric-title">{user.reviews || 0} reviews</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{user.servicesData?.length || 0}</div>
          <div className="metric-title">Services Offered</div>
        </div>
      </div>

      <div className="split-section">
        {user.bioVideo && (
          <div className="video-card">
            <div className="video-header">
              <span>Video Bio</span>
              <MoreVertical size={20} className="text-muted" />
            </div>
            <div className="video-placeholder" onClick={() => window.open(user.bioVideo, '_blank')}>
              <img src={user.bioVideoThumbnail || "https://images.unsplash.com/photo-1531123897727-8f129e1ebfa8?q=80&w=800&auto=format&fit=crop"} alt="Video Bio" />
              <div className="play-btn">
                <Play size={20} fill="currentColor" />
              </div>
            </div>
          </div>
        )}

        <div className="side-cards">
          <div className="side-card">
            <div className="side-card-title">Verification Status</div>
            <div style={{ color: user.isVerified ? 'var(--primary)' : '#d97706', fontWeight: 600 }}>
              {user.isVerified ? 'Verified' : 'Pending'}
            </div>
          </div>
          <div className="side-card">
            <div className="side-card-title">Services Offered</div>
            <div className="service-tags">
              {user.servicesData?.map((sd: any) => (
                <span key={sd.id} className="service-tag">{sd.service.name}</span>
              )) || <span className="text-muted">None</span>}
            </div>
          </div>
          <div className="side-card">
            <div className="side-card-title">Booking History (Recent)</div>
            <div className="flex flex-col gap-4" style={{ maxHeight: '70px', overflowY: 'auto', paddingRight: '14px' }}>
              {user.professionalBookings?.length > 0 ? (
                user.professionalBookings.map((booking: any) => (
                  <div key={booking.id} className="flex justify-between items-center py-2 border-bottom">
                    <div>
                      <div className="font-semibold text-sm">{booking.jobTitle || 'Service'}</div>
                      <div className="text-muted text-xs">Customer: {booking.customer?.name}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-bold">{formatDate(booking.createdAt).split(',')[0]}</div>
                      <div style={{ color: booking.status === 'COMPLETED' ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {booking.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted text-sm">No history available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {user.documents && user.documents.length > 0 && (
        <div className="documents-section">
          <div className="docs-title">Uploaded Documents ({user.documents.length})</div>
          <div className="docs-grid">
            {user.documents.map((doc: string, idx: number) => (
              <a href={doc} target="_blank" rel="noreferrer" key={idx} className="doc-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="doc-icon-box"><FileText size={20} /></div>
                <div>
                  <div className="doc-name">Document {idx + 1}</div>
                  <div className="doc-file">{doc.split('/').pop()?.split('?')[0] || 'file'}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="notes-section">
        <div className="notes-title">Admin Notes</div>

        {user.adminNotes && user.adminNotes.length > 0 && (
          <div className="notes-history" style={{ marginBottom: '24px' }}>
            {user.adminNotes.map((note: any) => {
              const authorName = note.admin ? `${note.admin.firstName || ''} ${note.admin.lastName || ''}`.trim() || note.admin.email : 'System';
              // const initials = authorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2);

              return (
                <div key={note.id} className="note-item">
                  <div className="note-header">
                    <div className="note-author">
                      {authorName}
                    </div>
                    <div className="note-time">{formatDate(note.createdAt)}</div>
                  </div>
                  <div className="note-content">{note.note}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="notes-input-area" style={{
          borderTop: user.adminNotes?.length > 0 ? '1px solid var(--border-color)' : 'none',
          paddingTop: user.adminNotes?.length > 0 ? '24px' : '0'
        }}>
          <textarea
            className="notes-textarea"
            placeholder="Add a new internal note about this user..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          ></textarea>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleAddNote}
              disabled={notesLoading || !newNote.trim()}
            >
              {notesLoading ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>
      </div>

      <div className="actions-section">
        <div className="actions-title">Account Actions</div>
        <div className="actions-row">
          {user.role === 'PROFESSIONAL' && (
            <button
              className="btn btn-primary"
              onClick={handleMarkAsVerified}
              disabled={user.isVerified || statusLoading}
              style={{ opacity: user.isVerified ? 0.6 : 1, cursor: user.isVerified ? 'not-allowed' : 'pointer' }}
            >
              {user.isVerified ? 'Already Verified' : 'Mark as Verified'}
            </button>
          )}
          <button
            className="btn btn-outline btn-outline-warning"
            onClick={handleDeactivate}
            disabled={statusLoading}
          >
            {user.isBlocked ? 'Reactivate Account' : 'Deactivate Account'}
          </button>
          <button
            className="btn btn-outline btn-outline-danger"
            onClick={handleDelete}
            disabled={statusLoading}
          >
            Delete Account
          </button>
        </div>
      </div>
      <div style={{ height: 40 }}></div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={pendingAction || (() => { })}
        title={modalTitle}
        description={modalDescription}
        confirmText={modalConfirmText}
        type={modalType}
      />
    </div>
  );
};

export default UserDetail;
