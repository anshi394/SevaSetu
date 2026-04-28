'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/volunteer-login';

    // 1. Redirect to login if no token
    if (!token && !isAuthPage) {
      router.push('/login');
    }

    // 2. Attach token to axios
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // 3. Simple role-based access
    if (role === 'volunteer' && !pathname.startsWith('/volunteer-dashboard') && !isAuthPage) {
        router.push('/volunteer-dashboard');
    }
    
    if (role === 'admin' && pathname === '/volunteer-dashboard') {
        router.push('/');
    }

  }, [pathname]);

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/volunteer-login';
  const isVolunteer = typeof window !== 'undefined' && localStorage.getItem('role') === 'volunteer';

  return (
    <div style={{ display: 'flex' }}>
      {/* Only show sidebar for Admin and not on auth pages */}
      {!isAuthPage && !isVolunteer && <div style={{ width: '260px' }} />} 
      
      <main style={{ 
        flex: 1, 
        padding: isAuthPage ? '0' : '40px',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}>
        {children}
      </main>
    </div>
  );
}
