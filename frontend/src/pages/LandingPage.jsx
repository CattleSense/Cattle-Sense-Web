import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSun, FiMoon, FiLogIn, FiUserPlus, FiArrowRight,
  FiVideo, FiCpu, FiCloudRain, FiTrendingUp, FiClipboard, FiLock,
  FiFilm, FiZap, FiThumbsUp,
  FiGrid, FiActivity, FiShield,
  FiChevronRight,
} from 'react-icons/fi';
import { FaLeaf, FaSeedling, FaGlobe } from 'react-icons/fa';

const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800;900&display=swap';
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

const THEMES = {
  dark: {
    pageBg: '#000000', navBg: 'rgba(0,0,0,0.88)', cardBg: '#1E1E1E', cardBorder: '#333333',
    cardShadow: '0 10px 40px rgba(0,0,0,0.5)', title: '#E1E1E1', subtitle: '#A0A0A0', body: '#A0A0A0',
    accent: '#2563eb', accentEnd: '#1e40af', accentShadow: 'rgba(14,165,233,0.45)',
    primaryBg: 'linear-gradient(135deg, #2563eb, #1e40af)',
    heroGlow: 'rgba(37,99,235,0.14)', orbGlow: 'rgba(168,85,247,0.08)',
    featureIconBg: 'rgba(37,99,235,0.15)', pillBg: 'rgba(37,99,235,0.12)',
    pillBorder: 'rgba(37,99,235,0.28)', pillColor: '#60a5fa',
    secBadgeBg: 'rgba(37,99,235,0.1)', secBadgeC: '#60a5fa',
    divider: 'rgba(255,255,255,0.06)', muted: '#475569',
    gridLine: 'rgba(255,255,255,0.025)',
    stepNumColor: '#2563eb', bannerBg: 'linear-gradient(135deg, #1e3a8a, #2563eb)', ctaBtnColor: '#1e40af',
    toggleBg: 'rgba(255,255,255,0.08)', toggleColor: '#A0A0A0',
    footerColor: '#475569', cattleId: '#60a5fa',
    secondaryBtn: 'rgba(255,255,255,0.12)', secondaryClr: '#A0A0A0',
  },
  light: {
    pageBg: '#f8fafc', navBg: 'rgba(248,250,252,0.9)', cardBg: 'rgba(255,255,255,0.95)', cardBorder: 'rgba(0,0,0,0.08)',
    cardShadow: '0 8px 30px rgba(0,0,0,0.08)', title: '#1e293b', subtitle: '#475569', body: '#64748b',
    accent: '#10b981', accentEnd: '#059669', accentShadow: 'rgba(0,204,102,0.35)',
    primaryBg: 'linear-gradient(135deg, #10b981, #059669)',
    heroGlow: 'rgba(16,185,129,0.1)', orbGlow: 'rgba(16,185,129,0.06)',
    featureIconBg: 'rgba(16,185,129,0.11)', pillBg: 'rgba(16,185,129,0.1)',
    pillBorder: 'rgba(16,185,129,0.28)', pillColor: '#059669',
    secBadgeBg: 'rgba(16,185,129,0.08)', secBadgeC: '#059669',
    divider: 'rgba(0,0,0,0.07)', muted: '#94a3b8',
    gridLine: 'rgba(0,0,0,0.03)',
    stepNumColor: '#10b981', bannerBg: 'linear-gradient(135deg, #059669, #10b981)', ctaBtnColor: '#059669',
    toggleBg: 'rgba(0,0,0,0.05)', toggleColor: '#64748b',
    footerColor: '#94a3b8', cattleId: '#059669',
    secondaryBtn: 'rgba(0,0,0,0.1)', secondaryClr: '#64748b',
  },
};

