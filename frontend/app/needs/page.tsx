'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '@/components/DataTable';

const API_BASE = 'http://127.0.0.1:5000/api/modules/needs';

export default function NeedsPage() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ severity: '', need_type: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { severity, need_type } = filters;
      const res = await axios.get(API_BASE, {
        params: { page, limit: 10, severity, need_type }
      });
      setData(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this need?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filters]);

  const columns = [
    { key: 'need_id', label: 'ID' },
    { key: 'need_type', label: 'Type' },
    { key: 'people_count', label: 'People' },
    { 
      key: 'severity', 
      label: 'Severity',
      render: (val: string) => (
        <span style={{ 
          color: val === 'high' ? 'var(--danger)' : val === 'medium' ? 'var(--warning)' : 'var(--success)',
          fontWeight: 600,
          textTransform: 'uppercase',
          fontSize: '12px'
        }}>{val}</span>
      )
    },
    { 
      key: 'location_id', 
      label: 'Location',
      render: (val: any) => val ? `${val.district}, ${val.city}` : 'N/A'
    },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Needs & Beneficiaries</h1>
          <p style={{ color: 'var(--secondary)', marginTop: '8px' }}>Tracking humanitarian requirements across regions</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            style={{ 
              background: 'var(--card)', color: 'white', border: '1px solid var(--card-border)', 
              padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' 
            }}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
          >
            <option value="">All Severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input 
            type="text" 
            placeholder="Search Type..." 
            style={{ 
              background: 'var(--card)', color: 'white', border: '1px solid var(--card-border)', 
              padding: '8px 12px', borderRadius: '8px' 
            }}
            onChange={(e) => setFilters(prev => ({ ...prev, need_type: e.target.value }))}
          />
        </div>
      </header>

      <DataTable 
        columns={columns} 
        data={data} 
        page={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}
