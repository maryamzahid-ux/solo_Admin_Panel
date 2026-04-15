import React from 'react';
import { ArrowLeft, User, FileText, CheckCircle, Settings, Trash2, CreditCard, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AuditTrail.css';

const logs = [
  { id: 1, action: 'Mark as Verified', desc: 'Approved professional verification application for Sara Ali (Make-up Artist)', admin: 'Admin Sarah', date: '3/7/2026', time: '14:30:22', icon: CheckCircle, color: '#f0fdf4', iconColor: '#22c55e' },
  { id: 2, action: 'Deactivated Account', desc: 'Deactivated professional account (John Doe)', admin: 'Admin Sarah', date: '3/7/2026', time: '12:15:10', icon: XCircle, color: '#fff1f2', iconColor: '#e11d48' },
  { id: 3, action: 'Deleted Account', desc: 'Permanently removed customer account (Mark Wilson)', admin: 'Admin John', date: '3/7/2026', time: '10:45:30', icon: Trash2, color: '#fef2f2', iconColor: '#ef4444' },
  { id: 4, action: 'Updated Booking Status', desc: 'Manually changed status of booking #b125 to "Completed"', admin: 'Admin Sarah', date: '3/6/2026', time: '16:20:45', icon: FileText, color: '#eff6ff', iconColor: '#3b82f6' },
  { id: 5, action: 'Update Payment Status', desc: 'Marked payment for booking #b98 as "Paid Out"', admin: 'Admin Sarah', date: '3/6/2026', time: '15:10:22', icon: CreditCard, color: '#f0f9ff', iconColor: '#0ea5e9' },
  { id: 6, action: 'Settings Updated', desc: 'Platform commission updated from 10% to 15% for all new professionals', admin: 'Admin Sarah', date: '3/6/2026', time: '09:00:00', icon: Settings, color: '#f5f3ff', iconColor: '#8b5cf6' },
];

const AuditTrail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="page-title">Audit Trail</h1>
        </div>
        <button className="btn btn-primary btn-success">Export CSV</button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-value">8</div>
          <div className="summary-label">Total Actions</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">1</div>
          <div className="summary-label">Active Admins</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">Today</div>
          <div className="summary-label">Latest Activity</div>
        </div>
      </div>

      <div className="results-count">5 records found</div>

      <div className="audit-logs-list">
        {logs.map(log => (
          <div key={log.id} className="audit-log-item">
            <div className="audit-log-header">
              <div className="audit-action-box">
                <div className="audit-icon-box" style={{background: log.color}}>
                  <log.icon size={20} style={{color: log.iconColor}} />
                </div>
                <div className="audit-details">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="log-action-title">{log.action}</h3>
                      <p className="log-action-desc">{log.desc}</p>
                    </div>
                    <div className="audit-timestamp">
                      <div className="log-date">{log.date}</div>
                      <div className="log-time">{log.time}</div>
                    </div>
                  </div>
                  
                  <div className="audit-meta">
                    <User size={14} className="text-muted" /> 
                    <span>Performed by: </span>
                    <span className="performer-name">{log.admin}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{height: 60}}></div>
    </div>
  );
};

export default AuditTrail;
