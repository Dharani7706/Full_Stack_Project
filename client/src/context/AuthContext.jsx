import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => { localStorage.removeItem('token'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = (email, password) =>
    api.post('/auth/login', { email, password }).then(({ data }) => {
      localStorage.setItem('token', data.token);
      setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
      return data;
    });

  const register = (name, email, password, role) =>
    api.post('/auth/register', { name, email, password, role }).then(({ data }) => {
      localStorage.setItem('token', data.token);
      setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
      return data;
    });

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = () =>
    api.get('/auth/me').then(({ data }) => { setUser(data); return data; });

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
