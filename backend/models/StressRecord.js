const mongoose = require('mongoose');

const stressRecordSchema = new mongoose.Schema({
  cattle_id: { type: String, required: true, trim: true },
  stress: {
    type: String,
    enum: ['Calm', 'Mild', 'Moderate', 'High', 'Extreme'],
    required: true
  },
  confidence: { type: Number, default: 0 },
  recommendation: { type: String },
  videoPath: { type: String },
  videoFilename: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String },
  date: { type: String },
  time: { type: String },
  detectionDetails: { type: Object },
  weatherData: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('StressRecord', stressRecordSchema);
