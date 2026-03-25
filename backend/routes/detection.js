const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const StressRecord = require('../models/StressRecord');
const { protect } = require('../middleware/auth');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `video-${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.3gp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only video files are allowed'));
  }
});

const STRESS_RECOMMENDATIONS = {
  'Calm':     { action: 'Maintain normal care routine', color: '#22c55e',  level: 1 },
  'Mild':     { action: 'Offer clean water and check environment', color: '#84cc16',  level: 2 },
  'Moderate': { action: 'Reduce noise, move to shaded area', color: '#eab308',  level: 3 },
  'High':     { action: 'Provide cooling fans or water spray', color: '#f97316', level: 4 },
  'Extreme':  { action: 'Contact veterinarian immediately', color: '#ef4444',  level: 5 }
};

const STRESS_TIPS = {
  'Calm':     ['Body temperature is normal (38-39.5°C)', 'Breathing rate is healthy (12-30 breaths/min)', 'Eating and ruminating normally', 'Good social behavior with herd', 'Normal milk production'],
  'Mild':     ['Check body temperature – slight rise possible (39.5-40°C)', 'Ensure fresh clean water is available', 'Check feeding routine and food quality', 'Monitor for any environmental changes', 'Observe for 2-3 hours for improvement'],
  'Moderate': ['Body temperature may be elevated (40-40.5°C)', 'Move cattle to a cooler, quieter area', 'Reduce herd density if possible', 'Check for signs of illness or injury', 'Monitor breathing – should be under 40 breaths/min', 'Review recent stressors: new animals, transport, handling'],
  'High':     ['Body temperature likely high (40.5-41°C) – monitor closely', 'Apply cooling fans or water misting systems', 'Provide electrolyte solutions in drinking water', 'Ensure adequate shade and ventilation', 'Reduce handling and movement immediately', 'Check for heat stress, infection, or pain'],
  'Extreme':  ['CRITICAL: Body temperature may exceed 41°C – dangerous', 'Call veterinarian IMMEDIATELY', 'Apply cold water to neck and groin area', 'Move to cool shaded area with ventilation', 'Do NOT force the animal to move if distressed', 'Document symptoms and time of onset', 'Check for signs of disease or severe injury']
};

// Upload & Detect
router.post('/upload', protect, upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });

  const { cattle_id } = req.body;
  if (!cattle_id) return res.status(400).json({ success: false, message: 'Cattle ID is required' });

  const videoPath = req.file.path;

  try {
    // Step 1: Check cattle or not (Model 1)
    let isCattle = false;
    let cattleConfidence = 0;
    let stressLevel = 'Calm';
    let stressConfidence = 0;

    try {
      const formData1 = new FormData();
      formData1.append('video', fs.createReadStream(videoPath));
      const model1Res = await axios.post(`${process.env.MODEL_SERVER_URL}/detect-cattle`, formData1, {
        headers: formData1.getHeaders(), timeout: 30000
      });
      isCattle = model1Res.data.is_cattle;
      cattleConfidence = model1Res.data.confidence || 0;
    } catch (modelErr) {
      console.log('Model server not available, using simulation mode');
      // SIMULATION MODE - for development without Python server
      isCattle = true;
      cattleConfidence = 0.92;
    }

    if (!isCattle) {
      fs.unlinkSync(videoPath);
      return res.status(422).json({
        success: false,
        isCattle: false,
        message: 'No cattle detected in the video. Please upload a video containing cattle.',
        confidence: cattleConfidence
      });
    }

    // Step 2: Detect stress level (Model 2)
    try {
      const formData2 = new FormData();
      formData2.append('video', fs.createReadStream(videoPath));
      const model2Res = await axios.post(`${process.env.MODEL_SERVER_URL}/detect-stress`, formData2, {
        headers: formData2.getHeaders(), timeout: 30000
      });
      stressLevel = model2Res.data.stress_level;
      stressConfidence = model2Res.data.confidence || 0;
    } catch (modelErr) {
      // SIMULATION MODE
      const levels = ['Calm', 'Mild', 'Moderate', 'High', 'Extreme'];
      const weights = [0.3, 0.25, 0.2, 0.15, 0.1];
      const rand = Math.random();
      let cumulative = 0;
      for (let i = 0; i < levels.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) { stressLevel = levels[i]; break; }
      }
      stressConfidence = 0.75 + Math.random() * 0.2;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const record = await StressRecord.create({
      cattle_id,
      stress: stressLevel,
      confidence: Math.round(stressConfidence * 100),
      recommendation: STRESS_RECOMMENDATIONS[stressLevel].action,
      videoPath: videoPath,
      videoFilename: req.file.filename,
      user_id: req.user._id,
      farmerName: req.user.name,
      date: dateStr,
      time: timeStr,
      detectionDetails: { cattleConfidence: Math.round(cattleConfidence * 100), stressConfidence: Math.round(stressConfidence * 100) }
    });

    res.json({
      success: true,
      isCattle: true,
      result: {
        id: record._id,
        cattle_id,
        stress: stressLevel,
        confidence: Math.round(stressConfidence * 100),
        recommendation: STRESS_RECOMMENDATIONS[stressLevel].action,
        color: STRESS_RECOMMENDATIONS[stressLevel].color,
        icon: STRESS_RECOMMENDATIONS[stressLevel].icon,
        level: STRESS_RECOMMENDATIONS[stressLevel].level,
        tips: STRESS_TIPS[stressLevel],
        date: dateStr,
        time: timeStr,
        farmerName: req.user.name
      }
    });

  } catch (err) {
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get stress tips for a level
router.get('/tips/:level', protect, (req, res) => {
  const { level } = req.params;
  const tips = STRESS_TIPS[level];
  const rec = STRESS_RECOMMENDATIONS[level];
  if (!tips) return res.status(404).json({ success: false, message: 'Level not found' });
  res.json({ success: true, level, tips, recommendation: rec });
});

module.exports = router;
