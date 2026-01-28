import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ScheduledSessions() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ mentorId: '', menteeId: '', scheduledAt: '', duration: 30, topic: '' });
  const [rateOpen, setRateOpen] = useState(null);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const isMentor = user?.role === 'mentor';

  const load = () => api.get('/chat/scheduled/list').then(({ data }) => setList(data || [])).catch(() => setList([]));

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const role = isMentor ? 'student' : 'mentor';
    api.get(`/users?role=${role}`).then(({ data }) => setUsers(data || [])).catch(() => setUsers([]));
  }, [isMentor]);

  const handleCreate = (e) => {
    e.preventDefault();
    const body = isMentor ? { mentorId: user._id, menteeId: form.menteeId, scheduledAt: form.scheduledAt, duration: form.duration, topic: form.topic } : { mentorId: form.mentorId, menteeId: user._id, scheduledAt: form.scheduledAt, duration: form.duration, topic: form.topic };
    api.post('/chat/scheduled', body).then(() => { setShowForm(false); setForm({ mentorId: '', menteeId: '', scheduledAt: '', duration: 30, topic: '' }); load(); }).catch((r) => alert(r.response?.data?.message || 'Failed'));
  };

  const submitRating = () => {
    if (!rateOpen) return;
    api.put(`/chat/scheduled/${rateOpen._id}/rate`, { rating, ratingComment }).then(() => { setRateOpen(null); setRating(5); setRatingComment(''); load(); }).catch((r) => alert(r.response?.data?.message || 'Failed'));
  };

  return (
    <div>
      <div className="flex-between mb-2">
        <h1 style={{ margin: 0 }}>Scheduled Sessions</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Schedule session'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-2">
          <h3>Schedule a mentorship session</h3>
          <div className="form-group">
            <label>{isMentor ? 'Mentee (student)' : 'Mentor'}</label>
            <select value={isMentor ? form.menteeId : form.mentorId} onChange={(e) => isMentor ? setForm((f) => ({ ...f, menteeId: e.target.value })) : setForm((f) => ({ ...f, mentorId: e.target.value }))} required>
              <option value="">Select</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>When (datetime-local)</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Duration (min)</label>
            <input type="number" min={5} value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: +e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Topic (optional)</label>
            <input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary">Schedule</button>
        </form>
      )}

      <div className="card">
        <h3>Upcoming & past</h3>
        {list.length === 0 && <p className="text-muted mb-0">No sessions.</p>}
        {list.map((s) => (
          <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <strong>{s.topic || 'Session'}</strong> with {isMentor ? s.mentee?.name : s.mentor?.name} · {new Date(s.scheduledAt).toLocaleString()} · <span className={`badge ${s.status === 'scheduled' ? 'badge-info' : s.status === 'completed' ? 'badge-muted' : 'badge-warn'}`}>{s.status}</span>
            </div>
            {!isMentor && s.status === 'scheduled' && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRateOpen(s)}>Mark done & rate</button>
            )}
          </div>
        ))}
      </div>

      {rateOpen && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3>Rate this session</h3>
          <div className="form-group">
            <label>Rating (1–5)</label>
            <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(+e.target.value)} />
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary" onClick={submitRating}>Submit rating</button>
          <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem' }} onClick={() => setRateOpen(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
