import { useState, useRef, useCallback, useEffect } from 'react';
import api from '../utils/api';
import { STRESS_CONFIG } from '../utils/stress';
import toast from 'react-hot-toast';
import { FiVideo, FiUpload, FiCamera, FiFilm, FiCircle, FiSquare, FiCheckCircle, 
  FiClock, FiX, FiSearch, FiCpu, FiUploadCloud, FiCheckSquare, FiActivity, FiBarChart2, FiRefreshCw, FiClipboard    } from 'react-icons/fi';

// ── Load Google Fonts ─────────────────────────────────────────────────────────
const _fl = document.createElement('link');
_fl.rel = 'stylesheet';
_fl.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap';
if (!document.head.querySelector('[href*="DM+Serif"]')) document.head.appendChild(_fl);
 
// ── Font shorthand ─────────────────────────────────────────────────────────────
const F = {
  serif: "'DM Serif Display', Georgia, serif",
  sans:  "'DM Sans', -apple-system, sans-serif",
};
// ── Theme tokens ──────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    pageBg:'#000000', cardBg:'#1E1E1E', cardBorder:'#333333', cardShadow:'0 8px 32px rgba(0,0,0,0.5)',
    title:'#E1E1E1', subtitle:'#A0A0A0', body:'#A0A0A0', muted:'#475569',
    accent:'#2563eb', accentShadow:'rgba(14,165,233,0.4)',
    primaryBg:'linear-gradient(135deg, #2563eb, #1e40af)',
    inputBg:'#111111', inputBorder:'#333333', inputColor:'#E1E1E1',
    divider:'rgba(255,255,255,0.06)',
    toggleBg:'rgba(255,255,255,0.08)', toggleColor:'#A0A0A0', toggleHover:'rgba(255,255,255,0.14)',
    secondaryBtn:'rgba(255,255,255,0.08)', secondaryBorder:'rgba(255,255,255,0.14)', secondaryColor:'#A0A0A0',
    uploadZone:'#111111', uploadBorder:'#333333', uploadHover:'rgba(37,99,235,0.1)',
    seekTrack:'rgba(255,255,255,0.08)', seekFill:'#2563eb',
    stepActive:'#3b82f6', stepDone:'#22c55e', stepIdle:'#2a2a2a',
    tabActive:'linear-gradient(135deg, #2563eb, #1e40af)', tabActiveShadow:'rgba(14,165,233,0.4)',
  },
  light: {
    pageBg:'#f8fafc', cardBg:'#ffffff', cardBorder:'rgba(0,0,0,0.08)', cardShadow:'0 4px 20px rgba(0,0,0,0.06)',
    title:'#1e293b', subtitle:'#64748b', body:'#64748b', muted:'#94a3b8',
    accent:'#10b981', accentShadow:'rgba(0,204,102,0.35)',
    primaryBg:'linear-gradient(135deg, #10b981, #059669)',
    inputBg:'#f8fafc', inputBorder:'rgba(0,0,0,0.12)', inputColor:'#1e293b',
    divider:'rgba(0,0,0,0.07)',
    toggleBg:'rgba(0,0,0,0.05)', toggleColor:'#64748b', toggleHover:'rgba(0,0,0,0.1)',
    secondaryBtn:'rgba(0,0,0,0.04)', secondaryBorder:'rgba(0,0,0,0.12)', secondaryColor:'#64748b',
    uploadZone:'#f8fafc', uploadBorder:'rgba(0,0,0,0.12)', uploadHover:'rgba(16,185,129,0.06)',
    seekTrack:'rgba(0,0,0,0.08)', seekFill:'#10b981',
    stepActive:'#10b981', stepDone:'#22c55e', stepIdle:'rgba(0,0,0,0.08)',
    tabActive:'linear-gradient(135deg, #10b981, #059669)', tabActiveShadow:'rgba(0,204,102,0.35)',
  },
};

