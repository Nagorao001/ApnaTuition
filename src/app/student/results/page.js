'use client';
import { useState, useEffect } from 'react';

export default function StudentResults() {
  const [scores, setScores] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setUser(d.user);
      if (d.user) fetch(`/api/scores?student_id=${d.user.id}`).then(r => r.json()).then(s => setScores(s.scores || []));
    });
  }, []);

  const avgScore = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0;
  const prevAvg = scores.length > 2 ? Math.round(scores.slice(2).reduce((a, s) => a + s.score, 0) / (scores.length - 2)) : avgScore;
  const trend = avgScore - prevAvg;
  const weekly = scores.filter(s => s.type === 'weekly');
  const monthly = scores.filter(s => s.type === 'monthly');

  const badges = [
    { name: 'Top Scorer', meta: 'Math · Oct', icon: '🏆', color: '#dcfce7' },
    { name: 'Fast Learner', meta: 'Physics', icon: '⚡', color: '#dbeafe' },
    { name: 'Perfect Month', meta: 'Literature', icon: '🔒', color: '#f3f4f6' },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Test Results</h1><p className="text-muted">Track your academic progress and achievements.</p></div>
          <div className="flex-row gap-sm">
            <button className="btn btn-secondary btn-sm">🔍 Filter</button>
            <button className="btn btn-secondary btn-sm">📥 Export</button>
          </div>
        </div>
      </div>

      <div className="grid-main mb-lg">
        <div>
          <div className="card mb-lg">
            <div className="flex-between mb-md">
              <h3 className="headline-sm">Overall Performance</h3>
              <span className="badge badge-info">Last 6 Months</span>
            </div>
            <div className="line-chart-area">
              <svg viewBox="0 0 400 120" style={{width:'100%',height:'100%'}}>
                <polyline fill="none" stroke="var(--teal)" strokeWidth="2" points={
                  scores.slice().reverse().map((s, i, arr) => `${(i / Math.max(arr.length - 1, 1)) * 380 + 10},${110 - s.score}`).join(' ')
                } />
                <polyline fill="url(#grad)" stroke="none" points={
                  `10,110 ${scores.slice().reverse().map((s, i, arr) => `${(i / Math.max(arr.length - 1, 1)) * 380 + 10},${110 - s.score}`).join(' ')} 390,110`
                } />
                <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--teal)" stopOpacity="0.2"/><stop offset="100%" stopColor="var(--teal)" stopOpacity="0"/></linearGradient></defs>
              </svg>
            </div>
            <div className="flex-row gap-lg" style={{marginTop:12}}>
              <div><span className="body-sm text-muted">Avg Score</span><div style={{fontSize:24,fontWeight:700,color:'var(--teal)'}}>{avgScore}%</div></div>
              <div><span className="body-sm text-muted">Trend</span><div style={{fontSize:24,fontWeight:700,color: trend >= 0 ? 'var(--teal)' : 'var(--error)'}}>
                {trend >= 0 ? '+' : ''}{trend}%
              </div></div>
            </div>
          </div>

          <div className="card">
            <h3 className="headline-sm mb-md">Recent Assessments</h3>
            {weekly.length > 0 && (<>
              <div className="label-sm text-muted mb-sm">Weekly Tests</div>
              <div className="table-wrap mb-lg">
                <table>
                  <thead><tr><th>Date</th><th>Subject</th><th>Topic</th><th>Score</th><th>Status</th></tr></thead>
                  <tbody>
                    {weekly.map(s => (
                      <tr key={s.id}>
                        <td className="body-sm">{s.test_date}</td>
                        <td><span className="chip">{s.subject}</span></td>
                        <td className="body-sm">{s.test_title}</td>
                        <td style={{fontWeight:600,color: s.score >= 80 ? 'var(--teal)' : 'var(--on-surface)'}}>{s.score}%</td>
                        <td>{s.score >= 60 ? <span className="badge badge-success">✓ Pass</span> : <span className="badge badge-error">✗ Fail</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>)}
            {monthly.length > 0 && (<>
              <div className="label-sm text-muted mb-sm">Monthly Reviews</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Month</th><th>Focus Area</th><th>Score</th></tr></thead>
                  <tbody>
                    {monthly.map(s => (
                      <tr key={s.id}>
                        <td className="body-sm">{s.test_date}</td>
                        <td className="body-sm">{s.test_title}</td>
                        <td style={{fontWeight:600,color:'var(--teal)'}}>{s.score}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>)}
          </div>
        </div>

        <div>
          <div className="card mb-lg">
            <h3 className="headline-sm mb-md">Performance Badges</h3>
            <div className="badge-grid">
              {badges.map(b => (
                <div className="perf-badge" key={b.name}>
                  <div className="perf-badge-icon" style={{background: b.color}}>{b.icon}</div>
                  <div className="perf-badge-name">{b.name}</div>
                  <div className="perf-badge-meta">{b.meta}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="milestone-card">
            <h3>Next Milestone</h3>
            <p>Achieve 90% in upcoming Chemistry mock exam to unlock the &quot;Science Whiz&quot; badge.</p>
            <div className="progress-bar" style={{margin:'16px 0 8px'}}>
              <div className="progress-fill" style={{width: `${avgScore}%`}} />
            </div>
            <div className="flex-between"><span className="label-sm">Current: {avgScore}%</span><span className="label-sm">Goal: 90%</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
