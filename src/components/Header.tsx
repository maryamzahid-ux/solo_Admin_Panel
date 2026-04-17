import { Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAdmin } from '../context/admin/AdminContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { admin } = useAdmin();
  const fullName = admin ? `${admin.firstName} ${admin.lastName}` : 'Admin';
  const location = useLocation();
  const isDashboard = location.pathname.includes('dashboard');

  return (
    <header className="header">
      <div className="flex items-center gap-4">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="header-title">
          {isDashboard ? 'Admin Dashboard' : ''}
        </div>
      </div>
      <div className="header-actions">
        <Bell className="header-bell" size={20} />
        <div className="header-profile">
          <img 
            src={admin?.profile || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName)} 
            alt="Admin" 
          />
          <span>Hi, {fullName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
