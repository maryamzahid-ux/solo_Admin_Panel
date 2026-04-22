import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, Bell, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetSettings, useUpdateSettings, useResetSettings, type PlatformSettings } from '../api/settings.api';
import './Settings.css';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

import { useToast } from '../context/ToastContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { getSettings, loading: fetching } = useGetSettings();
  const { updateSettings, loading: updating, error: updateError } = useUpdateSettings();
  const { resetSettings, loading: resetting, error: resetError } = useResetSettings();

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [formData, setFormData] = useState<PlatformSettings | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      await fetchSettings();
    };
    init();
  }, []);

  const fetchSettings = async () => {
    const res = await getSettings();
    if (res?.success) {
      setSettings(res.data);
      setFormData(res.data);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!formData) return;

    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0
    });
  };

  const handleToggleChange = (name: keyof PlatformSettings) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [name]: !formData[name]
    });
  };

  const handleRefundPolicyChange = (policy: PlatformSettings['refundPolicy']) => {
    if (!formData) return;
    setFormData({
      ...formData,
      refundPolicy: policy
    });
  };

  const handleSave = async () => {
    if (!formData) return;
    const res = await updateSettings(formData);
    if (res?.success) {
      setSettings(res.data);
      showToast('Settings saved successfully');
    } else {
      showToast(updateError || 'Failed to save settings', 'error');
    }
  };

  const handleReset = () => {
    setFormData(settings);
    // showToast('Changes discarded', 'info');
  };

  const handleRestoreDefaults = () => {
    setIsResetModalOpen(true);
  };

  const confirmRestoreDefaults = async () => {
    setIsResetModalOpen(false);
    const res = await resetSettings();
    if (res?.success) {
      setSettings(res.data);
      setFormData(res.data);
      showToast('Restored to defaults');
    } else {
      showToast(resetError || 'Failed to reset settings', 'error');
    }
  };

  if (fetching && !settings) {
    return (
      <Loader />
    );
  }

  if (!formData) return null;

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(formData);

  return (
    <>
      <div className="settings-page">
        <div className="page-header">
          <div className="flex items-center gap-4">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
            </button>
            <h1 className="page-title">System Settings</h1>
          </div>
          <div className="flex gap-4 items-center">
            {/* <button
              className="btn btn-outline"
              style={{ padding: '10px 24px' }}
              onClick={handleReset}
              disabled={!hasChanges || updating || resetting}
            >
              Reset
            </button> */}
            <button
              className="btn btn-primary"
              style={{ padding: '10px 24px', position: 'relative' }}
              onClick={handleSave}
              disabled={!hasChanges || updating || resetting}
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="settings-list-layout">
          <div className="settings-card">
            <div className="settings-section-header">
              <div className="settings-icon-box" style={{ background: '#f0fdf4' }}>
                <Shield size={22} />
              </div>
              <div className="settings-title-info">
                <h3>Commission & Fees</h3>
                <p>Configure platform revenue settings</p>
              </div>
            </div>

            <div className="settings-input-group">
              <label className="settings-label">Professional side (Platform Commission %)</label>
              <input
                type="number"
                name="professionalCommission"
                className="settings-input"
                value={formData.professionalCommission}
                onChange={handleInputChange}
              />
              <p className="settings-help">Current: {formData.professionalCommission}% deducted from professional earnings</p>
            </div>

            <div className="toggle-row settings-input-group disabled">
              <div className="settings-label" style={{ marginBottom: 0 }}>Customer - Side Fee</div>
              <label className="switch customer-side-fee-switch">
                <input
                  type="checkbox"
                  checked={formData.customerSideFeeEnabled}
                  disabled
                />
                <span className="slider"></span>
              </label>
            </div>
            <p className="text-muted text-xs" style={{ marginTop: -16, marginBottom: 24, opacity: 0.6 }}>Add an additional fee charged to customers</p>

            <div className="settings-input-group disabled">
              <label className="settings-label">Customer Side Fee (Platform Commission %)</label>
              <input
                type="number"
                name="customerSideFee"
                className="settings-input"
                value={formData.customerSideFee}
                disabled
              />
            </div>

            <div className="settings-input-group disabled">
              <label className="settings-label">Payment Processing Fee (Stripe %)</label>
              <input type="text" className="settings-input" value={formData.stripeProcessingFee} disabled />
              <p className="settings-help">Fixed for standard accounts</p>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-section-header">
              <div className="settings-icon-box" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <RotateCcw size={20} />
              </div>
              <div className="settings-title-info">
                <h3>Cancellation & Refund Policy</h3>
                <p>Set rules for booking cancellations</p>
              </div>
            </div>

            <div className="settings-input-group">
              <label className="settings-label">Fee Cancellation Window (Hours)</label>
              <input
                type="number"
                name="cancellationWindow"
                className="settings-input"
                value={formData.cancellationWindow}
                onChange={handleInputChange}
              />
              <p className="settings-help">before service start time</p>
            </div>

            <p className="text-muted text-xs mb-4">Customers can cancel and get a refund based on the policy below if cancelled at least {formData.cancellationWindow} hours before the service.</p>

            <div className="refund-options-stack">
              <div
                className={`refund-option ${formData.refundPolicy === 'FULL' ? 'active' : ''}`}
                onClick={() => handleRefundPolicyChange('FULL')}
              >
                <div className="radio-btn">{formData.refundPolicy === 'FULL' && <div className="radio-inner"></div>}</div>
                <div className="option-text">
                  <span className="option-title">Full Refund</span>
                  <span className="option-desc">100% refund within cancellation window</span>
                </div>
              </div>

              <div
                className={`refund-option disabled ${formData.refundPolicy === 'PARTIAL' ? 'active' : ''}`}
              >
                <div className="radio-btn">{formData.refundPolicy === 'PARTIAL' && <div className="radio-inner"></div>}</div>
                <div className="option-text">
                  <span className="option-title">Partial Refund</span>
                  <span className="option-desc">50% refund within cancellation window</span>
                </div>
              </div>

              <div
                className={`refund-option disabled ${formData.refundPolicy === 'MANUAL' ? 'active' : ''}`}
              >
                <div className="radio-btn">{formData.refundPolicy === 'MANUAL' && <div className="radio-inner"></div>}</div>
                <div className="option-text">
                  <span className="option-title">Custom / Manual Review</span>
                  <span className="option-desc">All refunds require admin approval</span>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-section-header">
              <div className="settings-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                <Bell size={20} />
              </div>
              <div className="settings-title-info">
                <h3>Automated Notifications</h3>
                <p>Configure booking reminders</p>
              </div>
            </div>

            <div className="notification-flow">
              <div className="notif-item">
                <div className="notif-row">
                  <div className="notif-text">
                    <div className="notif-title">Enable automated Reminders</div>
                    <div className="notif-desc">Send reminders to customers and professionals</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={formData.remindersEnabled}
                      onChange={() => handleToggleChange('remindersEnabled')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className={`notif-item ${!formData.remindersEnabled ? 'disabled' : ''}`}>
                <div className="notif-row">
                  <div className="notif-text">
                    <div className="notif-title">24-Hour Reminder</div>
                    <div className="notif-desc">Send reminder 24 hours before service</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={formData.reminder24h}
                      onChange={() => handleToggleChange('reminder24h')}
                      disabled={!formData.remindersEnabled}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className={`notif-item ${!formData.remindersEnabled ? 'disabled' : ''}`}>
                <div className="notif-row">
                  <div className="notif-text">
                    <div className="notif-title">1-Hour Reminder</div>
                    <div className="notif-desc">Send reminder 1 hour before service</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={formData.reminder1h}
                      onChange={() => handleToggleChange('reminder1h')}
                      disabled={!formData.remindersEnabled}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="danger-zone-compact">
            <h3>Danger Zone</h3>
            <p>Irreversible actions for system configuration</p>
            <button
              className="btn-danger-link"
              onClick={handleRestoreDefaults}
              disabled={updating || resetting}
            >
              {resetting ? 'Resetting System...' : 'Restore Factory Defaults'}
            </button>
          </div>
        </div>
        <div style={{ height: 60 }}></div>
      </div>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmRestoreDefaults}
        type="danger"
        title="Restore Factory Defaults"
        description="Are you sure you want to restore all platform settings to their factory defaults? This action cannot be undone."
        confirmText="Yes, Restore Defaults"
      />
    </>
  );
};

export default Settings;
