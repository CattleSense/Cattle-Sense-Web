import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { FiGrid, FiVideo, FiList, FiTrendingUp, FiLogOut, FiSun, FiMoon, FiFile, FiMenu, FiX } from 'react-icons/fi';

// ── Responsive hook ───────────────────────────────────────────────────────────
function useResponsive() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return {
    isMobile:  width < 640,
    isTablet:  width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}

const navItems = [
  { to: '/dashboard', icon: <FiGrid size={18} />,       label: 'Dashboard'     },
  { to: '/detection', icon: <FiVideo size={18} />,      label: 'Detect Stress' },
  { to: '/history',   icon: <FiList size={18} />,       label: 'History'       },
  { to: '/analytics', icon: <FiTrendingUp size={18} />, label: 'Analytics'     },
  { to: '/reports',   icon: <FiFile size={18} />,       label: 'Reports'       },
];

// ── Theme tokens ──────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    pageBg:         '#292828',
    sidebarBg:      '#000000',
    topbarBg:       '#000000',
    cardBg:         '#1E1E1E',
    border:         '#333333',
    accent:         '#2563eb',
    accentEnd:      '#1e40af',
    accentShadow:   'rgba(14,165,233,0.4)',
    gradientStart:  '#2563eb',
    gradientEnd:    '#1e40af',
    textPrimary:    '#E1E1E1',
    textSecondary:  '#A0A0A0',
    brandName:      '#E1E1E1',
    brandSub:       '#A0A0A0',
    collapseBtn:    '#A0A0A0',
    navText:        '#A0A0A0',
    navActive:      '#ffffff',
    navActiveBg:    'linear-gradient(135deg, #2563eb, #1e40af)',
    navHoverBg:     'rgba(37,99,235,0.1)',
    navLabel:       '#555555',
    avatarBg:       'linear-gradient(135deg, #2563eb, #1e40af)',
    avatarText:     '#ffffff',
    topbarUserText: '#A0A0A0',
    weatherBg:      '#1E1E1E',
    weatherBorder:  '#333333',
    weatherCity:    '#A0A0A0',
    toggleBg:       '#1E1E1E',
    toggleColor:    '#A0A0A0',
    toggleHover:    '#333333',
    logoutColor:    '#A0A0A0',
    logoutHover:    'rgba(37,99,235,0.1)',
    contentBg:      '#000000',
    bottomNavBg:    '#0a0a0a',
    bottomNavBorder:'#222222',
  },
  light: {
    pageBg:         '#f8fafc',
    sidebarBg:      'rgba(255,255,255,0.8)',
    topbarBg:       'rgba(255,255,255,0.8)',
    cardBg:         'rgba(255,255,255,0.4)',
    border:         'rgba(0,0,0,0.1)',
    accent:         '#10b981',
    accentEnd:      '#059669',
    accentShadow:   'rgba(0,204,102,0.4)',
    gradientStart:  '#10b981',
    gradientEnd:    '#059669',
    textPrimary:    '#1e293b',
    textSecondary:  '#64748b',
    brandName:      '#1e293b',
    brandSub:       '#64748b',
    collapseBtn:    '#64748b',
    navText:        '#64748b',
    navActive:      '#ffffff',
    navActiveBg:    'linear-gradient(135deg, #10b981, #059669)',
    navHoverBg:     'rgba(16,185,129,0.08)',
    navLabel:       '#94a3b8',
    avatarBg:       'linear-gradient(135deg, #10b981, #059669)',
    avatarText:     '#ffffff',
    topbarUserText: '#64748b',
    weatherBg:      'rgba(255,255,255,0.4)',
    weatherBorder:  'rgba(0,0,0,0.1)',
    weatherCity:    '#64748b',
    toggleBg:       'rgba(255,255,255,0.4)',
    toggleColor:    '#64748b',
    toggleHover:    'rgba(16,185,129,0.1)',
    logoutColor:    '#64748b',
    logoutHover:    'rgba(16,185,129,0.08)',
    contentBg:      '#f8fafc',
    bottomNavBg:    '#ffffff',
    bottomNavBorder:'rgba(0,0,0,0.08)',
  },
};

