import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user } = useSelector(state => state.auth);

  const stats = [
    { icon: '📋', label: 'Applied Internships', value: '3', color: '#2196f3' },
    { icon: '🎓', label: 'Completed Projects', value: '2', color: '#4caf50' },
    { icon: '🏆', label: 'Badges Earned', value: '5', color: '#ff9800' },
    { icon: '📈', label: 'Skill Level', value: 'Intermediate', color: '#9c27b0' }
  ];

  const quickActions = [
    {
      title: 'Browse Micro-Internships',
      description: 'Find and apply for short-term projects',
      link: '/micro-internships',
      buttonText: 'Browse',
      icon: '🔍',
      color: '#2196f3'
    },
    {
      title: 'View My Applications',
      description: 'Track your internship applications',
      link: '/micro-internships',
      buttonText: 'View',
      icon: '📋',
      color: '#4caf50'
    },
    {
      title: 'My Achievement Badges',
      description: 'See your earned badges and progress',
      link: '/micro-internships',
      buttonText: 'View Badges',
      icon: '🏆',
      color: '#ff9800'
    },
    {
      title: 'Skill Development',
      description: 'Monitor your learning progress',
      link: '#',
      buttonText: 'Track',
      icon: '📈',
      color: '#9c27b0'
    }
  ];

  return (
    <div className="student-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Continue your learning journey with hands-on projects and mentorship</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="section-title">Quick Actions</h2>
      <div className="actions-grid">
        {quickActions.map((action, index) => (
          <div key={index} className="action-card">
            <div className="action-icon">{action.icon}</div>
            <h3>{action.title}</h3>
            <p>{action.description}</p>
            <Link 
              to={action.link} 
              className="action-button"
              style={{
                background: `linear-gradient(135deg, ${action.color}, ${action.color}dd)`
              }}
            >
              {action.buttonText}
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-content">
          <p>Your recent activities and progress will appear here...</p>
        </div>
      </div>
    </div>
  );
}