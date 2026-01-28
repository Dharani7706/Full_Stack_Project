import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setName(data.name || '');
      setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : '');
      setInterests(Array.isArray(data.interests) ? data.interests.join(', ') : '');
      setExperience(data.experience || '');
      setBio(data.bio || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(false);
    api.put('/users/profile', {
      name,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      interests: interests.split(',').map(s => s.trim()).filter(Boolean),
      experience,
      bio,
    }).then(() => { refreshUser(); setSaved(true); }).catch(() => {});
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>My Profile</h1>
      {saved && <div className="badge badge-success mb-2">Profile saved.</div>}
      <form onSubmit={handleSave} className="card" style={{ maxWidth: '560px' }}>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Skills (comma-separated)</label>
          <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Node, Python" />
        </div>
        <div className="form-group">
          <label>Interests (comma-separated)</label>
          <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. Web dev, AI" />
        </div>
        <div className="form-group">
          <label>Experience</label>
          <textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Brief experience or background" />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" />
        </div>
        <button type="submit" className="btn btn-primary">Save Profile</button>
      </form>
      {user?.linkedMentor && (
        <div className="card mt-1">
          <h3>Linked Mentor</h3>
          <p><strong>{user.linkedMentor.name}</strong> · {user.linkedMentor.email}</p>
        </div>
      )}
      {user?.linkedMentees?.length > 0 && (
        <div className="card mt-1">
          <h3>Linked Mentees</h3>
          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {user.linkedMentees.map((m) => <li key={m._id}>{m.name} · {m.email}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
