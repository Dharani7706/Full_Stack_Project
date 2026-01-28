import express from 'express';
import LiveSession from '../models/LiveSession.js';
import Challenge from '../models/Challenge.js';
import { protect, mentorOnly, studentOnly } from '../middleware/auth.js';

const router = express.Router();

// --- Live Sessions ---

// @route   GET /api/live-sessions
router.get('/sessions', protect, async (req, res) => {
  try {
    const status = req.query.status;
    const q = status ? { status } : {};
    const list = await LiveSession.find(q).populate('mentor', 'name email avatar').sort('scheduledAt');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/live-sessions (mentor create)
router.post('/sessions', protect, mentorOnly, async (req, res) => {
  try {
    const { title, description, type, scheduledAt, duration, meetingLink } = req.body;
    const item = await LiveSession.create({
      title,
      description,
      type: type || 'chat',
      scheduledAt,
      duration: duration || 60,
      meetingLink: meetingLink || '',
      mentor: req.user._id,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/live-sessions/:id/join (student join)
router.put('/sessions/:id/join', protect, studentOnly, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.participants) session.participants = [];
    if (!session.participants.includes(req.user._id)) {
      session.participants.push(req.user._id);
      await session.save();
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Challenges (mini-hackathons) ---

// @route   GET /api/live-sessions/challenges
router.get('/challenges', protect, async (req, res) => {
  try {
    const status = req.query.status;
    const q = status ? { status } : {};
    const list = await Challenge.find(q).populate('mentor', 'name email avatar').sort('-createdAt');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/live-sessions/challenges (mentor create)
router.post('/challenges', protect, mentorOnly, async (req, res) => {
  try {
    const { title, description, deadline, difficulty, prizes } = req.body;
    const item = await Challenge.create({
      title,
      description,
      deadline,
      difficulty: difficulty || 'medium',
      prizes: prizes || '',
      mentor: req.user._id,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/live-sessions/challenges/:id/join
router.put('/challenges/:id/join', protect, studentOnly, async (req, res) => {
  try {
    const ch = await Challenge.findById(req.params.id);
    if (!ch) return res.status(404).json({ message: 'Challenge not found' });
    if (ch.status !== 'open' && ch.status !== 'ongoing') return res.status(400).json({ message: 'Cannot join' });
    if (!ch.participants) ch.participants = [];
    if (!ch.participants.some(p => p.toString() === req.user._id.toString())) {
      ch.participants.push(req.user._id);
      if (ch.status === 'open') ch.status = 'ongoing';
      await ch.save();
    }
    res.json(ch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/live-sessions/challenges/:id/submit
router.post('/challenges/:id/submit', protect, studentOnly, async (req, res) => {
  try {
    const ch = await Challenge.findById(req.params.id);
    if (!ch) return res.status(404).json({ message: 'Challenge not found' });
    const { link, notes } = req.body;
    const existing = (ch.submissions || []).find(s => s.student.toString() === req.user._id.toString());
    if (existing) {
      existing.link = link || existing.link;
      existing.notes = notes || existing.notes;
      existing.submittedAt = new Date();
    } else {
      ch.submissions = ch.submissions || [];
      ch.submissions.push({ student: req.user._id, link, notes, submittedAt: new Date() });
    }
    await ch.save();
    res.json(ch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/live-sessions/challenges/:id/rate (mentor rate submission)
router.put('/challenges/:id/rate', protect, mentorOnly, async (req, res) => {
  try {
    const ch = await Challenge.findById(req.params.id);
    if (!ch || ch.mentor.toString() !== req.user._id.toString()) return res.status(404).json({ message: 'Forbidden' });
    const { studentId, rating, feedback } = req.body;
    const sub = (ch.submissions || []).find(s => s.student.toString() === studentId);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    sub.rating = rating;
    sub.feedback = feedback || '';
    await ch.save();
    res.json(ch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
