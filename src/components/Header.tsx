import { Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
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
          <img src="https://i.pravatar.cc/150?u=mary" alt="Admin" />
          <span>Hi Mary</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
