import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'MicroInternship', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  submittedWork: { type: String, default: '' },
  submittedAt: { type: Date },
  feedback: { type: String, default: '' },
  mentorRating: { type: Number, min: 1, max: 5 },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  badgeAwarded: { type: Boolean, default: false },
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

applicationSchema.index({ internship: 1, student: 1 }, { unique: true });

export default mongoose.model('MicroInternshipApplication', applicationSchema);
