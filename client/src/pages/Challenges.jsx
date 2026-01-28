import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Challenges() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', difficulty: 'medium', prizes: '' });
  const [detail, setDetail] = useState(null);
  const [submitLink, setSubmitLink] = useState('');
  const [submitNotes, setSubmitNotes] = useState('');
  const isMentor = user?.role === 'mentor';

  const load = () => api.get('/live-sessions/challenges').then(({ data }) => setList(data || [])).catch(() => setList([]));

  useEffect(() => { load(); }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    api.post('/live-sessions/challenges', { ...form, deadline: form.deadline || new Date().toISOString() }).then(() => { setShowForm(false); setForm({ title: '', description: '', deadline: '', difficulty: 'medium', prizes: '' }); load(); }).catch((r) => alert(r.response?.data?.message || 'Failed'));
  };

  const join = (id) => api.put(`/live-sessions/challenges/${id}/join`).then(() => load()).catch((r) => alert(r.response?.data?.message || 'Failed'));

  const submit = (id) => {
    api.post(`/live-sessions/challenges/${id}/submit`, { link: submitLink, notes: submitNotes }).then(() => { setDetail(null); setSubmitLink(''); setSubmitNotes(''); load(); }).catch((r) => alert(r.response?.data?.message || 'Failed'));
  };

  const openDetail = (c) => setDetail(c);

  return (
    <div>
      <div className="flex-between mb-2">
        <h1 style={{ margin: 0 }}>Challenges / Mini-Hackathons</h1>
        {isMentor && <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Create challenge'}</button>}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-2">
          <h3>Create challenge</h3>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Deadline (datetime-local)</label>
            <input type="datetime-local" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Difficulty</label>
            <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="form-group">
            <label>Prizes (optional)</label>
            <input value={form.prizes} onChange={(e) => setForm((f) => ({ ...f, prizes: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      )}

      <div className="grid-2">
        {list.map((c) => (
          <div key={c._id} className="card">
            <div className="flex-between mb-1">
              <h3 className="mb-0">{c.title}</h3>
              <span className={`badge ${c.status === 'open' || c.status === 'ongoing' ? 'badge-warn' : 'badge-muted'}`}>{c.status}</span>
            </div>
            <p className="text-muted mb-1">{c.difficulty} · by {c.mentor?.name} · due {new Date(c.deadline).toLocaleString()}</p>
            <p style={{ fontSize: '0.9rem' }}>{c.description?.slice(0, 100)}...</p>
            {!isMentor && (c.status === 'open' || c.status === 'ongoing') && (
              <button type="button" className="btn btn-primary btn-sm mt-1" onClick={() => openDetail(c)}>View & Join / Submit</button>
            )}
          </div>
        ))}
      </div>
      {list.length === 0 && <p className="text-muted">No challenges yet.</p>}

      {detail && (
        <div className="card" style={{ position: 'fixed', top: 80, right: 20, left: 'auto', width: 360, maxHeight: '80vh', overflow: 'auto', zIndex: 10 }}>
          <div className="flex-between mb-2">
            <h3 className="mb-0">{detail.title}</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetail(null)}>Close</button>
          </div>
          <p>{detail.description}</p>
          <p className="text-muted">Deadline: {new Date(detail.deadline).toLocaleString()}</p>
          <button type="button" className="btn btn-primary btn-sm" style={{ marginRight: '0.5rem' }} onClick={() => join(detail._id)}>Join</button>
          <div className="form-group mt-1">
            <label>Submit: link</label>
            <input value={submitLink} onChange={(e) => setSubmitLink(e.target.value)} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input value={submitNotes} onChange={(e) => setSubmitNotes(e.target.value)} />
          </div>
          <button type="button" className="btn btn-success btn-sm" onClick={() => submit(detail._id)}>Submit</button>
        </div>
      )}
    </div>
  );
}
