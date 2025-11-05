import express from 'express';
import MicroInternship from '../models/MicroInternship.js';
import Badge from '../models/Badge.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/micro-internships - Get all micro-internships
router.get('/', async (req, res) => {
  try {
    console.log('=== GET /api/micro-internships ===');
    console.log('Query parameters:', req.query);
    
    const { status, difficulty, skills, mentor } = req.query;
    let filter = {};

    if (status && status !== '') filter.status = status;
    if (difficulty && difficulty !== '') filter.difficulty = difficulty;
    if (skills && skills !== '') {
      filter.skillsRequired = { $in: skills.split(',').map(s => s.trim()) };
    }
    if (mentor && mentor !== '') filter.mentor = mentor;

    console.log('Database filter:', filter);

    const microInternships = await MicroInternship.find(filter)
      .populate('mentor', 'name email department')
      .populate('applications.student', 'name email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${microInternships.length} micro-internships`);
    
    res.json({
      success: true,
      microInternships: microInternships || []
    });
  } catch (error) {
    console.error('❌ Error in GET /api/micro-internships:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch micro-internships: ' + error.message
    });
  }
});

// GET /api/micro-internships/:id - Get single micro-internship
router.get('/:id', async (req, res) => {
  try {
    console.log('=== GET /api/micro-internships/:id ===');
    console.log('Internship ID:', req.params.id);

    const microInternship = await MicroInternship.findById(req.params.id)
      .populate('mentor', 'name email department bio')
      .populate('applications.student', 'name email department');

    if (!microInternship) {
      console.log('❌ Micro-internship not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Micro-internship not found'
      });
    }

    console.log('✅ Found micro-internship:', microInternship.title);
    
    res.json({
      success: true,
      microInternship
    });
  } catch (error) {
    console.error('❌ Error in GET /api/micro-internships/:id:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/micro-internships - Create micro-internship (Mentor only)
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== POST /api/micro-internships START ===');
    console.log('📦 Request body received:', JSON.stringify(req.body, null, 2));
    console.log('👤 Authenticated user:', {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      email: req.user.email
    });
    
    // Check if user is mentor
    if (req.user.role !== 'mentor') {
      console.log('❌ Access denied - User role is:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Only mentors can create micro-internships. Current role: ' + req.user.role
      });
    }

    console.log('✅ User is a mentor, proceeding with creation...');
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'duration', 'deadline'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Prepare internship data
    const internshipData = {
      title: req.body.title,
      description: req.body.description,
      skillsRequired: Array.isArray(req.body.skillsRequired) 
        ? req.body.skillsRequired 
        : (req.body.skillsRequired || '').split(',').map(skill => skill.trim()).filter(skill => skill),
      duration: parseInt(req.body.duration),
      difficulty: req.body.difficulty || 'Beginner',
      deadline: new Date(req.body.deadline),
      mentor: req.user.id,
      status: 'Open'
    };

    console.log('📝 Prepared internship data:', internshipData);

    // Create and save micro-internship
    const microInternship = new MicroInternship(internshipData);
    
    console.log('💾 Saving to database...');
    await microInternship.save();
    console.log('✅ Micro-internship saved to database with ID:', microInternship._id);
    
    // Populate mentor details
    await microInternship.populate('mentor', 'name email');
    
    console.log('✅ Micro-internship created successfully!');
    console.log('=== POST /api/micro-internships END ===');
    
    res.status(201).json({
      success: true,
      message: 'Micro-internship created successfully',
      microInternship
    });
  } catch (error) {
    console.error('❌ Error in POST /api/micro-internships:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed: ' + validationErrors.join(', ')
      });
    }
    
    if (error.name === 'CastError') {
      console.error('Cast error for field:', error.path, 'value:', error.value);
      return res.status(400).json({
        success: false,
        message: `Invalid data format for field: ${error.path}`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create micro-internship: ' + error.message
    });
  }
});

