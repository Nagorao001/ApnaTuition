'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Student Management', href: '/admin/students', icon: '👥' },
  { label: 'Notes Manager', href: '/admin/notes', icon: '📄' },
  { label: 'Test Manager', href: '/admin/tests', icon: '📝' },
  { label: 'Results', href: '/admin/results', icon: '📈' },
  { label: 'Games', href: '/admin/games', icon: '🎮' },
  { label: 'Support Messages', href: '/admin/support', icon: '💬' },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
    fetch('/api/theme', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme: next }) });
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">AT</div>
          <div><h2>ApnaTuition</h2><span>Admin Portal</span></div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <a key={n.href} href={n.href} className={`sidebar-link ${pathname === n.href ? 'active' : ''}`}>
              <span className="icon">{n.icon}</span>{n.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-cta" onClick={() => router.push('/admin/students')}>
            📢 System Updates
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button className="sidebar-link" onClick={logout}>🚪 Logout</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
