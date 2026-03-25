# 🐄 CattleSense — Cattle Stress Detection System
## Final Year Research Project · Sri Lanka

---

## 📁 Project Structure

```
cattle-stress/
├── backend/                    ← Node.js + Express API
│   ├── models/                 ← MongoDB schemas
│   ├── routes/                 ← API endpoints
│   ├── middleware/             ← JWT auth
│   ├── uploads/videos/         ← Stored videos (auto-created)
│   ├── server.js               ← Main entry point
│   ├── .env                    ← Environment variables
│   └── package.json
│
├── frontend/                   ← React + Vite app
│   ├── src/
│   │   ├── pages/              ← All pages
│   │   ├── components/         ← Shared components
│   │   ├── context/            ← Auth context
│   │   └── utils/              ← API, stress helpers
│   └── package.json
│
└── model_server/               ← Python Flask model API
    ├── model_server.py         ← Serves your TFLite models
    ├── models/                 ← PUT YOUR .tflite FILES HERE
    │   ├── cow_not_cow.tflite  ← Model 1: cattle detection
    │   └── cattle_stress.tflite← Model 2: stress detection
    └── requirements.txt
```

---

## ⚡ QUICK START (3 Terminals)

### Terminal 1 — Python Model Server

```bash
cd model_server

# Install dependencies
pip install flask flask-cors opencv-python tensorflow numpy pillow

# Place your TFLite models in:
#   model_server/models/cow_not_cow.tflite
#   model_server/models/cattle_stress.tflite

python model_server.py
# ✅ Runs on http://localhost:8000
```

### Terminal 2 — Node.js Backend

```bash
cd backend
npm install
# Edit .env: set MONGODB_URI to your MongoDB connection string
npm run dev
# ✅ Runs on http://localhost:5000
# ✅ Auto-seeds admin: admin@gmail.com / Admin123@
```

### Terminal 3 — React Frontend

```bash
cd frontend
npm install
npm run dev
# ✅ Runs on http://localhost:3000
# ✅ Opens login page automatically
```

---

## 🤖 MODEL INTEGRATION GUIDE

### Your TFLite Models

You trained **two models** using MobileNetV2:

#### Model 1: `cow_not_cow.tflite`
```
Input:  224 × 224 × 3 (float32, normalized 0–1)
Output: sigmoid value (1 neuron)
  - value < 0.5  → COW detected ✅
  - value >= 0.5 → NOT a cow ❌

Class indices from your training:
  {'cow': 0, 'not_cow': 1}
```

#### Model 2: `cattle_stress.tflite`
```
Input:  224 × 224 × 3 (float32, normalized 0–1)
Output: 5 class probabilities (softmax)
  [Calm, Mild, Moderate, High, Extreme]
  → argmax = predicted stress level
```

### How the Pipeline Works

```
User uploads video
      ↓
[Node.js Backend]
  → Saves video to /uploads/videos/
  → Calls POST http://localhost:8000/detect-cattle
        ↓
[Python Model Server]
  → Extracts 10 frames from video using OpenCV
  → Each frame: resize to 224×224, normalize /255
  → Run through cow_not_cow.tflite
  → Average sigmoid scores across all frames
  → If avg < 0.5 → IS CATTLE → return {is_cattle: true}
  → If avg >= 0.5 → NOT CATTLE → return {is_cattle: false}
        ↓
[Node.js Backend]
  → If not cattle → 422 response → Frontend shows REJECTION
  → If cattle → calls POST http://localhost:8000/detect-stress
        ↓
[Python Model Server]
  → Extracts 15 frames from video
  → Run each frame through cattle_stress.tflite
  → Average class probabilities across all frames
  → Return {stress_level: "Calm"|"Mild"|..., confidence: 0.85}
        ↓
[Node.js Backend]
  → Save record to MongoDB
  → Return result with recommendation + tips
        ↓
[React Frontend]
  → Animate seekbar progress
  → Show stress level, confidence, recommendations
  → Display care tips panel
```

### If Models Are Not Loaded (Simulation Mode)

If your `.tflite` files are missing, the system runs in **simulation mode**:
- Model 1 always returns `is_cattle: true` (confidence 92%)
- Model 2 randomly picks a stress level with weighted probability

**To activate real models:** copy both `.tflite` files to `model_server/models/`

---

## ⚙️ Environment Setup

