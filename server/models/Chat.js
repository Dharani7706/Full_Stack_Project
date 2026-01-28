import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'file'], default: 'text' },
  fileUrl: { type: String, default: '' },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Chat', messageSchema);
