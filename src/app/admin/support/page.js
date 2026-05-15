'use client';
import { useState, useEffect, useRef } from 'react';

export default function AdminSupport() {
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [body, setBody] = useState('');
  const [user, setUser] = useState(null);
  const scrollRef = useRef(null);

  const load = () => {
    fetch('/api/messages').then(r => r.json()).then(d => {
      setMessages(d.messages.reverse()); // Reverse to have oldest first for chat flow
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  };

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));
    fetch('/api/users').then(r => r.json()).then(d => setStudents(d.students));
    load();
  }, []);

  // Mark messages as read when viewing a chat
  useEffect(() => {
    if (user && selectedStudentId) {
      messages.forEach(m => {
        if (m.receiver_id === user.id && m.sender_id === selectedStudentId && !m.is_read) {
          fetch(`/api/messages/${m.id}`, { method: 'PUT' });
        }
      });
    }
  }, [messages, selectedStudentId, user]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim() || !selectedStudentId) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: selectedStudentId, body })
    });
    setBody('');
    load();
  };

  const selectedMessages = messages.filter(m => m.sender_id === selectedStudentId || m.receiver_id === selectedStudentId);

  // Calculate unread counts
  const unreadCounts = {};
  messages.forEach(m => {
    if (m.receiver_id === user?.id && !m.is_read) {
      unreadCounts[m.sender_id] = (unreadCounts[m.sender_id] || 0) + 1;
    }
  });

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)'}}>
      <div className="page-header" style={{flexShrink: 0}}>
        <h1>Support Messages</h1>
        <p className="text-muted">Manage support requests and chat with students.</p>
      </div>

      <div className="card" style={{flexGrow: 1, display: 'flex', padding: 0, overflow: 'hidden', gap: 0}}>
        
        {/* Sidebar: Student List */}
        <div style={{width: 300, borderRight: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column'}}>
          <div style={{padding: 16, borderBottom: '1px solid var(--outline-variant)', fontWeight: 600}}>Students</div>
          <div style={{overflowY: 'auto', flexGrow: 1}}>
            {students.map(s => (
              <div 
                key={s.id} 
                onClick={() => { setSelectedStudentId(s.id); setTimeout(() => scrollRef.current?.scrollIntoView(), 100); }}
                style={{
                  padding: 16, 
                  borderBottom: '1px solid var(--outline-variant)', 
                  cursor: 'pointer',
                  background: selectedStudentId === s.id ? 'var(--surface-container-high)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                {s.photo_url ? (
                  <img src={s.photo_url} alt="DP" style={{width: 32, height: 32, borderRadius: '50%', objectFit: 'cover'}} />
                ) : (
                  <div className={`avatar ${s.status === 'active' ? 'avatar-blue' : 'avatar-orange'}`} style={{width: 32, height: 32, fontSize: 14}}>
                    {s.name[0]}
                  </div>
                )}
                <div style={{flexGrow: 1}}>
                  <div style={{fontWeight: 500, fontSize: 14}}>{s.name}</div>
                  <div style={{fontSize: 12, color: 'var(--text-muted)'}}>{s.student_id}</div>
                </div>
                {unreadCounts[s.id] > 0 && (
                  <span className="badge badge-error" style={{padding: '2px 6px', fontSize: 12}}>{unreadCounts[s.id]}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
          {!selectedStudentId ? (
            <div style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>
              Select a student to view messages
            </div>
          ) : (
            <>
              <div style={{padding: 16, borderBottom: '1px solid var(--outline-variant)', fontWeight: 600}}>
                Chat with {students.find(s => s.id === selectedStudentId)?.name}
              </div>
              
              <div style={{flexGrow: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
                {selectedMessages.length === 0 && <div className="text-muted" style={{textAlign: 'center', marginTop: 40}}>No messages yet.</div>}
                
                {selectedMessages.map(m => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id} style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      display: 'flex',
                      gap: 12,
                      flexDirection: isMe ? 'row-reverse' : 'row'
                    }}>
                      <div style={{
                        background: isMe ? 'var(--teal)' : 'var(--surface-container-high)',
                        color: isMe ? 'var(--on-primary)' : 'var(--on-surface)',
                        padding: '12px 16px',
                        borderRadius: 16,
                        borderTopRightRadius: isMe ? 4 : 16,
                        borderTopLeftRadius: !isMe ? 4 : 16,
                      }}>
                        <div style={{fontSize: 12, opacity: 0.8, marginBottom: 4}}>{isMe ? 'You' : m.sender_name} • {m.created_at.split(' ')[1]}</div>
                        <div style={{whiteSpace: 'pre-wrap'}}>{m.body}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              <div style={{padding: 16, borderTop: '1px solid var(--outline-variant)', background: 'var(--surface-container)'}}>
                <form onSubmit={send} style={{display: 'flex', gap: 12}}>
                  <input 
                    className="input" 
                    style={{flexGrow: 1}} 
                    placeholder="Type your message..." 
                    value={body} 
                    onChange={e => setBody(e.target.value)} 
                  />
                  <button type="submit" className="btn btn-primary" disabled={!body.trim()}>Send</button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
