'use client';
import { useState, useEffect } from 'react';

export default function GamesHub() {
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState('All Games');
  const [playing, setPlaying] = useState(null);

  useEffect(() => { fetch('/api/games').then(r => r.json()).then(d => setGames(d.games.filter(g => g.enabled))); }, []);

  const subjects = ['All Games', ...new Set(games.map(g => g.subject))];
  const filtered = filter === 'All Games' ? games : games.filter(g => g.subject === filter);
  const icons = { Mathematics: '🧮', 'Language Arts': '📖', 'Critical Thinking': '🧩', Science: '🧪' };

  if (playing) {
    return (
      <>
        <div className="page-header">
          <div className="page-header-row">
            <div><h1>{playing.title}</h1><p className="text-muted">{playing.subject}</p></div>
            <button className="btn btn-secondary" onClick={() => setPlaying(null)}>← Back to Games</button>
          </div>
        </div>
        <div className="card" style={{padding:0,overflow:'hidden',height:'70vh'}}>
          <iframe src={playing.url} style={{width:'100%',height:'100%',border:'none'}} title={playing.title} sandbox="allow-scripts allow-same-origin allow-popups" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Educational Games Hub</h1>
        <p className="text-muted">Learn through play. Select a subject to explore interactive challenges.</p>
      </div>

      <div className="chips-row mb-lg">
        {subjects.map(s => (
          <button key={s} className={`chip ${filter === s ? 'active' : 'chip-outline'}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      <div className="grid-3">
        {filtered.map(g => (
          <div className="game-card" key={g.id}>
            <div className="game-card-icon">{icons[g.subject] || '🎮'}</div>
            <h3>{g.title}</h3>
            <span className="chip">{g.subject}</span>
            <p>{g.description}</p>
            <button className="btn btn-primary" onClick={() => setPlaying(g)}>▶ Play Now</button>
          </div>
        ))}
      </div>
    </>
  );
}
