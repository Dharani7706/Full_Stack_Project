import React from 'react';
import Navbar from '../components/Navbar';
import { Container, Grid, Card, CardContent, Typography } from '@mui/material';

export default function MentorDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const modules = [
    { title: 'Micro-Internships', desc: 'Create and manage short-term mentorship projects.' },
    { title: 'Live Career Lab', desc: 'Host live sessions or challenges for students.' },
    { title: 'Communication & Feedback', desc: 'Chat with mentees and share insights.' },
    { title: 'Dashboard & Analytics', desc: 'Monitor mentee progress and performance data.' },
  ];

  return (
    <>
      <Navbar role="Mentor" />
      <Container>
        {/* 👇 Display Logged-in User Name */}
        <Typography variant="h5" mb={3}>
          Welcome, {user?.name || 'Mentor'}!
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
