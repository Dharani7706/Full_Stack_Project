import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig'; // Fixed import path

const ManageInternships = () => {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '', awardBadge: true });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.role === 'mentor') {
      fetchMyInternships();
    }
  }, [user]);

  const fetchMyInternships = async () => {
    try {
      const response = await axios.get('/micro-internships');
      
      // Filter internships created by current user
      const myInternships = response.data.filter(
        internship => internship.mentor._id === user.id
      );
      
      setInternships(myInternships);
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (internshipId, applicationId, action) => {
    try {
      await axios.patch(
        `/micro-internships/${internshipId}/applications/${applicationId}`,
        { status: action }
      );
      fetchMyInternships();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const provideFeedback = async (internshipId, applicationId, feedbackData) => {
    try {
      await axios.post(
        `/micro-internships/${internshipId}/feedback`,
        {
          applicationId,
          ...feedbackData
        }
      );
      fetchMyInternships();
      setSelectedInternship(null);
      setFeedback({ rating: 5, comment: '', awardBadge: true });
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
  };

  if (loading) return <div className="loading">Loading your internships...</div>;

  if (user?.role !== 'mentor') {
    return (
      <div className="manage-internships">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>Only mentors can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-internships">
      <div className="page-header">
        <h1>Manage My Micro-Internships</h1>
        <p>Review applications and provide feedback to students</p>
      </div>

      <div className="internships-grid">
        {internships.map(internship => (
          <div key={internship._id} className="internship-manager-card">
            <div className="card-header">
              <h3>{internship.title}</h3>
              <span className={`status-badge ${internship.status.toLowerCase()}`}>
                {internship.status}
              </span>
            </div>

            <div className="applications-section">
              <h4>Applications ({internship.applications.length})</h4>
              
              {internship.applications.length === 0 ? (
                <p className="no-applications">No applications yet</p>
              ) : (
                <div className="applications-list">
                  {internship.applications.map(application => (
                    <div key={application._id} className="application-item">
                      <div className="application-header">
                        <span className="student-name">
                          {application.student?.name || 'Unknown Student'}
                        </span>
                        <span className={`application-status ${application.status.toLowerCase()}`}>
                          {application.status}
                        </span>
                      </div>

                      {application.coverLetter && (
                        <p className="cover-letter">{application.coverLetter}</p>
                      )}

                      <div className="application-actions">
                        {application.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApplicationAction(internship._id, application._id, 'Accepted')}
                              className="btn-success"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleApplicationAction(internship._id, application._id, 'Rejected')}
                              className="btn-danger"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {application.status === 'Accepted' && !application.submission && (
                          <span className="waiting">Waiting for submission...</span>
                        )}

                        {application.submission && (
                          <div className="submission-details">
                            <p><strong>Submitted Work:</strong></p>
                            <p>{application.submission.work}</p>
                            <p className="submit-date">
                              Submitted on: {new Date(application.submission.submittedAt).toLocaleDateString()}
                            </p>

                            {!application.submission.feedback ? (
                              <button
                                onClick={() => setSelectedInternship({
                                  internshipId: internship._id,
                                  applicationId: application._id,
                                  studentName: application.student?.name || 'Student'
                                })}
                                className="btn-primary"
                              >
                                Provide Feedback
                              </button>
                            ) : (
                              <div className="feedback-given">
                                <strong>Feedback Provided:</strong>
                                <p>Rating: {application.submission.feedback.rating}/5</p>
                                <p>{application.submission.feedback.comment}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedInternship && (
        <FeedbackModal
          internship={selectedInternship}
          feedback={feedback}
          setFeedback={setFeedback}
          onClose={() => {
            setSelectedInternship(null);
            setFeedback({ rating: 5, comment: '', awardBadge: true });
          }}
          onSubmit={provideFeedback}
        />
      )}

      {internships.length === 0 && (
        <div className="no-internships">
          <p>You haven't created any micro-internships yet.</p>
          <a href="/micro-internships" className="btn-primary">
            Create Your First Micro-Internship
          </a>
        </div>
      )}
    </div>
  );
};

const FeedbackModal = ({ internship, feedback, setFeedback, onClose, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(internship.internshipId, internship.applicationId, feedback);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Provide Feedback for {internship.studentName}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating (1-5)</label>
            <select 
              value={feedback.rating} 
              onChange={(e) => setFeedback({...feedback, rating: parseInt(e.target.value)})}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Feedback Comment</label>
            <textarea
              value={feedback.comment}
              onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
              required
              rows="4"
              placeholder="Provide constructive feedback about the student's work..."
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={feedback.awardBadge}
                onChange={(e) => setFeedback({...feedback, awardBadge: e.target.checked})}
              />
              Award Completion Badge
            </label>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">Submit Feedback</button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageInternships;