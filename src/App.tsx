import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/admin/AdminContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/Toast/Toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const CredentialRequest = lazy(() => import('./pages/CredentialRequest'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const UserDetail = lazy(() => import('./pages/UserDetail'));
const BookingManagement = lazy(() => import('./pages/BookingManagement'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const AuditTrail = lazy(() => import('./pages/AuditTrail'));
const Settings = lazy(() => import('./pages/Settings'));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const PayoutManagement = lazy(() => import('./pages/PayoutManagement'));

function App() {
  return (
    <ToastProvider>
      <AdminProvider>
        <Router>
          <Toast />
          <Suspense fallback={<Loader fullScreen={true} />}>
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
                  <Route path="payouts" element={<PayoutManagement />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin-registration-invite" element={<CredentialRequest />} />
            </Routes>
          </Suspense>
        </Router>
      </AdminProvider>
    </ToastProvider>
  );
}

export default App;
