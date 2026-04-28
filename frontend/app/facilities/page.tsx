'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '@/components/DataTable';

const API_BASE = 'http://127.0.0.1:5000/api/modules/facilities';

export default function FacilitiesPage() {
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
    if (!confirm('Are you sure you want to delete this facility?')) return;
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
    { key: 'facility_id', label: 'ID' },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Total Capacity' },
    { key: 'occupancy', label: 'Current Occupancy' },
    { 
      key: 'location_id', 
      label: 'Location',
      render: (val: any) => val ? `${val.district}, ${val.city}` : 'N/A'
    },
    { 
      key: 'status_bar', 
      label: 'Status',
      render: (_: any, row: any) => {
        const percent = (row.occupancy / row.capacity) * 100;
        return (
          <div style={{ width: '100px', height: '8px', background: 'var(--glass)', borderRadius: '4px' }}>
            <div style={{ 
              width: `${Math.min(percent, 100)}%`, height: '100%', 
              background: percent > 90 ? 'var(--danger)' : percent > 70 ? 'var(--warning)' : 'var(--success)',
              borderRadius: '4px' 
            }} />
          </div>
        )
      }
    }
  ];

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Infrastructure & Facilities</h1>
        <p style={{ color: 'var(--secondary)', marginTop: '8px' }}>Monitoring capacity and occupancy across NGO shelters and clinics</p>
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
