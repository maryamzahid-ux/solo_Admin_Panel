import React, { useState } from 'react';
import { Mail, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/logo.png';
import { useLogin, useChangePassword } from '../hooks/authHook';
import { useAdmin } from '../context/admin/AdminContext';
import { loginSchema, changePasswordSchema } from '../validation/auth.validatiion';
import Modal from '../components/Modal';
import { secureSetItem } from '../utils/storage';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });

  // States for change password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, loading, error, clearError } = useLogin();
  const { changePassword, loading: changePasswordLoading, error: changePasswordError } = useChangePassword();
  const { setAdmin } = useAdmin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear existing API errors first

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        formattedErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setErrors({}); // Clear frontend validation errors

    try {
      // FIX: Use formData fields
      const res = await login(formData.email, formData.password);
      if (res && res.success && res.data) {


        if (res.data.admin) {
          secureSetItem('token', res.data.accessToken);
          secureSetItem('admin_data', res.data.admin);
          setAdmin(res.data.admin);
        }

        // Check if admin needs to change password
        if (res.data.admin && res.data.admin.hasChangedPassword === false) {
          setShowPasswordModal(true);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    const result = changePasswordSchema.safeParse({ newPassword });
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        formattedErrors[String(issue.path[0])] = issue.message;
      });
      setPasswordError(formattedErrors.newPassword);
      return;
    }
    setPasswordError('');
    try {
      const res = await changePassword(newPassword);
      if (res && res.success) {
        setShowPasswordModal(false);
        secureSetItem('admin_data', res.data.admin);
        secureSetItem('token', res.data.accessToken);
        setAdmin(res.data.admin);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };


  return (
    <>
      {error && (
        <Modal
          isOpen={!!error}
          onClose={() => clearError()}
          title="Login Failed"
          description={error || 'An error occurred during login'}
          type="danger"
          confirmText="OK"
          onConfirm={() => clearError()}
        />
      )}

      {showPasswordModal && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password Required"
          description="For security reasons, please change your default password before accessing the dashboard."
          type="warning"
          confirmText={changePasswordLoading ? 'Updating...' : 'Update Password'}
          onConfirm={handleChangePassword}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {changePasswordError && (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '5px' }}>{changePasswordError}</div>
            )}
            <div>
              <div className="form-input-container">
                <KeyRound size={18} className="form-icon" />
                <input
                  type="password"
                  placeholder="New Password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

              </div>
              {passwordError && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{passwordError}</div>}
            </div>
            <div className="form-input-container">
              <KeyRound size={18} className="form-icon" />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}

      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <img src={logo} alt="Solo" style={{ height: 60 }} />
          </div>

          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to review performance, configure settings, and manage users.</p>
          </div>

          <form onSubmit={handleLogin} style={{ marginTop: 24 }}>
            <div className="form-group">
              <label className="form-label">Email Address <span>*</span></label>
              <div>
                <div className="form-input-container">
                  <Mail size={18} className="form-icon" />
                  <input type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.email}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password <span>*</span></label>
              <div>
                <div className="form-input-container">
                  <KeyRound size={18} className="form-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="form-input"
                    placeholder="Enter your password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.password}</div>}

              </div>
            </div>

            <div className="login-footer-actions">
              <label>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                Remember me
              </label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ padding: '14px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div >
      </div >
    </>
  );
};

export default Login;
