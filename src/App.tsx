import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/admin/AdminContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/Toast/Toast';
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
import ProtectedRoute from './components/ProtectedRoute';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <ToastProvider>
      <AdminProvider>
        <Router>
          <Toast />
          <Routes>
            <Route element={<ProtectedRoute />}>
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
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin-registration-invite" element={<CredentialRequest />} />
          </Routes>
        </Router>
      </AdminProvider>
    </ToastProvider>
  );
}

export default App;
