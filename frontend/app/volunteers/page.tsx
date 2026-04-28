'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '@/components/DataTable';

const API_BASE = '${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/modules/volunteers';

export default function VolunteersPage() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE, {
        params: { page, limit: 10 }
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
    if (!confirm('Are you sure you want to delete this volunteer?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const columns = [
    { key: 'volunteer_id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { 
      key: 'skills', 
      label: 'Skills',
      render: (val: string[]) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {val.map((s, i) => (
            <span key={i} style={{ 
              background: 'var(--glass)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' 
            }}>{s}</span>
          ))}
        </div>
      )
    },
    { 
      key: 'location_id', 
      label: 'Location',
      render: (val: any) => val ? `${val.district}, ${val.city}` : 'N/A'
    },
    { 
      key: 'availability', 
      label: 'Availability',
      render: (val: string) => (
        <span style={{ color: val === 'available' ? 'var(--success)' : 'var(--warning)' }}>{val}</span>
      )
    },
    { 
      key: 'passkey', 
      label: 'Passkey (Login)',
      render: (val: string) => <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: 'var(--primary)' }}>{val || 'N/A'}</code>
    },
  ];

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Volunteer Directory</h1>
        <p style={{ color: 'var(--secondary)', marginTop: '8px' }}>Manage and assign humanitarian personnel</p>
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
