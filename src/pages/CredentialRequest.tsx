import React, { useState } from 'react';
import { User, Mail, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CredentialRequest.css';
import logo from '../assets/logo.png';

const CredentialRequest: React.FC = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRequestCredential = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Request for Credential:', { ...formData, profilePic });
    alert(`Credential request submitted for ${formData.firstName} ${formData.lastName}`);
    navigate('/login');
  };

  return (
    <div className="credential-container">
      <div className="credential-card">
        <div className="credential-logo">
          <img src={logo} alt="Solo" style={{ height: 60 }} />
        </div>

        <div className="credential-header">
          <h1>Account Verification</h1>
          <p>Provide your information to request a password reset or new credentials.</p>
        </div>

        <form style={{ marginTop: 24 }}>
          {/* Profile Picture Upload */}
          <div className="form-group">
            <label className="form-label">Profile Picture</label>
            <div className="profile-pic-container">
              <input
                type="file"
                id="profile-pic"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="profile-pic-input"
              />
              <label htmlFor="profile-pic" className="profile-pic-upload">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="profile-pic-preview" />
                ) : (
                  <>
                    <Upload size={24} />
                    <span>Upload Profile Picture</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Name Fields */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name <span>*</span></label>
              <div className="form-input-container">
                <User size={18} className="form-icon" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter your first name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Last Name <span>*</span></label>
              <div className="form-input-container">
                <User size={18} className="form-icon" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address <span>*</span></label>
            <div className="form-input-container">
              <Mail size={18} className="form-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="credential-actions">
            <button
              type="submit"
              onClick={handleRequestCredential}
              className="btn btn-primary w-full"
              style={{ padding: '14px' }}
            >
              Request New Credentials
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Remember your password?{' '}
              <a href="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                Sign In
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialRequest;
