import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiSun, FiMoon,
} from 'react-icons/fi';


// ── Load Google Fonts ─────────────────────────────────────────────────────────
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Inter:wght@400;500;600;700;800&display=swap';
if (!document.head.querySelector('[href*="Playfair"]')) {
  document.head.appendChild(fontLink);
}

const THEMES = {
  dark: {
    pageBg: 'linear-gradient(135deg, #000000 0%, #0a0f1a 50%, #000000 100%)',
    cardBg: '#1E1E1E',
    cardBorder: '#333333',
    cardShadow: '0 20px 60px rgba(0,0,0,0.6)',
    title: '#E1E1E1',
    subtitle: '#A0A0A0',
    label: '#A0A0A0',
    inputBg: '#111111',
    inputBorder: '#333333',
    inputColor: '#E1E1E1',
    accent: '#2563eb',
    accentEnd: '#1e40af',
    accentShadow: 'rgba(14,165,233,0.4)',
    primaryBg: 'linear-gradient(135deg, #2563eb, #1e40af)',
    logoColor: '#2563eb',
    logoSub: '#A0A0A0',
    roleNoteBg: 'rgba(37,99,235,0.06)',
    roleNoteBorder: 'rgba(37,99,235,0.25)',
    roleNoteColor: '#A0A0A0',
    linkColor: '#60a5fa',
    footerColor: '#A0A0A0',
    orb: 'rgba(37,99,235,0.08)',
    toggleBg: 'rgba(255,255,255,0.08)',
    toggleColor: '#A0A0A0',
    toggleHover: 'rgba(255,255,255,0.14)',
    gridLine: 'rgba(255,255,255,0.025)',
    divider: 'rgba(255,255,255,0.06)',
    socialBg: 'rgba(255,255,255,0.05)',
    socialBorder: 'rgba(255,255,255,0.12)',
    socialColor: '#E1E1E1',
    socialHover: 'rgba(255,255,255,0.1)',
  },
  light: {
    pageBg: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f0fdf4 100%)',
    cardBg: '#ffffff',
    cardBorder: 'rgba(0,0,0,0.08)',
    cardShadow: '0 20px 60px rgba(0,0,0,0.1)',
    title: '#1e293b',
    subtitle: '#64748b',
    label: '#475569',
    inputBg: '#f8fafc',
    inputBorder: 'rgba(0,0,0,0.12)',
    inputColor: '#1e293b',
    accent: '#10b981',
    accentEnd: '#059669',
    accentShadow: 'rgba(0,204,102,0.35)',
    primaryBg: 'linear-gradient(135deg, #10b981, #059669)',
    logoColor: '#10b981',
    logoSub: '#64748b',
    roleNoteBg: 'rgba(16,185,129,0.05)',
    roleNoteBorder: 'rgba(16,185,129,0.25)',
    roleNoteColor: '#64748b',
    linkColor: '#059669',
    footerColor: '#64748b',
    orb: 'rgba(16,185,129,0.08)',
    toggleBg: 'rgba(0,0,0,0.05)',
    toggleColor: '#64748b',
    toggleHover: 'rgba(0,0,0,0.1)',
    gridLine: 'rgba(0,0,0,0.03)',
    divider: 'rgba(0,0,0,0.06)',
    socialBg: '#ffffff',
    socialBorder: 'rgba(0,0,0,0.12)',
    socialColor: '#1e293b',
    socialHover: 'rgba(0,0,0,0.04)',
  },
};
// ── Responsive hook ───────────────────────────────────────────────────────────
function useResponsive() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return { isMobile: width < 640, isTablet: width >= 640 && width < 1024, isDesktop: width >= 1024, width };
}


