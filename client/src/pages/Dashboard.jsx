import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#58a6ff', '#3fb950', '#d29922', '#f85149'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const isMentor = user?.role === 'mentor';

  useEffect(() => {
    api.get('/dashboard').then(({ data: d }) => setData(d)).catch(() => setData(null));
  }, []);

  useEffect(() => {
    const role = isMentor ? 'student' : 'mentor';
    api.get(`/users?role=${role}`).then(({ data: u }) => setUsers(u)).catch(() => setUsers([]));
  }, [isMentor]);

  if (!data) return <div>Loading...</div>;

  const { microInternship, upcomingLiveSessions, upcomingChallenges, upcomingMentorship, mentorAnalytics, studentSummary } = data;

  const barData = microInternship ? [
    { name: 'Applied', value: microInternship.applied, fill: COLORS[0] },
    { name: 'In Progress', value: microInternship.inProgress, fill: COLORS[1] },
    { name: 'Completed', value: microInternship.completed, fill: COLORS[2] },
    { name: 'Badges', value: microInternship.badges, fill: COLORS[3] },
  ] : [];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Dashboard</h1>

      <div className="grid-3 mb-2">
        <div className="card">
          <h3>Micro-Internships</h3>
          <p className="mb-0">Applied: <strong>{microInternship?.applied ?? 0}</strong></p>
          <p className="mb-0">In progress: <strong>{microInternship?.inProgress ?? 0}</strong></p>
          <p className="mb-0">Completed: <strong>{microInternship?.completed ?? 0}</strong></p>
          <p className="mb-0">Badges: <strong>{microInternship?.badges ?? 0}</strong></p>
          <Link to="/micro-internships" className="btn btn-secondary btn-sm mt-1">View</Link>
        </div>
        {mentorAnalytics && (
          <div className="card">
            <h3>Mentor Analytics</h3>
            <p className="mb-0">Mentees: <strong>{mentorAnalytics.totalMentees}</strong></p>
            <p className="mb-0">Applications: <strong>{mentorAnalytics.totalApplications}</strong></p>
            <p className="mb-0">Completion rate: <strong>{mentorAnalytics.completionRate}%</strong></p>
            <p className="mb-0">Avg rating: <strong>{mentorAnalytics.averageRating || '-'}</strong></p>
          </div>
        )}
        {studentSummary && (
          <div className="card">
            <h3>Performance Summary</h3>
            <p className="mb-0">Applied: <strong>{studentSummary.totalApplied}</strong></p>
            <p className="mb-0">Completed: <strong>{studentSummary.completed}</strong></p>
            <p className="mb-0">Badges: <strong>{studentSummary.badges}</strong></p>
            <p className="mb-0">Avg rating: <strong>{studentSummary.averageRating || '-'}</strong></p>
          </div>
        )}
      </div>

      {barData.length > 0 && (
        <div className="card mb-2">
          <h3>Micro-Internship Overview</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                <Bar dataKey="value" fill="var(--accent)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <h3>Upcoming Live Sessions</h3>
          {upcomingLiveSessions?.length ? upcomingLiveSessions.map((s) => (
            <div key={s._id} className="flex-between mb-1" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span>{s.title}</span>
              <span className="text-muted">{new Date(s.scheduledAt).toLocaleString()}</span>
            </div>
          )) : <p className="text-muted mb-0">None scheduled.</p>}
          <Link to="/live-sessions" className="btn btn-secondary btn-sm mt-1">View all</Link>
        </div>
        <div className="card">
          <h3>Upcoming Challenges</h3>
          {upcomingChallenges?.length ? upcomingChallenges.map((c) => (
            <div key={c._id} className="flex-between mb-1" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span>{c.title}</span>
              <span className="text-muted">Due {new Date(c.deadline).toLocaleDateString()}</span>
            </div>
          )) : <p className="text-muted mb-0">None open.</p>}
          <Link to="/challenges" className="btn btn-secondary btn-sm mt-1">View all</Link>
        </div>
      </div>

      <div className="card mt-1">
        <h3>Upcoming Mentorship Sessions</h3>
        {upcomingMentorship?.length ? upcomingMentorship.map((s) => (
          <div key={s._id} className="flex-between mb-1" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
            <span>{s.topic || 'Session'} with {isMentor ? s.mentee?.name : s.mentor?.name}</span>
            <span className="text-muted">{new Date(s.scheduledAt).toLocaleString()}</span>
          </div>
        )) : <p className="text-muted mb-0">None scheduled.</p>}
        <Link to="/scheduled" className="btn btn-secondary btn-sm mt-1">View all</Link>
      </div>

      <div className="card mt-1">
        <h3>Browse {isMentor ? 'Students' : 'Mentors'}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {users.slice(0, 8).map((u) => (
            <Link key={u._id} to={`/users/${u._id}`} className="badge badge-info" style={{ textDecoration: 'none' }}>{u.name}</Link>
          ))}
        </div>
        {users.length > 8 && <p className="text-muted mt-1 mb-0">And {users.length - 8} more. Visit Profile to manage links.</p>}
      </div>
    </div>
  );
}
