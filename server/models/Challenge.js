import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deadline: { type: Date, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  prizes: { type: String, default: '' },
  status: { type: String, enum: ['open', 'ongoing', 'judging', 'completed'], default: 'open' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    link: String,
    notes: String,
    submittedAt: Date,
    rating: Number,
    feedback: String,
  }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Challenge', challengeSchema);
