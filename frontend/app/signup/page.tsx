'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, User } from 'lucide-react';

export default function AdminSignup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/auth/admin/signup`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('user', JSON.stringify(res.data.admin));
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <form onSubmit={handleSubmit} className="glass-card" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ background: 'var(--primary)', color: 'white', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Admin Signup</h1>
          <p style={{ color: 'var(--secondary)', fontSize: '14px', marginTop: '4px' }}>Create an account to start managing resources</p>
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
            <input
              type="text"
              placeholder="Full Name"
              required
              style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
            <input
              type="email"
              placeholder="Email Address"
              required
              autoComplete="off"
              style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
            <input
              type="password"
              placeholder="Password"
              required
              autoComplete="new-password"
              style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '14px', borderRadius: '10px' }}>Create Admin Account</button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--secondary)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
        </p>
      </form>
    </div>
  );
}