export default function DetectionPage() {
  const [step, setStep] = useState('idle');
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [cattleId, setCattleId] = useState('');
  const [progress, setProgress] = useState(0);
  const [seekPos, setSeekPos] = useState(0);
  const [result, setResult] = useState(null);
  const [rejectionMsg, setRejectionMsg] = useState('');
  const [mode, setMode] = useState('upload');
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [tips, setTips] = useState([]);
  const [showTips, setShowTips] = useState(false);
  const fileRef = useRef();
  const videoRef = useRef();
  const mediaRef = useRef();
  const chunksRef = useRef([]);
  const countdownRef = useRef();

  const [isDark, setIsDark] = useState(() => localStorage.getItem('dashboard-theme') !== 'light');
  useEffect(() => {
    const h = (e) => setIsDark(e.detail === 'dark');
    window.addEventListener('dashboard-theme-change', h);
    return () => window.removeEventListener('dashboard-theme-change', h);
  }, []);
  const T = THEMES[isDark ? 'dark' : 'light'];

  const toggleTheme = () => {
    setIsDark(p => {
      const next = !p;
      localStorage.setItem('dashboard-theme', next ? 'dark' : 'light');
      setTimeout(() => window.dispatchEvent(new CustomEvent('dashboard-theme-change', { detail: next ? 'dark' : 'light' })), 0);
      return next;
    });
  };

  const card = { background: T.cardBg, border: `1px solid ${T.cardBorder}`, boxShadow: T.cardShadow, borderRadius: 16, transition: 'all 0.3s' };
  const primaryBtn = { background: T.primaryBg, border: 'none', color: '#fff', boxShadow: `0 4px 14px ${T.accentShadow}`, cursor: 'pointer', fontFamily: F.sans, borderRadius: 10, fontWeight: 700, transition: 'all 0.2s' };
  const secondaryBtn = { background: T.secondaryBtn, border: `1px solid ${T.secondaryBorder}`, color: T.secondaryColor, cursor: 'pointer', fontFamily: F.sans, borderRadius: 10, fontWeight: 600, transition: 'all 0.2s' };
  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.inputColor, fontSize: 14, fontFamily: F.sans, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' };

  const reset = () => {
    setStep('idle'); setVideoFile(null); setVideoURL(null);
    setProgress(0); setSeekPos(0); setResult(null); setRejectionMsg('');
    setShowTips(false); setTips([]);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) return toast.error('Please select a video file');
    if (file.size > 100 * 1024 * 1024) return toast.error('Video must be under 100MB');
    setVideoFile(file); setVideoURL(URL.createObjectURL(file)); setStep('selected');
  };

  const onDrop = useCallback((e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      videoRef.current.srcObject = stream; videoRef.current.play();
      mediaRef.current = new MediaRecorder(stream); chunksRef.current = [];
      mediaRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `camera-${Date.now()}.webm`, { type: 'video/webm' });
        stream.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
        handleFile(file);
      };
      mediaRef.current.start(); setRecording(true); setCountdown(10);
      countdownRef.current = setInterval(() => {
        setCountdown(p => { if (p <= 1) { clearInterval(countdownRef.current); stopRecording(); return 0; } return p - 1; });
      }, 1000);
    } catch (err) { toast.error('Cannot access camera: ' + err.message); }
  };

  const stopRecording = () => {
    if (mediaRef.current?.state === 'recording') mediaRef.current.stop();
    clearInterval(countdownRef.current); setRecording(false);
  };

  const animateSeekbar = (duration = 3000) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pos = Math.min((elapsed / duration) * 100, 100);
      setSeekPos(pos); setProgress(pos);
      if (pos >= 100) clearInterval(interval);
    }, 50);
    return interval;
  };

  const handleDetect = async () => {
    if (!videoFile) return toast.error('Please select a video');
    if (!cattleId.trim()) return toast.error('Please enter a Cattle ID');
    const formData = new FormData();
    formData.append('video', videoFile); formData.append('cattle_id', cattleId.trim());
    try {
      setStep('uploading'); setProgress(0); setSeekPos(0);
      const up = animateSeekbar(2000);
      await new Promise(r => setTimeout(r, 800));
      clearInterval(up); setProgress(100); setSeekPos(100);
      await new Promise(r => setTimeout(r, 300));
      setStep('checking_cattle'); setProgress(0); setSeekPos(0);
      const ci = animateSeekbar(2500);
      await new Promise(r => setTimeout(r, 500));
      const response = await api.post('/detection/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
      clearInterval(ci); setProgress(100); setSeekPos(100);
      await new Promise(r => setTimeout(r, 300));
      setStep('checking_stress'); setProgress(0); setSeekPos(0);
      const si = animateSeekbar(2000);
      await new Promise(r => setTimeout(r, 2000));
      clearInterval(si); setProgress(100); setSeekPos(100);
      await new Promise(r => setTimeout(r, 400));
      setResult(response.data.result); setStep('done');
      toast.success(`Detection complete: ${response.data.result.stress} stress level`);
    } catch (err) {
      if (err.response?.status === 422 || err.response?.data?.isCattle === false) {
        setRejectionMsg(err.response?.data?.message || 'No cattle detected in video');
        setStep('rejected');
      } else {
        toast.error(err.response?.data?.message || 'Detection failed');
        setStep('selected'); setProgress(0); setSeekPos(0);
      }
    }
  };

  const loadTips = async (level) => {
    try { const { data } = await api.get(`/detection/tips/${level}`); setTips(data.tips); setShowTips(true); }
    catch { setTips([]); setShowTips(true); }
  };

  const cfg = result ? STRESS_CONFIG[result.stress] : null;
  const processingSteps = ['uploading', 'checking_cattle', 'checking_stress'];

  return (
    <div style={{ background: T.pageBg, minHeight: '100vh', padding: '28px 24px', fontFamily: F.sans, transition: 'all 0.3s' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 900, color: T.title, letterSpacing: '-0.02em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
  <FiVideo size={24} style={{ color: T.accent, flexShrink: 0 }} />
  Cattle Stress Detection
</h1>
          <p style={{ color: T.subtitle, fontSize: 14 }}>Upload or record a 10-second video to analyze cattle stress levels using AI</p>
        </div>
        
      </div>

      {/* ── Mode tabs ── */}
     <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
  {['upload', 'camera'].map(m => (
    <button key={m} onClick={() => { setMode(m); reset(); }} style={{
      padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
      cursor: 'pointer', fontFamily: F.sans, transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', gap: 8,
      background: mode === m ? T.primaryBg : T.secondaryBtn,
      border: mode === m ? 'none' : `1px solid ${T.secondaryBorder}`,
      color: mode === m ? '#fff' : T.secondaryColor,
      boxShadow: mode === m ? `0 4px 14px ${T.accentShadow}` : 'none',
    }}>
      {m === 'upload'
        ? <><FiUpload size={15} /> Upload Video</>
        : <><FiCamera size={15} /> Record Camera</>
      }
    </button>
  ))}
</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Left: Input ── */}
        <div>
          {/* Step 1: Cattle ID */}
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.divider}` }}>
              <h3 style={{ fontFamily: F.serif, fontSize: 17, fontWeight: 700, color: T.title }}>Step 1: Cattle ID</h3>
            </div>
            <div style={{ padding: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 6, letterSpacing: '0.04em' }}>Enter Cattle ID *</label>
              <input
                style={inputStyle} placeholder="e.g. 001, A-123" value={cattleId}
                onChange={e => setCattleId(e.target.value)} disabled={!['idle', 'selected'].includes(step)}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.inputBorder}
              />
              <small style={{ color: T.muted, fontSize: 12, marginTop: 4, display: 'block' }}>This ID will be stored with the detection record</small>
            </div>
          </div>

          {/* Step 2: Video */}
          <div style={card}>
  <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.divider}` }}>
    <h3 style={{ fontFamily: F.serif, fontSize: 17, fontWeight: 700, color: T.title, display: 'flex', alignItems: 'center', gap: 8 }}>
      {mode === 'upload'
        ? <FiUpload size={17} style={{ color: T.accent, flexShrink: 0 }} />
        : <FiVideo size={17} style={{ color: T.accent, flexShrink: 0 }} />
      }
      Step 2: {mode === 'upload' ? 'Upload Video' : 'Record Video'}
    </h3>
  </div>

  <div style={{ padding: 20 }}>
    {mode === 'upload' ? (
      <>
        <div
          onClick={() => step === 'idle' && fileRef.current.click()}
          onDragOver={e => e.preventDefault()} onDrop={onDrop}
          style={{
            border: `2px dashed ${step === 'idle' ? T.uploadBorder : T.accent}`,
            borderRadius: 12, padding: '28px 20px', textAlign: 'center',
            cursor: step === 'idle' ? 'pointer' : 'default',
            background: step === 'idle' ? T.uploadZone : T.uploadHover,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => step === 'idle' && (e.currentTarget.style.background = T.uploadHover)}
          onMouseLeave={e => step === 'idle' && (e.currentTarget.style.background = T.uploadZone)}
        >
          <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

          {/* Upload zone icon */}
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
            {step === 'idle'
              ? <FiUpload size={36} style={{ color: T.accent }} />
              : <FiCheckCircle size={36} style={{ color: '#22c55e' }} />
            }
          </div>

          <div style={{ fontWeight: 700, fontSize: 14, color: T.title, marginBottom: 4 }}>
            {videoFile ? videoFile.name : 'Drop video here or click to browse'}
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>
            {videoFile ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB` : 'Max 100MB · MP4, AVI, MOV, WebM'}
          </div>
          <div style={{ fontSize: 11, marginTop: 4, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <FiClock size={11} />
            Recommended: 10 seconds
          </div>
        </div>

        {videoFile && step === 'selected' && (
          <button onClick={reset} style={{ ...secondaryBtn, marginTop: 10, padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiX size={13} /> Remove video
          </button>
        )}
      </>
    ) : (
      <div style={{ textAlign: 'center' }}>
        <video ref={videoRef} style={{ width: '100%', borderRadius: 10, background: '#000', maxHeight: 200 }} muted />

        {!recording ? (
          <button onClick={startRecording} style={{ ...primaryBtn, marginTop: 12, width: '100%', padding: '12px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <FiCircle size={14} style={{ color: '#ef4444' }} />
            Start Recording (10 sec)
          </button>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#ef4444', marginBottom: 8, fontFamily: F.serif, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <FiCircle size={24} style={{ color: '#ef4444', fill: '#ef4444' }} />
              {countdown}s
            </div>
            <div style={{ background: T.seekTrack, borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ height: '100%', width: `${((10 - countdown) / 10) * 100}%`, background: '#ef4444', borderRadius: 4, transition: 'width 1s' }} />
            </div>
            <button onClick={stopRecording} style={{ background: '#ef4444', border: 'none', color: '#fff', borderRadius: 10, padding: '10px', width: '100%', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F.sans, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <FiSquare size={14} />
              Stop Early
            </button>
          </div>
        )}

        {videoFile && (
          <p style={{ marginTop: 8, fontSize: 13, color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FiCheckCircle size={14} />
            Video ready: {(videoFile.size / 1024 / 1024).toFixed(1)} MB
          </p>
        )}
      </div>
    )}

    {videoURL && (
      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 6 }}>Preview</label>
        <video src={videoURL} controls style={{ width: '100%', borderRadius: 10, maxHeight: 180 }} />
      </div>
    )}
  </div>
</div>

          {/* Detect button */}
          {['selected', 'idle'].includes(step) && (
  <button
    onClick={handleDetect}
    disabled={!videoFile || !cattleId.trim()}
    style={{
      ...primaryBtn, width: '100%', padding: '14px', fontSize: 15,
      marginTop: 16, display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 8,
      opacity: (!videoFile || !cattleId.trim()) ? 0.5 : 1,
    }}
  >
    <FiSearch size={18} />
    Detect Stress Level
  </button>
)}
        </div>

        {/* ── Right: Status / Result ── */}
        <div>
          {/* Processing */}
          {processingSteps.includes(step) && (
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.divider}` }}>
                <h3 style={{ fontFamily: F.serif, fontSize: 17, fontWeight: 700, color: T.title }}>⚙️ Processing…</h3>
              </div>
              <div style={{ padding: 20 }}>
                {[
                  { key: 'uploading',        icon: <FiUploadCloud size={16} />, label: 'Uploading video to server',                    model: ''                   },
{ key: 'checking_cattle', icon: <FiCheckSquare size={16} />, label: 'Model 1: Checking if video contains cattle…',  model: 'cow_not_cow.tflite' },
{ key: 'checking_stress', icon: <FiActivity    size={16} />, label: 'Model 2: Analyzing cattle stress level…',      model: 'cattle_stress.tflite'},
                ].map(s => {
                  const isActive = s.key === step;
                  const isDone = processingSteps.indexOf(s.key) < processingSteps.indexOf(step);
                  return (
                    <div key={s.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', 
                        background: isDone ? T.stepDone : isActive ? T.stepActive : T.stepIdle, display: 'flex', alignItems: 'center',
                         justifyContent: 'center', fontSize: 16, flexShrink: 0, transition: 'background 0.3s', color: isDone || isActive ? '#fff' : T.muted }}>
                        {isDone ? '✓' : s.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: isActive ? T.accent : isDone ? '#22c55e' : T.muted }}>{s.label}</div>
                        {s.model && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Using: {s.model}</div>}
                        {isActive && (
                          <div style={{ marginTop: 10 }}>
                            <div style={{ background: T.seekTrack, borderRadius: 6, height: 8, overflow: 'hidden', position: 'relative', marginBottom: 4 }}>
                              <div style={{ height: '100%', width: `${seekPos}%`, background: T.seekFill, borderRadius: 6, transition: 'width 0.1s' }} />
                            </div>
                            <div style={{ fontSize: 11, color: T.muted }}>{Math.round(progress)}% complete</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rejected */}
          {step === 'rejected' && (
            <div style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#fee2e2', border: '2px solid #fca5a5', borderRadius: 16, padding: 24 }}>
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>❌</div>
                <h2 style={{ fontFamily: F.serif, color: '#dc2626', fontSize: 22, fontWeight: 900 }}>Not a Cattle Video</h2>
              </div>
              <div style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'white', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <p style={{ color: isDark ? '#fca5a5' : '#7f1d1d', fontSize: 13 }}>{rejectionMsg}</p>
              </div>
              <div style={{ background: isDark ? 'rgba(249,115,22,0.1)' : '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <strong style={{ color: '#c2410c', fontSize: 13 }}>📋 Model 1 Result</strong>
                <p style={{ color: isDark ? '#fed7aa' : '#9a3412', fontSize: 13, marginTop: 4 }}>The AI model (cow_not_cow.tflite) did not detect cattle in the video.</p>
              </div>
              <button
  onClick={reset}
  style={{
    ...secondaryBtn, width: '100%', padding: '11px', fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  }}
>
  <FiRefreshCw size={15} />
  Try Another Video
</button>
            </div>
          )}

          {/* Result */}
          {step === 'done' && result && cfg && (
            <div style={{ background: isDark ? T.cardBg : cfg.bg, border: `2px solid ${cfg.color}`, borderRadius: 16, padding: 24 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 52, marginBottom: 8 }}>{cfg.icon}</div>
                <div style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 900, color: cfg.text, letterSpacing: '-0.02em' }}>{result.stress}</div>
                <div style={{ color: cfg.text, opacity: 0.8, fontSize: 13, marginTop: 4 }}>Stress Level {cfg.level} of 5</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                  {[1, 2, 3, 4, 5].map(l => (
                    <div key={l} style={{ width: 32, height: 8, borderRadius: 4, background: l <= cfg.level ? cfg.color : isDark ? '#333' : '#e2e8f0', transition: 'background 0.3s' }} />
                  ))}
                </div>
              </div>
              <div style={{ background: isDark ? '#111' : 'white', borderRadius: 12, padding: 16, marginBottom: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  {[
                    { label: 'Cattle ID', value: `#${result.cattle_id}` },
                    //{ label: 'Confidence', value: `${result.confidence}%` },
                    { label: 'Date', value: result.date },
                    { label: 'Time', value: result.time },
                  ].map((item, i) => (
                    <div key={i} style={{ background: isDark ? '#1a1a1a' : '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.title, marginTop: 2 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: cfg.bg, border: `1px solid ${cfg.color}`, borderRadius: 10, padding: 12 }}>
                  <strong style={{ color: cfg.text, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
  <FiClipboard size={13} />
  Recommendation
</strong>
                  <p style={{ color: cfg.text, fontSize: 13, marginTop: 4 }}>{result.recommendation}</p>
                </div>
              </div>
              <button onClick={() => loadTips(result.stress)} style={{ ...primaryBtn, width: '100%', padding: '11px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 10, background: cfg.color, boxShadow: 'none' }}>
                💡 {showTips ? 'Hide' : 'View'} Detailed Care Tips
              </button>
              {showTips && tips.length > 0 && (
                <div style={{ background: isDark ? '#111' : 'white', borderRadius: 12, padding: 16, marginBottom: 10 }}>
                  <strong style={{ fontSize: 13, color: cfg.text }}>🩺 Care Checklist for {result.stress} Stress:</strong>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
                    {tips.map((tip, i) => (
                      <li key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: cfg.color, fontSize: 16, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 13, color: T.body }}>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button onClick={reset} style={{ ...secondaryBtn, width: '100%', padding: '11px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <FiRefreshCw size={15} />
                New Detection
              </button>
            </div>
          )}

          {/* Idle hint */}
          {step === 'idle' && (
            <div style={card}>
              <div style={{ padding: '36px 24px', textAlign: 'center' }}>
                <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
  <FiCpu size={48} style={{ color: T.accent }} />
</div>
                <h3 style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 800, color: T.title, marginBottom: 18 }}>AI Detection Pipeline</h3>
                <div style={{ textAlign: 'left' }}>
  {[
    { icon: <FiUploadCloud size={15} />, step: '1', label: 'Upload or record a 10-sec video',      sub: 'Max 100MB'            },
    { icon: <FiCheckSquare size={15} />, step: '2', label: 'Validates cattle presence',             sub: 'Only use cattle videos'   },
    { icon: <FiActivity    size={15} />, step: '3', label: 'Detects stress level',                  sub: 'check cattle stress level' },
    { icon: <FiBarChart2   size={15} />, step: '4', label: 'Results saved & recommendations shown', sub: '5-level classification'},
  ].map((item, i) => (
    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: T.primaryBg, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>
        {item.step}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: T.title, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color: T.accent, flexShrink: 0 }}>{item.icon}</span>
          {item.label}
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{item.sub}</div>
      </div>
    </div>
  ))}
</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}