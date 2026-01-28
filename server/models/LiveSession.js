import mongoose from 'mongoose';

const liveSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['video', 'chat', 'hybrid'], default: 'chat' },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // minutes
  meetingLink: { type: String, default: '' },
  status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('LiveSession', liveSessionSchema);
