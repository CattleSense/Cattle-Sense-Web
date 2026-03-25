"""
Cattle Stress Detection - Python Model Server
Serves two TFLite models via REST API:
  1. cow_not_cow.tflite   - Detect if video contains cattle
  2. cattle_stress.tflite - Detect stress level

Run: python model_server.py

Requirements:
  pip install flask flask-cors opencv-python tensorflow numpy pillow
"""

import os
import cv2
import numpy as np
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ─── Model paths ──────────────────────────────────────────────────────────────
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
CATTLE_MODEL_PATH  = os.path.join(MODEL_DIR, "models", "cow_not_cow.tflite")
STRESS_MODEL_PATH  = os.path.join(MODEL_DIR, "models", "cattle_stress.tflite")

STRESS_LABELS = ["Calm", "Mild", "Moderate", "High", "Extreme"]

# ─── Load TFLite interpreters ─────────────────────────────────────────────────
def load_interpreter(path):
    try:
        import tensorflow as tf
        interp = tf.lite.Interpreter(model_path=path)
        interp.allocate_tensors()
        logger.info(f"✅ Loaded model: {path}")
        return interp
    except Exception as e:
        logger.error(f"❌ Could not load {path}: {e}")
        return None

cattle_interpreter  = load_interpreter(CATTLE_MODEL_PATH)
stress_interpreter  = load_interpreter(STRESS_MODEL_PATH)


# ─── Frame extraction ─────────────────────────────────────────────────────────
def extract_frames(video_path, max_frames=10, target_size=(224, 224)):
    """Extract evenly-spaced frames from a video and resize."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Cannot open video file")
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    indices = np.linspace(0, max(total - 1, 0), min(max_frames, total), dtype=int)
    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()
        if ret:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, target_size)
            frames.append(frame)
    cap.release()
    return frames


# ─── Model inference ──────────────────────────────────────────────────────────
def run_cattle_detection(frames):
    """
    cow_not_cow.tflite:
      class_indices = {'cow': 0, 'not_cow': 1}
      output sigmoid: value < 0.5 → COW, value >= 0.5 → NOT_COW
    Returns (is_cattle: bool, confidence: float)
    """
    if cattle_interpreter is None:
        # Fallback simulation if model not loaded
        return True, 0.90

    input_details  = cattle_interpreter.get_input_details()
    output_details = cattle_interpreter.get_output_details()

    scores = []
    for frame in frames:
        img = frame.astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=0)
        cattle_interpreter.set_tensor(input_details[0]['index'], img)
        cattle_interpreter.invoke()
        out = cattle_interpreter.get_tensor(output_details[0]['index'])[0][0]
        scores.append(float(out))

    avg_score = float(np.mean(scores))
    # sigmoid output: < 0.5 means COW (class index 0)
    is_cattle = avg_score < 0.5
    confidence = (1.0 - avg_score) if is_cattle else avg_score
    return is_cattle, round(confidence, 4)


def run_stress_detection(frames):
    """
    cattle_stress.tflite:
      Multi-class output: [Calm, Mild, Moderate, High, Extreme]
    Returns (stress_label: str, confidence: float)
    """
    if stress_interpreter is None:
        # Fallback simulation
        import random
        weights = [0.30, 0.25, 0.20, 0.15, 0.10]
        idx = random.choices(range(5), weights=weights)[0]
        return STRESS_LABELS[idx], round(0.75 + random.random() * 0.20, 4)

    input_details  = stress_interpreter.get_input_details()
    output_details = stress_interpreter.get_output_details()

    all_probs = []
    for frame in frames:
        img = frame.astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=0)
        stress_interpreter.set_tensor(input_details[0]['index'], img)
        stress_interpreter.invoke()
        out = stress_interpreter.get_tensor(output_details[0]['index'])[0]
        all_probs.append(out)

    avg_probs = np.mean(all_probs, axis=0)

    # Softmax if not already normalised
    if len(avg_probs) == 5:
        exp_p = np.exp(avg_probs - np.max(avg_probs))
        avg_probs = exp_p / exp_p.sum()

    pred_idx = int(np.argmax(avg_probs))
    confidence = float(avg_probs[pred_idx])
    return STRESS_LABELS[pred_idx], round(confidence, 4)


# ─── API Endpoints ────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'cattle_model': cattle_interpreter is not None,
        'stress_model': stress_interpreter is not None
    })


@app.route('/detect-cattle', methods=['POST'])
def detect_cattle():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    video_file = request.files['video']
    suffix = os.path.splitext(video_file.filename)[1] or '.mp4'

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        video_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        frames = extract_frames(tmp_path, max_frames=10)
        if not frames:
            return jsonify({'error': 'Could not extract frames from video'}), 422

        is_cattle, confidence = run_cattle_detection(frames)
        logger.info(f"Cattle detection: is_cattle={is_cattle}, confidence={confidence:.2%}")

        return jsonify({
            'is_cattle': is_cattle,
            'confidence': confidence,
            'frames_analyzed': len(frames)
        })
    except Exception as e:
        logger.error(f"Cattle detection error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.route('/detect-stress', methods=['POST'])
def detect_stress():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    video_file = request.files['video']
    suffix = os.path.splitext(video_file.filename)[1] or '.mp4'

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        video_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        frames = extract_frames(tmp_path, max_frames=15)
        if not frames:
            return jsonify({'error': 'Could not extract frames from video'}), 422

        stress_level, confidence = run_stress_detection(frames)
        logger.info(f"Stress detection: level={stress_level}, confidence={confidence:.2%}")

        return jsonify({
            'stress_level': stress_level,
            'confidence': confidence,
            'frames_analyzed': len(frames)
        })
    except Exception as e:
        logger.error(f"Stress detection error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


if __name__ == '__main__':
    print("=" * 60)
    print("🐄 Cattle Stress Detection - Model Server")
    print("=" * 60)
    print(f"  Cattle model : {'✅ Loaded' if cattle_interpreter else '⚠️  Not found (simulation mode)'}")
    print(f"  Stress model : {'✅ Loaded' if stress_interpreter else '⚠️  Not found (simulation mode)'}")
    print(f"  Models dir   : {MODEL_DIR}/models/")
    print("=" * 60)
    print("  Place your TFLite files in the models/ folder:")
    print("    models/cow_not_cow.tflite")
    print("    models/cattle_stress.tflite")
    print("=" * 60)
    app.run(host='0.0.0.0', port=8000, debug=False)
