import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      if (user?.role === 'student') {
        navigate('/student-dashboard');
      } else if (user?.role === 'mentor') {
        navigate('/mentor-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="dashboard-loading">
      <div className="loading-content">
        <h2>Loading Dashboard...</h2>
        <p>Redirecting to your personalized dashboard</p>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
}