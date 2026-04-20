import React, { useState, useEffect } from 'react';
import { Users, Briefcase, FileCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import './Dashboard.css';
import { useGetDashboardStats } from '../hooks/admin/dashboard/usedash';


const jobsDataWeek = [
  { name: 'Mon', completed: 15, inProgress: 8, cancelled: 2 },
  { name: 'Tue', completed: 28, inProgress: 14, cancelled: 3 },
  { name: 'Wed', completed: 18, inProgress: 6, cancelled: 1 },
  { name: 'Thu', completed: 22, inProgress: 10, cancelled: 3 },
  { name: 'Fri', completed: 18, inProgress: 14, cancelled: 4 },
  { name: 'Sat', completed: 28, inProgress: 10, cancelled: 5 },
  { name: 'Sun', completed: 15, inProgress: 4, cancelled: 2 },
];

const jobsDataMonth = [
  { name: 'Wk 1', completed: 85, inProgress: 40, cancelled: 12 },
  { name: 'Wk 2', completed: 110, inProgress: 55, cancelled: 8 },
  { name: 'Wk 3', completed: 95, inProgress: 35, cancelled: 15 },
  { name: 'Wk 4', completed: 125, inProgress: 60, cancelled: 10 },
];

const feesDataWeek = [
  { name: 'Mon', fee: 400 }, { name: 'Tue', fee: 1000 }, { name: 'Wed', fee: 1200 }, { name: 'Thu', fee: 900 }, { name: 'Fri', fee: 600 }, { name: 'Sat', fee: 1600 }, { name: 'Sun', fee: 900 },
];

const feesDataMonth = [
  { name: 'Wk 1', fee: 4500 }, { name: 'Wk 2', fee: 6200 }, { name: 'Wk 3', fee: 5100 }, { name: 'Wk 4', fee: 7800 },
];

const Dashboard: React.FC = () => {
  const [feesRange, setFeesRange] = useState('7d');
  const [jobsRange, setJobsRange] = useState('week');
  const [trendRange, setTrendRange] = useState('week');
  const [topCards, setTopCards] = useState<any>([]);
  const { getDashboardStats } = useGetDashboardStats();

  const fetchData = async () => {
    const res = await getDashboardStats();
    setTopCards(res.data)
  }

  useEffect(() => {
    fetchData();
  }, []);

  const getFeesAmount = () => {
    if (feesRange === 'today') return '€750';
    return feesRange === '7d' ? '€5,120' : '€24,850';
  };
  const getFeesGrowth = () => {
    if (feesRange === 'today') return '↑ 5% from yesterday';
    return feesRange === '7d' ? '↑ 18% from last week' : '↑ 12% from last month';
  };

  const getJobsData = () => jobsRange === 'week' ? jobsDataWeek : jobsDataMonth;

  const getTrendData = () => {
    if (trendRange === '6m' || trendRange === '12m') return feesDataMonth; // Demo fallback
    return trendRange === 'week' ? feesDataWeek : feesDataMonth;
  };

  return (
    <div>
      <h1 className="dashboard-header">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-header">
            <div className="stat-icon"><Users size={20} /></div>
            <div>
              <div className="stat-value">{topCards.totalUsers}</div>
              <div className="stat-title">Total Users</div>
            </div>
          </div>
          <div className="stat-footer">
            {topCards.totalCustomers} Customers <br /> {topCards.totalProfessionals} Professionals
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Users size={20} /></div>
            <div>
              <div className="stat-value">{topCards.activeUsers}</div>
              <div className="stat-title">Active Users</div>
            </div>
          </div>
          <div className="stat-footer">
            {topCards.activeCustomers} Customers <br /> {topCards.activeProfessionals} Professionals
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}><FileCheck size={20} /></div>
            <div>
              <div className="stat-value">{topCards.totalServices}</div>
              <div className="stat-title">Total Services</div>
            </div>
          </div>
          <div className="stat-footer" style={{ marginTop: 'auto', paddingTop: '16px' }}>
            {topCards.totalCategories} categories
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}><Briefcase size={20} /></div>
            <div>
              <div className="stat-value">{topCards.totalJobs}</div>
              <div className="stat-title">Total Jobs</div>
            </div>
          </div>
          <div className="stat-footer" style={{ marginTop: 'auto', paddingTop: '16px' }}>
            {topCards.totalJobs} This month
          </div>
        </div>
      </div>

      <h2 className="section-title">Job Status Overview</h2>
      <div className="job-status-grid">
        <div className="mini-card">
          <div className="mini-icon yellow"><AlertCircle size={24} /></div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>42</div>
            <div className="text-muted text-sm">In Progress</div>
          </div>
        </div>
        <div className="mini-card">
          <div className="mini-icon green"><CheckCircle size={24} /></div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>2,987</div>
            <div className="text-muted text-sm">Completed</div>
          </div>
        </div>
        <div className="mini-card">
          <div className="mini-icon red"><XCircle size={24} /></div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>216</div>
            <div className="text-muted text-sm">Cancelled</div>
          </div>
        </div>
      </div>

      <div className="revenue-card">
        <div className="chart-header">
          <span className="chart-title" style={{ color: 'var(--primary)' }}>PLATFORM FEES COLLECTED</span>
          <select
            className="form-input"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={feesRange}
            onChange={(e) => setFeesRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
        <div className="revenue-content">
          <div className="revenue-amount"><span>💰</span>{getFeesAmount()}</div>
          <div style={{ color: 'var(--primary)', fontSize: '0.85rem', marginTop: '8px' }}>{getFeesGrowth()}</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">JOBS OVER TIME</span>
            <select
              className="form-input"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={jobsRange}
              onChange={(e) => setJobsRange(e.target.value)}
            >
              <option value="week">This week</option>
              <option value="month">Last month</option>
            </select>
          </div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getJobsData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <RechartsTooltip />
                <Bar dataKey="completed" stackId="a" fill="#bbf7d0" radius={[0, 0, 4, 4]} />
                <Bar dataKey="inProgress" stackId="a" fill="#fef08a" />
                <Bar dataKey="cancelled" stackId="a" fill="#fecaca" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-4">
            <div className="flex items-center gap-2"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#bbf7d0' }}></span> Completed</div>
            <div className="flex items-center gap-2"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fef08a' }}></span> In progress</div>
            <div className="flex items-center gap-2"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fecaca' }}></span> Cancelled</div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">PLATFORM FEES TREND</span>
            <select
              className="form-input"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={trendRange}
              onChange={(e) => setTrendRange(e.target.value)}
            >
              <option value="week">This week</option>
              <option value="month">Last month</option>
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
            </select>
          </div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getTrendData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="fee" stroke="#5cc728" strokeWidth={2} dot={{ r: 4, fill: "white", stroke: "#5cc728", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div style={{ height: 40 }}></div>
    </div>
  );
};

export default Dashboard;
