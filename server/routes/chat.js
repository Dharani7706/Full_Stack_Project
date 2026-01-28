import express from 'express';
import Chat from '../models/Chat.js';
import ScheduledSession from '../models/ScheduledSession.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// --- Scheduled sessions (must be before /:otherId and /:id) ---

// @route   GET /api/chat/scheduled/list
router.get('/scheduled/list', protect, async (req, res) => {
  try {
    const q = req.user.role === 'mentor' ? { mentor: req.user._id } : { mentee: req.user._id };
    const list = await ScheduledSession.find(q)
      .populate('mentor', 'name email avatar')
      .populate('mentee', 'name email avatar')
      .sort('scheduledAt');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/chat/scheduled
router.post('/scheduled', protect, async (req, res) => {
  try {
    const { mentorId, menteeId, scheduledAt, duration, topic } = req.body;
    const mentor = mentorId || (req.user.role === 'mentor' ? req.user._id : null);
    const mentee = menteeId || (req.user.role === 'student' ? req.user._id : null);
    if (!mentor || !mentee) return res.status(400).json({ message: 'mentorId and menteeId required' });
    const item = await ScheduledSession.create({
      mentor,
      mentee,
      scheduledAt,
      duration: duration || 30,
      topic: topic || '',
    });
    const populated = await ScheduledSession.findById(item._id).populate('mentor', 'name email').populate('mentee', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/chat/scheduled/:id/rate
router.put('/scheduled/:id/rate', protect, async (req, res) => {
  try {
    const item = await ScheduledSession.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    const isMentee = item.mentee.toString() === req.user._id.toString();
    if (!isMentee) return res.status(403).json({ message: 'Only mentee can rate' });
    const { rating, ratingComment } = req.body;
    item.rating = rating;
    item.ratingComment = ratingComment || '';
    item.ratedAt = new Date();
    item.status = 'completed';
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Chat ---

// @route   POST /api/chat/send
router.post('/send', protect, async (req, res) => {
  try {
    const { receiver, content, type, fileUrl } = req.body;
    const msg = await Chat.create({
      sender: req.user._id,
      receiver,
      content: content || '',
      type: type || 'text',
      fileUrl: fileUrl || '',
    });
    const populated = await Chat.findById(msg._id).populate('sender', 'name avatar').populate('receiver', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/chat/:otherId (conversation with user)
router.get('/:otherId', protect, async (req, res) => {
  try {
    const messages = await Chat.find({
      $or: [
        { sender: req.user._id, receiver: req.params.otherId },
        { sender: req.params.otherId, receiver: req.user._id },
      ],
    }).populate('sender', 'name avatar').populate('receiver', 'name avatar').sort('createdAt');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/chat/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const msg = await Chat.findOne({ _id: req.params.id, receiver: req.user._id });
    if (!msg) return res.status(404).json({ message: 'Not found' });
    msg.read = true;
    msg.readAt = new Date();
    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
