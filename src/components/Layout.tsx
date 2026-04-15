import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className={`layout-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      <Sidebar />
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
