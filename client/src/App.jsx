import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProfileView from './pages/ProfileView';
import MicroInternships from './pages/MicroInternships';
import MicroInternshipDetail from './pages/MicroInternshipDetail';
import MyApplications from './pages/MyApplications';
import LiveSessions from './pages/LiveSessions';
import Challenges from './pages/Challenges';
import Chat from './pages/Chat';
import ScheduledSessions from './pages/ScheduledSessions';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes future={{ v7_relativeSplatPath: true }}>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="users/:id" element={<ProfileView />} />
        <Route path="micro-internships" element={<MicroInternships />} />
        <Route path="micro-internships/:id" element={<MicroInternshipDetail />} />
        <Route path="my-applications" element={<MyApplications />} />
        <Route path="live-sessions" element={<LiveSessions />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="chat" element={<Chat />} />
        <Route path="chat/:otherId" element={<Chat />} />
        <Route path="scheduled" element={<ScheduledSessions />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
