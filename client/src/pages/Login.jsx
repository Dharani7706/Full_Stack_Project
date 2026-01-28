import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr('');
    login(email, password)
      .then(() => navigate('/dashboard'))
      .catch((r) => setErr(r.response?.data?.message || 'Login failed'));
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Login</h1>
        {err && <div className="card" style={{ background: 'var(--danger-soft)', borderColor: 'var(--danger)', marginBottom: '1rem' }}>{err}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <p className="toggle">Don&apos;t have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
