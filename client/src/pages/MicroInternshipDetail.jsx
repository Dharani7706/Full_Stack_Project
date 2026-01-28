import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function MicroInternshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [app, setApp] = useState(null);
  const [mentorApps, setMentorApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [submittedWork, setSubmittedWork] = useState('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('pending');
  const [rating, setRating] = useState(0);
  const [progress, setProgress] = useState(0);
  const [badge, setBadge] = useState(false);
  const isMentor = user?.role === 'mentor';

  useEffect(() => {
    api.get(`/micro-internships/${id}`).then(({ data }) => setItem(data)).catch(() => setItem(null));
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    api.get('/micro-internships/my/applications').then(({ data }) => {
      const a = data.find((x) => x.internship?._id === id || x.internship === id);
      setApp(a || null);
      if (a) setSubmittedWork(a.submittedWork || '');
    }).catch(() => setApp(null));
  }, [id, user]);

  useEffect(() => {
    if (!user || user.role !== 'mentor') return;
    api.get('/micro-internships/mentor/applications').then(({ data }) => {
      const forThis = (data || []).filter((x) => (x.internship?._id || x.internship) === id);
      setMentorApps(forThis);
    }).catch(() => setMentorApps([]));
  }, [id, user]);

  const apply = () => {
    api.post(`/micro-internships/${id}/apply`).then(() => { setApp({ status: 'pending' }); }).catch((r) => alert(r.response?.data?.message || 'Failed'));
  };

  const submitWork = () => {
    api.put(`/micro-internships/applications/${app._id}`, { submittedWork }).then(({ data }) => { setApp(data); }).catch((r) => alert(r.response?.data?.message || 'Failed'));
  };

  const mentorUpdate = (appId) => {
    api.put(`/micro-internships/applications/${appId}`, { status, feedback, mentorRating: rating || undefined, progress, badgeAwarded: badge }).then(({ data }) => {
      setMentorApps((prev) => prev.map((a) => (a._id === data._id ? data : a)));
      setSelectedApp(data);
    }).catch((r) => alert(r.response?.data?.message || 'Failed'));
  };

  const selectMentorApp = (a) => {
    setSelectedApp(a);
    setFeedback(a.feedback || '');
    setStatus(a.status || 'pending');
    setRating(a.mentorRating || 0);
    setProgress(a.progress || 0);
    setBadge(!!a.badgeAwarded);
  };

  if (!item) return <div>Loading...</div>;

  const canApply = !isMentor && !app && item.status === 'open';

  return (
    <div>
      <div className="flex-between mb-2">
        <h1 style={{ margin: 0 }}>{item.title}</h1>
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>
      <div className="card mb-2">
        <p className="text-muted">by {item.mentor?.name} · {item.duration} day(s) · <span className={`badge ${item.status === 'open' ? 'badge-success' : 'badge-muted'}`}>{item.status}</span></p>
        <p>{item.description}</p>
        {item.skillsRequired?.length > 0 && <p><strong>Skills:</strong> {item.skillsRequired.join(', ')}</p>}
      </div>

      {canApply && <button type="button" className="btn btn-primary mb-2" onClick={apply}>Apply</button>}

      {app && (
        <div className="card">
          <h3>Your application</h3>
          <p><span className={`badge ${app.status === 'accepted' ? 'badge-success' : app.status === 'rejected' ? 'badge-muted' : 'badge-warn'}`}>{app.status}</span> {app.progress > 0 && ` · ${app.progress}%`} {app.badgeAwarded && ' · Badge'}</p>
          {app.status === 'accepted' && (
            <div className="form-group">
              <label>Submit work</label>
              <textarea value={submittedWork} onChange={(e) => setSubmittedWork(e.target.value)} placeholder="Link or description of your work" />
              <button type="button" className="btn btn-primary mt-1" onClick={submitWork}>Submit</button>
            </div>
          )}
          {app.feedback && <p><strong>Feedback:</strong> {app.feedback}</p>}
        </div>
      )}

      {isMentor && (item.mentor?._id === user?._id || item.mentor === user?._id) && (
        <div className="card">
          <h3>Manage applications</h3>
          {mentorApps.length > 0 ? (
            <>
              <div className="mb-2">
                {mentorApps.map((a) => (
                  <button type="button" key={a._id} className={`btn btn-sm ${selectedApp?._id === a._id ? 'btn-primary' : 'btn-secondary'}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }} onClick={() => selectMentorApp(a)}>
                    {a.student?.name || 'Student'} · {a.status} · {a.progress}%
                  </button>
                ))}
              </div>
              {selectedApp && (
                <>
                  {selectedApp.submittedWork && <p><strong>Submitted work:</strong> {selectedApp.submittedWork}</p>}
                  <div className="form-group">
                    <label>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Feedback</label>
                    <input value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Rating (1–5)</label>
                    <input type="number" min={1} max={5} value={rating || ''} onChange={(e) => setRating(+e.target.value || 0)} />
                  </div>
                  <div className="form-group">
                    <label>Progress (0–100)</label>
                    <input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(+e.target.value)} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="checkbox" checked={badge} onChange={(e) => setBadge(e.target.checked)} />
                    Award badge
                  </label>
                  <button type="button" className="btn btn-primary" onClick={() => mentorUpdate(selectedApp._id)}>Update</button>
                </>
              )}
            </>
          ) : <p className="text-muted mb-0">No applications yet.</p>}
        </div>
      )}
    </div>
  );
}
