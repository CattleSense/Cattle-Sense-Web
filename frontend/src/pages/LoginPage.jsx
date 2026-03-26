import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiSun, FiMoon,
} from 'react-icons/fi';

// ── Load Google Fonts (Playfair Display + Inter) ──────────────────────────────
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Inter:wght@400;500;600;700;800&display=swap';
if (!document.head.querySelector('[href*="Playfair"]')) {
  document.head.appendChild(fontLink);
}

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



// ─── Theme tokens ─────────────────────────────────────────────────────────────
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
    demoBoxBg: 'rgba(37,99,235,0.06)',
    demoBoxBorder: 'rgba(37,99,235,0.25)',
    demoTitle: '#60a5fa',
    demoText: '#A0A0A0',
    linkColor: '#60a5fa',
    footerColor: '#A0A0A0',
    orb1: 'rgba(37,99,235,0.1)',
    orb2: 'rgba(37,99,235,0.06)',
    toggleBg: 'rgba(255,255,255,0.08)',
    toggleColor: '#A0A0A0',
    toggleHover: 'rgba(255,255,255,0.14)',
    gridLine: 'rgba(255,255,255,0.025)',
    divider: 'rgba(255,255,255,0.08)',
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
    demoBoxBg: 'rgba(16,185,129,0.05)',
    demoBoxBorder: 'rgba(16,185,129,0.25)',
    demoTitle: '#059669',
    demoText: '#64748b',
    linkColor: '#059669',
    footerColor: '#64748b',
    orb1: 'rgba(16,185,129,0.1)',
    orb2: 'rgba(16,185,129,0.06)',
    toggleBg: 'rgba(0,0,0,0.05)',
    toggleColor: '#64748b',
    toggleHover: 'rgba(0,0,0,0.1)',
    gridLine: 'rgba(0,0,0,0.03)',
    divider: 'rgba(0,0,0,0.08)',
    socialBg: '#ffffff',
    socialBorder: 'rgba(0,0,0,0.12)',
    socialColor: '#1e293b',
    socialHover: 'rgba(0,0,0,0.04)',
  },
};

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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

  // ── Shared font shortcuts ──────────────────────────────────────────────────
  const playfair = "'Playfair Display', Georgia, serif";
  const inter = "'Inter', -apple-system, sans-serif";

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: theme.pageBg,
      padding: '20px', position: 'relative', overflow: 'hidden',
      fontFamily: inter, transition: 'all 0.3s ease',
    }}>

      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${theme.gridLine} 1px, transparent 1px),
                          linear-gradient(90deg, ${theme.gridLine} 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: 400, height: 400, borderRadius: '50%', background: theme.orb1, filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: 350, height: 350, borderRadius: '50%', background: theme.orb2, filter: 'blur(80px)', pointerEvents: 'none' }} />

      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{
        position: 'absolute', top: 20, right: 20, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '7px 14px', borderRadius: 10, border: 'none',
        cursor: 'pointer', fontSize: 12, fontWeight: 500,
        background: theme.toggleBg, color: theme.toggleColor,
        fontFamily: inter, transition: 'background 0.2s',
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
        borderRadius: 20, padding: '40px', width: '100%', maxWidth: 420,
        boxShadow: theme.cardShadow, position: 'relative', zIndex: 1,
        backdropFilter: 'blur(20px)', transition: 'all 0.3s ease',
      }} className="fade-in">

        {/* ── Logo — Playfair Display ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
          <span style={{ fontSize: 42 }}>🐄</span>
          <div>
            <div style={{
              fontFamily: playfair, fontSize: 24, fontWeight: 900,
              color: theme.logoColor, lineHeight: 1.2, letterSpacing: '-0.01em',
            }}>
              CattleSense
            </div>
            <div style={{ fontFamily: inter, fontSize: 11, color: theme.logoSub, marginTop: 3, letterSpacing: '0.04em' }}>
              Livestock Management for Sri Lanka
            </div>
          </div>
        </div>

        {/* ── Page title — Playfair Display ── */}
        <h2 style={{
          fontFamily: playfair, fontSize: 28, fontWeight: 900,
          marginBottom: 6, color: theme.title, letterSpacing: '-0.02em',
        }}>
          Welcome Back
        </h2>
        <p style={{ fontFamily: inter, color: theme.subtitle, fontSize: 14, marginBottom: 28 }}>
          Sign in to your dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: inter, fontSize: 12, fontWeight: 600, color: theme.label, marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email" placeholder="admin@gmail.com" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = theme.accent}
              onBlur={e => e.target.style.borderColor = theme.inputBorder}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontFamily: inter, fontSize: 12, fontWeight: 600, color: theme.label, marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" placeholder="Enter your password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = theme.accent}
              onBlur={e => e.target.style.borderColor = theme.inputBorder}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', marginTop: 16,
            borderRadius: 12, border: 'none',
            background: theme.primaryBg, color: '#fff',
            fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: `0 4px 16px ${theme.accentShadow}`,
            opacity: loading ? 0.7 : 1,
            fontFamily: inter, transition: 'all 0.3s ease',
          }}>
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>






        <p style={{ fontFamily: inter, textAlign: 'center', color: theme.footerColor, fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: theme.linkColor, textDecoration: 'none', fontWeight: 600 }}>
            Register as Farmer
          </Link>
        </p>
      </div>
    </div>
  );
}
