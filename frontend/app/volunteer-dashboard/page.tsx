'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipboardList, CheckCircle, Package, MapPin, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VolunteerDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [usedResources, setUsedResources] = useState<Record<string, number>>({});
  const [volunteerName, setVolunteerName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setVolunteerName(userData.name);
    }
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/volunteer/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId: string, type: string) => {
    setUpdating(taskId);
    try {
      const token = localStorage.getItem('token');
      const resourcesUsed = [{ type, quantity: usedResources[taskId] || 0 }];
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/volunteer/tasks/${taskId}/complete`, { resourcesUsed }, {
          headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      alert('Failed to complete task');
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/volunteer-login');
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white' }}>Loading tasks...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Welcome, {volunteerName || 'Volunteer'}</h1>
          <p style={{ color: 'var(--secondary)' }}>Manage your assigned tasks and update resource usage</p>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: 'var(--glass)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={18} /> Logout
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {tasks.filter(t => t.status !== 'completed').length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
            <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
            <h3>No Active Tasks</h3>
            <p style={{ color: 'var(--secondary)' }}>You are all caught up! New tasks will appear here once assigned.</p>
          </div>
        ) : (
          tasks.filter(t => t.status !== 'completed').map((task) => (
            <div key={task._id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span className="badge" style={{ background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: task.priority === 'high' ? 'var(--danger)' : 'var(--primary)' }}>
                    {task.priority.toUpperCase()} PRIORITY
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--secondary)' }}>ID: {task.task_id}</span>
                </div>
                
                <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>{task.type.toUpperCase()} Support Needed</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} />
                    <span>{task.need_id.location_id.district}, {task.need_id.location_id.city}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={16} />
                    <span>Serving {task.need_id.people_count} people</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--glass)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={20} color="var(--primary)" />
                  <span style={{ fontWeight: 600 }}>Deduct Resources</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--secondary)' }}>Amount of {task.type} used:</label>
                  <input 
                    type="number" 
                    placeholder="Enter quantity..." 
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                    onChange={(e) => setUsedResources({ ...usedResources, [task._id]: parseInt(e.target.value) })}
                  />
                </div>
                <button 
                  onClick={() => handleComplete(task._id, task.type)}
                  disabled={updating === task._id}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '12px' }}
                >
                  {updating === task._id ? 'Updating...' : 'Complete & Update'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {tasks.filter(t => t.status === 'completed').length > 0 && (
          <div style={{ marginTop: '60px' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>Recently Completed</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.6 }}>
                  {tasks.filter(t => t.status === 'completed').map(task => (
                      <div key={task._id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{task.type.toUpperCase()} - {task.need_id.location_id.city}</span>
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ COMPLETED</span>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}
