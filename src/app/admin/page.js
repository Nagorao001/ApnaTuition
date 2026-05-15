'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="main-content"><p>Loading...</p></div>;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const bars = [35, 45, 55, 75, 65, 40, 30];

  return (
    <>
      <div className="page-header">
        <h1>Overview</h1>
        <p className="text-muted">System performance and key metrics for today.</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon">👥</div>
            <span className="badge badge-success">+8% this week</span>
          </div>
          <div className="stat-card-label">Total Students</div>
          <div className="stat-card-value">{stats.totalStudents.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon">📈</div>
            <span className="badge badge-info">+1.2pts</span>
          </div>
          <div className="stat-card-label">Average Score</div>
          <div className="stat-card-value">{stats.avgScore}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{background: 'var(--badge-error-bg)', color: 'var(--badge-error-text)'}}>📋</div>
            <span className="badge badge-error">Requires Attention</span>
          </div>
          <div className="stat-card-label">Pending Assignments</div>
          <div className="stat-card-value">{stats.pendingAssignments}</div>
        </div>
      </div>

      <div className="grid-main">
        <div className="card">
          <div className="card-header">
            <h3>Platform Activity</h3>
            <span className="badge badge-info">This Week</span>
          </div>
          <div className="bar-chart">
            {days.map((d, i) => (
              <div className="bar-chart-col" key={d}>
                <div className="bar" style={{
                  height: `${bars[i]}%`,
                  background: i === 3 ? 'var(--chart-bar-2)' : i < 3 ? 'var(--chart-bar-1)' : 'var(--chart-bar-3)'
                }} />
                <span className="bar-label">{d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <a href="#" className="body-sm text-muted">View All</a>
          </div>
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.slice(0, 5).map((a, i) => {
              const colors = ['avatar-blue', 'avatar-orange', 'avatar-purple', 'avatar-green'];
              const initials = a.user_name.split(' ').map(w => w[0]).join('');
              return (
                <div className="activity-item" key={a.id || i}>
                  <div className={`avatar ${colors[i % 4]}`}>{initials}</div>
                  <div>
                    <div className="activity-text"><strong>{a.user_name}</strong> {a.details || a.action}</div>
                    <div className="activity-meta">{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted body-sm">No recent activity.</p>
          )}
        </div>
      </div>
    </>
  );
}
