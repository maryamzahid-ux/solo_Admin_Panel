import React, { useState, useEffect } from 'react';
import { Users, Briefcase, FileCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Rectangle } from 'recharts';
import './Dashboard.css';
import { useGetDashboardStats, useGetRevenueStats, useGetJobsChart, useGetFeesTrend } from '../hooks/admin/dashboard/usedash';
import Loader from '../components/Loader';
import InternalLoader from '../components/InternalLoader';


const CustomBar = (props: any) => {
  const { height, payload, dataKey } = props;
  if (!height || height <= 0) return null;

  let radius: [number, number, number, number] = [0, 0, 0, 0];

  if (dataKey === 'completed') {
    // Bottom bar: round bottom corners usually, 
    // but if it's the only bar, round all corners.
    const isTop = (!payload.inProgress || payload.inProgress === 0) && (!payload.cancelled || payload.cancelled === 0);
    radius = isTop ? [8, 8, 8, 8] : [0, 0, 8, 8];
  } else if (dataKey === 'inProgress') {
    // Middle bar: round top if no cancelled bar is on top
    const isTop = !payload.cancelled || payload.cancelled === 0;
    radius = isTop ? [8, 8, 0, 0] : [0, 0, 0, 0];
  } else if (dataKey === 'cancelled') {
    // Top-most bar: always round top corners
    radius = [8, 8, 0, 0];
  }

  return <Rectangle {...props} radius={radius} />;
};

const Dashboard: React.FC = () => {
  const [feesRange, setFeesRange] = useState('today');
  const [jobsRange, setJobsRange] = useState('this_week');
  const [trendRange, setTrendRange] = useState('this_week');
  const [topCards, setTopCards] = useState<any>(null);
  const [chartData, setChartData] = useState<any>([]);
  const [trendChartData, setTrendChartData] = useState<any>([]);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRevenueLoading, setIsRevenueLoading] = useState(false);

  const { getDashboardStats } = useGetDashboardStats();
  const { getRevenueStats } = useGetRevenueStats();
  const { getJobsChart } = useGetJobsChart();
  const { getFeesTrend } = useGetFeesTrend();

  const fetchDashboardStats = async () => {
    const res = await getDashboardStats();
    setTopCards(res.data);
  };

  const fetchRevenueData = async (range: string) => {
    setIsRevenueLoading(true);
    try {
      // Map frontend range values to API values
      const apiRange = range === 'today' ? '1' : (range === '7d' ? '7' : '30');
      const res = await getRevenueStats(apiRange);
      setRevenueData(res.data);
    } finally {
      setIsRevenueLoading(false);
    }
  };

  const fetchChartData = async (range: string) => {
    const res = await getJobsChart(range);
    setChartData(res.data);
  };

  const fetchTrendChartData = async (range: string) => {
    const res = await getFeesTrend(range);
    setTrendChartData(res.data);
  };

  useEffect(() => {
    const loadAllData = async () => {
      setIsInitialLoading(true);
      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchRevenueData(feesRange),
          fetchChartData(jobsRange),
          fetchTrendChartData(trendRange)
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadAllData();
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      fetchRevenueData(feesRange);
    }
  }, [feesRange]);

  useEffect(() => {
    if (!isInitialLoading) {
      fetchChartData(jobsRange);
    }
  }, [jobsRange]);

  useEffect(() => {
    if (!isInitialLoading) {
      fetchTrendChartData(trendRange);
    }
  }, [trendRange]);

  const getFeesAmount = () => {
    if (!revenueData) return '...';
    return `€${revenueData.totalFees.toLocaleString()}`;
  };

  const getFeesGrowth = () => {
    if (!revenueData) return '...';
    const sign = revenueData.growth >= 0 ? '↑' : '↓';
    const period = feesRange === 'today' ? 'yesterday' : (feesRange === '7d' ? 'last week' : 'last month');
    return `${sign} ${Math.abs(revenueData.growth)}% from ${period}`;
  };

  const getJobsData = () => chartData;

  const getTrendData = () => trendChartData;
  console.log(trendChartData);

  if (isInitialLoading) {
    return <Loader />;
  }

  return (
    <div>
      <h1 className="dashboard-header">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-header">
            <div className="stat-icon"><Users size={20} /></div>
            <div>
              <div className="stat-value">{topCards?.users?.total}</div>
              <div className="stat-title">Total Users</div>
            </div>
          </div>
          <div className="stat-footer">
            {topCards?.users?.customers} Customers <br /> {topCards?.users?.professionals} Professionals
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Users size={20} /></div>
            <div>
              <div className="stat-value">{topCards?.activeUsers?.total}</div>
              <div className="stat-title">Active Users</div>
            </div>
          </div>
          <div className="stat-footer">
            {topCards?.activeUsers?.customers} Customers <br /> {topCards?.activeUsers?.professionals} Professionals
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}><FileCheck size={20} /></div>
            <div>
              <div className="stat-value">{topCards?.services?.total}</div>
              <div className="stat-title">Total Services</div>
            </div>
          </div>
          <div className="stat-footer" style={{ marginTop: 'auto', paddingTop: '16px' }}>
            {topCards?.services?.categories} categories
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}><Briefcase size={20} /></div>
            <div>
              <div className="stat-value">{topCards?.jobs?.total}</div>
              <div className="stat-title">Total Jobs</div>
            </div>
          </div>
          <div className="stat-footer" style={{ marginTop: 'auto', paddingTop: '16px' }}>
            {topCards?.jobs?.thisMonth} this month
          </div>
        </div>
      </div>

      <h2 className="section-title">Job Status Overview</h2>
      <div className="job-status-grid">
        <div className="mini-card">
          <div className="mini-icon yellow"><AlertCircle size={24} /></div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{topCards?.jobStatusOverview?.inProgress ?? 0}</div>
            <div className="text-muted text-sm">In Progress</div>
          </div>
        </div>
        <div className="mini-card">
          <div className="mini-icon green"><CheckCircle size={24} /></div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{topCards?.jobStatusOverview?.completed ?? 0}</div>
            <div className="text-muted text-sm">Completed</div>
          </div>
        </div>
        <div className="mini-card">
          <div className="mini-icon red"><XCircle size={24} /></div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{topCards?.jobStatusOverview?.cancelled ?? 0}</div>
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
        {isRevenueLoading ? (
          <div className="revenue-content">
            <InternalLoader size='small' />
          </div>
        ) : (
          <div className="revenue-content">
            <div className="revenue-amount"><span>💰</span>{getFeesAmount()}</div>
            <div style={{ color: 'var(--primary)', fontSize: '0.85rem', marginTop: '8px' }}>{getFeesGrowth()}</div>
          </div>
        )}
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
              <option value="this_week">This week</option>
              <option value="this_month">This month</option>
              <option value="last_month">Last month</option>
              <option value="6m">Last 6 months</option>
            </select>
          </div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getJobsData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  domain={[0, (dataMax: number) => dataMax + 1]}
                />
                <RechartsTooltip />
                <Bar dataKey="completed" stackId="a" fill="#bbf7d0" shape={<CustomBar />} />
                <Bar dataKey="inProgress" stackId="a" fill="#fef08a" shape={<CustomBar />} />
                <Bar dataKey="cancelled" stackId="a" fill="#fecaca" shape={<CustomBar />} />
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
              <option value="this_week">This week</option>
              <option value="this_month">This month</option>
              <option value="last_month">Last month</option>
              <option value="6m">Last 6 months</option>
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
