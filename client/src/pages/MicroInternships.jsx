import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function MicroInternships() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', duration: 1, skillsRequired: '', maxParticipants: 10 });
  const isMentor = user?.role === 'mentor';

  const load = () => {
    const q = status ? `?status=${status}` : '';
    api.get(`/micro-internships${q}`).then(({ data }) => setList(data)).catch(() => setList([]));
  };

  useEffect(() => { load(); }, [status]);

  const handleCreate = (e) => {
    e.preventDefault();
    api.post('/micro-internships', {
      ...form,
      skillsRequired: form.skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
    }).then(() => { setShowForm(false); setForm({ title: '', description: '', duration: 1, skillsRequired: '', maxParticipants: 10 }); load(); }).catch((r) => alert(r.response?.data?.message || 'Failed'));
  };

  return (
    <div>
      <div className="flex-between mb-2">
        <h1 style={{ margin: 0 }}>Micro-Internships</h1>
        {isMentor && <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Create'}</button>}
      </div>

      <div className="flex gap-1 mb-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-2">
          <h3>Create Micro-Internship (1–5 days)</h3>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Duration (days, 1–5)</label>
            <input type="number" min={1} max={5} value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: +e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Skills (comma-separated)</label>
            <input value={form.skillsRequired} onChange={(e) => setForm((f) => ({ ...f, skillsRequired: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Max participants</label>
            <input type="number" min={1} value={form.maxParticipants} onChange={(e) => setForm((f) => ({ ...f, maxParticipants: +e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      )}

      <div className="grid-2">
        {list.map((i) => (
          <div key={i._id} className="card">
            <div className="flex-between mb-1">
              <h3 className="mb-0"><Link to={`/micro-internships/${i._id}`}>{i.title}</Link></h3>
              <span className={`badge ${i.status === 'open' ? 'badge-success' : i.status === 'completed' ? 'badge-muted' : 'badge-warn'}`}>{i.status}</span>
            </div>
            <p className="text-muted mb-1">{i.duration} day(s) · by {i.mentor?.name}</p>
            <p style={{ fontSize: '0.9rem' }}>{i.description?.slice(0, 120)}{i.description?.length > 120 ? '...' : ''}</p>
          </div>
        ))}
      </div>
      {list.length === 0 && <p className="text-muted">No micro-internships yet.</p>}
    </div>
  );
}