export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', location: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('dashboard-theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handler = (e) => setIsDark(e.detail === 'dark');
    window.addEventListener('dashboard-theme-change', handler);
    return () => window.removeEventListener('dashboard-theme-change', handler);
  }, []);

  const theme = THEMES[isDark ? 'dark' : 'light'];

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('dashboard-theme', next ? 'dark' : 'light');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dashboard-theme-change', { detail: next ? 'dark' : 'light' }));
      }, 0);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful! Welcome!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };


  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1px solid ${theme.inputBorder}`,
    background: theme.inputBg, color: theme.inputColor,
    fontSize: 14, fontFamily: "'Inter', sans-serif", outline: 'none',
    transition: 'border 0.2s', boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: theme.label, marginBottom: 6, fontFamily: "'Inter', sans-serif",
  };

  const formGroup = { marginBottom: 14 };

  const socialBtn = {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '11px', borderRadius: 12, cursor: 'pointer',
    background: theme.socialBg, border: `1px solid ${theme.socialBorder}`,
    color: theme.socialColor, fontSize: 13, fontWeight: 600,
    fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: theme.pageBg, padding: '20px',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, sans-serif",
      transition: 'all 0.3s ease',
    }}>

      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${theme.gridLine} 1px, transparent 1px),
                          linear-gradient(90deg, ${theme.gridLine} 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: '-150px', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: theme.orb, filter: 'blur(90px)', pointerEvents: 'none',
      }} />

      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{
        position: 'absolute', top: 20, right: 20, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '7px 14px', borderRadius: 10, border: 'none',
        cursor: 'pointer', fontSize: 12, fontWeight: 500,
        background: theme.toggleBg, color: theme.toggleColor,
        fontFamily: "'Inter', sans-serif", transition: 'background 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = theme.toggleHover}
        onMouseLeave={e => e.currentTarget.style.background = theme.toggleBg}
      >
        {isDark
          ? <FiSun size={isMobile ? 13 : 14} style={{ flexShrink: 0 }} />
          : <FiMoon size={isMobile ? 13 : 14} style={{ flexShrink: 0 }} />
        }
      </button>

      {/* Card */}
      <div style={{
        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
        borderRadius: 20, padding: '36px',
        width: '100%', maxWidth: 480,
        boxShadow: theme.cardShadow,
        position: 'relative', zIndex: 1,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
      }} className="fade-in">

        {/* ── Logo — Playfair Display ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 38 }}>🐄</span>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 22, fontWeight: 900,
              color: theme.logoColor, letterSpacing: '-0.01em', lineHeight: 1.2,
            }}>
              CattleSense
            </h1>
            <p style={{ fontSize: 11, color: theme.logoSub, fontFamily: "'Inter', sans-serif", letterSpacing: '0.04em', marginTop: 2 }}>
              Livestock Management for Sri Lanka
            </p>
          </div>
        </div>

        {/* ── Page heading — Playfair Display ── */}
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 24, fontWeight: 900,
          marginBottom: 6, color: theme.title,
          letterSpacing: '-0.02em',
        }}>
          Create Farmer Account
        </h2>
        <p style={{ color: theme.subtitle, fontSize: 14, marginBottom: 24, fontFamily: "'Inter', sans-serif" }}>
          Register to monitor your cattle's stress levels
        </p>

        <form onSubmit={handleSubmit}>
          {/* Name + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input placeholder="Your name" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle}
                onFocus={e => e.target.style.borderColor = theme.accent}
                onBlur={e => e.target.style.borderColor = theme.inputBorder} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input placeholder="+94 71 234 5678" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle}
                onFocus={e => e.target.style.borderColor = theme.accent}
                onBlur={e => e.target.style.borderColor = theme.inputBorder} />
            </div>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>Email Address *</label>
            <input type="email" placeholder="farmer@email.com" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle}
              onFocus={e => e.target.style.borderColor = theme.accent}
              onBlur={e => e.target.style.borderColor = theme.inputBorder} />
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>Password *</label>
            <input type="password" placeholder="Min 6 characters" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle}
              onFocus={e => e.target.style.borderColor = theme.accent}
              onBlur={e => e.target.style.borderColor = theme.inputBorder} />
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>Farm Location</label>
            <input placeholder="e.g., Kandy, Sri Lanka" value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle}
              onFocus={e => e.target.style.borderColor = theme.accent}
              onBlur={e => e.target.style.borderColor = theme.inputBorder} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', marginTop: 4,
            borderRadius: 12, border: 'none',
            background: theme.primaryBg, color: '#fff',
            fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: `0 4px 16px ${theme.accentShadow}`,
            opacity: loading ? 0.7 : 1,
            fontFamily: "'Inter', sans-serif", transition: 'all 0.3s ease',
          }}>
            {loading ? '⏳ Creating Account...' : '✨ Create Account'}
          </button>
        </form>





        <p style={{ textAlign: 'center', color: theme.footerColor, fontSize: 14, marginTop: 20, fontFamily: "'Inter', sans-serif" }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: theme.linkColor, textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
