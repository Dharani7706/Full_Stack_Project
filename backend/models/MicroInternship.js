import mongoose from 'mongoose';

const microInternshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillsRequired: [{
    type: String,
    trim: true
  }],
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Open'
  },
  applications: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    applicationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    },
    coverLetter: String,
    submission: {
      work: String,
      submittedAt: Date,
      feedback: {
        rating: Number,
        comment: String,
        givenAt: Date
      }
    }
  }],
  deadline: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('MicroInternship', microInternshipSchema);