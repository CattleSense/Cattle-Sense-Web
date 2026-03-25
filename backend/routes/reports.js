const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const StressRecord = require('../models/StressRecord');
const { protect } = require('../middleware/auth');

router.get('/pdf', protect, async (req, res) => {
  try {
    const { month, cattle_id } = req.query;
    const query = req.user.role === 'admin' ? {} : { user_id: req.user._id };
    if (cattle_id) query.cattle_id = { $regex: cattle_id, $options: 'i' };
    if (month) query.date = { $regex: `^${month}` };

    const records = await StressRecord.find(query).populate('user_id', 'name farmName').sort({ createdAt: -1 }).limit(100);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=cattle-stress-report-${Date.now()}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor('#1a6b3a').text('Cattle Stress Detection Report', { align: 'center' });
    doc.fontSize(12).fillColor('#666').text('CattleSense - Livestock Management System, Sri Lanka', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('#333').text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.text(`Total Records: ${records.length}`, { align: 'right' });
    doc.moveDown();

    // Table header
    const cols = [50, 130, 230, 310, 400, 490];
    doc.fontSize(9).fillColor('white');
    const headerY = doc.y - 15;
    doc.fillColor('white');
    ['Cattle ID', 'Date', 'Time', 'Stress Level',  'Farmer'].forEach((h, i) => {
      doc.text(h, cols[i], headerY, { width: 80 });
    });
    doc.moveDown(0.5);

    // Rows
    const COLORS = { Calm: '#22c55e', Mild: '#84cc16', Moderate: '#eab308', High: '#f97316', Extreme: '#ef4444' };
    records.forEach((r, idx) => {
      if (doc.y > 700) doc.addPage();
      const rowY = doc.y;
      if (idx % 2 === 0) doc.rect(50, rowY - 2, 510, 18).fill('#f9f9f9');
      doc.fillColor('#333').fontSize(8);
      const farmer = r.user_id ? (r.user_id.farmName || r.user_id.name || 'N/A') : 'N/A';
      [r.cattle_id, r.date, r.time, r.stress,  farmer].forEach((val, i) => {
        if (i === 3) {
          doc.fillColor(COLORS[r.stress] || '#333').text(val, cols[i], rowY, { width: 80 });
        } else {
          doc.fillColor('#333').text(String(val || '-'), cols[i], rowY, { width: 80 });
        }
      });
      doc.moveDown(0.4);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
