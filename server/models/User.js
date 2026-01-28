import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['mentor', 'student'], required: true },
  avatar: { type: String, default: '' },
  skills: [{ type: String }],
  interests: [{ type: String }],
  experience: { type: String, default: '' },
  bio: { type: String, default: '' },
  linkedMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  linkedMentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
