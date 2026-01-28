import express from 'express';
import User from '../models/User.js';
import { protect, mentorOnly, studentOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users (mentors list for students, students list for mentors)
router.get('/', protect, async (req, res) => {
  try {
    const role = req.query.role || (req.user.role === 'mentor' ? 'student' : 'mentor');
    const users = await User.find({ role }).select('-password').select('name email avatar skills interests experience bio');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('linkedMentor', 'name email avatar skills')
      .populate('linkedMentees', 'name email avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, skills, interests, experience, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, skills: skills || [], interests: interests || [], experience: experience || '', bio: bio || '', avatar: avatar || '' },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/users/link-mentee (mentor links a student)
router.post('/link-mentee', protect, mentorOnly, async (req, res) => {
  try {
    const { menteeId } = req.body;
    const mentee = await User.findOne({ _id: menteeId, role: 'student' });
    if (!mentee) return res.status(404).json({ message: 'Student not found' });
    if (mentee.linkedMentor) return res.status(400).json({ message: 'Student already has a mentor' });

    mentee.linkedMentor = req.user._id;
    await mentee.save();

    if (!req.user.linkedMentees) req.user.linkedMentees = [];
    if (!req.user.linkedMentees.includes(menteeId)) {
      req.user.linkedMentees.push(menteeId);
      await req.user.save();
    }
    res.json({ message: 'Mentee linked successfully', mentee: mentee._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/users/request-mentor (student requests to link with mentor)
router.post('/request-mentor', protect, studentOnly, async (req, res) => {
  try {
    const { mentorId } = req.body;
    const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

    const user = await User.findById(req.user._id);
    if (user.linkedMentor) return res.status(400).json({ message: 'You already have a linked mentor' });

    user.linkedMentor = mentorId;
    await user.save();

    if (!mentor.linkedMentees) mentor.linkedMentees = [];
    if (!mentor.linkedMentees.includes(req.user._id)) {
      mentor.linkedMentees.push(req.user._id);
      await mentor.save();
    }
    res.json({ message: 'Mentor linked successfully', mentor: mentorId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
