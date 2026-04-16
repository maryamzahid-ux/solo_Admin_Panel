import React, { useState } from 'react';
import { Mail, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/logo.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
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
            <div className="form-input-container">
              <Mail size={18} className="form-icon" />
              <input type="email" required className="form-input" placeholder="Enter your email address" defaultValue="admin@solo.com" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password <span>*</span></label>
            <div className="form-input-container">
              <KeyRound size={18} className="form-icon" />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="form-input"
                placeholder="Enter your password"
                defaultValue="password123"
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
          </div>

          <div className="login-footer-actions">
            <label>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ padding: '14px' }}>
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            Don't have credentials?
          </p>
          <Link to="/credential-request" className="btn btn-secondary w-full" style={{ padding: '12px', textDecoration: 'none', display: 'block' }}>
            Request Credentials
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
