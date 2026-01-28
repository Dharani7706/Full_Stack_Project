import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [err, setErr] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr('');
    register(name, email, password, role)
      .then(() => navigate('/dashboard'))
      .catch((r) => setErr(r.response?.data?.message || r.response?.data?.errors?.[0]?.msg || 'Registration failed'));
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Register</h1>
        {err && <div className="card" style={{ background: 'var(--danger-soft)', borderColor: 'var(--danger)', marginBottom: '1rem' }}>{err}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password (min 6)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Register</button>
        </form>
        <p className="toggle">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
