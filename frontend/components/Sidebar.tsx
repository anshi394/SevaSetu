'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Heart, 
  MapPin, 
  Package, 
  ClipboardList, 
  UploadCloud, 
  Bell,
  LogOut
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Needs', icon: Heart, path: '/needs' },
  { name: 'Volunteers', icon: Users, path: '/volunteers' },
  { name: 'Tasks', icon: ClipboardList, path: '/tasks' },
  { name: 'Resources', icon: Package, path: '/resources' },
  { name: 'Facilities', icon: MapPin, path: '/facilities' },
  { name: 'Upload', icon: UploadCloud, path: '/upload' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/volunteer-login';
  if (isAuthPage) return null;

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>S</div>
        <span className={styles.logoText}>SevaSetu</span>
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        {user && (
          <div style={{ marginBottom: '16px', padding: '0 12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--secondary)' }}>Logged in as</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{user.name}</p>
          </div>
        )}
        <Link href="/volunteer-login" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', display: 'block', marginBottom: '16px', textAlign: 'center', fontWeight: 600 }}>
          → Switch to Volunteer Portal
        </Link>
        <button onClick={handleLogout} className={styles.logoutBtn} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
