import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import CredentialRequest from './pages/CredentialRequest';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import UserDetail from './pages/UserDetail';
import BookingManagement from './pages/BookingManagement';
import BookingDetail from './pages/BookingDetail';
import AuditTrail from './pages/AuditTrail';
import Settings from './pages/Settings';
import CustomerDetail from './pages/CustomerDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/credential-request" element={<CredentialRequest />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          <Route path="audit" element={<AuditTrail />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
