'use client';
import { useState, useEffect, useRef } from 'react';

export default function StudentSupport() {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [user, setUser] = useState(null);
  const scrollRef = useRef(null);

  const load = () => {
    fetch('/api/messages').then(r => r.json()).then(d => {
      setMessages(d.messages);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  };

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setUser(d.user);
      load();
    });
  }, []);

  // Mark messages as read
  useEffect(() => {
    if (user && messages.length > 0) {
      messages.forEach(m => {
        if (m.receiver_id === user.id && !m.is_read) {
          fetch(`/api/messages/${m.id}`, { method: 'PUT' });
        }
      });
    }
  }, [messages, user]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: 'admin', body })
    });
    setBody('');
    load();
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)'}}>
      <div className="page-header" style={{flexShrink: 0}}>
        <h1>Support Messages</h1>
        <p className="text-muted">Chat directly with your administrator for any help.</p>
      </div>

      <div className="card" style={{flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden'}}>
        <div style={{flexGrow: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
          {messages.length === 0 && <div className="text-muted" style={{textAlign: 'center', marginTop: 40}}>No messages yet. Send a message to start!</div>}
          
          {messages.map(m => {
            const isMe = m.sender_id === user?.id;
            return (
              <div key={m.id} style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                display: 'flex',
                gap: 12,
                flexDirection: isMe ? 'row-reverse' : 'row'
              }}>
                {m.sender_photo ? (
                  <img src={m.sender_photo} alt="DP" style={{width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0}} />
                ) : (
                  <div className={`avatar ${isMe ? 'avatar-blue' : 'avatar-orange'}`} style={{width: 32, height: 32, fontSize: 14, flexShrink: 0}}>
                    {m.sender_name[0]}
                  </div>
                )}
                <div style={{
                  background: isMe ? 'var(--teal)' : 'var(--surface-container-high)',
                  color: isMe ? 'var(--on-primary)' : 'var(--on-surface)',
                  padding: '12px 16px',
                  borderRadius: 16,
                  borderTopRightRadius: isMe ? 4 : 16,
                  borderTopLeftRadius: !isMe ? 4 : 16,
                }}>
                  <div style={{fontSize: 12, opacity: 0.8, marginBottom: 4}}>{m.sender_name} • {m.created_at.split(' ')[1]}</div>
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
      </div>
    </div>
  );
}