// ── Feature cards — Fi icons instead of emoji ─────────────────────────────────
const FEATURES = [
  {
    icon: FiVideo,
    title: 'Video Analysis',
    desc: 'Upload or record 10-second cattle videos. Two-stage AI detects and classifies stress instantly.',
  },
  {
    icon: FiCpu,
    title: 'Detect Stress',
    desc: 'Detect and classify stress levels with confidence scores.',
  },
  {
    icon: FiCloudRain,
    title: 'Weather Alerts',
    desc: 'Live Sri Lanka weather data. Heat stress risk alerts keep you ahead of danger.',
  },
  {
    icon: FiTrendingUp,
    title: 'Analytics',
    desc: 'Trend charts, leaderboards, monthly patterns and stress distribution at a glance.',
  },
  {
    icon: FiClipboard,
    title: 'History & PDF',
    desc: 'Searchable detection history with PDF export. AI action tips per record.',
  },
  {
    icon: FiLock,
    title: 'Secure Access',
    desc: 'Farmer and Admin roles. Manage your herd with full privacy and control.',
  },
];

// ── How-it-works steps — Fi icons instead of emoji ───────────────────────────
const HOW_STEPS = [
  {
    num: '01',
    icon: FiFilm,
    title: 'Record or Upload',
    desc: 'Use your phone or upload a video. ~10 seconds, steady, good lighting.',
  },
  {
    num: '02',
    icon: FiZap,
    title: 'AI Analyzes',
    desc: 'Model 1 confirms presence. Model 2 classifies stress. Runs in seconds.',
  },
  {
    num: '03',
    icon: FiThumbsUp,
    title: 'Act on Insights',
    desc: 'Get the stress level, confidence score, and specific action tips.',
  },
];

const STRESS_LEVELS = [
  { label: 'Calm', color: '#22c55e', pct: 35 },
  { label: 'Mild', color: '#84cc16', pct: 24 },
  { label: 'Moderate', color: '#eab308', pct: 18 },
  { label: 'High', color: '#f97316', pct: 13 },
  { label: 'Extreme', color: '#ef4444', pct: 10 },
];

