import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import microInternshipRoutes from './routes/microInternships.js';
import liveSessionRoutes from './routes/liveSessions.js';
import chatRoutes from './routes/chat.js';
import dashboardRoutes from './routes/dashboard.js';

connectDB();
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/micro-internships', microInternshipRoutes);
app.use('/api/live-sessions', liveSessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Socket: simple chat relay (optional; for real-time feel)
io.on('connection', (socket) => {
  socket.on('chat:send', (payload) => io.to(payload.receiver).emit('chat:message', payload));
  socket.on('chat:join', (userId) => { socket.userId = userId; socket.join(userId); });
  socket.on('disconnect', () => {});
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
