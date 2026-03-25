const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

router.get('/sri-lanka', protect, async (req, res) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const city = req.query.city || 'Colombo';
    if (!apiKey || apiKey === 'your_openweather_api_key_here') {
      // Return mock data when no API key
      return res.json({
        success: true, mock: true,
        data: { city, temp: 31, humidity: 75, description: 'Partly Cloudy', heatStress: 'moderate', icon: '⛅' }
      });
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},LK&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);
    const d = response.data;
    const temp = d.main.temp;
    const heatStress = temp > 35 ? 'high' : temp > 30 ? 'moderate' : 'low';
    res.json({
      success: true,
      data: { city, temp, humidity: d.main.humidity, description: d.weather[0].description, heatStress, icon: temp > 35 ? '🔥' : '☀️' }
    });
  } catch (err) {
    res.json({ success: true, mock: true, data: { city: 'Colombo', temp: 30, humidity: 78, description: 'Tropical', heatStress: 'moderate', icon: '🌤️' } });
  }
});

module.exports = router;
