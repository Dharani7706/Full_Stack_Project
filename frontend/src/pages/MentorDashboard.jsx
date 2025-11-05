import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import './MentorDashboard.css';

export default function MentorDashboard() {
  const { user } = useSelector(state => state.auth);

  const stats = [
    { icon: '📋', label: 'Active Internships', value: '4', color: '#2196f3' },
    { icon: '👥', label: 'Students Mentored', value: '12', color: '#4caf50' },
    { icon: '⭐', label: 'Pending Reviews', value: '3', color: '#ff9800' },
    { icon: '📊', label: 'Completion Rate', value: '85%', color: '#9c27b0' }
  ];

  const quickActions = [
    {
      title: 'Create Micro-Internship',
      description: 'Post new short-term projects for students',
      link: '/micro-internships',
      buttonText: 'Create',
      icon: '🚀',
      color: '#2196f3'
    },
    {
      title: 'Manage Internships',
      description: 'Review applications and provide feedback',
      link: '/manage-internships',
      buttonText: 'Manage',
      icon: '📊',
      color: '#4caf50'
    },
    {
      title: 'Student Progress',
      description: 'Track your students learning journey',
      link: '#',
      buttonText: 'View Progress',
      icon: '📈',
      color: '#ff9800'
    },
    {
      title: 'Analytics & Reports',
      description: 'View mentorship analytics',
      link: '#',
      buttonText: 'View Analytics',
      icon: '📋',
      color: '#9c27b0'
    }
  ];

  return (
    <div className="mentor-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section mentor-welcome">
        <h1>Welcome, Mentor {user?.name}!</h1>
        <p>Guide students through hands-on learning experiences and shape future talent</p>
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
      <h2 className="section-title">Mentor Tools</h2>
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
      <div className="activity-grid">
        <div className="activity-card">
          <h3>Pending Applications</h3>
          <div className="activity-content">
            <p>You have 3 internship applications waiting for review...</p>
          </div>
          <Link to="/manage-internships" className="outline-button">
            Review Applications
          </Link>
        </div>
        
        <div className="activity-card">
          <h3>Recent Feedback</h3>
          <div className="activity-content">
            <p>Your recent feedback and student interactions will appear here...</p>
          </div>
        </div>
      </div>
    </div>
  );
}