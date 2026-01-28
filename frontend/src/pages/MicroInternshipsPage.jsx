import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import MicroInternshipList from '../components/MicroInternship/MicroInternshipList';
import CreateMicroInternship from '../components/MicroInternship/CreateMicroInternship';
import BadgesDisplay from '../components/MicroInternship/BadgesDisplay';
import './MicroInternshipsPage.css';

const MicroInternshipsPage = () => {
  const user = useSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState('browse');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleInternshipCreated = () => {
    setActiveTab('browse');
    setSuccessMessage('Micro-internship created successfully!');
  };

  // Get user from localStorage if Redux state is not available
  const currentUser = user || JSON.parse(localStorage.getItem('user'));

  return (
    <div className="micro-internships-page">
      <div className="page-header">
        <h1>Micro-Internships</h1>
        <p>Gain hands-on experience through short-term projects guided by mentors</p>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="tabs">
        <button 
          className={activeTab === 'browse' ? 'active' : ''}
          onClick={() => setActiveTab('browse')}
        >
          Browse Internships
        </button>
        
        {currentUser?.role === 'mentor' && (
          <button 
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
          >
            Create Internship
          </button>
        )}
        
        {currentUser?.role === 'student' && (
          <button 
            className={activeTab === 'badges' ? 'active' : ''}
            onClick={() => setActiveTab('badges')}
          >
            My Badges
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'browse' && <MicroInternshipList user={currentUser} />}
        {activeTab === 'create' && currentUser?.role === 'mentor' && (
          <CreateMicroInternship onCreated={handleInternshipCreated} />
        )}
        {activeTab === 'badges' && currentUser?.role === 'student' && (
          <BadgesDisplay userId={currentUser.id} />
        )}
      </div>
    </div>
  );
};

export default MicroInternshipsPage;