import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './store/slices/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import MicroInternshipsPage from './pages/MicroInternshipsPage';
import ManageInternships from './pages/ManageInternships';
import axios from './utils/axiosConfig';
import './App.css';

export default function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  // Check for existing token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/auth/me');
          dispatch(setUser(response.data));
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
        }
      }
    };

    checkAuth();
  }, [dispatch]);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/student-dashboard" 
          element={isAuthenticated && user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/mentor-dashboard" 
          element={isAuthenticated && user?.role === 'mentor' ? <MentorDashboard /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/micro-internships" 
          element={isAuthenticated ? <MicroInternshipsPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/manage-internships" 
          element={isAuthenticated && user?.role === 'mentor' ? <ManageInternships /> : <Navigate to="/dashboard" />} 
        />
      </Routes>
    </div>
  );
}