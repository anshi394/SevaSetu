'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, User, Clock, CheckCircle2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/modules/tasks`;
const REASSIGN_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/modules/reassign`;

export default function TasksPage() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [reassignMsg, setReassignMsg] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE, { params: { page, limit: 12 } });
      setData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async () => {
    setReassigning(true);
    setReassignMsg('');
    try {
      await axios.post(REASSIGN_URL);
      setReassignMsg('Re-assignment triggered! Refreshing in 2s...');
      setTimeout(() => { fetchData(); setReassignMsg(''); }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setReassigning(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, [page]);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.35)' };
      case 'medium': return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.35)' };
      default: return { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.35)' };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'in-progress': return { color: 'var(--success)', label: '● Active' };
      case 'queued': return { color: 'var(--warning)', label: '● Queued' };
      case 'awaiting-logistics': return { color: '#f59e0b', label: '● Awaiting Logistics' };
      case 'completed': return { color: 'var(--primary)', label: '● Done' };
      default: return { color: 'var(--secondary)', label: '● Backlog' };
    }
  };

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Task Management</h1>
          <p style={{ color: 'var(--secondary)', marginTop: '6px' }}>
            {total} active operational tasks — auto-assigned to eligible volunteers
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <button
            onClick={handleReassign}
            disabled={reassigning}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--glass)', border: '1px solid var(--card-border)',
              color: 'var(--primary)', padding: '10px 20px',
              borderRadius: '12px', fontWeight: 700, fontSize: '14px',
              cursor: reassigning ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={16} style={{ animation: reassigning ? 'spin 1s linear infinite' : 'none' }} />
            {reassigning ? 'Assigning...' : 'Re-assign Volunteers'}
          </button>
          {reassignMsg && <span style={{ fontSize: '13px', color: 'var(--success)' }}>{reassignMsg}</span>}
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--secondary)' }}>Loading tasks...</div>
      ) : data.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>No tasks found</p>
          <p style={{ color: 'var(--secondary)', marginBottom: '24px' }}>Upload Needs CSV first, then Volunteers CSV to auto-generate and assign tasks.</p>
          <a href="/upload" style={{ color: 'var(--primary)', fontWeight: 700 }}>→ Go to Upload</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {data.map((task: any) => {
            const pStyle = getPriorityStyle(task.priority);
            const sStyle = getStatusStyle(task.status);
            return (
              <div key={task._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                {/* Delete button */}
                <button onClick={() => handleDelete(task._id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer', padding: '4px' }}>
                  <Trash2 size={15} />
                </button>

                {/* Priority Badge + Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    textTransform: 'uppercase', background: pStyle.bg, color: pStyle.color,
                    border: `1px solid ${pStyle.border}`
                  }}>
                    {task.priority || 'low'} Priority
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: sStyle.color }}>{sStyle.label}</span>
                </div>

                {/* Task Title */}
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, textTransform: 'capitalize' }}>
                    {task.type || 'General'} Assistance
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--secondary)', marginTop: '3px' }}>
                    {task.need_id?.need_id || task.task_id || 'N/A'}
                  </p>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 0', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
                  {/* Volunteer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <User size={15} color={task.assigned_to ? 'var(--success)' : task.eligible_volunteer ? 'var(--warning)' : 'var(--danger)'} />
                    <span style={{ fontWeight: 600, color: task.assigned_to ? 'var(--text)' : 'var(--warning)' }}>
                      {task.assigned_to ? task.assigned_to.name : task.eligible_volunteer ? `${task.eligible_volunteer.name} (Matched)` : '⚠ No volunteer matched yet'}
                    </span>
                  </div>
                  {task.status === 'awaiting-logistics' && (
                    <div style={{ paddingLeft: '25px', fontSize: '12px', color: 'var(--warning)', fontWeight: 600 }}>
                      ⚠ Missing resources to proceed.
                    </div>
                  )}
                  {task.assigned_to?.skills && (
                    <div style={{ paddingLeft: '25px', fontSize: '12px', color: 'var(--secondary)' }}>
                      Skills: {Array.isArray(task.assigned_to.skills) ? task.assigned_to.skills.join(', ') : task.assigned_to.skills}
                    </div>
                  )}

                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <MapPin size={15} color="var(--secondary)" />
                    <span>
                      {task.need_id?.location_id
                        ? `${task.need_id.location_id.district}, ${task.need_id.location_id.city}`
                        : 'Location not found'}
                    </span>
                  </div>

                  {/* People count */}
                  {task.need_id?.people_count && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <Clock size={15} color="var(--secondary)" />
                      <span>{task.need_id.people_count} people affected</span>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ fontSize: '13px', padding: '8px 16px', opacity: (task.status === 'queued' || task.status === 'awaiting-logistics' || task.status === 'backlog') ? 0.5 : 1, cursor: (task.status === 'queued' || task.status === 'awaiting-logistics' || task.status === 'backlog') ? 'not-allowed' : 'pointer' }}
                    onClick={() => (task.status === 'in-progress' || task.status === 'completed') && setSelectedTask(task)}
                  >
                    {task.status === 'completed' ? 'View Report' : task.status === 'in-progress' ? 'Track Progress' : 'Pending Start'}
                  </button>
                  {task.status === 'in-progress' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Assigned & Active
                    </div>
                  )}
                  {(task.status === 'queued' || task.status === 'backlog') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontSize: '12px', fontWeight: 600 }}>
                      <AlertCircle size={14} /> Awaiting Volunteer
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn" style={{ background: 'var(--glass)' }}>
            Previous
          </button>
          <span style={{ fontWeight: 600 }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn" style={{ background: 'var(--glass)' }}>
            Next
          </button>
        </div>
      )}

      {/* Tracking Modal */}
      {selectedTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedTask(null)}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '32px', width: '480px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Task Tracking</h2>
              <button onClick={() => setSelectedTask(null)} style={{ background: 'var(--glass)', border: 'none', color: 'var(--text)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--secondary)' }}>Task ID</p>
                <p style={{ fontWeight: 700 }}>{selectedTask.task_id}</p>
              </div>

              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '16px' }}>
                <div style={{ position: 'absolute', left: '21px', top: '10px', bottom: '10px', width: '2px', background: 'var(--card-border)' }} />

                <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', zIndex: 1, marginTop: '4px' }} />
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '14px' }}>Task Generated</h4>
                    <p style={{ fontSize: '12px', color: 'var(--secondary)' }}>Need identified and priority set to {selectedTask.priority}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: selectedTask.assigned_to ? 'var(--primary)' : 'var(--card-border)', zIndex: 1, marginTop: '4px' }} />
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '14px', color: selectedTask.assigned_to ? 'var(--text)' : 'var(--secondary)' }}>Volunteer Assigned</h4>
                    <p style={{ fontSize: '12px', color: 'var(--secondary)' }}>
                      {selectedTask.assigned_to ? `Assigned to ${selectedTask.assigned_to.name}` : 'Awaiting eligible volunteer match...'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: selectedTask.status === 'in-progress' || selectedTask.status === 'completed' ? 'var(--warning)' : 'var(--card-border)', zIndex: 1, marginTop: '4px' }} />
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '14px', color: selectedTask.status === 'in-progress' || selectedTask.status === 'completed' ? 'var(--text)' : 'var(--secondary)' }}>Action Accepted</h4>
                    <p style={{ fontSize: '12px', color: 'var(--secondary)' }}>
                      {selectedTask.status === 'in-progress' ? 'Volunteer has acknowledged and is en route.' : selectedTask.status === 'completed' ? 'Action was completed.' : 'Pending volunteer confirmation.'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: selectedTask.status === 'completed' ? 'var(--success)' : 'var(--card-border)', zIndex: 1, marginTop: '4px' }} />
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '14px', color: selectedTask.status === 'completed' ? 'var(--text)' : 'var(--secondary)' }}>Completed</h4>
                    <p style={{ fontSize: '12px', color: 'var(--secondary)' }}>
                      {selectedTask.status === 'completed' ? 'Task resolved successfully.' : 'Task is currently active.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
