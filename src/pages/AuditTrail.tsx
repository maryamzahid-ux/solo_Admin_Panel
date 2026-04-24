import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft, User, CheckCircle, Settings, Trash2, CreditCard,
  XCircle, Shield, Search, Filter, RefreshCw, ChevronDown, Activity, RotateCcw, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetAuditLogs, type AuditLog } from '../api/audit.api';
import Loader from '../components/Loader';
import './AuditTrail.css';

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; iconColor: string; label: string }> = {
  USER_VERIFIED: { icon: CheckCircle, color: '#f0fdf4', iconColor: '#22c55e', label: 'User Verified' },
  USER_BLOCKED: { icon: XCircle, color: '#fff1f2', iconColor: '#e11d48', label: 'Account Deactivated' },
  USER_REACTIVATED: { icon: Shield, color: '#f0fdf4', iconColor: '#22c55e', label: 'Account Reactivated' },
  USER_DELETED: { icon: Trash2, color: '#fef2f2', iconColor: '#ef4444', label: 'Account Deleted' },
  PAYOUT_APPROVED: { icon: CreditCard, color: '#f0f9ff', iconColor: '#0ea5e9', label: 'Payout Approved' },
  PAYOUT_DECLINED: { icon: CreditCard, color: '#fff1f2', iconColor: '#e11d48', label: 'Payout Declined' },
  SETTINGS_UPDATED: { icon: Settings, color: '#f5f3ff', iconColor: '#8b5cf6', label: 'Settings Updated' },
  SETTINGS_RESET: { icon: RotateCcw, color: '#fefce8', iconColor: '#d97706', label: 'Settings Reset' },
};

const DEFAULT_CONFIG = { icon: Activity, color: '#f1f5f9', iconColor: '#64748b', label: 'Action' };

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Actions' },
  { value: 'USER_VERIFIED', label: 'User Verified' },
  { value: 'USER_BLOCKED', label: 'Account Deactivated' },
  { value: 'USER_REACTIVATED', label: 'Account Reactivated' },
  { value: 'USER_DELETED', label: 'Account Deleted' },
  { value: 'PAYOUT_APPROVED', label: 'Payout Approved' },
  { value: 'PAYOUT_DECLINED', label: 'Payout Declined' },
  { value: 'SETTINGS_UPDATED', label: 'Settings Updated' },
  { value: 'SETTINGS_RESET', label: 'Settings Reset' },
];

const AuditTrail: React.FC = () => {
  const navigate = useNavigate();
  const { getAuditLogs, loading } = useGetAuditLogs();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState({ totalActions: 0, activeAdmins: 0, latestActivity: null as string | null });
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLogs = useCallback(async (cursor?: string, append = false) => {
    const params: Record<string, unknown> = { limit: 20 };
    if (cursor) params.cursor = cursor;
    if (actionFilter !== 'ALL') params.action = actionFilter;
    if (search.trim()) params.search = search.trim();

    const res = await getAuditLogs(params as any);
    if (res?.success) {
      const data = res.data;
      setLogs(prev => append ? [...prev, ...data.logs] : data.logs);
      setNextCursor(data.nextCursor);
      setSummary(data.summary);
      setInitialLoad(false);
    }
  }, [actionFilter, search]);

  // Initial fetch + filter/search change
  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLogs();
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

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

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
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

  const getAdminName = (log: AuditLog) => {
    if (!log.admin) return 'System';
    const first = log.admin.firstName || '';
    const last = log.admin.lastName || '';
    const full = `${first} ${last}`.trim();
    return full || log.admin.email;
  };

  const getConfig = (action: string) => ACTION_CONFIG[action] || DEFAULT_CONFIG;

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Date', 'Time', 'Action', 'Description', 'Admin', 'Entity Type', 'Entity ID'];
    const rows = logs.map(log => [
      formatDate(log.createdAt),
      formatTime(log.createdAt),
      getConfig(log.action).label,
      log.description,
      getAdminName(log),
      log.entityType || '',
      log.entityId || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <button className="btn btn-primary" onClick={handleExportCSV} disabled={logs.length === 0}>
          <Download size={16} />
          Export CSV
        </button>
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

      {/* Search + Filter Bar */}
      <div className="audit-toolbar">
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

        <div className="audit-filter-wrapper" ref={filterRef}>
          <button
            className={`audit-filter-btn ${actionFilter !== 'ALL' ? 'active' : ''}`}
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Filter size={16} />
            {FILTER_OPTIONS.find(f => f.value === actionFilter)?.label || 'Filter'}
            <ChevronDown size={14} />
          </button>
          {showFilterDropdown && (
            <div className="audit-filter-dropdown">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`audit-filter-option ${actionFilter === opt.value ? 'selected' : ''}`}
                  onClick={() => { setActionFilter(opt.value); setShowFilterDropdown(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        {logs.length} {logs.length === 1 ? 'record' : 'records'} found
        {actionFilter !== 'ALL' && <span className="filter-badge">{FILTER_OPTIONS.find(f => f.value === actionFilter)?.label}</span>}
        {search.trim() && <span className="filter-badge">"{search.trim()}"</span>}
      </div>

      {/* Audit Logs List */}
      <div className="audit-logs-list">
        {logs.length === 0 && !loading ? (
          <div className="empty-state">
            <Activity size={48} strokeWidth={1} />
            <h3>No audit logs found</h3>
            <p>Actions performed by admins will appear here.</p>
          </div>
        ) : (
          logs.map(log => {
            const config = getConfig(log.action);
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
                        <div>
                          <h3 className="log-action-title">{config.label}</h3>
                          <p className="log-action-desc">{log.description}</p>
                        </div>
                        <div className="audit-timestamp">
                          <div className="log-date">{formatDate(log.createdAt)}</div>
                          <div className="log-time">{formatTime(log.createdAt)}</div>
                        </div>
                      </div>

                      <div className="audit-meta">
                        <User size={14} className="text-muted" />
                        <span>Performed by: </span>
                        <span className="performer-name">{getAdminName(log)}</span>
                        {log.entityType && (
                          <>
                            <span className="meta-separator">•</span>
                            <span className="entity-badge">{log.entityType}</span>
                          </>
                        )}
                      </div>
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
      {loading && !initialLoad && (
        <div className="loading-more">
          <RefreshCw size={16} className="spin" />
          Loading more...
        </div>
      )}

      <div style={{ height: 60 }} />
    </div>
  );
};

export default AuditTrail;
