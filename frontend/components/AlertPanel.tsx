'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Bell, X } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/modules/alerts';

export default function AlertPanel() {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(API_BASE);
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await axios.put(`${API_BASE}/${id}/read`);
      setAlerts(prev => prev.filter((a: any) => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = alerts.filter((a: any) => a.severity === 'critical').length;

  return (
    <>
      {/* Floating Alerts Button */}
      {!isHidden ? (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 1000 }}>
          {/* Main Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsHidden(true)}
              style={{ 
                position: 'absolute', top: '-10px', right: '-10px',
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                color: 'var(--secondary)', borderRadius: '50%', width: '24px', height: '24px', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 1001
              }}
              title="Hide Alerts Panel"
            >
              <X size={12} />
            </button>
            <button
              onClick={() => setOpen(true)}
              style={{
                background: criticalCount > 0 ? 'var(--danger)' : 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                padding: '14px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                transition: 'all 0.2s ease',
                animation: criticalCount > 0 ? 'pulse 2s infinite' : 'none',
              }}
            >
              <Bell size={20} />
              {criticalCount > 0 ? `${criticalCount} Critical Alert${criticalCount > 1 ? 's' : ''}` : `See Alerts (${alerts.length})`}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsHidden(false)}
          style={{
            position: 'fixed', bottom: '32px', right: '32px', zIndex: 1000,
            background: 'var(--glass)', border: '1px solid var(--card-border)',
            color: criticalCount > 0 ? 'var(--danger)' : 'var(--secondary)',
            borderRadius: '50%', width: '48px', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
          title="Show Alerts"
        >
          <Bell size={20} />
          {criticalCount > 0 && <div style={{ position: 'absolute', top: '0', right: '0', background: 'var(--danger)', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--bg)' }} />}
        </button>
      )}

      {/* Alerts Modal Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '20px',
              padding: '32px',
              width: '560px',
              maxHeight: '70vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>System Alerts</h2>
                <p style={{ color: 'var(--secondary)', fontSize: '13px', marginTop: '4px' }}>
                  Only critical operational alerts are shown
                </p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'var(--glass)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Alert List */}
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--secondary)' }}>
                ✅ No critical alerts at this time.
              </div>
            ) : (
              alerts.map((alert: any) => (
                <div key={alert._id} style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '16px',
                  background: alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.07)' : 'rgba(245, 158, 11, 0.07)',
                  borderRadius: '12px',
                  border: `1px solid ${alert.severity === 'critical' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                }}>
                  <AlertCircle size={20} color={alert.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.5 }}>{alert.message}</p>
                    <p style={{ fontSize: '11px', color: 'var(--secondary)', marginTop: '4px' }}>
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDismiss(alert._id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer', padding: '4px', alignSelf: 'flex-start' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(239,68,68,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 8px 48px rgba(239,68,68,0.7); }
        }
      `}</style>
    </>
  );
}
