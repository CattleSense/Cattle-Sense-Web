import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Load Google Fonts (Playfair Display for headline, Inter for body) ─────────
const fontLink = document.createElement('link');
fontLink.rel  = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800;900&display=swap';
if (!document.head.querySelector('[href*="Playfair"]')) {
  document.head.appendChild(fontLink);
}

const THEMES = {
  dark: {
    pageBg:        '#000000',
    navBg:         'rgba(0,0,0,0.88)',
    cardBg:        '#1E1E1E',
    cardBorder:    '#333333',
    cardShadow:    '0 10px 40px rgba(0,0,0,0.5)',
    title:         '#E1E1E1',
    subtitle:      '#A0A0A0',
    body:          '#A0A0A0',
    accent:        '#2563eb',
    accentEnd:     '#1e40af',
    accentShadow:  'rgba(14,165,233,0.45)',
    primaryBg:     'linear-gradient(135deg, #2563eb, #1e40af)',
    heroGlow:      'rgba(37,99,235,0.14)',
    orbGlow:       'rgba(168,85,247,0.08)',
    featureIconBg: 'rgba(37,99,235,0.15)',
    pillBg:        'rgba(37,99,235,0.12)',
    pillBorder:    'rgba(37,99,235,0.28)',
    pillColor:     '#60a5fa',
    secBadgeBg:    'rgba(37,99,235,0.1)',
    secBadgeC:     '#60a5fa',
    divider:       'rgba(255,255,255,0.06)',
    muted:         '#475569',
    gridLine:      'rgba(255,255,255,0.025)',
    urlBarBg:      'rgba(255,255,255,0.06)',
    mobNavBg:      '#000000',
    mobCardBg:     '#111111',
    mobCardBorder: '#2a2a2a',
    webBg:         '#0d1117',
    webTopBg:      '#161b22',
    sidebarBg:     '#0a0a0a',
    wCardBg:       '#1E1E1E',
    wCardBorder:   '#333333',
    stepNumColor:  '#2563eb',
    bannerBg:      'linear-gradient(135deg, #1e3a8a, #2563eb)',
    ctaBtnColor:   '#1e40af',
    toggleBg:      'rgba(255,255,255,0.08)',
    toggleColor:   '#A0A0A0',
    footerColor:   '#475569',
    cattleId:      '#60a5fa',
    secondaryBtn:  'rgba(255,255,255,0.12)',
    secondaryClr:  '#A0A0A0',
  },
  light: {
    pageBg:        '#f8fafc',
    navBg:         'rgba(248,250,252,0.9)',
    cardBg:        'rgba(255,255,255,0.95)',
    cardBorder:    'rgba(0,0,0,0.08)',
    cardShadow:    '0 8px 30px rgba(0,0,0,0.08)',
    title:         '#1e293b',
    subtitle:      '#475569',
    body:          '#64748b',
    accent:        '#10b981',
    accentEnd:     '#059669',
    accentShadow:  'rgba(0,204,102,0.35)',
    primaryBg:     'linear-gradient(135deg, #10b981, #059669)',
    heroGlow:      'rgba(16,185,129,0.1)',
    orbGlow:       'rgba(16,185,129,0.06)',
    featureIconBg: 'rgba(16,185,129,0.11)',
    pillBg:        'rgba(16,185,129,0.1)',
    pillBorder:    'rgba(16,185,129,0.28)',
    pillColor:     '#059669',
    secBadgeBg:    'rgba(16,185,129,0.08)',
    secBadgeC:     '#059669',
    divider:       'rgba(0,0,0,0.07)',
    muted:         '#94a3b8',
    gridLine:      'rgba(0,0,0,0.03)',
    urlBarBg:      'rgba(0,0,0,0.07)',
    mobNavBg:      '#ffffff',
    mobCardBg:     'rgba(0,0,0,0.02)',
    mobCardBorder: 'rgba(0,0,0,0.07)',
    webBg:         '#f1f5f9',
    webTopBg:      '#e2e8f0',
    sidebarBg:     '#ffffff',
    wCardBg:       'rgba(255,255,255,0.9)',
    wCardBorder:   'rgba(0,0,0,0.08)',
    stepNumColor:  '#10b981',
    bannerBg:      'linear-gradient(135deg, #059669, #10b981)',
    ctaBtnColor:   '#059669',
    toggleBg:      'rgba(0,0,0,0.05)',
    toggleColor:   '#64748b',
    footerColor:   '#94a3b8',
    cattleId:      '#059669',
    secondaryBtn:  'rgba(0,0,0,0.1)',
    secondaryClr:  '#64748b',
  },
};

