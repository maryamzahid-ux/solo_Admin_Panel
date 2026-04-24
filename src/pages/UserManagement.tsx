import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Calendar, Briefcase, CheckCircle2, ArrowLeft, UserX, Users, UserCheck, Filter, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetUsers } from '../api/admin.api';
import './UserManagement.css';
import Loader from '../components/Loader';
import InternalLoader from '../components/InternalLoader';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  const { getUsers, loading } = useGetUsers();

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement | null>(null);
  const typeFilterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusFilterRef.current && !statusFilterRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (typeFilterRef.current && !typeFilterRef.current.contains(e.target as Node)) {
        setShowTypeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
                {['All', 'Active', 'Inactive', 'Pending Verification'].map(opt => (
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

          <div className="custom-filter-wrapper" ref={typeFilterRef}>
            <button
              className={`custom-filter-btn ${typeFilter !== 'All' ? 'active' : ''}`}
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <Filter size={16} />
              {typeFilter === 'All' ? 'All Users' : typeFilter}
              <ChevronDown size={14} />
            </button>
            {showTypeDropdown && (
              <div className="custom-filter-dropdown">
                {['All', 'Customers', 'Professionals'].map(opt => (
                  <button
                    key={opt}
                    className={`custom-filter-option ${typeFilter === opt ? 'selected' : ''}`}
                    onClick={() => { setTypeFilter(opt); setShowTypeDropdown(false); }}
                  >
                    {opt === 'All' ? 'All Users' : opt}
                  </button>
                ))}
              </div>
            )}
          </div>
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
          <div className="summary-icon-box" style={{ background: '#f0fdf4' }}>
            <Users size={20} style={{ color: '#22c55e' }} />
          </div>
          <div>
            <div className="summary-value">{totalUsers}</div>
            <div className="summary-label">Total Users Found</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#eff6ff' }}>
            <UserCheck size={20} style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <div className="summary-value">{users.filter(u => u.role === 'CUSTOMER').length}</div>
            <div className="summary-label">Loaded Customers</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#fefce8' }}>
            <Briefcase size={20} style={{ color: '#d97706' }} />
          </div>
          <div>
            <div className="summary-value">{users.filter(u => u.role === 'PROFESSIONAL').length}</div>
            <div className="summary-label">Loaded Professionals</div>
          </div>
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
        <>
          <div style={{ height: 40 }} />
          <InternalLoader />
          <div style={{ height: 40 }} />
        </>

      )}
    </div>
  );
};

export default UserManagement;
