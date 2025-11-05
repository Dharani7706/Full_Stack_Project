import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  microInternship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MicroInternship',
    required: true
  },
  badgeType: {
    type: String,
    enum: ['Completion', 'Excellence', 'Quick Learner', 'Team Player'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  earnedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Badge', badgeSchema);