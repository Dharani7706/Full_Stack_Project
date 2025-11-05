import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get all users (for testing)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, department, bio, skills } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        name, 
        department, 
        bio, 
        skills,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentors
router.get('/role/mentors', async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select('-password');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get students
router.get('/role/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;