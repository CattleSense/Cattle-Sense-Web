const express = require('express');
const router = express.Router();
const StressRecord = require('../models/StressRecord');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, async (req, res) => {
  try {
    const baseQuery = req.user.role === 'admin' ? {} : { user_id: req.user._id };
    const [total, stressDist, monthlyCounts, recentRecords, topCattle] = await Promise.all([
      StressRecord.countDocuments(baseQuery),
      StressRecord.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$stress', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      StressRecord.aggregate([
        { $match: baseQuery },
        { $group: {
          _id: { $substr: ['$date', 0, 7] },
          count: { $sum: 1 },
          avgStressLevel: { $avg: { $switch: {
            branches: [
              { case: { $eq: ['$stress', 'Calm'] }, then: 1 },
              { case: { $eq: ['$stress', 'Mild'] }, then: 2 },
              { case: { $eq: ['$stress', 'Moderate'] }, then: 3 },
              { case: { $eq: ['$stress', 'High'] }, then: 4 },
              { case: { $eq: ['$stress', 'Extreme'] }, then: 5 }
            ], default: 1
          }}}
        }},
        { $sort: { '_id': 1 } },
        { $limit: 12 }
      ]),
      StressRecord.find(baseQuery).sort({ createdAt: -1 }).limit(5).lean(),
      StressRecord.aggregate([
        { $match: baseQuery },
        { $group: {
          _id: '$cattle_id',
          totalChecks: { $sum: 1 },
          avgStress: { $avg: { $switch: {
            branches: [
              { case: { $eq: ['$stress', 'Calm'] }, then: 1 },
              { case: { $eq: ['$stress', 'Mild'] }, then: 2 },
              { case: { $eq: ['$stress', 'Moderate'] }, then: 3 },
              { case: { $eq: ['$stress', 'High'] }, then: 4 },
              { case: { $eq: ['$stress', 'Extreme'] }, then: 5 }
            ], default: 1
          }}},
          lastCheck: { $max: '$createdAt' }
        }},
        { $sort: { avgStress: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: { total, stressDist, monthlyCounts, recentRecords, topCattle }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
