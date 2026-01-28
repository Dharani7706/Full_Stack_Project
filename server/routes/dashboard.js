import express from 'express';
import MicroInternship from '../models/MicroInternship.js';
import MicroInternshipApplication from '../models/MicroInternshipApplication.js';
import LiveSession from '../models/LiveSession.js';
import Challenge from '../models/Challenge.js';
import ScheduledSession from '../models/ScheduledSession.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/dashboard
router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();

    // Micro-internship stats
    let microStats = { applied: 0, inProgress: 0, completed: 0, badges: 0 };
    if (user.role === 'student') {
      const apps = await MicroInternshipApplication.find({ student: user._id });
      microStats.applied = apps.length;
      microStats.inProgress = apps.filter(a => a.status === 'accepted' && a.progress < 100).length;
      microStats.completed = apps.filter(a => a.status === 'completed' || a.progress === 100).length;
      microStats.badges = apps.filter(a => a.badgeAwarded).length;
    } else {
      const internships = await MicroInternship.find({ mentor: user._id });
      const allAppIds = (await MicroInternshipApplication.find({ internship: { $in: internships.map(i => i._id) } })).map(a => a._id);
      const apps = await MicroInternshipApplication.find({ _id: { $in: allAppIds } });
      microStats.applied = apps.length;
      microStats.inProgress = apps.filter(a => a.status === 'accepted' && a.progress < 100).length;
      microStats.completed = apps.filter(a => a.status === 'completed' || a.progress === 100).length;
      microStats.badges = apps.filter(a => a.badgeAwarded).length;
    }

    // Upcoming live sessions
    const upcomingSessions = await LiveSession.find({
      status: 'scheduled',
      scheduledAt: { $gte: now },
      $or: [{ mentor: user._id }, { participants: user._id }],
    }).populate('mentor', 'name avatar').sort('scheduledAt').limit(5);

    // Upcoming challenges
    const upcomingChallenges = await Challenge.find({
      status: { $in: ['open', 'ongoing'] },
      deadline: { $gte: now },
    }).populate('mentor', 'name avatar').sort('deadline').limit(5);

    // Scheduled mentorship sessions
    const upcomingMentorship = await ScheduledSession.find({
      status: 'scheduled',
      scheduledAt: { $gte: now },
      $or: [{ mentor: user._id }, { mentee: user._id }],
    }).populate('mentor', 'name avatar').populate('mentee', 'name avatar').sort('scheduledAt').limit(5);

    // Mentor analytics (only for mentors)
    let mentorAnalytics = null;
    if (user.role === 'mentor') {
      const internships = await MicroInternship.find({ mentor: user._id });
      const appIds = (await MicroInternshipApplication.find({ internship: { $in: internships.map(i => i._id) } })).map(a => a._id);
      const apps = await MicroInternshipApplication.find({ _id: { $in: appIds } }).populate('student', 'name');
      const total = apps.length;
      const completed = apps.filter(a => a.status === 'completed' || a.progress === 100).length;
      const withRating = apps.filter(a => a.mentorRating).length;
      const avgRating = withRating > 0 ? apps.filter(a => a.mentorRating).reduce((s, a) => s + a.mentorRating, 0) / withRating : 0;
      mentorAnalytics = {
        totalMentees: [...new Set(apps.map(a => a.student && a.student._id).filter(Boolean))].length,
        totalApplications: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        averageRating: Math.round(avgRating * 10) / 10,
      };
    }

    // Student performance summary
    let studentSummary = null;
    if (user.role === 'student') {
      const apps = await MicroInternshipApplication.find({ student: user._id });
      const withRating = apps.filter(a => a.mentorRating);
      const avg = withRating.length ? withRating.reduce((s, a) => s + a.mentorRating, 0) / withRating.length : 0;
      studentSummary = {
        totalApplied: apps.length,
        completed: apps.filter(a => a.status === 'completed' || a.progress === 100).length,
        badges: apps.filter(a => a.badgeAwarded).length,
        averageRating: Math.round(avg * 10) / 10,
      };
    }

    res.json({
      microInternship: microStats,
      upcomingLiveSessions: upcomingSessions,
      upcomingChallenges: upcomingChallenges,
      upcomingMentorship: upcomingMentorship,
      mentorAnalytics,
      studentSummary,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
