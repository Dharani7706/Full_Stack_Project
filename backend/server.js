import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import microInternshipRoutes from './routes/microInternships.js';

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const CONNECTION_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/mentorship-portal';
const PORT = process.env.PORT || 5000;

// MongoDB connection with better error handling
mongoose.connect(CONNECTION_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${CONNECTION_URL}`);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🗄️  Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/micro-internships', microInternshipRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Server is running successfully!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uptime: process.uptime()
  });
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🎯 Career Mentorship Portal API',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me'
      },
      users: {
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        updateProfile: 'PUT /api/users/profile',
        getMentors: 'GET /api/users/role/mentors',
        getStudents: 'GET /api/users/role/students'
      },
      microInternships: {
        getAll: 'GET /api/micro-internships',
        getById: 'GET /api/micro-internships/:id',
        create: 'POST /api/micro-internships',
        apply: 'POST /api/micro-internships/:id/apply',
        submitWork: 'POST /api/micro-internships/:id/submit',
        provideFeedback: 'POST /api/micro-internships/:id/feedback',
        getBadges: 'GET /api/micro-internships/badges/:userId'
      },
      health: 'GET /api/health'
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Career Mentorship Portal API',
    version: '1.0.0',
    documentation: '/api',
    health: '/api/health'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
    availableRoutes: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/me',
      '/api/users',
      '/api/micro-internships',
      '/api/health'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.toString()
    })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('🔥 Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Career Mentorship Portal Server Started');
  console.log('='.repeat(50));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🎯 Frontend URL: http://localhost:5173`);
  console.log('='.repeat(50) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});