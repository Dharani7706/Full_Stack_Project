import React, { useState } from 'react';
import { Container, TextField, Button, Typography, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email && password) {
      const user = { name, email, role };
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } else {
      alert('Please fill all fields');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10, p: 4, boxShadow: 3, borderRadius: 3 }}>
      <Typography variant="h5" textAlign="center" mb={2}>Login</Typography>

      {/* 👇 Optional Name Field for Demo */}
      <TextField
        label="Full Name"
        fullWidth
        margin="normal"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <TextField
        type="password"
        label="Password"
        fullWidth
        margin="normal"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <TextField
        select
        label="Role"
        fullWidth
        margin="normal"
        value={role}
        onChange={e => setRole(e.target.value)}
      >
        <MenuItem value="student">Student</MenuItem>
        <MenuItem value="mentor">Mentor</MenuItem>
      </TextField>

      <Button variant="contained" color="primary" fullWidth onClick={handleLogin} sx={{ mt: 2 }}>
        Login
      </Button>

      <Typography mt={2} textAlign="center">
        Don’t have an account? <a href="/register">Register</a>
      </Typography>
    </Container>
  );
}
