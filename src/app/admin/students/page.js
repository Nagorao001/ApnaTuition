'use client';
import { useState, useEffect } from 'react';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [pending, setPending] = useState(0);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', grade: '9th Grade', student_id: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    const q = search ? `?search=${search}` : '';
    fetch(`/api/users${q}`).then(r => r.json()).then(d => {
      setStudents(d.students); setTotal(d.total); setActive(d.active); setPending(d.pending);
    });
  };

  useEffect(() => { load(); }, [search]);

  const addStudent = async (e) => {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ name: '', email: '', grade: '9th Grade', student_id: '' }); setMsg('Student created!'); load(); setTimeout(() => setMsg(''), 3000); }
    else { const data = await res.json(); setMsg(`Error: ${data.error}`); }
  };

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'inactive' : 'active';
    await fetch(`/api/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    load();
  };

  const uploadPhoto = async (id, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    await fetch(`/api/users/${id}/photo`, { method: 'POST', body: formData });
    load();
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Student Management</h1>
            <p className="text-muted">Manage enrolled students, assign IDs, and oversee account access.</p>
          </div>
          <button className="btn btn-primary" onClick={() => document.getElementById('quick-add-name')?.focus()}>
            👤 Create New Student
          </button>
        </div>
      </div>

      <div className="grid-main">
        <div>
          <div className="card mb-lg">
            <div className="search-input mb-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input className="input" placeholder="Search by name, ID, or class..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Student Name</th><th>Student ID</th><th>Class/Grade</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex-row">
                          {s.photo_url ? (
                            <img src={s.photo_url} alt="DP" className="avatar" style={{objectFit:'cover'}} />
                          ) : (
                            <div className={`avatar ${s.status === 'active' ? 'avatar-blue' : 'avatar-orange'}`}>
                              {s.name.split(' ').map(w=>w[0]).join('')}
                            </div>
                          )}
                          <div><div style={{fontWeight:500}}>{s.name}</div><div className="body-sm text-muted">{s.email}</div></div>
                        </div>
                      </td>
                      <td className="body-sm">{s.student_id}</td>
                      <td className="body-sm">{s.grade}</td>
                      <td>
                        <span className={`badge ${s.status === 'active' ? 'badge-success' : s.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(s.id, s.status)}>
                          {s.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <label className="btn btn-ghost btn-sm" style={{cursor:'pointer', marginLeft: 8}}>
                          Upload DP
                          <input type="file" accept="image/*" hidden onChange={e => uploadPhoto(s.id, e.target.files[0])} />
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-pagination">
              <span>Showing 1-{students.length} of {total} students</span>
              <div className="flex-row gap-sm">
                <button className="btn btn-ghost btn-sm">←</button>
                <button className="btn btn-ghost btn-sm">→</button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-lg">
            <h3 className="headline-sm mb-md">📊 Overview</h3>
            <div className="flex-between mb-sm"><span className="body-sm">Total Students</span><span style={{fontSize:24,fontWeight:700}}>{total}</span></div>
            <hr style={{border:'none',borderTop:'1px solid var(--outline-variant)',margin:'12px 0'}}/>
            <div className="flex-between"><span className="body-sm">Active</span><span style={{fontWeight:600}}>{active}</span></div>
            <div className="flex-between"><span className="body-sm">Pending setup</span><span style={{fontWeight:600}}>{pending}</span></div>
          </div>

          <div className="card">
            <h3 className="headline-sm mb-md">⚡ Quick Add</h3>
            {msg && <div className="badge badge-success mb-md" style={{display:'block',textAlign:'center',padding:8}}>{msg}</div>}
            <form onSubmit={addStudent}>
              <div className="input-group mb-md">
                <label>Full Name</label>
                <input id="quick-add-name" className="input" placeholder="e.g. Sarah Connor" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="input-group mb-md">
                <label>Email Address</label>
                <input className="input" type="email" placeholder="sarah@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="input-row mb-md">
                <div className="input-group">
                  <label>Grade</label>
                  <select className="select" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>
                    <option>9th Grade</option><option>10th Grade</option><option>11th Grade</option><option>12th Grade</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>ID Assignment</label>
                  <input className="input" placeholder="e.g. ID-123" value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} required />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" style={{width:'100%'}}>Add Student</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