const FEATURES = [
  { icon: '🎥', title: 'Video Analysis',  desc: 'Upload or record 10-second cattle videos. Two-stage AI detects and classifies stress instantly.' },
  { icon: '🧠', title: 'Detect Stress',   desc: 'Detect and classify stress levels with confidence scores.' },
  { icon: '🌡️', title: 'Weather Alerts', desc: 'Live Sri Lanka weather data. Heat stress risk alerts keep you ahead of danger.' },
  { icon: '📈', title: 'Analytics',       desc: 'Trend charts, leaderboards, monthly patterns and stress distribution at a glance.' },
  { icon: '📋', title: 'History & PDF',   desc: 'Searchable detection history with PDF export. AI action tips per record.' },
  { icon: '🔒', title: 'Secure Access',   desc: 'Farmer and Admin roles. Manage your herd with full privacy and control.' },
];

const STRESS_LEVELS = [
  { label: 'Calm',     color: '#22c55e', pct: 35 },
  { label: 'Mild',     color: '#84cc16', pct: 24 },
  { label: 'Moderate', color: '#eab308', pct: 18 },
  { label: 'High',     color: '#f97316', pct: 13 },
  { label: 'Extreme',  color: '#ef4444', pct: 10 },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('dashboard-theme');
    return saved ? saved === 'dark' : true;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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

  const goToDashboard = () => navigate('/login');
  const goToLogin     = () => navigate('/login');
  const goToRegister  = () => navigate('/register');

  const card = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: theme.cardShadow,
    backdropFilter: 'blur(20px)',
    borderRadius: 18,
    transition: 'all 0.3s ease',
  };

  const primaryBtn = {
    background: theme.primaryBg,
    border: 'none',
    color: '#fff',
    boxShadow: `0 6px 20px ${theme.accentShadow}`,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: "'Inter', sans-serif",
  };

  const secondaryBtn = {
    background: 'transparent',
    border: `1.5px solid ${theme.secondaryBtn}`,
    color: theme.secondaryClr,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{
      background: theme.pageBg, color: theme.title, minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, sans-serif",
      transition: 'all 0.3s ease', overflowX: 'hidden', position: 'relative',
    }}>

      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${theme.gridLine} 1px, transparent 1px),
                          linear-gradient(90deg, ${theme.gridLine} 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />

      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '-15%', left: '-8%', width: 480, height: 480, borderRadius: '50%', background: theme.heroGlow, filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-8%', right: '-6%', width: 320, height: 320, borderRadius: '50%', background: theme.orbGlow, filter: 'blur(90px)', zIndex: 0, pointerEvents: 'none' }} />

      {/* ═══ NAV ═══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', backdropFilter: 'blur(20px)',
        background: theme.navBg, borderBottom: `1px solid ${theme.divider}`,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 30 }}>🐄</span>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900, fontSize: 26,
              color: theme.accent, letterSpacing: '-0.01em',
            }}>
              CattleSense
            </div>
            <div style={{ fontSize: 9, color: theme.subtitle, letterSpacing: '0.12em', marginTop: -2, fontFamily: "'Inter', sans-serif" }}>
              LIVESTOCK MANAGEMENT FOR SRI LANKA
            </div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 9, border: 'none',
            cursor: 'pointer', fontSize: 12, fontWeight: 500,
            background: theme.toggleBg, color: theme.toggleColor, fontFamily: "'Inter', sans-serif",
          }}>
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>

          {!isMobile && (
            <button onClick={goToRegister} style={{
              ...secondaryBtn, padding: '7px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500,
            }}>
              Register
            </button>
          )}

          <button onClick={goToLogin} style={{
            ...secondaryBtn, padding: '7px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500,
          }}>
            Sign In
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: isMobile ? '56px 20px 44px' : '80px 20px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 28,
            background: theme.pillBg, border: `1px solid ${theme.pillBorder}`, color: theme.pillColor,
            fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em',
          }}>
            🇱🇰 AI-Powered Cattle Stress Detection
          </div>

          {/* ── HEADLINE — Playfair Display serif font ── */}
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: isMobile ? 38 : 64,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 22,
            color: theme.title,
          }}>
            Know Your Cattle's{' '}
            <span style={{
              fontStyle: 'italic',
              backgroundImage: theme.primaryBg,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Stress Level
            </span>
            <br />
            <span style={{ fontStyle: 'normal' }}>Before It's Too Late</span>
          </h1>

          {/* Subheadline — Inter for contrast */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: isMobile ? 15 : 17,
            color: theme.subtitle,
            lineHeight: 1.75,
            maxWidth: 540,
            margin: '0 auto 36px',
            fontWeight: 400,
          }}>
            Upload a 10-second video. Our dual AI pipeline detects cattle presence,
            classifies stress across 5 levels, and gives actionable recommendations instantly.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <button onClick={goToDashboard} style={{
              ...primaryBtn,
              padding: isMobile ? '12px 24px' : '15px 36px',
              borderRadius: 13, fontSize: isMobile ? 14 : 16, fontWeight: 700,
            }}>
              🚀 Open Dashboard
            </button>
            <button onClick={goToRegister} style={{
              ...secondaryBtn,
              padding: isMobile ? '12px 22px' : '15px 30px',
              borderRadius: 13, fontSize: isMobile ? 14 : 15, fontWeight: 600,
            }}>
              Create Free Account
            </button>
          </div>

          {/* Stress preview card */}
          <div style={{ ...card, maxWidth: 400, margin: '0 auto', padding: '22px 24px', textAlign: 'left' }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
              color: theme.muted, marginBottom: 14,
              fontFamily: "'Inter', sans-serif",
            }}>
              LIVE STRESS DISTRIBUTION PREVIEW
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
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 20px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-block', padding: '3px 13px', borderRadius: 100,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12,
            background: theme.secBadgeBg, color: theme.secBadgeC,
            fontFamily: "'Inter', sans-serif",
          }}>
            FEATURES
          </div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: isMobile ? 24 : 36,
            fontWeight: 800, letterSpacing: '-0.02em',
            marginBottom: 10, color: theme.title,
          }}>
            Everything to protect your herd
          </div>
          <div style={{ fontSize: 14, color: theme.subtitle, maxWidth: 460, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            Built for Sri Lankan farmers. Designed to work in the field.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ ...card, padding: '24px 20px', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ width: 44, height: 44, borderRadius: 13, background: theme.featureIconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.title, marginBottom: 7, fontFamily: "'Inter', sans-serif" }}>{f.title}</div>
              <div style={{ fontSize: 12, color: theme.body, lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 20px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-block', padding: '3px 13px', borderRadius: 100,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12,
            background: theme.secBadgeBg, color: theme.secBadgeC,
            fontFamily: "'Inter', sans-serif",
          }}>
            HOW IT WORKS
          </div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: isMobile ? 24 : 36,
            fontWeight: 800, letterSpacing: '-0.02em', color: theme.title,
          }}>
            Three steps to peace of mind
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { num: '01', icon: '🎬', title: 'Record or Upload', desc: 'Use your phone or upload a video. ~10 seconds, steady, good lighting.' },
            { num: '02', icon: '🤖', title: 'AI Analyzes',      desc: 'Model 1 confirms presence. Model 2 classifies stress. Runs in seconds.' },
            { num: '03', icon: '💡', title: 'Act on Insights',  desc: 'Get the stress level, confidence score, and specific action tips.' },
          ].map((s, i) => (
            <div key={i} style={{ ...card, padding: '26px 22px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 12, right: 16,
                fontSize: 42, fontWeight: 900, opacity: 0.75,
                color: theme.stepNumColor, fontFamily: 'monospace',
              }}>{s.num}</div>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: theme.featureIconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.title, marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>{s.title}</div>
              <div style={{ fontSize: 12, color: theme.body, lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 20px 60px' }}>
        <div style={{
          background: theme.bannerBg, borderRadius: 22,
          padding: isMobile ? '40px 24px' : '54px 44px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🐄</div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: isMobile ? 24 : 34,
              fontWeight: 900, color: '#fff',
              marginBottom: 12, letterSpacing: '-0.02em',
              fontStyle: 'italic',
            }}>
              Ready to protect your herd?
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14, color: 'rgba(255,255,255,0.82)',
              marginBottom: 28, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.7,
            }}>
              Join farmers across Sri Lanka using AI to monitor cattle stress and improve animal welfare.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={goToDashboard} style={{
                background: '#fff', border: 'none', borderRadius: 12,
                padding: '13px 30px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', color: theme.ctaBtnColor,
                boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
                fontFamily: "'Inter', sans-serif",
              }}>
                🚀 Open Dashboard
              </button>
              <button onClick={goToRegister} style={{
                background: 'rgba(255,255,255,0.14)', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.38)',
                borderRadius: 12, padding: '13px 28px',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}>
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        position: 'relative', zIndex: 1,
        padding: '26px 20px', borderTop: `1px solid ${theme.divider}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🐄</span>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 900, fontSize: 22, color: theme.accent,
          }}>
            CattleSense
          </span>
        </div>
        <div style={{ fontSize: 12, color: theme.footerColor, fontFamily: "'Inter', sans-serif" }}>
          © 2026 CattleSense. AI-powered cattle stress detection.
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 18 }}>
            {['Dashboard', 'Detection', 'History', 'Analytics'].map(l => (
              <span
                key={l}
                onClick={goToDashboard}
                style={{ fontSize: 12, color: theme.footerColor, cursor: 'pointer', transition: 'color 0.2s', fontFamily: "'Inter', sans-serif" }}
                onMouseEnter={e => e.target.style.color = theme.accent}
                onMouseLeave={e => e.target.style.color = theme.footerColor}
              >
                {l}
              </span>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}