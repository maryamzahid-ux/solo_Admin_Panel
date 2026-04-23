import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, FileText, Settings, LogOut, DollarSign } from 'lucide-react';
import logo from '../assets/logo.png';
import { useLogout } from '../hooks/authHook';
import { useAdmin } from '../context/admin/AdminContext';
import { secureRemoveItem } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, title: 'Dashboard', subtitle: 'View insights' },
  { path: '/users', icon: Users, title: 'User Management', subtitle: 'Manage all users' },
  { path: '/bookings', icon: Calendar, title: 'Booking Management', subtitle: 'Monitor all bookings' },
  { path: '/payouts', icon: DollarSign, title: 'Payouts', subtitle: 'Approve payments' },
  { path: '/audit', icon: FileText, title: 'Audit Trail', subtitle: 'Manage all logs' },
  { path: '/settings', icon: Settings, title: 'Settings', subtitle: 'Manage system settings' }
];

const Sidebar: React.FC = () => {
  const { logout, loading } = useLogout();
  const { clearAdmin } = useAdmin();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      secureRemoveItem('admin_data');
      secureRemoveItem('token');
      clearAdmin();

      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <>
      {isLogoutModalOpen && (
        <Modal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
          title="Logout"
          description="Are you sure you want to logout?"
          confirmText={loading ? 'Logging out...' : 'Logout'}
          type="danger"
        />
      )}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Solo" style={{ height: 40, width: 'auto' }} />
        </div>
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              to={item.path}
              key={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              <div className="nav-text">
                <span className="nav-title">{item.title}</span>
                <span className="nav-subtitle">{item.subtitle}</span>
              </div>
            </NavLink>
          ))}

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsLogoutModalOpen(true);
            }}
            className="nav-item"
            style={{ marginTop: 'auto', marginBottom: 0 }}
          >
            <LogOut className="nav-icon" />
            <div className="nav-text">
              <span className="nav-title">Logout</span>
              <span className="nav-subtitle">Exit application</span>
            </div>
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
