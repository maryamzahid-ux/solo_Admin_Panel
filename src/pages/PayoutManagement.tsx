import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, ArrowLeft, Clock, Briefcase, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PayoutManagement.css';
import { useGetPayouts, useUpdatePayoutStatus } from '../api/payout.api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';

// [ Removed mock data for production-ready state ]

const PayoutManagement: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayout, setCurrentPayout] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'decline'>('approve');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const { getPayouts, loading: fetchLoading, error: fetchError } = useGetPayouts();
  const { updatePayoutStatus, loading: actionLoading } = useUpdatePayoutStatus();

  const fetchData = useCallback(async () => {
    const res = await getPayouts();
    if (res && res.data) {
      setPayouts(res.data);
    } else if (fetchError) {
      showToast(fetchError, 'error');
    }
    setHasLoadedOnce(true);
  }, [getPayouts, fetchError, showToast]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleActionClick = (payout: any, type: 'approve' | 'decline') => {
    setCurrentPayout(payout);
    setActionType(type);
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!currentPayout) return;

    const res = await updatePayoutStatus(currentPayout.id, actionType === 'approve' ? 'approved' : 'declined');

    if (res) {
      showToast(`Payout ${actionType === 'approve' ? 'approved' : 'declined'} successfully`, 'success');
      // Refresh the list from the server
      fetchData();
    } else {
      // If API fails, we still allow the UI to reflect the change for demo purposes if desired, 
      // but in a proper integration we should rely on the refresh or show an error.
      // For now, let's just refresh to stay in sync with server.
      fetchData();
    }

    setIsModalOpen(false);
    setCurrentPayout(null);
  };

  const filteredPayouts = payouts.filter(p => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter.toLowerCase();
    const matchesSearch = p.professional.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });



  if (!hasLoadedOnce || (fetchLoading && payouts.length === 0)) {
    return <Loader />;
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="page-title">Payout Management</h1>
        </div>
        <div className="filters-row">
          <select
            className="form-input"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="DECLINED">Declined</option>
          </select>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search by professional..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="text-muted" />
          </div>
        </div>
      </div>



      <div className="payout-grid">
        {filteredPayouts.map(payout => (
          <div key={payout.id} className="payout-card">
            <div className="payout-header">
              <div className="payout-professional">
                <img src={payout.avatar} alt={payout.professional} className="payout-avatar" />
                <div>
                  <div className="payout-name">{payout.professional}</div>
                  <div className="payout-email">{payout.email}</div>
                </div>
              </div>
              <div className={`status-badge status-${payout.status}`}>
                {payout.status}
              </div>
            </div>

            <div className="payout-amount">€{payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

            <div className="payout-meta">
              <div className="meta-item"><Briefcase size={14} /> Service: <b>{payout.serviceName}</b></div>
              <div className="meta-item"><User size={14} /> Customer: <b>{payout.customerName}</b></div>
              <div className="meta-item"><Calendar size={14} /> Request Date: <b>{payout.date}</b></div>
            </div>

            {payout.status === 'pending' && (
              <div className="payout-actions">
                <button className="btn-approve" onClick={() => handleActionClick(payout, 'approve')}>Approve</button>
                <button className="btn-decline" onClick={() => handleActionClick(payout, 'decline')}>Decline</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPayouts.length === 0 && hasLoadedOnce && !fetchLoading && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Clock size={48} />
          </div>
          <h3>No Payout Requests</h3>
          <p>There are currently no payout requests matching your filters.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={actionType === 'approve' ? 'Approve Payout' : 'Decline Payout'}
        description={`Are you sure you want to ${actionType} the payout of €${currentPayout?.amount} for ${currentPayout?.professional}?`}
        confirmText={actionLoading ? (actionType === 'approve' ? 'Approving...' : 'Declining...') : (actionType === 'approve' ? 'Confirm Approval' : 'Confirm Decline')}
        type={actionType === 'approve' ? 'success' : 'danger'}
      />

      <div style={{ height: 60 }}></div>
    </div>
  );
};

export default PayoutManagement;
