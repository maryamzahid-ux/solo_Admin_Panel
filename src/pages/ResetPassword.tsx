import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Login.css';
import logo from '../assets/logo.png';
import { useResetPassword } from '../hooks/authHook';
import { changePasswordSchema } from '../validation/auth.validatiion';
import Modal from '../components/Modal';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { resetPassword, loading, error, clearError } = useResetPassword();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!token) {
      setPasswordError('Invalid or missing reset token.');
      return;
    }

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
      const res = await resetPassword(token, newPassword);

      if (res && res.success) {
        setSuccessMessage('Password reset successfully! Redirecting to login...');

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {/* Error Modal */}
      {error && (
        <Modal
          isOpen={!!error}
          onClose={() => clearError()}
          title="Reset Failed"
          description={error || 'An error occurred while resetting password'}
          type="danger"
          confirmText="OK"
          onConfirm={() => clearError()}
        />
      )}

      <div className="login-container">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <img src={logo} alt="Solo" style={{ height: 60 }} />
          </div>

          {/* Header */}
          <div className="login-header">
            <h1>Set New Password</h1>
            <p>Please enter your new password below.</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div
              style={{
                background: '#d1fae5',
                color: '#065f46',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '0.9rem',
                textAlign: 'center',
              }}
            >
              {successMessage}
            </div>
          )}

          {!token ? (
            <div className="text-center" style={{ marginTop: '20px' }}>
              <p style={{ color: '#ef4444', marginBottom: '20px' }}>
                Invalid or missing reset token.
              </p>
              <Link
                to="/login"
                className="btn btn-primary w-full"
                style={{ padding: '14px', display: 'inline-block' }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} style={{ marginTop: 24 }}>
              {/* New Password */}
              <div className="form-group">
                <label className="form-label">
                  New Password <span>*</span>
                </label>

                <div className="form-input-container">
                  <KeyRound size={18} className="form-icon" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {passwordError && (
                  <div
                    style={{
                      color: '#ef4444',
                      fontSize: '0.8rem',
                      marginTop: '5px',
                    }}
                  >
                    {passwordError}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">
                  Confirm New Password <span>*</span>
                </label>

                <div className="form-input-container">
                  <KeyRound size={18} className="form-icon" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ padding: '14px', width: '100%' }}
                disabled={loading || !!successMessage}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              {/* Back */}
              <div
                className="flex justify-center text-sm"
                style={{ marginTop: '20px', textAlign: 'center' }}
              >
                <Link
                  to="/login"
                  className="text-muted"
                  style={{ textDecoration: 'underline' }}
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
