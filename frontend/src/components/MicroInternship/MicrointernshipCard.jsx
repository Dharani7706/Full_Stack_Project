import React, { useState } from 'react';
import axios from '../../utils/axiosConfig';
import './MicroInternshipCard.css';

const MicroInternshipCard = ({ internship, user, onUpdate }) => {
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submissionWork, setSubmissionWork] = useState('');

  // Safe data access with fallbacks
  const safeInternship = internship || {};
  const safeUser = user || {};
  
  // Safe status access
  const status = safeInternship.status || 'Unknown';
  
  // Safe mentor access
  const mentorName = safeInternship.mentor?.name || 'Unknown Mentor';
  const mentorEmail = safeInternship.mentor?.email || '';
  
  // Safe applications access
  const applications = safeInternship.applications || [];
  
  // Check if user has applied
  const hasApplied = applications.some(
    app => app.student?._id === safeUser.id || app.student === safeUser.id
  );

  // Find user's application
  const userApplication = applications.find(
    app => app.student?._id === safeUser.id || app.student === safeUser.id
  );

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/micro-internships/${safeInternship._id}/apply`, 
        { coverLetter },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowApplyForm(false);
      setCoverLetter('');
      onUpdate();
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to apply: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/micro-internships/${safeInternship._id}/submit`, 
        { work: submissionWork },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowSubmissionForm(false);
      setSubmissionWork('');
      onUpdate();
    } catch (error) {
      console.error('Error submitting work:', error);
      alert('Failed to submit work: ' + (error.response?.data?.message || error.message));
    }
  };

  // Don't render if internship data is invalid
  if (!safeInternship._id) {
    return (
      <div className="micro-internship-card error">
        <div className="error-message">
          <h3>Invalid Internship Data</h3>
          <p>This internship data is incomplete or corrupted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`micro-internship-card ${status.toLowerCase().replace(' ', '-')}`}>
      <div className="card-header">
        <h3>{safeInternship.title || 'Untitled Internship'}</h3>
        <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>
          {status}
        </span>
      </div>

      <div className="card-meta">
        <span className="mentor">By: {mentorName}</span>
        <span className="duration">{safeInternship.duration || 0} day(s)</span>
        <span className="difficulty">{safeInternship.difficulty || 'Unknown'}</span>
      </div>

      <p className="description">{safeInternship.description || 'No description provided.'}</p>

      {(safeInternship.skillsRequired && safeInternship.skillsRequired.length > 0) && (
        <div className="skills">
          {safeInternship.skillsRequired.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
        </div>
      )}

      {safeInternship.deadline && (
        <div className="deadline">
          Deadline: {new Date(safeInternship.deadline).toLocaleDateString()}
        </div>
      )}

      {safeUser.role === 'student' && (
        <div className="student-actions">
          {!hasApplied && status === 'Open' && (
            <button 
              onClick={() => setShowApplyForm(true)}
              className="btn-primary"
            >
              Apply Now
            </button>
          )}

          {hasApplied && userApplication && (
            <div className="application-status">
              Your application: <strong>{userApplication.status || 'Pending'}</strong>
            </div>
          )}

          {userApplication?.status === 'Accepted' && !userApplication?.submission && (
            <button 
              onClick={() => setShowSubmissionForm(true)}
              className="btn-secondary"
            >
              Submit Work
            </button>
          )}

          {userApplication?.submission && (
            <div className="submission-status">
              Work submitted on {userApplication.submission.submittedAt ? 
                new Date(userApplication.submission.submittedAt).toLocaleDateString() : 
                'Unknown date'
              }
              {userApplication.submission.feedback && (
                <div className="feedback">
                  <strong>Feedback:</strong> {userApplication.submission.feedback.comment || 'No comment'}
                  <br />
                  <strong>Rating:</strong> {userApplication.submission.feedback.rating || 0}/5
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showApplyForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Apply for {safeInternship.title}</h3>
            <form onSubmit={handleApply}>
              <textarea
                placeholder="Why are you interested in this micro-internship?"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                required
                rows="4"
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Submit Application</button>
                <button 
                  type="button" 
                  onClick={() => setShowApplyForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmissionForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Submit Work for {safeInternship.title}</h3>
            <form onSubmit={handleSubmitWork}>
              <textarea
                placeholder="Describe your work, provide links, or paste your code..."
                value={submissionWork}
                onChange={(e) => setSubmissionWork(e.target.value)}
                required
                rows="6"
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Submit Work</button>
                <button 
                  type="button" 
                  onClick={() => setShowSubmissionForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MicroInternshipCard;