import mongoose from 'mongoose';

const scheduledSessionSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 30 },
  topic: { type: String, default: '' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
  reminderSent: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
  ratingComment: { type: String, default: '' },
  ratedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('ScheduledSession', scheduledSessionSchema);
