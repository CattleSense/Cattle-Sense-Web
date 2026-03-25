const express = require('express');
const router = express.Router();
const StressRecord = require('../models/StressRecord');
const { protect, adminOnly } = require('../middleware/auth');

// Get history (farmer: own only, admin: all)
router.get('/', protect, async (req, res) => {
  try {
    const { cattle_id, date, stress, page = 1, limit = 20 } = req.query;
    const query = req.user.role === 'admin' ? {} : { user_id: req.user._id };
    if (cattle_id) query.cattle_id = { $regex: cattle_id, $options: 'i' };
    if (date) query.date = date;
    if (stress) query.stress = stress;
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      StressRecord.find(query).populate('user_id', 'name email farmName').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      StressRecord.countDocuments(query)
    ]);
    res.json({ success: true, records, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single record
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await StressRecord.findById(req.params.id).populate('user_id', 'name email farmName');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (req.user.role !== 'admin' && record.user_id._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete record (admin or own)
router.delete('/:id', protect, async (req, res) => {
  try {
    const record = await StressRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (req.user.role !== 'admin' && record.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await StressRecord.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
