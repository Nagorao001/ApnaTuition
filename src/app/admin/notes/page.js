'use client';
import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function NotesManager() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [form, setForm] = useState({ title: '', subject: 'Mathematics', grade: '10th Grade' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => { fetch('/api/notes', { cache: 'no-store' }).then(r => r.json()).then(d => { setNotes(d.notes); setFolders(d.folders); }); };
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    e.preventDefault(); setUploading(true);
    const fd = new FormData();
    fd.append('title', form.title); fd.append('subject', form.subject); fd.append('grade', form.grade);
    if (file) fd.append('file', file);
    await fetch('/api/notes', { method: 'POST', body: fd });
    setForm({ title: '', subject: 'Mathematics', grade: '10th Grade' }); setFile(null); setUploading(false); load();
  };

  const remove = async (id) => { await fetch(`/api/notes/${id}`, { method: 'DELETE' }); load(); };

  const icons = { Mathematics: '📐', 'English Lit': '📖', Science: '🔬' };

  return (
    <>
      <div className="page-header">
        <h1>Notes Manager</h1>
        <p className="text-muted">Upload, organize, and manage study materials.</p>
      </div>

      <div className="card mb-lg">
        <h3 className="headline-sm mb-md">Upload New Note</h3>
        <form onSubmit={upload}>
          <div className="input-row mb-md">
            <div className="input-group"><label>Title</label><input className="input" placeholder="Note title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="input-group"><label>Subject</label>
              <select className="select" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                <option>Mathematics</option><option>Physics</option><option>Chemistry</option><option>Biology</option>
              </select>
            </div>
          </div>
          <div className="input-row mb-md">
            <div className="input-group"><label>Grade</label>
              <select className="select" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                <option>9th Grade</option><option>10th Grade</option><option>11th Grade</option><option>12th Grade</option>
              </select>
            </div>
            <div className="input-group"><label>PDF File</label><input className="input" type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} /></div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Note'}</button>
        </form>
      </div>

      <h3 className="headline-sm mb-md">Subject Folders</h3>
      <div className="grid-3 mb-lg">
        {folders.map(f => (
          <div className="folder-card" key={f.name}>
            <div className="folder-card-header">
              <div className="folder-icon">{icons[f.name] || '📁'}</div>
              <span className="badge badge-info">{f.count} Files</span>
            </div>
            <h3>{f.name}</h3>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3>All Notes</h3><span className="body-sm text-muted">{notes.length} notes</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Subject</th><th>Grade</th><th>Date</th><th>File</th><th></th></tr></thead>
            <tbody>
              {notes.map(n => (
                <tr key={n.id}>
                  <td style={{ fontWeight: 500 }}>{n.title}</td>
                  <td><span className="chip">{n.subject}</span></td>
                  <td className="body-sm">{n.grade}</td>
                  <td className="body-sm text-muted">{n.uploaded_at}</td>
                  <td>{n.file_path ? <a href={n.file_path} target="_blank" className="btn btn-ghost btn-sm">📥 Download</a> : <span className="text-muted body-sm">No file</span>}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => remove(n.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
