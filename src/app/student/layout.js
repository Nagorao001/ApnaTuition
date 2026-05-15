'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const NAV = [
  { label: 'Dashboard', href: '/student', icon: '📊' },
  { label: 'My Profile', href: '/student/profile', icon: '👤' },
  { label: 'Tests', href: '/student/tests', icon: '📝' },
  { label: 'Test Results', href: '/student/results', icon: '📈' },
  { label: 'Games Hub', href: '/student/games', icon: '🎮' },
  { label: 'Notes Library', href: '/student/notes', icon: '📚' },
];

export default function StudentLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
  }, []);

  // Close sidebar when pathname changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{alignItems: 'center'}}>
          {user?.photo_url ? (
            <img src={user.photo_url} alt="DP" style={{width: 36, height: 36, borderRadius: '50%', objectFit: 'cover'}} />
          ) : (
            <div className="sidebar-logo-icon">{user?.name ? user.name[0] : 'S'}</div>
          )}
          <div><h2 style={{fontSize: 16}}>{user?.name || 'Student'}</h2><span style={{fontSize: 12}}>{user?.student_id || 'Portal'}</span></div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <a key={n.href} href={n.href} className={`sidebar-link ${pathname === n.href ? 'active' : ''}`}>
              <span className="icon">{n.icon}</span>{n.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-cta" onClick={() => router.push('/student/support')}>💬 Get Support</button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button className="sidebar-link" onClick={logout}>🚪 Logout</button>
        </div>
      </aside>

      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <header className="mobile-header">
          <div className="flex-row">
            <div className="sidebar-logo-icon" style={{width: 32, height: 32}}>AT</div>
            <h2 style={{fontSize: 18}}>ApnaTuition</h2>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={() => setSidebarOpen(true)}>☰</button>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
