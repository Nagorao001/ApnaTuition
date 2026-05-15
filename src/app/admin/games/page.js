'use client';
import { useState, useEffect } from 'react';

export default function GamesManager() {
  const [games, setGames] = useState([]);
  const [form, setForm] = useState({ title: '', subject: 'Mathematics', difficulty: 'medium', description: '', url: '' });

  const load = () => { fetch('/api/games').then(r => r.json()).then(d => setGames(d.games)); };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    await fetch('/api/games', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ title: '', subject: 'Mathematics', difficulty: 'medium', description: '', url: '' }); load();
  };

  const toggle = async (id, enabled) => { await fetch(`/api/games/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: !enabled }) }); load(); };
  const remove = async (id) => { await fetch(`/api/games/${id}`, { method: 'DELETE' }); load(); };

  const icons = { Mathematics: '🧮', 'Language Arts': '📖', 'Critical Thinking': '🧩', Science: '🧪' };

  return (
    <>
      <div className="page-header"><h1>Games Manager</h1><p className="text-muted">Add and manage educational games.</p></div>

      <div className="card mb-lg">
        <h3 className="headline-sm mb-md">Add New Game</h3>
        <form onSubmit={add}>
          <div className="input-row mb-md">
            <div className="input-group"><label>Title</label><input className="input" placeholder="Game title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
            <div className="input-group"><label>Subject</label>
              <select className="select" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                <option>Mathematics</option><option>Language Arts</option><option>Science</option><option>Critical Thinking</option>
              </select>
            </div>
          </div>
          <div className="input-row mb-md">
            <div className="input-group"><label>Difficulty</label>
              <select className="select" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
            <div className="input-group"><label>Game URL</label><input className="input" placeholder="https://..." value={form.url} onChange={e => setForm({...form, url: e.target.value})} required /></div>
          </div>
          <div className="input-group mb-md"><label>Description</label><input className="input" placeholder="Brief description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <button className="btn btn-primary" type="submit">Add Game</button>
        </form>
      </div>

      <div className="grid-3">
        {games.map(g => (
          <div className="game-card" key={g.id} style={{opacity: g.enabled ? 1 : 0.5}}>
            <div className="game-card-icon">{icons[g.subject] || '🎮'}</div>
            <h3>{g.title}</h3>
            <span className="chip">{g.subject}</span>
            <p>{g.description}</p>
            <div className="flex-row" style={{width:'100%',justifyContent:'center',gap:8}}>
              <button className="btn btn-secondary btn-sm" onClick={() => toggle(g.id, g.enabled)}>{g.enabled ? 'Disable' : 'Enable'}</button>
              <button className="btn btn-ghost btn-sm" onClick={() => remove(g.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
