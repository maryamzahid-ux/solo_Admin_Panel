import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Calendar, Wallet, ArrowLeft, Filter, ChevronDown, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useGetBookings } from '../api/booking.api';
import './BookingManagement.css';
import Loader from '../components/Loader';
import InternalLoader from '../components/InternalLoader';

const BookingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [bookings, setBookings] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState({ total: 0, inDispute: 0, completed: 0, noShow: 0 });

  const { getBookings, loading } = useGetBookings();

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement | null>(null);
  const paymentFilterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusFilterRef.current && !statusFilterRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (paymentFilterRef.current && !paymentFilterRef.current.contains(e.target as Node)) {
        setShowPaymentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchBookings = async (cursor?: string) => {
    try {
      const statusMap: any = {
        'Requested': 'REQUESTED',
        'Accepted': 'ACCEPTED',
        'In Progress': 'IN_PROGRESS',
        'Completed': 'COMPLETED',
        'Cancelled': 'CANCELLED',
        'Declined': 'DECLINED',
        'No Show': 'NO_SHOW',
        'In Dispute': 'IN_DISPUTE',
        'All': 'ALL'
      };

      const paymentMap: any = {
        'In Escrow': 'IN_ESCROW',
        'Paid Out': 'PAID_OUT',
        'Refund Pending': 'REFUND_PENDING',
        'Refunded': 'REFUNDED',
        'On Hold': 'ON_HOLD',
        'All': 'ALL'
      };

      const res = await getBookings({
        status: statusMap[statusFilter],
        paymentStatus: paymentMap[paymentFilter],
        search: searchQuery,
        cursor,
        limit: 10
      });

      if (res?.success) {
        if (cursor) {
          setBookings(prev => [...prev, ...res.data.bookings]);
        } else {
          setBookings(res.data.bookings);
          setSummary(res.data.summary || { total: 0, inDispute: 0, completed: 0, noShow: 0 });
        }
        setNextCursor(res.data.nextCursor);
        setTotalCount(res.data.totalCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, paymentFilter, searchQuery]);

  // Infinite scroll intersection observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastBookingElementRef = useCallback((node: HTMLAnchorElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextCursor) {
        fetchBookings(nextCursor);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, nextCursor]);

  const statusOptions = ['All', 'Requested', 'Accepted', 'In Progress', 'Completed', 'Cancelled', 'Declined', 'No Show', 'In Dispute'];
  const paymentOptions = ['All', 'In Escrow', 'Paid Out', 'Refunded', 'On Hold'];

  if (loading && bookings.length === 0) {
    return <Loader />;
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="page-title">Booking Management</h1>
        </div>
        <div className="filters-row">
          <div className="custom-filter-wrapper" ref={statusFilterRef}>
            <button
              className={`custom-filter-btn ${statusFilter !== 'All' ? 'active' : ''}`}
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <Filter size={16} />
              {statusFilter === 'All' ? 'All Status' : statusFilter}
              <ChevronDown size={14} />
            </button>
            {showStatusDropdown && (
              <div className="custom-filter-dropdown">
                {statusOptions.map(opt => (
                  <button
                    key={opt}
                    className={`custom-filter-option ${statusFilter === opt ? 'selected' : ''}`}
                    onClick={() => { setStatusFilter(opt); setShowStatusDropdown(false); }}
                  >
                    {opt === 'All' ? 'All Status' : opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="custom-filter-wrapper" ref={paymentFilterRef}>
            <button
              className={`custom-filter-btn ${paymentFilter !== 'All' ? 'active' : ''}`}
              onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
            >
              <Filter size={16} />
              {paymentFilter === 'All' ? 'All Payments' : paymentFilter}
              <ChevronDown size={14} />
            </button>
            {showPaymentDropdown && (
              <div className="custom-filter-dropdown">
                {paymentOptions.map(opt => (
                  <button
                    key={opt}
                    className={`custom-filter-option ${paymentFilter === opt ? 'selected' : ''}`}
                    onClick={() => { setPaymentFilter(opt); setShowPaymentDropdown(false); }}
                  >
                    {opt === 'All' ? 'All Payments' : opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search by ID, customer, or professional"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="text-muted" />
          </div>
        </div>
      </div>

      <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#eff6ff' }}>
            <Briefcase size={20} style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <div className="summary-value">{summary.total}</div>
            <div className="summary-label">Total Bookings</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#fff7ed' }}>
            <AlertCircle size={20} style={{ color: '#ea580c' }} />
          </div>
          <div>
            <div className="summary-value">{summary.inDispute}</div>
            <div className="summary-label">In Dispute</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#f1f5f9' }}>
            <AlertCircle size={20} style={{ color: '#64748b' }} />
          </div>
          <div>
            <div className="summary-value">{summary.noShow}</div>
            <div className="summary-label">No Shows</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#f0fdf4' }}>
            <CheckCircle2 size={20} style={{ color: '#22c55e' }} />
          </div>
          <div>
            <div className="summary-value">{summary.completed}</div>
            <div className="summary-label">Completed</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Showing {bookings.length} of {totalCount} bookings
        </div>
      </div>

      <div className="booking-grid">
        {bookings.map((booking, index) => (
          <Link
            to={`/bookings/${booking.id}`}
            key={booking.id}
            className="booking-card"
            ref={bookings.length === index + 1 ? lastBookingElementRef : null}
          >
            <div className="booking-status">
              <div className={`booking-badge badge-${booking.status.toLowerCase().replace(/_/g, '-')}`}>
                {booking.status.replace(/_/g, ' ')}
              </div>
              <div className={`payment-badge badge-${booking.paymentStatus?.toLowerCase().replace(/_/g, '-')}`}>
                <Wallet size={12} /> {booking.paymentStatus?.replace(/_/g, ' ')}
              </div>
            </div>
            <div className="booking-id">#{booking.id.slice(-6).toUpperCase()}</div>
            <div className="booking-service">{booking.service?.name || 'Service Deleted'}</div>
            <div className="booking-people">
              <div className="booking-person"><span>Customer:</span> {booking.customer?.firstName} {booking.customer?.lastName}</div>
              <div className="booking-person"><span>Professional:</span> {booking.professional?.firstName} {booking.professional?.lastName}</div>
            </div>
            <div className="booking-meta">
              <div className="meta-item"><Calendar size={14} /> <b>{booking.date ? new Date(booking.date).toLocaleDateString() : new Date(booking.createdAt).toLocaleDateString()}</b></div>
              <div className="meta-item"><div style={{ fontSize: '1rem', fontWeight: 700 }}>€</div> <b>{booking.price}</b></div>
            </div>
          </Link>
        ))}
      </div>

      {bookings.length === 0 && !loading && (
        <div className="empty-state-message" style={{ gridColumn: '1 / -1', padding: '80px 0', background: 'white', borderRadius: 12, border: '1px dashed var(--border-color)', textAlign: 'center' }}>
          <Briefcase size={48} className="text-muted" style={{ marginBottom: '16px', opacity: 0.5, margin: '0 auto' }} />
          <div className="text-muted">No bookings found matching your search or filters.</div>
        </div>
      )}

      {loading && bookings.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <InternalLoader />
        </div>
      )}
      <div style={{ height: 60 }}></div>
    </div>
  );
};

export default BookingManagement;


