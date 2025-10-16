import React from 'react';
import Navbar from '../components/Navbar';
import { Container, Grid, Card, CardContent, Typography } from '@mui/material';

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const modules = [
    { title: 'Micro-Internships', desc: 'Apply and participate in short-term mentor-led projects.' },
    { title: 'Live Career Lab', desc: 'Join real-time mentorship sessions & industry challenges.' },
    { title: 'Communication & Feedback', desc: 'Chat and exchange feedback with mentors.' },
    { title: 'Dashboard & Analytics', desc: 'View progress, achievements, and engagement reports.' },
  ];

  return (
    <>
      <Navbar role="Student" />
      <Container>
        {/* 👇 Display Logged-in User Name */}
        <Typography variant="h5" mb={3}>
          Welcome, {user?.name || 'Student'}!
        </Typography>

        <Grid container spacing={3}>
          {modules.map((m, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{m.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{m.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
