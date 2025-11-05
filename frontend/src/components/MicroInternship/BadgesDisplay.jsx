import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BadgesDisplay.css';

const BadgesDisplay = ({ userId }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/micro-internships/badges/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBadges(response.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading badges...</div>;

  return (
    <div className="badges-display">
      <h2>My Achievement Badges</h2>
      
      {badges.length === 0 ? (
        <div className="no-badges">
          <p>You haven't earned any badges yet.</p>
          <p>Complete micro-internships to earn achievement badges!</p>
        </div>
      ) : (
        <div className="badges-grid">
          {badges.map(badge => (
            <div key={badge._id} className={`badge-card ${badge.badgeType.toLowerCase()}`}>
              <div className="badge-icon">
                {badge.badgeType === 'Completion' && '🏆'}
                {badge.badgeType === 'Excellence' && '⭐'}
                {badge.badgeType === 'Quick Learner' && '⚡'}
                {badge.badgeType === 'Team Player' && '🤝'}
              </div>
              <h3>{badge.title}</h3>
              <p>{badge.description}</p>
              <div className="badge-meta">
                <span>Earned: {new Date(badge.earnedAt).toLocaleDateString()}</span>
                {badge.microInternship && (
                  <span>Project: {badge.microInternship.title}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgesDisplay;