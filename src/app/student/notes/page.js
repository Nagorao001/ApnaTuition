'use client';
import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function NotesLibrary() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch('/api/notes', { cache: 'no-store' }).then(r => r.json()).then(d => { setNotes(d.notes); setFolders(d.folders); }); }, []);

  const icons = { Mathematics: '📐', 'English Lit': '📖', Science: '🔬' };
  const filtered = search ? notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase())) : notes;
  const recent = filtered.slice(0, 5);

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Library</h1><p className="text-muted">Access and organize your study materials.</p></div>
          <div className="search-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="input" placeholder="Search notes, topics, or subjects..." value={search} onChange={e => setSearch(e.target.value)} style={{minWidth:280}} />
          </div>
        </div>
      </div>

      <h3 className="headline-sm mb-md">📁 Subject Folders</h3>
      <div className="grid-3 mb-lg">
        {folders.map(f => (
          <div className="folder-card" key={f.name}>
            <div className="folder-card-header">
              <div className="folder-icon">{icons[f.name] || '📁'}</div>
              <span className="badge badge-info">{f.count} Files</span>
            </div>
            <h3>{f.name}</h3>
            <p className="text-muted body-sm">{
              f.name === 'Mathematics' ? 'Algebra, Geometry, Calculus' :
              f.name === 'English Lit' ? 'Essays, Analysis, Grammar' :
              f.name === 'Science' ? 'Biology, Chemistry, Physics' : ''
            }</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>🕐 Recently Added</h3>
          <a href="#" className="body-sm" style={{color:'var(--teal)'}}>View All</a>
        </div>
        {recent.map(n => (
          <div className="note-item" key={n.id}>
            <div className="note-info">
              <div className="note-icon">📄</div>
              <div>
                <div className="note-title">{n.title}</div>
                <div className="note-meta">{n.subject} · Uploaded {n.uploaded_at}</div>
              </div>
            </div>
            {n.file_path ? (
              <a href={n.file_path} download className="download-btn" title="Download PDF">📥</a>
            ) : (
              <span className="body-sm text-muted">—</span>
            )}
          </div>
        ))}
        {recent.length === 0 && <p className="text-muted body-sm" style={{padding:20,textAlign:'center'}}>No notes available.</p>}
      </div>
    </>
  );
}
