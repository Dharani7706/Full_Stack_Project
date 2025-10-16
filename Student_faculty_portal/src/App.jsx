import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';

export default function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/mentor-dashboard" element={<MentorDashboard />} />
    </Routes>
  );
}
