'use client';
import { useState, useEffect } from 'react';

export default function StudentProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));
  }, []);

  if (!user) return <div style={{padding:40, textAlign:'center'}}>Loading...</div>;

  return (
    <>
      <div className="page-header">
        <h1>My Profile</h1>
        <p className="text-muted">View your personal details and account information.</p>
      </div>

      <div className="card mb-lg" style={{maxWidth: 600, margin: '0 auto'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24}}>
          {user.photo_url ? (
            <img src={user.photo_url} alt="Profile Picture" className="avatar" style={{width: 120, height: 120, fontSize: 48, objectFit: 'cover', marginBottom: 16, borderRadius: '50%'}} />
          ) : (
            <div className="avatar avatar-blue" style={{width: 120, height: 120, fontSize: 48, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
              {user.name?.split(' ').map(w => w[0]).join('')}
            </div>
          )}
          <h2 className="headline-sm">{user.name}</h2>
          <span className="badge badge-info">{user.role}</span>
        </div>

        <div className="input-group mb-md">
          <label>Email Address</label>
          <input className="input" value={user.email} disabled />
        </div>
        
        <div className="input-row mb-md">
          <div className="input-group">
            <label>Student ID</label>
            <input className="input" value={user.student_id} disabled />
          </div>
          <div className="input-group">
            <label>Grade/Class</label>
            <input className="input" value={user.grade || 'N/A'} disabled />
          </div>
        </div>

        <div className="input-row mb-md">
          <div className="input-group">
            <label>Status</label>
            <input className="input" value={user.status} disabled />
          </div>
          <div className="input-group">
            <label>Joined On</label>
            <input className="input" value={user.created_at?.split(' ')[0] || 'N/A'} disabled />
          </div>
        </div>
      </div>
    </>
  );
}
