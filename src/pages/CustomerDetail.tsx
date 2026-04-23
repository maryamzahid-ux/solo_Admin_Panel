import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Briefcase } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../components/Modal';
import { useGetUserDetails, useUpdateUserStatus, useUpdateAdminNotes } from '../api/admin.api';
import Loader from '../components/Loader';
import { MapPin, MessageSquare } from 'lucide-react';
import './UserDetail.css';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [newNote, setNewNote] = useState('');
  const [locationName, setLocationName] = useState<string>('');
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
      console.error("Failed to fetch customer details:", error);
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
        openModal(
          'success',
          'Note Added',
          'The admin note has been successfully added for this customer.',
          'Dismiss',
          () => setIsModalOpen(false)
        );
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleDeactivate = () => {
    const isBlocked = user?.isBlocked;
    const actionText = isBlocked ? 'Reactivate' : 'Deactivate';

    openModal(
      'warning',
      `${actionText} Customer Account`,
      `Are you sure you want to ${actionText.toLowerCase()} this account? The customer will ${isBlocked ? 'be able to' : 'no longer be able to'} book services.`,
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
      'Delete Customer Account',
      'This action is permanent and cannot be undone. All booking history and personal data for this customer will be removed.',
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
    return <div className="text-center" style={{ marginTop: 100 }}>Customer not found.</div>;
  }

  const getStatus = () => {
    return user.isBlocked ? 'Inactive' : 'Active';
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
            <img
              src={user.avatar || 'https://via.placeholder.com/150'}
              alt={user.name}
              className="profile-avatar"
              onError={(e: any) => { e.target.src = 'https://via.placeholder.com/150' }}
            />
            <div>
              <div className="profile-name">{user.name}</div>
              <div className="user-role role-customer">Customer</div>
            </div>
          </div>
          <div className="profile-status">
            <span className={`badge ${getStatus().toLowerCase()}`}>{getStatus()}</span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <Mail size={18} className="info-icon" /> {user.email}
          </div>
          <div className="info-item">
            <Phone size={18} className="info-icon" /> {user.number}
          </div>
          <div className="info-item">
            <Calendar size={18} className="info-icon" /> Joined {formatDate(user.createdAt)}
          </div>
          <div className="info-item">
            <MapPin size={18} className="info-icon" /> {locationName || user.address || 'No address info'}
          </div>
          <div className="info-item">
            <Briefcase size={18} className="info-icon" /> {user.metrics?.totalBookings || 0} Services Availed
          </div>
        </div>
      </div>

      <div className="split-section">
        <div className="side-card">
          <div className="side-card-title">Services Chosen (Interests)</div>
          <div className="service-tags">
            {user.userServices?.filter((us: any) => us.type === 'INTEREST').map((us: any) => (
              <span key={us.id} className="service-tag">{us.service.name}</span>
            )) || <span className="text-muted">None</span>}
          </div>
        </div>

        <div className="side-card">
          <div className="side-card-title">Services Availed (History)</div>
          <div className="flex flex-col gap-4" style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '14px' }}>
            {user.customerBookings?.length > 0 ? (
              user.customerBookings.map((booking: any) => (
                <div key={booking.id} className="flex justify-between items-center py-2 border-bottom">
                  <div>
                    <div className="font-semibold text-sm">{booking.jobTitle || 'Service'}</div>
                    <div className="text-muted text-xs">Professional: {booking.professional?.name}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold">{formatDate(booking.createdAt)}</div>
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

      <div className="notes-section">
        <div className="notes-title">Admin Notes</div>

        {user.adminNotes && user.adminNotes.length > 0 && (
          <div className="notes-history" style={{ marginBottom: '24px' }}>
            {user.adminNotes.map((note: any) => {
              const authorName = note.admin ? `${note.admin.firstName || ''} ${note.admin.lastName || ''}`.trim() || note.admin.email : 'System';
              return (
                <div key={note.id} className="note-item">
                  <div className="note-header">
                    <div className="note-author">{authorName}</div>
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
            placeholder="Add a new internal note about this customer..."
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={pendingAction || (() => { })}
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
