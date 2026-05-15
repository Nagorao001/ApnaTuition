'use client';
import { useState, useEffect } from 'react';

export default function StudentTests() {
  const [tests, setTests] = useState([]);
  
  useEffect(() => {
    fetch('/api/tests').then(r => r.json()).then(d => setTests(d.tests));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  
  const upcoming = tests.filter(t => t.date >= today);
  const past = tests.filter(t => t.date < today);

  return (
    <>
      <div className="page-header">
        <h1>Available Tests</h1>
        <p className="text-muted">View and download your upcoming and past test question papers.</p>
      </div>

      <div className="card mb-lg">
        <div className="card-header">
          <h3>Upcoming & Ongoing Tests</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Subject</th><th>Type</th><th>Date</th><th>Duration</th><th>Action</th></tr></thead>
            <tbody>
              {upcoming.map(t => (
                <tr key={t.id}>
                  <td style={{fontWeight:500}}>{t.title}</td>
                  <td><span className="chip">{t.subject}</span></td>
                  <td><span className={`badge ${t.type === 'weekly' ? 'badge-info' : 'badge-warning'}`}>{t.type}</span></td>
                  <td className="body-sm">{t.date}</td>
                  <td className="body-sm">{t.duration} min</td>
                  <td>{t.file_path ? <a href={t.file_path} target="_blank" className="btn btn-primary btn-sm">📥 Download PDF</a> : <span className="text-muted body-sm">—</span>}</td>
                </tr>
              ))}
              {upcoming.length === 0 && <tr><td colSpan="6" className="text-muted" style={{textAlign:'center', padding: '24px 0'}}>No upcoming or ongoing tests at the moment.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Past Tests</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Subject</th><th>Type</th><th>Date</th><th>Duration</th><th>Action</th></tr></thead>
            <tbody>
              {past.map(t => (
                <tr key={t.id}>
                  <td style={{fontWeight:500}}>{t.title}</td>
                  <td><span className="chip">{t.subject}</span></td>
                  <td><span className={`badge ${t.type === 'weekly' ? 'badge-info' : 'badge-warning'}`}>{t.type}</span></td>
                  <td className="body-sm">{t.date}</td>
                  <td className="body-sm">{t.duration} min</td>
                  <td>{t.file_path ? <a href={t.file_path} target="_blank" className="btn btn-ghost btn-sm">📥 Download PDF</a> : <span className="text-muted body-sm">—</span>}</td>
                </tr>
              ))}
              {past.length === 0 && <tr><td colSpan="6" className="text-muted" style={{textAlign:'center', padding: '24px 0'}}>No past tests.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
