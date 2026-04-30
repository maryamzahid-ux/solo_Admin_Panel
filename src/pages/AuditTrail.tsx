import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft, User, CheckCircle, Settings, Trash2, CreditCard,
  XCircle, Shield, Search, RefreshCw, ChevronDown, Activity, RotateCcw, Download,
  Calendar, AlertTriangle, UserX, Pause, Play, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetAuditLogs, type AuditLog } from '../api/audit.api';
import Loader from '../components/Loader';
import './AuditTrail.css';
import InternalLoader from '../components/InternalLoader';

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; iconColor: string; label: string }> = {
  // User Actions
  USER_VERIFIED: { icon: CheckCircle, color: '#f0fdf4', iconColor: '#22c55e', label: 'User Verified' },
  USER_BLOCKED: { icon: XCircle, color: '#fff1f2', iconColor: '#e11d48', label: 'Account Deactivated' },
  USER_REACTIVATED: { icon: Shield, color: '#f0fdf4', iconColor: '#22c55e', label: 'Account Reactivated' },
  USER_DELETED: { icon: Trash2, color: '#fef2f2', iconColor: '#ef4444', label: 'Account Deleted' },
  
  // Booking Actions
  BOOKING_CREATED: { icon: Calendar, color: '#eff6ff', iconColor: '#3b82f6', label: 'Booking Created' },
  BOOKING_CANCELLED: { icon: XCircle, color: '#fff1f2', iconColor: '#e11d48', label: 'Booking Cancelled' },
  BOOKING_RESCHEDULED: { icon: RefreshCw, color: '#f0f9ff', iconColor: '#0ea5e9', label: 'Booking Rescheduled' },
  BOOKING_STATUS_OVERRIDE: { icon: Activity, color: '#f5f3ff', iconColor: '#8b5cf6', label: 'Status Override' },
  BOOKING_IN_DISPUTE: { icon: AlertTriangle, color: '#fff7ed', iconColor: '#ea580c', label: 'Booking Disputed' },
  BOOKING_ACCEPTED: { icon: CheckCircle, color: '#f0fdf4', iconColor: '#22c55e', label: 'Booking Accepted' },
  BOOKING_DECLINED: { icon: XCircle, color: '#fff1f2', iconColor: '#e11d48', label: 'Booking Declined' },
  BOOKING_COMPLETED: { icon: CheckCircle, color: '#f0fdf4', iconColor: '#22c55e', label: 'Booking Completed' },
  BOOKING_NO_SHOW: { icon: UserX, color: '#fef2f2', iconColor: '#ef4444', label: 'No Show Recorded' },

  // Payment Actions
  PAYMENT_HOLD: { icon: Pause, color: '#fffbeb', iconColor: '#f59e0b', label: 'Payment Held' },
  PAYMENT_RELEASE: { icon: Play, color: '#f0fdf4', iconColor: '#22c55e', label: 'Payment Released' },
  PAYMENT_REFUNDED: { icon: RotateCcw, color: '#fff1f2', iconColor: '#e11d48', label: 'Payment Refunded' },
  PAYMENT_CAPTURE: { icon: CreditCard, color: '#f0f9ff', iconColor: '#0ea5e9', label: 'Payment Captured' },
  PAYOUT_PROCESSED: { icon: CheckCircle, color: '#eff6ff', iconColor: '#3b82f6', label: 'Payout Completed' },
  
  // Settings
  SETTINGS_UPDATED: { icon: Settings, color: '#f5f3ff', iconColor: '#8b5cf6', label: 'Settings Updated' },
  SETTINGS_RESET: { icon: RotateCcw, color: '#fefce8', iconColor: '#d97706', label: 'Settings Reset' },
};

const DEFAULT_CONFIG = { icon: Activity, color: '#f1f5f9', iconColor: '#64748b', label: 'Action' };