// POST /api/micro-internships/:id/apply - Apply for micro-internship (Student only)
router.post('/:id/apply', auth, async (req, res) => {
  try {
    console.log('=== POST /api/micro-internships/:id/apply ===');
    console.log('Internship ID:', req.params.id);
    console.log('Applying user:', req.user.name, 'Role:', req.user.role);

    if (req.user.role !== 'student') {
      console.log('❌ Only students can apply. User role:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Only students can apply for micro-internships'
      });
    }

    const microInternship = await MicroInternship.findById(req.params.id);
    
    if (!microInternship) {
      console.log('❌ Micro-internship not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Micro-internship not found'
      });
    }

    console.log('Found internship:', microInternship.title, 'Status:', microInternship.status);

    if (microInternship.status !== 'Open') {
      console.log('❌ Internship not accepting applications. Status:', microInternship.status);
      return res.status(400).json({
        success: false,
        message: 'This micro-internship is not accepting applications. Current status: ' + microInternship.status
      });
    }

    // Check if already applied
    const existingApplication = microInternship.applications.find(
      app => app.student.toString() === req.user.id
    );

    if (existingApplication) {
      console.log('❌ User already applied to this internship');
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this micro-internship'
      });
    }

    // Add application
    microInternship.applications.push({
      student: req.user.id,
      coverLetter: req.body.coverLetter || '',
      applicationDate: new Date(),
      status: 'Pending'
    });

    console.log('💾 Saving application...');
    await microInternship.save();
    
    // Populate student details
    await microInternship.populate('applications.student', 'name email');
    
    console.log('✅ Application submitted successfully');
    
    res.json({
      success: true,
      message: 'Application submitted successfully',
      microInternship
    });
  } catch (error) {
    console.error('❌ Error in POST /api/micro-internships/:id/apply:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/micro-internships/:id/submit - Submit work (Student only)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    console.log('=== POST /api/micro-internships/:id/submit ===');
    
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit work'
      });
    }

    const microInternship = await MicroInternship.findById(req.params.id);
    
    if (!microInternship) {
      return res.status(404).json({
        success: false,
        message: 'Micro-internship not found'
      });
    }

    const application = microInternship.applications.find(
      app => app.student.toString() === req.user.id && app.status === 'Accepted'
    );

    if (!application) {
      return res.status(403).json({
        success: false,
        message: 'You are not accepted for this micro-internship or application not found'
      });
    }

    application.submission = {
      work: req.body.work,
      submittedAt: new Date()
    };

    await microInternship.save();
    await microInternship.populate('applications.student', 'name email');
    
    console.log('✅ Work submitted successfully');
    
    res.json({
      success: true,
      message: 'Work submitted successfully',
      microInternship
    });
  } catch (error) {
    console.error('❌ Error in POST /api/micro-internships/:id/submit:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/micro-internships/:id/feedback - Provide feedback (Mentor only)
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    console.log('=== POST /api/micro-internships/:id/feedback ===');
    
    if (req.user.role !== 'mentor') {
      return res.status(403).json({
        success: false,
        message: 'Only mentors can provide feedback'
      });
    }

    const microInternship = await MicroInternship.findById(req.params.id);
    
    if (!microInternship) {
      return res.status(404).json({
        success: false,
        message: 'Micro-internship not found'
      });
    }

    if (microInternship.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to provide feedback for this micro-internship'
      });
    }

    const application = microInternship.applications.id(req.body.applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (!application.submission) {
      return res.status(400).json({
        success: false,
        message: 'Student has not submitted work yet'
      });
    }

    application.submission.feedback = {
      rating: req.body.rating,
      comment: req.body.comment,
      givenAt: new Date()
    };

    // Create completion badge if requested
    if (req.body.awardBadge) {
      const badge = new Badge({
        student: application.student,
        microInternship: microInternship._id,
        badgeType: 'Completion',
        title: `${microInternship.title} Completion`,
        description: `Successfully completed the ${microInternship.title} micro-internship`,
        earnedAt: new Date()
      });
      await badge.save();
      console.log('✅ Completion badge awarded');
    }

    microInternship.status = 'Completed';
    await microInternship.save();
    await microInternship.populate('applications.student', 'name email');
    
    console.log('✅ Feedback provided successfully');
    
    res.json({
      success: true,
      message: 'Feedback provided successfully',
      microInternship
    });
  } catch (error) {
    console.error('❌ Error in POST /api/micro-internships/:id/feedback:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/micro-internships/badges/:userId - Get user's badges
router.get('/badges/:userId', auth, async (req, res) => {
  try {
    console.log('=== GET /api/micro-internships/badges/:userId ===');
    console.log('User ID:', req.params.userId);

    const badges = await Badge.find({ student: req.params.userId })
      .populate('microInternship', 'title description')
      .sort({ earnedAt: -1 });

    console.log(`✅ Found ${badges.length} badges for user`);
    
    res.json({
      success: true,
      badges: badges || []
    });
  } catch (error) {
    console.error('❌ Error in GET /api/micro-internships/badges/:userId:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/micro-internships/:id - Update micro-internship (Mentor only)
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('=== PUT /api/micro-internships/:id ===');
    
    const microInternship = await MicroInternship.findById(req.params.id);
    
    if (!microInternship) {
      return res.status(404).json({
        success: false,
        message: 'Micro-internship not found'
      });
    }

    if (microInternship.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this micro-internship'
      });
    }

    const updatedInternship = await MicroInternship.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('mentor', 'name email');

    console.log('✅ Micro-internship updated successfully');
    
    res.json({
      success: true,
      message: 'Micro-internship updated successfully',
      microInternship: updatedInternship
    });
  } catch (error) {
    console.error('❌ Error in PUT /api/micro-internships/:id:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/micro-internships/:id - Delete micro-internship (Mentor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('=== DELETE /api/micro-internships/:id ===');
    
    const microInternship = await MicroInternship.findById(req.params.id);
    
    if (!microInternship) {
      return res.status(404).json({
        success: false,
        message: 'Micro-internship not found'
      });
    }

    if (microInternship.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this micro-internship'
      });
    }

    await MicroInternship.findByIdAndDelete(req.params.id);
    
    console.log('✅ Micro-internship deleted successfully');
    
    res.json({
      success: true,
      message: 'Micro-internship deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error in DELETE /api/micro-internships/:id:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;