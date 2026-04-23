import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Calendar, Briefcase, CheckCircle2, ArrowLeft, UserX, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetUsers } from '../api/admin.api';
import './UserManagement.css';
import Loader from '../components/Loader';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  const { getUsers, loading } = useGetUsers();

  const fetchUsers = async (cursor?: string) => {
    try {
      const roleMap: any = { 'Customers': 'CUSTOMER', 'Professionals': 'PROFESSIONAL', 'All': 'ALL' };
      const statusMap: any = {
        'Active': 'ACTIVE',
        'Inactive': 'BLOCKED',
        'Pending Verification': 'PENDING_VERIFICATION',
        'All': 'ALL'
      };

      const res = await getUsers({
        role: roleMap[typeFilter],
        status: statusMap[statusFilter],
        search: searchQuery,
        cursor,
        limit: 10
      });

      if (res?.success) {
        if (cursor) {
          setUsers(prev => [...prev, ...res.data.users]);
        } else {
          setUsers(res.data.users);
          console.log(res.data);
        }
        setNextCursor(res.data.nextCursor);
        setTotalUsers(res.data.totalCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    fetchUsers(); // Reset on filters change
  }, [statusFilter, typeFilter, searchQuery]);

  // Infinite scroll intersection observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastUserElementRef = useCallback((node: HTMLAnchorElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextCursor) {
        fetchUsers(nextCursor);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, nextCursor]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && users.length === 0) {
    return (
      <Loader />
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="page-title">User Management</h1>
        </div>
        <div className="filters-row">
          <select
            className="form-input"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending Verification">Pending Verification</option>
          </select>
          <select
            className="form-input"
            style={{ width: 160 }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Users</option>
            <option value="Customers">Customers</option>
            <option value="Professionals">Professionals</option>
          </select>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="text-muted" />
          </div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>{totalUsers}</div>
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>Total Users Found</div>
        </div>
        <div className="summary-card">
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>{users.filter(u => u.role === 'CUSTOMER').length}</div>
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>Loaded Customers</div>
        </div>
        <div className="summary-card">
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>{users.filter(u => u.role === 'PROFESSIONAL').length}</div>
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>Loaded Professionals</div>
        </div>
      </div>

      <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Showing {users.length} of {totalUsers} users
        </div>
      </div>

      <div className="user-grid">
        {users.length === 0 && !loading && (
          <div className="empty-state-message">
            <UserX size={48} className="text-muted" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div className="text-muted">No users found matching your search or filters.</div>
            <div className="text-xs text-muted" style={{ marginTop: '8px' }}>Try adjusting your filters or search query.</div>
          </div>
        )}
        {users.map((user, index) => (
          <Link
            to={user.role === 'CUSTOMER' ? `/customers/${user.id}` : `/users/${user.id}`}
            key={user.id}
            className="user-card"
            ref={users.length === index + 1 ? lastUserElementRef : null}
          >
            <div className="user-status">
              <span className={`badge ${user.status.toLowerCase().replace(' ', '-')}`}>{user.status}</span>
            </div>
            <div className="user-card-header">
              <img
                src={user.avatar || 'https://via.placeholder.com/150'}
                className="user-avatar"
                alt={user.name}
                onError={(e: any) => { e.target.src = 'https://via.placeholder.com/150' }}
              />
              <div className="user-info">
                <div className="user-name">
                  {user.name}
                  {user.isVerified && <CheckCircle2 className="verified-icon" />}
                </div>
                <div className="user-email">{user.email}</div>
                <div className="user-phone" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{user.number}</div>
                <div className={`user-role role-${user.role.toLowerCase()}`} style={{ marginTop: 8 }}>{user.role}</div>
              </div>
            </div>
            <div className="user-card-footer">
              <div className="footer-item">
                <Calendar size={16} /> Joined {formatDate(user.createdAt)}
              </div>
              {user.role === 'PROFESSIONAL' && (
                <div className="footer-item">
                  <Briefcase size={16} /> {user.bookingsCount} bookings
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {loading && users.length > 0 && (
        <div className="flex justify-center items-center" style={{ marginTop: 32, marginBottom: 32 }}>
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}
      <div style={{ height: 40 }}></div>
    </div>
  );
};

export default UserManagement;