const MetadataDisplay: React.FC<{ metadata: Record<string, any> | null }> = ({ metadata }) => {
  if (!metadata) return null;

  const truncateMetadataValue = (val: any) => {
    if (val === undefined || val === null) return 'None';
    
    // If it's an object, stringify it instead of showing [object Object]
    if (typeof val === 'object') {
      try {
        const str = JSON.stringify(val);
        if (str.length > 30) return `${str.slice(0, 15)}...${str.slice(-10)}`;
        return str;
      } catch {
        return 'Object';
      }
    }

    const str = String(val);
    if (str.length > 15 && (str.includes('_') || str.includes('-') || /^[a-z0-9]+$/i.test(str))) {
      return `${str.slice(0, 6)}...${str.slice(-6)}`;
    }
    return str;
  };

  // Handle common patterns like before/after values
  const hasValues = metadata.before !== undefined || metadata.after !== undefined;
  
  if (hasValues) {
    const otherKeys = Object.keys(metadata).filter(k => !['before', 'after', 'timestamp', 'field'].includes(k));
    
    return (
      <div className="log-metadata">
        {metadata.field && (
          <div className="meta-field-name">
            <span className="meta-label">Changing:</span>
            <span className="meta-value">{metadata.field}</span>
          </div>
        )}
        <div className="meta-comparison">
          <div className="meta-val-box">
            <span className="meta-val-label">From</span>
            <span className="meta-val-text">{truncateMetadataValue(metadata.before)}</span>
          </div>
          <div className="meta-comparison-arrow">
            <ArrowRight size={14} />
          </div>
          <div className="meta-val-box">
            <span className="meta-val-label">To</span>
            <span className="meta-val-text active">{truncateMetadataValue(metadata.after)}</span>
          </div>
        </div>

        {otherKeys.length > 0 && (
          <div className="log-metadata-generic" style={{ marginTop: '12px' }}>
            {otherKeys.map(key => (
              <div key={key} className="meta-tag">
                <span className="meta-tag-key">{key}:</span>
                <span className="meta-tag-val">{truncateMetadataValue(metadata[key])}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Generic key-value display for other metadata
  const keys = Object.keys(metadata).filter(k => k !== 'timestamp');
  if (keys.length === 0) return null;

  return (
    <div className="log-metadata-generic">
      {keys.map(key => (
        <div key={key} className="meta-tag">
          <span className="meta-tag-key">{key}:</span>
          <span className="meta-tag-val">{truncateMetadataValue(metadata[key])}</span>
        </div>
      ))}
    </div>
  );
};

const AuditTrail: React.FC = () => {
  const navigate = useNavigate();
  const { getAuditLogs, loading } = useGetAuditLogs();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState({ totalActions: 0, activeAdmins: 0, latestActivity: null as string | null });
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');
  const [showActorDropdown, setShowActorDropdown] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const actorOptions = [
    { value: 'ALL', label: 'All Actors' },
    { value: 'ADMIN', label: 'Admin Actions', color: '#eff6ff', textColor: '#2563eb' },
    { value: 'CUSTOMER', label: 'Customer Actions', color: '#f0fdf4', textColor: '#16a34a' },
    { value: 'PROFESSIONAL', label: 'Pro Actions', color: '#f5f3ff', textColor: '#7c3aed' },
    { value: 'SYSTEM', label: 'System Events', color: '#f8fafc', textColor: '#475569' },
  ];

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const actorRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLogs = useCallback(async (cursor?: string, append = false) => {
    const params: Record<string, unknown> = { limit: 20 };
    if (cursor) params.cursor = cursor;
    if (actorFilter !== 'ALL') params.actorType = actorFilter;
    if (search.trim()) params.search = search.trim();

    const res = await getAuditLogs(params as any);
    if (res?.success) {
      const data = res.data;
      setLogs(prev => append ? [...prev, ...data.logs] : data.logs);
      setNextCursor(data.nextCursor);
      setSummary(data.summary);
      setInitialLoad(false);
    }
  }, [actorFilter, search]);

  // Initial fetch + filter/search change
  useEffect(() => {
    fetchLogs();
  }, [actorFilter, fetchLogs]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLogs();
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, fetchLogs]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextCursor && !loading) {
        fetchLogs(nextCursor, true);
      }
    }, { threshold: 0.1 });

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [nextCursor, loading, fetchLogs]);

  // Close filter dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actorRef.current && !actorRef.current.contains(e.target as Node)) {
        setShowActorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const d = new Date(dateString);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const truncateId = (id: string | null) => {
    if (!id) return '???';
    if (id.length <= 8) return id;
    return id.slice(-8);
  };

  const getActorName = (log: AuditLog) => {
    if (log.actorType === 'SYSTEM') return 'System Auto-Trigger';
    if (!log.admin) {
      const id = truncateId(log.actorId);
      if (id === '???') return `${log.actorType}`;
      return `${log.actorType} #${id}`;
    }
    const first = log.admin.firstName || '';
    const last = log.admin.lastName || '';
    const full = `${first} ${last}`.trim();
    return full || log.admin.email;
  };

  const getConfig = (action: string) => ACTION_CONFIG[action] || DEFAULT_CONFIG;

  const handleExportCSV = async () => {
    try {
      const params: Record<string, unknown> = { limit: 10000 };
      if (actorFilter !== 'ALL') params.actorType = actorFilter;
      if (search.trim()) params.search = search.trim();

      const res = await getAuditLogs(params as any);
      if (res?.success) {
        const allLogs = res.data.logs;
        if (allLogs.length === 0) return;

        const headers = ['Date', 'Time', 'Actor Type', 'Action', 'Description', 'Actor', 'Entity Type', 'Entity ID'];
        const rows = allLogs.map((log: AuditLog) => [
          formatDate(log.createdAt),
          formatTime(log.createdAt),
          log.actorType,
          getConfig(log.action).label,
          log.description,
          getActorName(log),
          log.entityType || '',
          log.entityId || '',
        ]);
        const csv = [headers, ...rows].map(r => r.map((c: string) => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export CSV", error);
    }
  };

  if (initialLoad && loading) return <Loader />;

  return (
    <div className="audit-page">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="page-title">Audit Trail</h1>
        </div>

        <div className="audit-toolbar-actions">
          <div className="audit-search-box">
            <Search size={16} className="audit-search-icon" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="audit-search-input"
            />
          </div>

          <div className="audit-filter-wrapper" ref={actorRef}>
            <button
              className={`audit-filter-btn ${actorFilter !== 'ALL' ? 'active' : ''}`}
              onClick={() => setShowActorDropdown(!showActorDropdown)}
            >
              <User size={16} />
              {actorOptions.find(f => f.value === actorFilter)?.label || 'All Actors'}
              <ChevronDown size={14} />
            </button>
            {showActorDropdown && (
              <div className="audit-filter-dropdown">
                {actorOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`audit-filter-option ${actorFilter === opt.value ? 'selected' : ''}`}
                    onClick={() => { setActorFilter(opt.value); setShowActorDropdown(false); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={handleExportCSV} disabled={logs.length === 0} style={{ padding: '10px 16px', borderRadius: '10px', height: '42px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#f0fdf4' }}>
            <Activity size={20} style={{ color: '#22c55e' }} />
          </div>
          <div>
            <div className="summary-value">{summary.totalActions}</div>
            <div className="summary-label">Total Actions</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#eff6ff' }}>
            <User size={20} style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <div className="summary-value">{summary.activeAdmins}</div>
            <div className="summary-label">Active Admins</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#f5f3ff' }}>
            <RefreshCw size={20} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <div className="summary-value">{getRelativeTime(summary.latestActivity)}</div>
            <div className="summary-label">Latest Activity</div>
          </div>
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="audit-logs-list">
        {logs.length === 0 && !loading ? (
          <div className="empty-state">
            <Activity size={48} strokeWidth={1} />
            <h3>No audit logs found</h3>
            <p>Actions performed across the platform will appear here.</p>
          </div>
        ) : (
          logs.map(log => {
            const config = getConfig(log.action);
            const actorConfig = actorOptions.find(a => a.value === log.actorType) || actorOptions[actorOptions.length - 1];
            const IconComp = config.icon;

            return (
              <div key={log.id} className="audit-log-item">
                <div className="audit-log-header">
                  <div className="audit-action-box">
                    <div className="audit-icon-box" style={{ background: config.color }}>
                      <IconComp size={20} style={{ color: config.iconColor }} />
                    </div>
                    <div className="audit-details">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <div className="log-title-row">
                            <h3 className="log-action-title">{config.label}</h3>
                            <div className="log-badges">
                              <span className="actor-type-badge" style={{ background: actorConfig.color, color: actorConfig.textColor }}>
                                {log.actorType}
                              </span>
                              {log.entityType && <span className="entity-badge">{log.entityType}</span>}
                            </div>
                          </div>
                          <div className="audit-meta">
                            <div className="flex items-center gap-1">
                               <User size={16} className="text-primary " />
                               <span className="performer-name">{getActorName(log)}</span>
                            </div>
                            {log.entityId && (
                               <>
                                 <div className="meta-separator">|</div>
                                 <span className="entity-type-label">{log.entityType || 'Entity'}:</span>
                                 <span className="entity-id-text">#{truncateId(log.entityId)}</span>
                               </>
                            )}
                          </div>
                          <p className="log-action-desc">{log.description}</p>
                        </div>
                        <div className="audit-timestamp">
                          <div className="log-date">{formatDate(log.createdAt)}</div>
                          <div className="log-time">{formatTime(log.createdAt)}</div>
                        </div>
                      </div>

                      <MetadataDisplay metadata={log.metadata as any} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && logs.length > 0 && (
        <>
          <div style={{ height: 40 }} />
          <InternalLoader />
          <div style={{ height: 40 }} />
        </>
      )}
    </div>
  );
};

export default AuditTrail;