// ── Footer nav links with icons ───────────────────────────────────────────────
const FOOTER_LINKS = [
  { label: 'Dashboard', icon: FiGrid },
  { label: 'Detection', icon: FiActivity },
  { label: 'History', icon: FiClipboard },
  { label: 'Analytics', icon: FiTrendingUp },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('dashboard-theme');
    return saved ? saved === 'dark' : true;
  });

  const theme = THEMES[isDark ? 'dark' : 'light'];

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('dashboard-theme', next ? 'dark' : 'light');
      setTimeout(() => window.dispatchEvent(new CustomEvent('dashboard-theme-change', { detail: next ? 'dark' : 'light' })), 0);
      return next;
    });
  };

  const goToDashboard = () => navigate('/login');
  const goToLogin = () => navigate('/login');
  const goToRegister = () => navigate('/register');

  const card = { background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow, backdropFilter: 'blur(20px)', borderRadius: 18, transition: 'all 0.3s ease' };
  const primaryBtn = { background: theme.primaryBg, border: 'none', color: '#fff', boxShadow: `0 6px 20px ${theme.accentShadow}`, cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: "'Inter', sans-serif" };
  const secondaryBtn = { background: 'transparent', border: `1.5px solid ${theme.secondaryBtn}`, color: theme.secondaryClr, cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: "'Inter', sans-serif" };

  // Responsive values
  const heroPadding = isMobile ? '48px 16px 36px' : isTablet ? '64px 24px 48px' : '80px 20px 60px';
  const heroFontSize = isMobile ? 32 : isTablet ? 48 : 64;
  const heroSubFontSize = isMobile ? 14 : 17;
  const sectionPadding = isMobile ? '0 16px 48px' : isTablet ? '0 24px 56px' : '0 20px 60px';
  const featuresGrid = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';
  const howGrid = isMobile ? '1fr' : 'repeat(3, 1fr)';
  const navHeight = isMobile ? 56 : 62;
  const sectionMaxWidth = isMobile ? '100%' : 900;
  const iconSize = isMobile ? 18 : 20;

  return (
    <div style={{
      background: theme.pageBg, color: theme.title, minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, sans-serif",
      transition: 'all 0.3s ease', overflowX: 'hidden', position: 'relative',
    }}>

      {/* Grid background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${theme.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridLine} 1px, transparent 1px)`, backgroundSize: '56px 56px' }} />

      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '-15%', left: '-8%', width: isMobile ? 280 : 480, height: isMobile ? 280 : 480, borderRadius: '50%', background: theme.heroGlow, filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-8%', right: '-6%', width: isMobile ? 200 : 320, height: isMobile ? 200 : 320, borderRadius: '50%', background: theme.orbGlow, filter: 'blur(90px)', zIndex: 0, pointerEvents: 'none' }} />

      {/* ═══ NAV ═══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, height: navHeight,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 14px' : '0 20px',
        backdropFilter: 'blur(20px)', background: theme.navBg,
        borderBottom: `1px solid ${theme.divider}`,
      }}>
        {/* Brand — FaSeedling instead of 🐄 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 7 : 9 }}>
          <div style={{
            width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 10,
            background: theme.primaryBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px ${theme.accentShadow}`, flexShrink: 0,
          }}>
            <FaSeedling size={isMobile ? 16 : 20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: isMobile ? 20 : 26, color: theme.accent, letterSpacing: '-0.01em' }}>
              CattleSense
            </div>
            {!isMobile && (
              <div style={{ fontSize: 9, color: theme.subtitle, letterSpacing: '0.12em', marginTop: -2, fontFamily: "'Inter', sans-serif" }}>
                LIVESTOCK MANAGEMENT FOR SRI LANKA
              </div>
            )}
          </div>
        </div>

        {/* Right side nav buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 7 : 10 }}>
          {/* Theme toggle — FiSun / FiMoon */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: isMobile ? '5px 10px' : '6px 12px', borderRadius: 9, border: 'none',
              cursor: 'pointer', fontSize: isMobile ? 11 : 12, fontWeight: 500,
              background: theme.toggleBg, color: theme.toggleColor,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {isDark
              ? <FiSun size={isMobile ? 13 : 14} style={{ flexShrink: 0 }} />
              : <FiMoon size={isMobile ? 13 : 14} style={{ flexShrink: 0 }} />
            }
            {!isMobile && (isDark ? 'Light' : 'Dark')}
          </button>

          {/* Register — FiUserPlus */}
          {!isMobile && (
            <button
              onClick={goToRegister}
              style={{
                ...secondaryBtn, padding: '7px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <FiUserPlus size={14} />
              Register
            </button>
          )}

          {/* Sign In — FiLogIn */}
          <button
            onClick={goToLogin}
            style={{
              ...secondaryBtn, padding: isMobile ? '6px 12px' : '7px 14px', borderRadius: 9,
              fontSize: isMobile ? 12 : 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <FiLogIn size={isMobile ? 13 : 14} />
            Sign In
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: heroPadding, textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '0' : '0 20px' }}>

          {/* Badge — FaGlobe icon */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: isMobile ? '5px 14px' : '6px 18px', borderRadius: 100,
            fontSize: isMobile ? 12 : 13, fontWeight: 600,
            marginBottom: isMobile ? 20 : 28,
            background: theme.pillBg, border: `1px solid ${theme.pillBorder}`, color: theme.pillColor,
            fontFamily: "'Inter', sans-serif",
          }}>
            <FaGlobe size={12} style={{ flexShrink: 0 }} />
            AI-Powered Cattle Stress Detection · Sri Lanka
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: heroFontSize, fontWeight: 900, lineHeight: 1.1,
            letterSpacing: '-0.02em', marginBottom: isMobile ? 16 : 22, color: theme.title,
          }}>
            Know Your Cattle's{' '}
            <span style={{ fontStyle: 'italic', backgroundImage: theme.primaryBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Stress Level
            </span>
            <br />
            <span style={{ fontStyle: 'normal' }}>Before It's Too Late</span>
          </h1>

          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: heroSubFontSize, color: theme.subtitle,
            lineHeight: 1.75, maxWidth: 540, margin: '0 auto',
            marginBottom: isMobile ? 28 : 36, fontWeight: 400, padding: isMobile ? '0 4px' : 0,
          }}>
            Upload a 10-second video. Our dual AI pipeline detects cattle presence,
            classifies stress across 5 levels, and gives actionable recommendations instantly.
          </p>

          {/* CTA buttons — Fi icons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: isMobile ? 32 : 48 }}>
            <button
              onClick={goToDashboard}
              style={{
                ...primaryBtn,
                padding: isMobile ? '12px 22px' : '15px 36px', borderRadius: 13,
                fontSize: isMobile ? 14 : 16, fontWeight: 700,
                flex: isMobile ? '1 1 calc(50% - 5px)' : 'none',
                maxWidth: isMobile ? 180 : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <FiGrid size={isMobile ? 15 : 17} style={{ flexShrink: 0 }} />
              Dashboard
            </button>
            <button
              onClick={goToRegister}
              style={{
                ...secondaryBtn,
                padding: isMobile ? '12px 16px' : '15px 30px', borderRadius: 13,
                fontSize: isMobile ? 14 : 15, fontWeight: 600,
                flex: isMobile ? '1 1 calc(50% - 5px)' : 'none',
                maxWidth: isMobile ? 180 : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <FiUserPlus size={isMobile ? 14 : 15} style={{ flexShrink: 0 }} />
              {isMobile ? 'Register' : 'Create Free Account'}
            </button>
          </div>

          {/* Stress preview card */}
          <div style={{ ...card, maxWidth: isMobile ? '100%' : 400, margin: '0 auto', padding: isMobile ? '18px 16px' : '22px 24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
              <FiActivity size={11} style={{ color: theme.muted, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: theme.muted, fontFamily: "'Inter', sans-serif" }}>
                LIVE STRESS DISTRIBUTION PREVIEW
              </span>
            </div>
            {STRESS_LEVELS.map(s => (
              <div key={s.label} style={{ marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.color, fontFamily: "'Inter', sans-serif" }}>{s.label}</span>
                  <span style={{ fontSize: 11, color: theme.muted }}>{s.pct}%</span>
                </div>
                <div style={{ background: theme.divider, borderRadius: 5, height: 7, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 5, width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: sectionMaxWidth, margin: '0 auto', padding: sectionPadding }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 13px', borderRadius: 100, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em', marginBottom: 12,
            background: theme.secBadgeBg, color: theme.secBadgeC, fontFamily: "'Inter', sans-serif",
          }}>
            <FiShield size={10} />
            FEATURES
          </div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 22 : 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, color: theme.title }}>
            Everything to protect your herd
          </div>
          <div style={{ fontSize: isMobile ? 13 : 14, color: theme.subtitle, maxWidth: 460, margin: '0 auto', fontFamily: "'Inter', sans-serif", padding: isMobile ? '0 8px' : 0 }}>
            Built for Sri Lankan farmers. Designed to work in the field.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: featuresGrid, gap: isMobile ? 12 : 16 }}>
          {FEATURES.map((f, i) => {
            const IconComp = f.icon;
            return (
              <div
                key={i}
                style={{ ...card, padding: isMobile ? '18px 16px' : '24px 20px', cursor: 'default' }}
                onMouseEnter={e => !isMobile && (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={e => !isMobile && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {/* Fi icon bubble */}
                <div style={{
                  width: isMobile ? 38 : 44, height: isMobile ? 38 : 44, borderRadius: 13,
                  background: theme.featureIconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14, color: theme.accent,
                }}>
                  <IconComp size={isMobile ? 18 : 21} />
                </div>
                <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: theme.title, marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 12, color: theme.body, lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
                  {f.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: sectionMaxWidth, margin: '0 auto', padding: sectionPadding }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 13px', borderRadius: 100, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em', marginBottom: 12,
            background: theme.secBadgeBg, color: theme.secBadgeC, fontFamily: "'Inter', sans-serif",
          }}>
            <FiChevronRight size={10} />
            HOW IT WORKS
          </div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 22 : 36, fontWeight: 800, letterSpacing: '-0.02em', color: theme.title }}>
            Three steps to peace of mind
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: howGrid, gap: isMobile ? 12 : 16 }}>
          {HOW_STEPS.map((s, i) => {
            const IconComp = s.icon;
            return (
              <div key={i} style={{ ...card, padding: isMobile ? '18px 16px' : '26px 22px', position: 'relative', overflow: 'hidden' }}>
                {/* Step number */}
                <div style={{
                  position: 'absolute', top: 12, right: 16,
                  fontSize: 38, fontWeight: 900, opacity: 0.75,
                  color: theme.stepNumColor, fontFamily: 'monospace',
                }}>
                  {s.num}
                </div>
                {/* Fi icon bubble */}
                <div style={{
                  width: isMobile ? 38 : 44, height: isMobile ? 38 : 44, borderRadius: 14,
                  background: theme.featureIconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14, color: theme.accent,
                }}>
                  <IconComp size={isMobile ? 18 : 21} />
                </div>
                <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: theme.title, marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 12, color: theme.body, lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: sectionMaxWidth, margin: '0 auto', padding: sectionPadding }}>
        <div style={{
          background: theme.bannerBg, borderRadius: isMobile ? 16 : 22,
          padding: isMobile ? '36px 20px' : '54px 44px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* FaLeaf icon instead of 🐄 emoji */}
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: isMobile ? 14 : 18,
            }}>
              <div style={{
                width: isMobile ? 52 : 64, height: isMobile ? 52 : 64, borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaLeaf size={isMobile ? 24 : 30} color="#fff" />
              </div>
            </div>

            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: isMobile ? 22 : 34, fontWeight: 900, color: '#fff',
              marginBottom: 12, letterSpacing: '-0.02em', fontStyle: 'italic',
            }}>
              Ready to protect your herd?
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13 : 14,
              color: 'rgba(255,255,255,0.82)', marginBottom: 24,
              maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.7,
              padding: isMobile ? '0 4px' : 0,
            }}>
              Join farmers across Sri Lanka using AI to monitor cattle stress and improve animal welfare.
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Open Dashboard — FiGrid */}
              <button
                onClick={goToDashboard}
                style={{
                  background: '#fff', border: 'none', borderRadius: 12,
                  padding: isMobile ? '11px 22px' : '13px 30px',
                  fontSize: isMobile ? 13 : 14, fontWeight: 700,
                  cursor: 'pointer', color: theme.ctaBtnColor,
                  boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <FiGrid size={isMobile ? 14 : 16} style={{ flexShrink: 0 }} />
                Open Dashboard
              </button>

              {/* Register — FiArrowRight */}
              <button
                onClick={goToRegister}
                style={{
                  background: 'rgba(255,255,255,0.14)', color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.38)',
                  borderRadius: 12, padding: isMobile ? '11px 18px' : '13px 28px',
                  fontSize: isMobile ? 13 : 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                {isMobile ? 'Register Free' : 'Create Free Account'}
                <FiArrowRight size={isMobile ? 14 : 15} style={{ flexShrink: 0 }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        position: 'relative', zIndex: 1,
        padding: isMobile ? '20px 16px' : '26px 20px',
        borderTop: `1px solid ${theme.divider}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        {/* Brand — FaSeedling */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: isMobile ? 26 : 30, height: isMobile ? 26 : 30, borderRadius: 8,
            background: theme.primaryBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 2px 8px ${theme.accentShadow}`,
          }}>
            <FaSeedling size={isMobile ? 12 : 14} color="#fff" />
          </div>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 900, fontSize: isMobile ? 18 : 22, color: theme.accent,
          }}>
            CattleSense
          </span>
        </div>

        {/* Copyright */}
        <div style={{ fontSize: 12, color: theme.footerColor, fontFamily: "'Inter', sans-serif", order: isMobile ? 3 : 0 }}>
          © 2026 CattleSense. AI-powered cattle stress detection.
        </div>

        {/* Footer links with icons — desktop only */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            {FOOTER_LINKS.map(({ label, icon: IconComp }) => (
              <span
                key={label}
                onClick={goToDashboard}
                style={{
                  fontSize: 12, color: theme.footerColor, cursor: 'pointer',
                  transition: 'color 0.2s', fontFamily: "'Inter', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = theme.accent;
                  e.currentTarget.querySelectorAll('svg').forEach(s => s.style.color = theme.accent);
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = theme.footerColor;
                  e.currentTarget.querySelectorAll('svg').forEach(s => s.style.color = theme.footerColor);
                }}
              >
                <IconComp size={12} style={{ flexShrink: 0 }} />
                {label}
              </span>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}
