'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Heart, 
  Users, 
  ClipboardCheck, 
  AlertTriangle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';


const API_BASE = 'http://127.0.0.1:5000/api';

const PRIORITY_COLORS: Record<string, string> = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

const TYPE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltipNeeds = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: '#fff', fontWeight: 700 }}>{payload[0].value} Needs</p>
        {payload[1] && <p style={{ color: '#06b6d4', fontSize: '12px' }}>{payload[1].value} People Affected</p>}
      </div>
    );
  }
  return null;
};

const CustomTooltipPriority = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>{label} Priority</p>
        <p style={{ color: '#fff', fontWeight: 700 }}>{payload[0].value} Tasks</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    totalNeeds: 0,
    highPriorityNeeds: 0,
    activeTasks: 0,
    totalVolunteers: 0,
    taskPriorityDistribution: [],
    needTrends: [],
    dailyNeedTrends: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/modules/stats`);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { title: 'Total Needs', value: stats.totalNeeds, icon: Heart, color: 'var(--primary)' },
    { title: 'High Priority', value: stats.highPriorityNeeds, icon: AlertTriangle, color: 'var(--danger)' },
    { title: 'Active Tasks', value: stats.activeTasks, icon: ClipboardCheck, color: 'var(--success)' },
    { title: 'Available Volunteers', value: stats.totalVolunteers, icon: Users, color: 'var(--accent)' },
  ];

  return (
    <div>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Operational Dashboard</h1>
          <p style={{ color: 'var(--secondary)', marginTop: '8px' }}>Real-time data-driven NGO management</p>
        </div>
        <div style={{ padding: '4px 12px', background: 'var(--glass)', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>
          System v2.1 (Live Update)
        </div>
      </header>

      {/* Stat Cards */}
      <div className="dashboard-grid" style={{ padding: 0 }}>
        {cards.map((card, idx) => (
          <div key={idx} className="glass-card stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-label">{card.title}</span>
              <card.icon color={card.color} size={24} />
            </div>
            <span className="stat-value">{card.value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Need Breakdown by Type */}
        <div className="glass-card" style={{ height: '360px' }}>
          <h3 style={{ marginBottom: '8px' }}>Needs by Type</h3>
          <p style={{ color: 'var(--secondary)', fontSize: '13px', marginBottom: '20px' }}>Count of needs & people affected per category</p>
          {stats.needTrends.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--secondary)', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '32px' }}>📭</span>
              <span>No needs data yet. Upload a needs CSV to see data.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="82%">
              <BarChart data={stats.needTrends} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltipNeeds />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Needs">
                  {stats.needTrends.map((_: any, index: number) => (
                    <Cell key={index} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Bar>
                <Bar dataKey="people" radius={[6, 6, 0, 0]} fill="#06b6d4" opacity={0.5} name="People" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Task Priority Distribution */}
        <div className="glass-card" style={{ height: '360px' }}>
          <h3 style={{ marginBottom: '8px' }}>Task Priority Distribution</h3>
          <p style={{ color: 'var(--secondary)', fontSize: '13px', marginBottom: '20px' }}>Number of tasks grouped by urgency level</p>
          {stats.taskPriorityDistribution.every((d: any) => d.count === 0) ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--secondary)', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '32px' }}>📋</span>
              <span>No tasks yet. Tasks are auto-generated after upload.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="82%">
              <BarChart data={stats.taskPriorityDistribution} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip content={<CustomTooltipPriority />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.taskPriorityDistribution.map((entry: any) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Floating Alerts Button */}

    </div>
  );
}
