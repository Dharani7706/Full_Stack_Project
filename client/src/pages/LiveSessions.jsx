import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LiveSessions() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'chat', scheduledAt: '', duration: 60, meetingLink: '' });
  const isMentor = user?.role === 'mentor';

  const load = () => api.get('/live-sessions/sessions').then(({ data }) => setList(data || [])).catch(() => setList([]));

  useEffect(() => { load(); }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    api.post('/live-sessions/sessions', { ...form, scheduledAt: form.scheduledAt || new Date().toISOString() }).then(() => { setShowForm(false); setForm({ title: '', description: '', type: 'chat', scheduledAt: '', duration: 60, meetingLink: '' }); load(); }).catch((r) => alert(r.response?.data?.message || 'Failed'));
  };

  const join = (id) => {
    api.put(`/live-sessions/sessions/${id}/join`).then(() => load()).catch((r) => alert(r.response?.data?.message || 'Failed'));
  };

  return (
    <div>
      <div className="flex-between mb-2">
        <h1 style={{ margin: 0 }}>Live Career Lab – Sessions</h1>
        {isMentor && <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Create session'}</button>}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-2">
          <h3>Create live session (video/chat)</h3>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="video">Video</option>
              <option value="chat">Chat</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="form-group">
            <label>When (datetime-local)</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Duration (min)</label>
            <input type="number" min={1} value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: +e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Meeting link (optional)</label>
            <input value={form.meetingLink} onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))} placeholder="https://meet.example.com/..." />
          </div>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      )}

      <div className="grid-2">
        {list.map((s) => (
          <div key={s._id} className="card">
            <div className="flex-between mb-1">
              <h3 className="mb-0">{s.title}</h3>
              <span className={`badge ${s.status === 'scheduled' ? 'badge-info' : s.status === 'live' ? 'badge-success' : 'badge-muted'}`}>{s.status}</span>
            </div>
            <p className="text-muted mb-1">{s.type} · {s.mentor?.name} · {new Date(s.scheduledAt).toLocaleString()}</p>
            <p style={{ fontSize: '0.9rem' }}>{s.description?.slice(0, 100)}{s.description?.length > 100 ? '...' : ''}</p>
            {s.meetingLink && <p><a href={s.meetingLink} target="_blank" rel="noreferrer">Join meeting</a></p>}
            {!isMentor && s.status === 'scheduled' && <button type="button" className="btn btn-primary btn-sm mt-1" onClick={() => join(s._id)}>Join</button>}
          </div>
        ))}
      </div>
      {list.length === 0 && <p className="text-muted">No live sessions yet.</p>}
    </div>
  );
}
