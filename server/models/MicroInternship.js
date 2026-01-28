import mongoose from 'mongoose';

const microInternshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number, required: true, min: 1, max: 5 }, // days
  skillsRequired: [{ type: String }],
  maxParticipants: { type: Number, default: 10 },
  status: { type: String, enum: ['open', 'in_progress', 'completed'], default: 'open' },
  deadline: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('MicroInternship', microInternshipSchema);
