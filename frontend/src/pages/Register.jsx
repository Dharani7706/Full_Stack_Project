import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import axios from '../utils/axiosConfig';
import './Register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/auth/register', formData);
      
      // Store token in localStorage (only token, not user data)
      localStorage.setItem('token', response.data.token);
      
      // Dispatch user data to Redux store
      dispatch(loginSuccess(response.data.user));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Create Account</h2>
        <p className="register-subtitle">Join the Career Mentorship Portal</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder="Enter your password"
            />
            <small>Password must be at least 6 characters long</small>
          </div>

          <div className="form-group">
            <label>I am a</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              disabled={loading}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          <div className="form-group">
            <label>Department/Field</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder="Computer Science, Engineering, Business, etc."
            />
          </div>
        </div>

        <button 
          className="register-button"
          onClick={handleRegister} 
          disabled={loading}
        >
          {loading ? <div className="button-spinner"></div> : 'Create Account'}
        </button>

        <div className="auth-link">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}