import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Chat() {
  const { otherId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const role = user?.role === 'mentor' ? 'student' : 'mentor';
    api.get(`/users?role=${role}`).then(({ data }) => setUsers(data || [])).catch(() => setUsers([]));
  }, [user]);

  useEffect(() => {
    if (!otherId) { setMessages([]); return; }
    setLoading(true);
    api.get(`/chat/${otherId}`).then(({ data }) => { setMessages(data || []); setLoading(false); }).catch(() => setLoading(false));
  }, [otherId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim() || !otherId) return;
    api.post('/chat/send', { receiver: otherId, content: input.trim() }).then(({ data }) => { setMessages((m) => [...m, data]); setInput(''); }).catch(() => {});
  };

  const other = users.find((u) => u._id === otherId);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '1rem' }}>
      <div className="card" style={{ width: 260, flexShrink: 0, overflow: 'auto' }}>
        <h3 className="mb-1">Conversations</h3>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>Choose a {user?.role === 'mentor' ? 'student' : 'mentor'} to chat.</p>
        {users.map((u) => (
          <Link key={u._id} to={`/chat/${u._id}`} style={{ display: 'block', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none' }} className={otherId === u._id ? 'active' : ''}>
            {u.name}
          </Link>
        ))}
      </div>
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!otherId ? (
          <p className="text-muted">Select a user to start chatting.</p>
        ) : (
          <>
            <div className="flex-between mb-2">
              <h3 className="mb-0">{other?.name || 'Chat'}</h3>
              <Link to={`/users/${otherId}`} className="btn btn-secondary btn-sm">View profile</Link>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '0.5rem 0' }}>
              {loading && <p className="text-muted">Loading...</p>}
              {messages.map((m) => (
                <div key={m._id} style={{ display: 'flex', justifyContent: m.sender?._id === user?._id || m.sender === user?._id ? 'flex-end' : 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ maxWidth: '70%', padding: '0.5rem 0.75rem', borderRadius: 10, background: m.sender?._id === user?._id || m.sender === user?._id ? 'var(--accent-soft)' : 'var(--bg-hover)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.sender?.name}</span>
                    <p style={{ margin: '0.2rem 0 0 0' }}>{m.content}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)' }} />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
