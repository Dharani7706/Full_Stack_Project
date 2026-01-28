import express from 'express';
import MicroInternship from '../models/MicroInternship.js';
import MicroInternshipApplication from '../models/MicroInternshipApplication.js';
import { protect, mentorOnly, studentOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/micro-internships
router.get('/', protect, async (req, res) => {
  try {
    const status = req.query.status;
    const q = status ? { status } : {};
    const list = await MicroInternship.find(q).populate('mentor', 'name email avatar skills').sort('-createdAt');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/micro-internships/my/applications (must be before /:id)
router.get('/my/applications', protect, studentOnly, async (req, res) => {
  try {
    const list = await MicroInternshipApplication.find({ student: req.user._id })
      .populate('internship')
      .populate('internship.mentor', 'name email avatar')
      .sort('-appliedAt');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/micro-internships/mentor/applications (must be before /:id)
router.get('/mentor/applications', protect, mentorOnly, async (req, res) => {
  try {
    const list = await MicroInternshipApplication.find({})
      .populate('internship')
      .populate('student', 'name email avatar')
      .then(rows => rows.filter(r => r.internship && String(r.internship.mentor?._id || r.internship.mentor) === String(req.user._id)));
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/micro-internships/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await MicroInternship.findById(req.params.id).populate('mentor', 'name email avatar skills');
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/micro-internships (mentor create)
router.post('/', protect, mentorOnly, async (req, res) => {
  try {
    const { title, description, duration, skillsRequired, maxParticipants, deadline } = req.body;
    const item = await MicroInternship.create({
      title,
      description,
      duration: duration || 1,
      skillsRequired: skillsRequired || [],
      maxParticipants: maxParticipants || 10,
      deadline: deadline || null,
      mentor: req.user._id,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/micro-internships/:id (mentor edit)
router.put('/:id', protect, mentorOnly, async (req, res) => {
  try {
    const item = await MicroInternship.findOne({ _id: req.params.id, mentor: req.user._id });
    if (!item) return res.status(404).json({ message: 'Not found' });
    const { title, description, duration, skillsRequired, maxParticipants, status, deadline } = req.body;
    if (title) item.title = title;
    if (description) item.description = description;
    if (duration) item.duration = duration;
    if (skillsRequired) item.skillsRequired = skillsRequired;
    if (maxParticipants) item.maxParticipants = maxParticipants;
    if (status) item.status = status;
    if (deadline !== undefined) item.deadline = deadline;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/micro-internships/:id/apply (student apply)
router.post('/:id/apply', protect, studentOnly, async (req, res) => {
  try {
    const internship = await MicroInternship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    if (internship.status !== 'open') return res.status(400).json({ message: 'Applications closed' });

    const existing = await MicroInternshipApplication.findOne({ internship: req.params.id, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already applied' });

    const count = await MicroInternshipApplication.countDocuments({ internship: req.params.id, status: { $in: ['accepted', 'pending'] } });
    if (count >= (internship.maxParticipants || 10)) return res.status(400).json({ message: 'Maximum participants reached' });

    const app = await MicroInternshipApplication.create({ internship: req.params.id, student: req.user._id });
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/micro-internships/applications/:appId (submit work / mentor: accept, reject, feedback, progress, badge)
router.put('/applications/:appId', protect, async (req, res) => {
  try {
    const app = await MicroInternshipApplication.findById(req.params.appId).populate('internship');
    if (!app) return res.status(404).json({ message: 'Application not found' });

    const isMentor = app.internship.mentor.toString() === req.user._id.toString();
    const isStudent = app.student.toString() === req.user._id.toString();

    if (isStudent) {
      const { submittedWork } = req.body;
      if (submittedWork !== undefined) {
        app.submittedWork = submittedWork;
        app.submittedAt = new Date();
        app.progress = 100;
      }
      await app.save();
      return res.json(app);
    }

    if (isMentor) {
      const { status, feedback, mentorRating, progress, badgeAwarded } = req.body;
      if (status) app.status = status;
      if (feedback !== undefined) app.feedback = feedback;
      if (mentorRating !== undefined) app.mentorRating = mentorRating;
      if (progress !== undefined) app.progress = progress;
      if (badgeAwarded !== undefined) app.badgeAwarded = badgeAwarded;
      await app.save();
      return res.json(app);
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
