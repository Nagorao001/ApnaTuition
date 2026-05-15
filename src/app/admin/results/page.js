'use client';
import { useState, useEffect } from 'react';

export default function ResultsPage() {
  const [scores, setScores] = useState([]);
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({ student_id: '', test_id: '', score: '', feedback: '' });

  const load = () => {
    fetch('/api/scores').then(r => r.json()).then(d => setScores(d.scores));
    fetch('/api/users').then(r => r.json()).then(d => setStudents(d.students));
    fetch('/api/tests').then(r => r.json()).then(d => setTests(d.tests));
  };
  useEffect(() => { load(); }, []);

  const addScore = async (e) => {
    e.preventDefault();
    await fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, score: parseFloat(form.score) }) });
    setForm({ student_id: '', test_id: '', score: '', feedback: '' }); load();
  };

  return (
    <>
      <div className="page-header"><h1>Results & Reports</h1><p className="text-muted">Enter scores and view student performance.</p></div>

      <div className="card mb-lg">
        <h3 className="headline-sm mb-md">Enter Score</h3>
        <form onSubmit={addScore}>
          <div className="input-row mb-md">
            <div className="input-group"><label>Student</label>
              <select className="select" value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} required>
                <option value="">Select student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.student_id})</option>)}
              </select>
            </div>
            <div className="input-group"><label>Test</label>
              <select className="select" value={form.test_id} onChange={e => setForm({...form, test_id: e.target.value})} required>
                <option value="">Select test</option>
                {tests.map(t => <option key={t.id} value={t.id}>{t.title} ({t.type})</option>)}
              </select>
            </div>
          </div>
          <div className="input-row mb-md">
            <div className="input-group"><label>Score (out of 100)</label><input className="input" type="number" min="0" max="100" value={form.score} onChange={e => setForm({...form, score: e.target.value})} required /></div>
            <div className="input-group"><label>Feedback</label><input className="input" placeholder="Optional feedback" value={form.feedback} onChange={e => setForm({...form, feedback: e.target.value})} /></div>
          </div>
          <button className="btn btn-primary" type="submit">Submit Score</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header"><h3>All Scores</h3><span className="body-sm text-muted">{scores.length} entries</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Test</th><th>Subject</th><th>Type</th><th>Score</th><th>Feedback</th><th>Date</th></tr></thead>
            <tbody>
              {scores.map(s => (
                <tr key={s.id}>
                  <td style={{fontWeight:500}}>{s.student_name}</td>
                  <td>{s.test_title}</td>
                  <td><span className="chip">{s.subject}</span></td>
                  <td><span className={`badge ${s.type === 'weekly' ? 'badge-info' : 'badge-warning'}`}>{s.type}</span></td>
                  <td style={{fontWeight:600, color: s.score >= 80 ? 'var(--teal)' : s.score >= 60 ? 'var(--on-surface)' : 'var(--error)'}}>{s.score}%</td>
                  <td className="body-sm text-muted">{s.feedback || '—'}</td>
                  <td className="body-sm text-muted">{s.graded_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