// ── Weather widget ─────────────────────────────────────────────────────────────
function WeatherWidget({ theme, compact = false }) {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    api.get('/weather').then(res => setWeather(res.data.weather)).catch(() => {});
  }, []);
  if (!weather) return null;
  const tempColor = weather.temp > 35 ? '#ef4444' : weather.temp > 30 ? '#f97316' : theme.accent;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: compact ? 5 : 8,
      background: theme.weatherBg, padding: compact ? '4px 10px' : '6px 14px',
      borderRadius: 12, border: `1px solid ${theme.weatherBorder}`,
      backdropFilter: 'blur(20px)',
    }}>
      <span style={{ fontSize: compact ? 13 : 14 }}>🌡️</span>
      <span style={{ fontSize: compact ? 13 : 14, color: tempColor, fontWeight: 600 }}>{weather.temp}°C</span>
      {!compact && <span style={{ fontSize: 12, color: theme.weatherCity }}>{weather.city}</span>}
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('dashboard-theme');
    return saved ? saved === 'dark' : true;
  });
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

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Close mobile drawer on route change
  const closeMobileDrawer = () => setMobileOpen(false);

  // On tablet: sidebar is always icon-only (collapsed), no toggle needed
  const effectiveCollapsed = isTablet ? true : collapsed;
  const sidebarWidth = isMobile ? 0 : effectiveCollapsed ? 70 : 240;

  // ── Sidebar inner content (shared between desktop fixed + mobile drawer) ──
  const SidebarContent = ({ onNavClick }) => (
    <>
      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '20px 16px', minHeight: 72,
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <span style={{ fontSize: 30, flexShrink: 0 }}>🐄</span>
        {(!effectiveCollapsed || isMobile) && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.brandName, fontFamily: 'Sora, sans-serif', whiteSpace: 'nowrap' }}>CattleSense</div>
            <div style={{ fontSize: 13, color: theme.brandSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Stress Detection
            </div>
          </div>
        )}
        {/* Collapse button — desktop only */}
        {isDesktop && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '4px', color: theme.collapseBtn, flexShrink: 0 }}
          >
            {collapsed ? '→' : '←'}
          </button>
        )}
        {/* Close button — mobile drawer */}
        {isMobile && (
          <button onClick={closeMobileDrawer} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: theme.collapseBtn, flexShrink: 0, padding: 4 }}>
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 16 }}>
          {(!effectiveCollapsed || isMobile) && (
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '6px 10px', marginBottom: 4, color: theme.navLabel }}>
              MAIN MENU
            </div>
          )}
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: effectiveCollapsed && !isMobile ? 0 : 10,
                padding: '10px 14px',
                textDecoration: 'none', marginBottom: 4,
                fontWeight: 500, fontSize: 14,
                background: isActive ? theme.navActiveBg : 'transparent',
                color: isActive ? theme.navActive : theme.navText,
                borderLeft: isActive ? `3px solid ${theme.accent}` : '3px solid transparent',
                borderRadius: isActive ? '0 12px 12px 0' : '12px',
                boxShadow: isActive ? `0 4px 14px ${theme.accentShadow}` : 'none',
                justifyContent: effectiveCollapsed && !isMobile ? 'center' : 'flex-start',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              })}
              onMouseEnter={e => {
                const el = e.currentTarget;
                if (!el.style.background.includes('gradient')) el.style.background = theme.navHoverBg;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                if (!el.style.background.includes('gradient')) el.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {(!effectiveCollapsed || isMobile) && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex', alignItems: 'center',
          gap: effectiveCollapsed && !isMobile ? 0 : 10,
          padding: '14px 16px', background: 'none',
          border: 'none', borderTop: `1px solid ${theme.border}`,
          cursor: 'pointer', width: '100%', fontSize: 14,
          color: theme.logoutColor,
          justifyContent: effectiveCollapsed && !isMobile ? 'center' : 'flex-start',
          fontFamily: "'Inter', sans-serif", transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = theme.logoutHover}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <FiLogOut size={18} style={{ flexShrink: 0 }} />
        {(!effectiveCollapsed || isMobile) && <span>Logout</span>}
      </button>
    </>
  );

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: theme.pageBg,
      transition: 'background-color 0.3s ease',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && isMobile && (
        <div
          onClick={closeMobileDrawer}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* ── DESKTOP / TABLET: Fixed sidebar ── */}
      {!isMobile && (
        <aside style={{
          position: 'fixed', top: 0, left: 0, height: '100vh',
          width: sidebarWidth,
          display: 'flex', flexDirection: 'column',
          zIndex: 100, overflow: 'hidden',
          background: theme.sidebarBg,
          borderRight: `1px solid ${theme.border}`,
          backdropFilter: 'blur(20px)',
          transition: 'width 0.25s ease, background 0.3s ease',
        }}>
          <SidebarContent onNavClick={() => {}} />
        </aside>
      )}

      {/* ── MOBILE: Slide-in drawer ── */}
      {isMobile && (
        <aside style={{
          position: 'fixed', top: 0, left: 0, height: '100vh',
          width: 260,
          display: 'flex', flexDirection: 'column',
          zIndex: 200, overflow: 'hidden',
          background: theme.sidebarBg,
          borderRight: `1px solid ${theme.border}`,
          backdropFilter: 'blur(20px)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <SidebarContent onNavClick={closeMobileDrawer} />
        </aside>
      )}

      {/* ── Main content area ── */}
      <main style={{
        flex: 1, minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        marginLeft: isMobile ? 0 : sidebarWidth,
        transition: 'margin-left 0.25s ease',
        // Extra bottom padding on mobile for bottom nav
        paddingBottom: isMobile ? 64 : 0,
      }}>

        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 14px' : '0 24px',
          height: isMobile ? 56 : 64,
          position: 'sticky', top: 0, zIndex: 50,
          background: theme.topbarBg,
          borderBottom: `1px solid ${theme.border}`,
          backdropFilter: 'blur(20px)',
          transition: 'background 0.3s ease',
        }}>

          {/* Left: hamburger (mobile) or brand (tablet collapsed) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <FiMenu size={22} />
              </button>
            )}
            {isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 20 }}>🐄</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: theme.brandName, fontFamily: 'Sora, sans-serif' }}>CattleSense</span>
              </div>
            )}
          </div>

          {/* Right: weather + avatar + theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16, marginLeft: 'auto' }}>
            <WeatherWidget theme={theme} compact={isMobile} />

            {/* User avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: isMobile ? 30 : 34, height: isMobile ? 30 : 34,
                borderRadius: '50%',
                background: theme.avatarBg, color: theme.avatarText,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isMobile ? 12 : 13, fontWeight: 700,
                boxShadow: `0 4px 10px ${theme.accentShadow}`,
                flexShrink: 0,
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: theme.topbarUserText }}>{user?.name}</span>
                  {user?.email && (
                    <span style={{ fontSize: 11, color: theme.textSecondary, opacity: 0.75 }}>{user.email}</span>
                  )}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6,
                padding: isMobile ? '7px' : '8px 16px',
                borderRadius: 12,
                border: `1px solid ${theme.border}`,
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: theme.toggleBg, color: theme.toggleColor,
                backdropFilter: 'blur(20px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = theme.toggleHover}
              onMouseLeave={e => e.currentTarget.style.background = theme.toggleBg}
            >
              {isDark
                ? <FiSun  size={isMobile ? 15 : 16} style={{ flexShrink: 0 }} />
                : <FiMoon size={isMobile ? 15 : 16} style={{ flexShrink: 0 }} />
              }
              {!isMobile && (isDark ? 'Light' : 'Dark')}
            </button>
          </div>
        </div>

        {/* ── Page content ── */}
        <div style={{
          padding: isMobile ? '14px 12px' : isTablet ? '20px 18px' : '28px 24px',
          flex: 1,
          background: theme.contentBg,
          transition: 'background 0.3s ease',
        }}>
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE: Bottom navigation bar ── */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 64, zIndex: 100,
          background: theme.bottomNavBg,
          borderTop: `1px solid ${theme.bottomNavBorder}`,
          backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, paddingTop: 8, paddingBottom: 8,
                textDecoration: 'none',
                color: isActive ? theme.accent : theme.navText,
                fontSize: 9,
                fontWeight: isActive ? 700 : 500,
                fontFamily: "'Inter', sans-serif",
                transition: 'color 0.2s',
                position: 'relative',
              })}
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator dot */}
                  {isActive && (
                    <span style={{
                      position: 'absolute', top: 6, width: 4, height: 4,
                      borderRadius: '50%', background: theme.accent,
                    }} />
                  )}
                  <span style={{
                    fontSize: 18,
                    opacity: isActive ? 1 : 0.65,
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}>
                    {item.icon}
                  </span>
                  <span style={{ letterSpacing: '0.02em' }}>{item.label.split(' ')[0]}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
