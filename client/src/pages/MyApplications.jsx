import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function MyApplications() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const isMentor = user?.role === 'mentor';

  useEffect(() => {
    if (!user) return;
    const url = user.role === 'mentor' ? '/micro-internships/mentor/applications' : '/micro-internships/my/applications';
    api.get(url).then(({ data }) => setList(data || [])).catch(() => setList([]));
  }, [user]);

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>{isMentor ? 'Mentor Applications' : 'My Applications'}</h1>
      {list.length === 0 && <p className="text-muted">No applications yet. {!isMentor && <><Link to="/micro-internships">Browse micro-internships</Link>.</>}</p>}
      <div className="grid-2">
        {list.map((a) => (
          <div key={a._id} className="card">
            <div className="flex-between mb-1">
              <h3 className="mb-0"><Link to={`/micro-internships/${a.internship?._id || a.internship}`}>{a.internship?.title || 'Internship'}</Link></h3>
              <span className={`badge ${a.status === 'accepted' ? 'badge-success' : a.status === 'rejected' || a.status === 'completed' ? 'badge-muted' : 'badge-warn'}`}>{a.status}</span>
            </div>
            <p className="text-muted mb-1">
              {isMentor ? `Student: ${a.student?.name}` : `Mentor: ${a.internship?.mentor?.name}`} · Progress: {a.progress}%{a.badgeAwarded ? ' · Badge' : ''}
            </p>
            {a.submittedWork && <p><strong>Submitted:</strong> {a.submittedWork.slice(0, 80)}{a.submittedWork.length > 80 ? '...' : ''}</p>}
            {a.feedback && <p><strong>Feedback:</strong> {a.feedback}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
