'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '@/components/DataTable';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/modules/resources`;

export default function ResourcesPage() {
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
    if (!confirm('Are you sure you want to delete this resource?')) return;
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
    { key: 'resource_id', label: 'ID' },
    { key: 'type', label: 'Resource Type' },
    { key: 'quantity', label: 'Stock Level' },
    { 
      key: 'location_id', 
      label: 'Warehouse Location',
      render: (val: any) => val ? `${val.district}, ${val.city}` : 'N/A'
    },
    { 
      key: 'status', 
      label: 'Availability',
      render: (val: string) => (
        <span style={{ 
          color: val === 'out' ? 'var(--danger)' : val === 'low' ? 'var(--warning)' : 'var(--success)',
          fontWeight: 600,
          textTransform: 'uppercase',
          fontSize: '12px'
        }}>{val}</span>
      )
    },
  ];

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Resource Management</h1>
        <p style={{ color: 'var(--secondary)', marginTop: '8px' }}>Tracking inventory levels and supply chain logistics</p>
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
