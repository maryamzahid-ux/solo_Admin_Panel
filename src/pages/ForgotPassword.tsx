import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Login.css';
import logo from '../assets/logo.png';
import { forgotPasswordSchema } from '../validation/auth.validatiion';
import { useForgotPassword } from '../hooks/authHook';

const ForgotPassword: React.FC = () => {
  const [sent, setSent] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  const [email, setEmail] = React.useState('');

  const { forgotPassword, loading, error, clearError } = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // ✅ Zod validation
    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        formattedErrors[String(issue.path[0])] = issue.message;
      });
      setEmailError(formattedErrors.email || '');
      return;
    }

    setEmailError('');

    const res = await forgotPassword(email);

    // ✅ ONLY move forward on real success
    if (res?.success) {
      setSent(true);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <img src={logo} alt="Solo" style={{ height: 60 }} />
        </div>

        {!sent ? (
          <>
            {/* Header */}
            <div className="login-header">
              <h1>Forgot Password</h1>
              <p>Enter your email address to receive a password reset link.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Email Address <span>*</span>
                </label>

                <div className="form-input-container">
                  <Mail size={18} className="form-icon" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                      clearError();
                    }}
                    required
                    className="form-input"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* ✅ Safe error rendering */}
                {(emailError || error) && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                    {emailError || error}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
                style={{ padding: '14px', marginBottom: '16px' }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              {/* Back */}
              <div className="flex justify-center text-sm">
                <Link
                  to="/login"
                  className="text-muted"
                  style={{ textDecoration: 'underline' }}
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="login-header">
              <h1 style={{ color: 'var(--primary)' }}>
                Check your email
              </h1>
              <p>
                We've sent a password reset link to your email address.
                Please check your inbox and follow the instructions.
              </p>
            </div>

            <Link
              to="/login"
              className="btn btn-outline w-full flex items-center justify-center gap-2"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