### backend/.env
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cattle_stress_db
JWT_SECRET=cattle_stress_jwt_secret_key_2026_sri_lanka
JWT_EXPIRE=7d
MODEL_SERVER_URL=http://localhost:8000
OPENWEATHER_API_KEY=your_openweather_api_key_here
NODE_ENV=development
```

**MongoDB:** Install MongoDB locally or use MongoDB Atlas (free cloud):
1. Go to https://www.mongodb.com/atlas
2. Create free cluster
3. Get connection string → paste into `MONGODB_URI`

**Weather API (optional):** Get free key from https://openweathermap.org/api

---

## 🔑 Authentication & Roles

| Role   | Default | Permissions |
|--------|---------|-------------|
| Admin  | Seeded  | Full system access, view all records, manage users, change roles |
| Farmer | Register| Upload videos, view own records, own analytics |

**Admin Login:**
```
Email:    admin@gmail.com
Password: Admin123@
```

**New users:** Register → automatically become Farmer → Admin can promote to Admin role.

---

## 🌐 API Endpoints

```
POST   /api/auth/login              → Login
POST   /api/auth/register           → Register (becomes Farmer)
GET    /api/auth/me                 → Get current user

POST   /api/detection/upload        → Upload video + detect (multipart/form-data)
GET    /api/detection/tips/:level   → Get care tips for stress level

GET    /api/history                 → Get records (farmer=own, admin=all)
GET    /api/history/:id             → Get single record
DELETE /api/history/:id             → Delete record

GET    /api/analytics/dashboard     → Dashboard stats

GET    /api/users                   → [Admin] All users
PUT    /api/users/:id/role          → [Admin] Change role
PUT    /api/users/:id/toggle        → [Admin] Activate/deactivate
DELETE /api/users/:id               → [Admin] Delete user

GET    /api/reports/pdf             → Download PDF report
GET    /api/weather/sri-lanka       → Weather data (Sri Lanka)
```

---

## 🎬 Detection Upload (POST /api/detection/upload)

```
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data

Body:
  video: <video file>       (max 100MB, video/* formats)
  cattle_id: "001"          (required)

Response (success):
{
  "success": true,
  "isCattle": true,
  "result": {
    "id": "...",
    "cattle_id": "001",
    "stress": "Calm",
    "confidence": 87,
    "recommendation": "Maintain normal care routine",
    "color": "#22c55e",
    "icon": "😌",
    "level": 1,
    "tips": [...],
    "date": "2026-02-15",
    "time": "10:22 PM"
  }
}

Response (not cattle — 422):
{
  "success": false,
  "isCattle": false,
  "message": "No cattle detected in the video. Please upload a video containing cattle.",
  "confidence": 0.12
}
```

---

## 🗄️ Database Schema

```javascript
// StressRecord
{
  cattle_id: "001",
  stress: "Calm",              // Calm|Mild|Moderate|High|Extreme
  confidence: 87,              // percentage
  recommendation: "...",
  videoPath: "...",
  user_id: ObjectId,
  farmerName: "Saman Perera",
  date: "2026-02-15",
  time: "10:22 PM",
  detectionDetails: {
    cattleConfidence: 92,
    stressConfidence: 87
  }
}

// User
{
  name: "Saman Perera",
  email: "saman@gmail.com",
  password: "<hashed>",
  role: "farmer",              // farmer|admin
  farmName: "Perera Farm",
  phone: "+94 71 234 5678",
  location: "Kandy",
  isActive: true
}
```

---

## 📱 Features Summary

| Feature | Description |
|---------|-------------|
| **Video Upload** | Up to 100MB, auto-validated for cattle presence |
| **Camera Record** | 10-second countdown auto-capture |
| **Seekbar Animation** | Animated progress during detection |
| **5-Level Stress** | Calm → Mild → Moderate → High → Extreme |
| **Care Tips** | Detailed checklist per stress level |
| **History** | Searchable records with detail panel |
| **Analytics** | Pie chart, bar chart, trend line |
| **User Management** | Admin role control, activate/deactivate |
| **PDF Reports** | Filtered export by month/cattle ID |
| **Weather** | Sri Lanka weather with heat stress correlation |
| **Role-based UI** | Admin vs Farmer dashboards |

---

## 🐞 Troubleshooting

**Video always detected as cattle / not working:**
- Check if `model_server.py` is running: `curl http://localhost:8000/health`
- Copy TFLite models to `model_server/models/` folder
- Check `MODEL_SERVER_URL=http://localhost:8000` in `.env`

**MongoDB connection failed:**
- Ensure MongoDB is running: `mongod --dbpath /data/db`
- Or use MongoDB Atlas cloud URI

**CORS error:**
- Ensure backend `cors` allows `http://localhost:3000`
- Check frontend Vite proxy config in `vite.config.js`

**Model server import error:**
```bash
pip install tensorflow==2.12.0  # Stable version
# or
pip install tflite-runtime      # Lighter option
```
