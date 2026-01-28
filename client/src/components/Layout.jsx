import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMentor = user?.role === 'mentor';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div style={{ padding: '0 1.25rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
          <strong style={{ fontSize: '1.1rem' }}>Career Mentorship</strong>
          <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{user?.name} · {user?.role}</div>
        </div>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>My Profile</NavLink>
        <NavLink to="/micro-internships" className={({ isActive }) => isActive ? 'active' : ''}>Micro-Internships</NavLink>
        <NavLink to="/my-applications" className={({ isActive }) => isActive ? 'active' : ''}>{isMentor ? 'Mentor Applications' : 'My Applications'}</NavLink>
        <NavLink to="/live-sessions" className={({ isActive }) => isActive ? 'active' : ''}>Live Career Lab</NavLink>
        <NavLink to="/challenges" className={({ isActive }) => isActive ? 'active' : ''}>Challenges</NavLink>
        <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''}>Chat</NavLink>
        <NavLink to="/scheduled" className={({ isActive }) => isActive ? 'active' : ''}>Scheduled Sessions</NavLink>
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button type="button" className="nav-btn" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
