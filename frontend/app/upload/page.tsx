'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertCircle, FileText, RefreshCw } from 'lucide-react';

const API_BASE = '${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/upload';
const MODULES_BASE = '${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/modules';

const uploadSections = [
  { id: 'needs', title: 'Needs / Beneficiaries', description: 'Upload offline survey data or beneficiary reports.' },
  { id: 'volunteers', title: 'Volunteers', description: 'Onboard new volunteers with skills and availability.' },
  { id: 'facilities', title: 'Facilities', description: 'Update status of shelters, clinics, and schools.' },
  { id: 'resources', title: 'Resources', description: 'Manage inventory and resource allocation data.' },
];

export default function UploadPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, 'success' | 'error' | null>>({});
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleUpload = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setLoading(id);
    setStatus(prev => ({ ...prev, [id]: null }));
    try {
      await axios.post(`${API_BASE}/${id}`, formData);
      setStatus(prev => ({ ...prev, [id]: 'success' }));
    } catch (err) {
      console.error(err);
      setStatus(prev => ({ ...prev, [id]: 'error' }));
    } finally {
      setLoading(null);
    }
  };

  const handleReset = async () => {
    if (!confirm('⚠️ This will permanently delete ALL data including needs, volunteers, tasks, alerts, facilities and resources. Continue?')) return;
    setResetting(true);
    setResetDone(false);
    try {
      await axios.post(`${MODULES_BASE}/reset`);
      setResetDone(true);
      setStatus({});
    } catch (err) {
      console.error(err);
      alert('Reset failed. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const [manualForm, setManualForm] = useState<string | null>(null);
  const [manualData, setManualData] = useState<any>({});
  const [manualStatus, setManualStatus] = useState<string | null>(null);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualStatus('loading');
    try {
      const typeMap: Record<string, string> = {
        'needs': 'need',
        'volunteers': 'volunteer',
        'facilities': 'facility',
        'resources': 'resource'
      };
      const type = typeMap[manualForm!];
      const res = await axios.post(`${API_BASE}/manual/${type}`, manualData);
      
      if (type === 'volunteer' && res.data.passkey) {
        setManualStatus(`Success! Passkey for volunteer: ${res.data.passkey}`);
      } else {
        setManualStatus('Success! Data added manually.');
      }
      setTimeout(() => {
        setManualForm(null);
        setManualStatus(null);
        setManualData({});
      }, 3000);
    } catch (err) {
      console.error(err);
      setManualStatus('Error: Failed to add data.');
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Data Upload Center</h1>
          <p style={{ color: 'var(--secondary)', marginTop: '8px' }}>Sync offline data with SevaSetu&apos;s intelligence engine</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <button
            onClick={handleReset}
            disabled={resetting}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: resetting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={16} style={{ animation: resetting ? 'spin 1s linear infinite' : 'none' }} />
            {resetting ? 'Resetting System...' : 'Reset All Data'}
          </button>
          {resetDone && (
            <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
              ✓ System reset! Upload fresh data below.
            </span>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {uploadSections.map((section) => (
          <div key={section.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', background: 'var(--glass)',
                  borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FileText size={24} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px' }}>{section.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>{section.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setManualForm(section.id)}
                style={{ fontSize: '12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
              >
                + Manual Add
              </button>
            </div>

            <label style={{
              border: status[section.id] === 'success' ? '2px dashed var(--success)' : status[section.id] === 'error' ? '2px dashed var(--danger)' : '2px dashed var(--card-border)',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              cursor: loading !== null ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
              background: loading === section.id ? 'var(--glass)' : 'transparent'
            }} className="upload-dropzone">
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleUpload(section.id, e.target.files[0])}
                disabled={loading !== null}
              />
              {loading === section.id ? (
                <div className="spinner" />
              ) : status[section.id] === 'success' ? (
                <CheckCircle color="var(--success)" size={32} />
              ) : status[section.id] === 'error' ? (
                <AlertCircle color="var(--danger)" size={32} />
              ) : (
                <UploadCloud color="var(--secondary)" size={32} />
              )}
              <span style={{ fontWeight: 600 }}>
                {loading === section.id ? 'Processing & Running Intelligence Engine...' :
                  status[section.id] === 'success' ? '✓ Upload Successful — Tasks Auto-Generated' :
                  status[section.id] === 'error' ? 'Upload Failed. Try again.' :
                  'Click to upload CSV'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--secondary)' }}>Max file size: 10MB (approx. 100k rows)</span>
            </label>
          </div>
        ))}
      </div>

      {/* Manual Entry Modal */}
      {manualForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleManualSubmit} className="glass-card" style={{ width: '500px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '24px' }}>Manual {manualForm.slice(0, -1)} Entry</h2>
            
            {manualStatus && (
              <div style={{ padding: '12px', borderRadius: '8px', background: manualStatus.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: manualStatus.includes('Error') ? 'var(--danger)' : 'var(--success)', fontSize: '14px', fontWeight: 600 }}>
                {manualStatus}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input placeholder="State" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, state: e.target.value})} />
              <input placeholder="District" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, district: e.target.value})} />
              <input placeholder="City" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, city: e.target.value})} />
              
              {manualForm === 'needs' && (
                <>
                  <input placeholder="Type (food, medical...)" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, need_type: e.target.value})} />
                  <input placeholder="People Count" type="number" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, people_count: e.target.value})} />
                  <select required style={{ padding: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, severity: e.target.value})}>
                    <option value="" style={{background: '#1a1a1a'}}>Select Severity</option>
                    <option value="low" style={{background: '#1a1a1a'}}>Low</option>
                    <option value="medium" style={{background: '#1a1a1a'}}>Medium</option>
                    <option value="high" style={{background: '#1a1a1a'}}>High</option>
                  </select>
                </>
              )}

              {manualForm === 'volunteers' && (
                <>
                  <input placeholder="Name" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, name: e.target.value})} />
                  <input placeholder="Email" style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, email: e.target.value})} />
                  <input placeholder="Skills (comma separated)" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, skills: e.target.value})} />
                  <input placeholder="Custom Passkey (Optional)" style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, password: e.target.value})} />
                </>
              )}

              {manualForm === 'facilities' && (
                <>
                  <input placeholder="Facility ID" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, facility_id: e.target.value})} />
                  <input placeholder="Name" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, name: e.target.value})} />
                  <input placeholder="Type" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, type: e.target.value})} />
                  <input placeholder="Capacity" type="number" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, capacity: e.target.value})} />
                </>
              )}

              {manualForm === 'resources' && (
                <>
                  <input placeholder="Resource ID" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, resource_id: e.target.value})} />
                  <input placeholder="Type (food, water...)" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, type: e.target.value})} />
                  <input placeholder="Quantity" type="number" required style={{ padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} onChange={e => setManualData({...manualData, quantity: e.target.value})} />
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="button" onClick={() => setManualForm(null)} className="btn" style={{ flex: 1, background: 'var(--glass)', color: 'white' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Save to System</button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .spinner {
          width: 32px; height: 32px;
          border: 3px solid var(--glass);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .upload-dropzone:hover { border-color: var(--primary) !important; background: var(--glass); }
      `}</style>
    </div>
  );
}
