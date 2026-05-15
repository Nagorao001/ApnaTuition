'use client';
import { useState, useEffect } from 'react';

export default function TestManager() {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({ title: '', subject: 'Mathematics', type: 'weekly', date: '', duration: '45' });
  const [file, setFile] = useState(null);

  const load = () => { fetch('/api/tests').then(r => r.json()).then(d => setTests(d.tests)); };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    await fetch('/api/tests', { method: 'POST', body: fd });
    setForm({ title: '', subject: 'Mathematics', type: 'weekly', date: '', duration: '45' }); setFile(null); load();
  };

  const remove = async (id) => { await fetch(`/api/tests/${id}`, { method: 'DELETE' }); load(); };

  return (
    <>
      <div className="page-header"><h1>Test Manager</h1><p className="text-muted">Create, assign, and manage tests.</p></div>

      <div className="card mb-lg">
        <h3 className="headline-sm mb-md">Create New Test</h3>
        <form onSubmit={create}>
          <div className="input-row mb-md">
            <div className="input-group"><label>Title</label><input className="input" placeholder="Test title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="input-group"><label>Subject</label>
              <select className="select" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                <option>All Subject</option><option>Physics</option><option>Chemistry</option><option>Mathematics</option><option>Biology</option>
              </select>
            </div>
          </div>
          <div className="input-row mb-md">
            <div className="input-group"><label>Type</label>
              <select className="select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="weekly">Weekly</option><option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="input-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
          </div>
          <div className="input-row mb-md">
            <div className="input-group"><label>Duration (min)</label><input className="input" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></div>
            <div className="input-group"><label>Question Paper (PDF)</label><input className="input" type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} /></div>
          </div>
          <button className="btn btn-primary" type="submit">Create Test</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header"><h3>All Tests</h3><span className="body-sm text-muted">{tests.length} tests</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Subject</th><th>Type</th><th>Date</th><th>Duration</th><th>File</th><th></th></tr></thead>
            <tbody>
              {tests.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>{t.title}</td>
                  <td><span className="chip">{t.subject}</span></td>
                  <td><span className={`badge ${t.type === 'weekly' ? 'badge-info' : 'badge-warning'}`}>{t.type}</span></td>
                  <td className="body-sm">{t.date}</td>
                  <td className="body-sm">{t.duration} min</td>
                  <td>{t.file_path ? <a href={t.file_path} target="_blank" className="btn btn-ghost btn-sm">📥</a> : '—'}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => remove(t.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
