import React, { useState } from 'react';
import { Search, Calendar, Clock, DollarSign, Wallet, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import './BookingManagement.css';

const initialBookings = [
  { id: 'BK1001', service: 'Personal Training Session', customer: 'John Anderson', professional: 'Sarah Mitchell', date: 'April 05', time: '10:00 AM', price: 120, status: 'Requested', payment: 'In Escrow' },
  { id: 'BK1002', service: 'Physiotherapy Session', customer: 'Michael Brown', professional: 'Lisa Rodriguez', date: 'April 05', time: '10:00 AM', price: 120, status: 'In Progress', payment: 'In Escrow' },
  { id: 'BK1003', service: 'Academic Tutoring - Math', customer: 'David Chen', professional: 'Tom Harris', date: 'April 03', time: '10:00 AM', price: 120, status: 'Accepted', payment: 'In Escrow' },
  { id: 'BK1004', service: 'Personal Training Session', customer: 'John Anderson', professional: 'Sarah Mitchell', date: 'April 05', time: '10:00 AM', price: 120, status: 'Cancelled', payment: 'Refund Pending' },
  { id: 'BK1005', service: 'Personal Training Session', customer: 'John Anderson', professional: 'Sarah Mitchell', date: 'April 05', time: '10:00 AM', price: 120, status: 'In Dispute', payment: 'On Hold' },
  { id: 'BK1006', service: 'Personal Training Session', customer: 'John Anderson', professional: 'Sarah Mitchell', date: 'April 05', time: '10:00 AM', price: 120, status: 'Declined', payment: 'Refunded' },
  { id: 'BK1007', service: 'Personal Training Session', customer: 'John Anderson', professional: 'Sarah Mitchell', date: 'April 05', time: '10:00 AM', price: 120, status: 'Completed', payment: 'In Escrow' },
  { id: 'BK1008', service: 'Personal Training Session', customer: 'John Anderson', professional: 'Sarah Mitchell', date: 'April 05', time: '10:00 AM', price: 120, status: 'No Show-Customer', payment: 'Refunded' },
];

const BookingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(4);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredBookings = initialBookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || b.payment === paymentFilter;
    const matchesSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.professional.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPayment && matchesSearch;
  });

  const handleViewAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisibleCount(prev => prev + 4);
  };

  return (
    <div>
      {isLoading && <Loader fullScreen={true} />}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="page-title">Booking Management</h1>
        </div>
        <div className="filters-row">
          <select 
            className="form-input" 
            style={{width: 180}}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="Requested">Requested</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Declined">Declined</option>
            <option value="In Dispute">In Dispute</option>
            <option value="No Show-Customer">No Show-Customer</option>
            <option value="No Show-Professional">No Show-Professional</option>
          </select>
          <select 
            className="form-input" 
            style={{width: 180}}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="ALL">All Payments</option>
            <option value="In Escrow">In Escrow</option>
            <option value="Paid Out">Paid Out</option>
            <option value="Refund Pending">Refund Pending</option>
            <option value="Refunded">Refunded</option>
            <option value="On Hold">On Hold</option>
          </select>
          <div className="search-input-container">
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="text-muted" />
          </div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div style={{fontSize: '2rem', fontWeight: 700, marginBottom: '8px'}}>8</div>
          <div className="text-muted" style={{fontSize: '0.9rem'}}>Total Bookings</div>
        </div>
        <div className="summary-card">
          <div style={{fontSize: '2rem', fontWeight: 700, marginBottom: '8px'}}>1</div>
          <div className="text-muted" style={{fontSize: '0.9rem'}}>In Dispute</div>
        </div>
        <div className="summary-card">
          <div style={{fontSize: '2rem', fontWeight: 700, marginBottom: '8px'}}>1</div>
          <div className="text-muted" style={{fontSize: '0.9rem'}}>Completed</div>
        </div>
      </div>

      <div className="flex justify-between items-center" style={{marginBottom: 16}}>
        <div style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>{filteredBookings.length} bookings found</div>
      </div>

      <div className="booking-grid">
        {filteredBookings.slice(0, visibleCount).map(booking => (
          <Link to={`/bookings/${booking.id}`} key={booking.id} className="booking-card">
            <div className="booking-status-tags">
              <div className={`booking-badge badge-${booking.status.toLowerCase().replace(' ', '-')}`}>
                {booking.status}
              </div>
              <div className={`payment-badge badge-${booking.payment.toLowerCase().replace(' ', '-')}`}>
                <Wallet size={12} /> {booking.payment}
              </div>
            </div>
            <div className="booking-id">#{booking.id}</div>
            <div className="booking-service">{booking.service}</div>
            <div className="booking-people">
              <div className="booking-person"><span>Customer:</span> {booking.customer}</div>
              <div className="booking-person"><span>Professional:</span> {booking.professional}</div>
            </div>
            <div className="booking-meta">
              <div className="meta-item"><Calendar size={14} /> Date: <b>{booking.date}</b></div>
              <div className="meta-item"><Clock size={14} /> Time: <b>{booking.time}</b></div>
              <div className="meta-item"><DollarSign size={14} /> Price: <b>€{booking.price}</b></div>
            </div>
          </Link>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="text-muted mb-4">No bookings found matching your filters.</div>
          <button className="btn btn-outline" onClick={handleViewAll}>Show All Bookings</button>
        </div>
      )}

      {filteredBookings.length > visibleCount && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button 
            type="button"
            className="text-muted text-sm font-medium" 
            style={{background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}
            onClick={handleViewAll}
          >
            View All Bookings
          </button>
        </div>
      )}
      <div style={{height: 60}}></div>
    </div>
  );
};

export default BookingManagement;
