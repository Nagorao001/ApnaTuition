'use client';
import { useState, useEffect } from 'react';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setUser(d.user);
      if (d.user) fetch(`/api/scores?student_id=${d.user.id}`).then(r => r.json()).then(s => setScores(s.scores || []));
    });
  }, []);

  const latest = scores[0];
  const avgScore = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0;
  const prevAvg = scores.length > 1 ? Math.round(scores.slice(1).reduce((a, s) => a + s.score, 0) / (scores.length - 1)) : avgScore;
  const trend = avgScore - prevAvg;

  return (
    <>
      <div className="page-header">
        <h1>Hello, {user?.name?.split(' ')[0] || 'Student'}!</h1>
        <p className="text-muted">Here is a quick overview of your learning journey today.</p>
      </div>

      <div className="grid-2 mb-lg">
        <div className="card">
          <div className="label-sm text-muted mb-sm">RECENT ASSESSMENT</div>
          <div className="flex-between">
            <div>
              <h3 className="headline-sm">{latest?.test_title || 'No tests yet'}</h3>
              <div style={{marginTop:12}}>
                <span style={{fontSize:36,fontWeight:700,color:'var(--teal)'}}>{latest?.score || 0}%</span>
                <span className="body-sm text-muted" style={{marginLeft:8}}>{trend >= 0 ? '+' : ''}{trend}% from last</span>
              </div>
              <div className="progress-bar" style={{marginTop:12,width:200}}>
                <div className="progress-fill" style={{width: `${latest?.score || 0}%`}} />
              </div>
            </div>
            <div style={{fontSize:40,opacity:0.2}}>📊</div>
          </div>
        </div>

        <div className="card">
          <div className="flex-between mb-md">
            <h3 className="headline-sm">Weekly Progress</h3>
            <a href="/student/results" className="body-sm" style={{color:'var(--teal)'}}>View Details →</a>
          </div>
          <div className="bar-chart" style={{height:100}}>
            {['Mon','Tue','Wed','Thu','Fri'].map((d, i) => (
              <div className="bar-chart-col" key={d}>
                <div className="bar" style={{height: `${[45, 65, 30, 80, 55][i]}%`, background: 'var(--chart-bar-1)'}} />
                <span className="bar-label">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="headline-sm mb-md">Quick Access</h3>
      <div className="quick-access">
        <a href="/student/games" className="quick-card">
          <div className="quick-card-icon">🎮</div>
          <div><h3>Games Hub</h3><p>Continue your learning quests.</p></div>
        </a>
        <a href="/student/notes" className="quick-card">
          <div className="quick-card-icon">📚</div>
          <div><h3>Notes Library</h3><p>Review your saved study materials.</p></div>
        </a>
      </div>
    </>
  );
}
