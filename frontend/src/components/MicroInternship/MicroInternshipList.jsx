import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import MicroInternshipCard from './MicroInternshipCard.jsx';
import './MicroInternshipList.css';

const MicroInternshipList = ({ user }) => {
  const [microInternships, setMicroInternships] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    difficulty: '',
    skills: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMicroInternships();
  }, [filters]);

  const fetchMicroInternships = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters properly
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const url = queryString ? `/micro-internships?${queryString}` : '/micro-internships';
      
      console.log('Fetching from URL:', url);
      
      const response = await axios.get(url);
      
      console.log('API Response:', response.data);
      
      // Handle the response structure
      let internshipsData = [];
      
      if (response.data.success && Array.isArray(response.data.microInternships)) {
        internshipsData = response.data.microInternships;
      } else if (Array.isArray(response.data)) {
        internshipsData = response.data;
      }
      
      setMicroInternships(internshipsData);
      
    } catch (error) {
      console.error('Error fetching micro-internships:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      setError('Failed to load micro-internships. Please check if the server is running.');
      setMicroInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  if (loading) {
    return (
      <div className="loading">
        Loading micro-internships...
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Unable to Load Internships</h3>
          <p>{error}</p>
          <button onClick={fetchMicroInternships} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="micro-internship-list">
      <div className="filters">
        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select 
          value={filters.difficulty} 
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <input
          type="text"
          placeholder="Filter by skills..."
          value={filters.skills}
          onChange={(e) => handleFilterChange('skills', e.target.value)}
        />
      </div>

      <div className="internship-grid">
        {microInternships.length > 0 ? (
          microInternships.map(internship => (
            <MicroInternshipCard 
              key={internship._id || internship.id} // FIX: Added key prop
              internship={internship} 
              user={user}
              onUpdate={fetchMicroInternships}
            />
          ))
        ) : (
          <div className="no-internships">
            <h3>No micro-internships available</h3>
            <p>There are currently no micro-internships posted. Check back later or create one if you're a mentor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MicroInternshipList;