import React, { useState } from 'react';
import axios from '../../utils/axiosConfig';
import './CreateMicroInternship.css';

const CreateMicroInternship = ({ onCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillsRequired: '',
    duration: 1,
    difficulty: 'Beginner',
    deadline: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const skillsArray = formData.skillsRequired.split(',').map(skill => skill.trim());

      console.log('Creating micro-internship with data:', {
        ...formData,
        skillsRequired: skillsArray
      });
      console.log('Token:', token);
      console.log('API Base URL:', axios.defaults.baseURL);

      const response = await axios.post('/micro-internships', {
        ...formData,
        skillsRequired: skillsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Response:', response);
      onCreated(response.data);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        skillsRequired: '',
        duration: 1,
        difficulty: 'Beginner',
        deadline: ''
      });
      
    } catch (error) {
      console.error('Error creating micro-internship:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request
      });
    }
  };

  return (
    <div className="create-micro-internship">
      <h2>Create Micro-Internship</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Skills Required (comma separated)</label>
          <input
            type="text"
            name="skillsRequired"
            value={formData.skillsRequired}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (days)</label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5].map(days => (
                <option key={days} value={days}>{days} day{days > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Deadline</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary">Create Micro-Internship</button>
      </form>
    </div>
  );
};

export default CreateMicroInternship;