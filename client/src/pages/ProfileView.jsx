import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`).then(({ data }) => setProfile(data)).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [id]);

  const handleLink = () => {
    if (!user?.role) return;
    const isMentor = user.role === 'mentor';
    const body = isMentor ? { menteeId: id } : { mentorId: id };
    const url = isMentor ? '/users/link-mentee' : '/users/request-mentor';
    api.post(url, body).then(() => { setProfile((p) => ({ ...p, linkedMentor: isMentor ? p : user, linkedMentees: isMentor ? [...(p?.linkedMentees || []), user] : p?.linkedMentees })); }).catch((r) => alert(r.response?.data?.message || 'Failed'));
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>User not found.</div>;

  const canLink = user.role === 'mentor' && profile.role === 'student' && !profile.linkedMentor;
  const canRequest = user.role === 'student' && profile.role === 'mentor' && !user.linkedMentor;

  return (
    <div>
      <div className="flex-between mb-2">
        <h1 style={{ margin: 0 }}>{profile.name}</h1>
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>
      <div className="card">
        <p className="text-muted mb-1">{profile.email} · {profile.role}</p>
        {profile.skills?.length > 0 && <p><strong>Skills:</strong> {profile.skills.join(', ')}</p>}
        {profile.interests?.length > 0 && <p><strong>Interests:</strong> {profile.interests.join(', ')}</p>}
        {profile.experience && <p><strong>Experience:</strong> {profile.experience}</p>}
        {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
        {(canLink || canRequest) && (
          <button type="button" className="btn btn-primary mt-1" onClick={handleLink}>
            {canLink ? 'Link as Mentee' : 'Request as Mentor'}
          </button>
        )}
        <button type="button" className="btn btn-secondary mt-1" style={{ marginLeft: '0.5rem' }} onClick={() => navigate(`/chat/${id}`)}>Chat</button>
      </div>
    </div>
  );
}
