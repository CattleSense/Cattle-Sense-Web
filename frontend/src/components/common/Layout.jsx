import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { FiGrid, FiVideo, FiList, FiTrendingUp, FiLogOut, FiSun, FiMoon, FiFile  } from 'react-icons/fi';

const navItems = [
  { to: '/dashboard', icon: <FiGrid size={18} />,       label: 'Dashboard'    },
  { to: '/detection', icon: <FiVideo size={18} />,      label: 'Detect Stress' },
  { to: '/history',   icon: <FiList size={18} />,       label: 'History'      },
  { to: '/analytics', icon: <FiTrendingUp size={18} />, label: 'Analytics'    },
  { to: '/reports', icon: <FiFile size={18} />, label: 'Reports'    },
];



// ─── Theme tokens — matched to AdminHome.jsx ────────────────────────────────
const THEMES = {
  dark: {
    // Page & sidebar backgrounds
    pageBg:          '#292828',
    sidebarBg:       '#000000',
    topbarBg:        '#000000',
    cardBg:          '#1E1E1E',
    border:          '#333333',
    // Accent — blue gradient (dark mode)
    accent:          '#2563eb',
    accentEnd:       '#1e40af',
    accentShadow:    'rgba(14,165,233,0.4)',
    gradientStart:   '#2563eb',
    gradientEnd:     '#1e40af',
    // Text
    textPrimary:     '#E1E1E1',
    textSecondary:   '#A0A0A0',
    brandName:       '#E1E1E1',
    brandSub:        '#A0A0A0',
    collapseBtn:     '#A0A0A0',
    // Nav
    navText:         '#A0A0A0',
    navActive:       '#ffffff',
    navActiveBg:     'linear-gradient(135deg, #2563eb, #1e40af)',
    navHoverBg:      'rgba(37,99,235,0.1)',
    navLabel:        '#555555',
    // Avatar
    avatarBg:        'linear-gradient(135deg, #2563eb, #1e40af)',
    avatarText:      '#ffffff',
    // Topbar
    topbarUserText:  '#A0A0A0',
    weatherBg:       '#1E1E1E',
    weatherBorder:   '#333333',
    weatherCity:     '#A0A0A0',
    // Toggle
    toggleBg:        '#1E1E1E',
    toggleColor:     '#A0A0A0',
    toggleHover:     '#333333',
    // Logout
    logoutColor:     '#A0A0A0',
    logoutHover:     'rgba(37,99,235,0.1)',
    // Content
    contentBg:       '#000000',
  },
  light: {
    // Page & sidebar backgrounds
    pageBg:          '#f8fafc',
    sidebarBg:       'rgba(255,255,255,0.8)',
    topbarBg:        'rgba(255,255,255,0.8)',
    cardBg:          'rgba(255,255,255,0.4)',
    border:          'rgba(0,0,0,0.1)',
    // Accent — green gradient (light mode)
    accent:          '#10b981',
    accentEnd:       '#059669',
    accentShadow:    'rgba(0,204,102,0.4)',
    gradientStart:   '#10b981',
    gradientEnd:     '#059669',
    // Text
    textPrimary:     '#1e293b',
    textSecondary:   '#64748b',
    brandName:       '#1e293b',
    brandSub:        '#64748b',
    collapseBtn:     '#64748b',
    // Nav
    navText:         '#64748b',
    navActive:       '#ffffff',
    navActiveBg:     'linear-gradient(135deg, #10b981, #059669)',
    navHoverBg:      'rgba(16,185,129,0.08)',
    navLabel:        '#94a3b8',
    // Avatar
    avatarBg:        'linear-gradient(135deg, #10b981, #059669)',
    avatarText:      '#ffffff',
    // Topbar
    topbarUserText:  '#64748b',
    weatherBg:       'rgba(255,255,255,0.4)',
    weatherBorder:   'rgba(0,0,0,0.1)',
    weatherCity:     '#64748b',
    // Toggle
    toggleBg:        'rgba(255,255,255,0.4)',
    toggleColor:     '#64748b',
    toggleHover:     'rgba(16,185,129,0.1)',
    // Logout
    logoutColor:     '#64748b',
    logoutHover:     'rgba(16,185,129,0.08)',
    // Content
    contentBg:       '#f8fafc',
  },
};
// ────────────────────────────────────────────────────────────────────────────

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Dark/light mode state (persisted to localStorage) ──────────────────
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('dashboard-theme');
    return saved ? saved === 'dark' : true;
  });

  const theme = THEMES[isDark ? 'dark' : 'light'];

 const toggleTheme = () => {
  setIsDark(prev => {
    const next = !prev;
    localStorage.setItem('dashboard-theme', next ? 'dark' : 'light');
    return next;
  });
  // ── Dispatch AFTER render cycle to avoid setState-during-render warning ──
  setTimeout(() => {
    const next = localStorage.getItem('dashboard-theme');
    window.dispatchEvent(new CustomEvent('dashboard-theme-change', { detail: next }));
  }, 0);
};
  // ───────────────────────────────────────────────────────────────────────

 const handleLogout = () => {
  logout();
  toast.success('Logged out successfully');
  navigate('/');
};
  const sidebarWidth = collapsed ? 70 : 240;

  window.dispatchEvent(new CustomEvent('dashboard-theme-change', { detail: 'dark' | 'light' }));

  return (
    <div style={{
      ...styles.root,
      background: theme.pageBg,
      transition: 'background-color 0.3s ease',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        width: sidebarWidth,
        left: mobileOpen ? 0 : undefined,
        background: theme.sidebarBg,
        borderRight: `1px solid ${theme.border}`,
        backdropFilter: 'blur(20px)',
        transition: 'width 0.25s ease, background 0.3s ease',
      }}>

        {/* Brand */}
        <div style={{ ...styles.brand, borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ fontSize: 28 }}>🐄</span>
          {!collapsed && (
            <div>
              <div style={{ ...styles.brandName, color: theme.brandName }}>CattleSense</div>
              <div style={{ ...styles.brandSub, color: theme.brandSub }}>Livestock Management for Sri Lanka</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ ...styles.collapseBtn, color: theme.collapseBtn }}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* User info 
        {!collapsed && (
          <div style={{ ...styles.userInfo, borderBottom: `1px solid ${theme.border}` }}>
            <div style={{
              ...styles.userAvatar,
              background: theme.avatarBg,
              color: theme.avatarText,
              boxShadow: `0 4px 14px ${theme.accentShadow}`,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ ...styles.userName, color: theme.textPrimary }}>{user?.name}</div>
              <div style={{ ...styles.userRole, color: theme.textSecondary }}>
                {user?.role === 'admin' ? '⚙️ Admin' : '🌾 Farmer'}
              </div>
            </div>
          </div>
        )} */}

        {/* Nav items */}
        <nav style={styles.nav}>
          <div style={styles.navSection}>
            {!collapsed && (
              <div style={{ ...styles.navLabel, color: theme.navLabel }}>MAIN MENU</div>
            )}
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  ...styles.navItem,
                  background: isActive ? theme.navActiveBg : 'transparent',
                  color: isActive ? theme.navActive : theme.navText,
                  borderLeft: isActive ? `3px solid ${theme.accent}` : '3px solid transparent',
                  borderRadius: isActive ? '0 12px 12px 0' : '12px',
                  boxShadow: isActive ? `0 4px 14px ${theme.accentShadow}` : 'none',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                })}
                onMouseEnter={e => {
                  if (!e.currentTarget.className.includes('active'))
                    e.currentTarget.style.background = theme.navHoverBg;
                }}
                onMouseLeave={e => {
                  if (!e.currentTarget.className.includes('active'))
                    e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {!collapsed && <span style={{ fontSize: 14 }}>{item.label}</span>}
              </NavLink>
            ))}
          </div>

           {/*  {user?.role === 'admin' && (
            <div style={styles.navSection}>
              {!collapsed && (
                <div style={{ ...styles.navLabel, color: theme.navLabel }}>ADMIN</div>
              )}
              {adminItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    ...styles.navItem,
                    background: isActive ? theme.navActiveBg : 'transparent',
                    color: isActive ? theme.navActive : theme.navText,
                    borderLeft: isActive ? `3px solid ${theme.accent}` : '3px solid transparent',
                    borderRadius: isActive ? '0 12px 12px 0' : '12px',
                    boxShadow: isActive ? `0 4px 14px ${theme.accentShadow}` : 'none',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  })}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {!collapsed && <span style={{ fontSize: 14 }}>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          )}  */}
        </nav>

        {/* Logout */}
        <button
  onClick={handleLogout}
  style={{
    ...styles.logoutBtn,
    borderTop: `1px solid ${theme.border}`,
    color: theme.logoutColor,
    justifyContent: collapsed ? 'center' : 'flex-start',
  }}
  onMouseEnter={e => e.currentTarget.style.background = theme.logoutHover}
  onMouseLeave={e => e.currentTarget.style.background = 'none'}
>
  <FiLogOut size={18} style={{ flexShrink: 0 }} />
  {!collapsed && <span>Logout</span>}
</button>
      </aside>

      {/* Main content */}
      <main style={{ ...styles.main, marginLeft: sidebarWidth }}>

        {/* Top bar */}
        <div style={{
          ...styles.topbar,
          background: theme.topbarBg,
          borderBottom: `1px solid ${theme.border}`,
          backdropFilter: 'blur(20px)',
          transition: 'background 0.3s ease',
          justifyContent: 'flex-end',
        }}>
          <button style={{ ...styles.mobileMenuBtn, color: theme.textSecondary }}
            onClick={() => setMobileOpen(!mobileOpen)}>☰
          </button>

          <div style={{ ...styles.topbarRight, marginLeft: 'auto' }}>
            <WeatherWidget theme={theme} />

            {/* User avatar */}
            <div style={styles.topbarUser}>
  <div style={{
    ...styles.topbarAvatar,
    background: theme.avatarBg,
    color: theme.avatarText,
    boxShadow: `0 4px 10px ${theme.accentShadow}`,
  }}>
    {user?.name?.charAt(0).toUpperCase()}
  </div>
  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <span style={{ fontSize: 14, fontWeight: 600, color: theme.topbarUserText }}>{user?.name}</span>
    {user?.email && (
      <span style={{ fontSize: 11, color: theme.textSecondary, opacity: 0.75 }}>{user.email}</span>
    )}
  </div>
</div>

            {/* Theme toggle — far right */}
            <button
  onClick={toggleTheme}
  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  style={{
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 12,
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
    ? <FiSun  size={16} style={{ flexShrink: 0 }} />
    : <FiMoon size={16} style={{ flexShrink: 0 }} />
  }
</button>
          </div>
        </div>

        {/* Page content */}
        <div style={{
          ...styles.content,
          background: theme.contentBg,
          transition: 'background 0.3s ease',
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// Mini weather widget — themed to match AdminHome card style
function WeatherWidget({ theme }) {
  const { API } = useAuth();
  const [weather, setWeather] = React.useState(null);

  React.useEffect(() => {
    api.get('/weather').then(res => setWeather(res.data.weather)).catch(() => {});
  }, []);

  if (!weather) return null;

  const tempColor = weather.temp > 35 ? '#ef4444' : weather.temp > 30 ? '#f97316' : theme.accent;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: theme.weatherBg,
      padding: '6px 14px', borderRadius: 12,
      border: `1px solid ${theme.weatherBorder}`,
      backdropFilter: 'blur(20px)',
    }}>
      <span>🌡️</span>
      <span style={{ fontSize: 14, color: tempColor, fontWeight: 600 }}>{weather.temp}°C</span>
      <span style={{ fontSize: 12, color: theme.weatherCity }}>{weather.city}</span>
    </div>
  );
}

const styles = {
  root: { display: 'flex', minHeight: '100vh' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99,
  },
  sidebar: {
    position: 'fixed', top: 0, left: 0, height: '100vh',
    display: 'flex', flexDirection: 'column',
    zIndex: 100, overflow: 'hidden',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '20px 16px', minHeight: 72,
  },
  brandName: { fontFamily: 'Sora', fontSize: 16, fontWeight: 700 },
  brandSub:  { fontSize: 11 },
  collapseBtn: {
    marginLeft: 'auto', background: 'none', border: 'none',
    cursor: 'pointer', fontSize: 16, padding: '4px',
  },
  userInfo: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '16px',
  },
  userAvatar: {
    width: 38, height: 38, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 700, flexShrink: 0,
  },
  userName: { fontSize: 14, fontWeight: 600 },
  userRole:  { fontSize: 12 },
  nav: { flex: 1, padding: '12px 8px', overflowY: 'auto' },
  navSection: { marginBottom: 16 },
  navLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    padding: '6px 10px', marginBottom: 4,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    textDecoration: 'none', marginBottom: 4,
    fontWeight: 500,
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 16px', background: 'none', border: 'none',
    cursor: 'pointer', width: '100%',
    fontSize: 14, transition: 'all 0.3s ease',
    fontFamily: "'Inter', sans-serif",
  },
  main: {
    flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column',
    transition: 'margin-left 0.25s ease',
  },
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: 64,
    position: 'sticky', top: 0, zIndex: 50,
  },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 16 },
  topbarUser:  { display: 'flex', alignItems: 'center', gap: 8 },
  topbarAvatar: {
    width: 34, height: 34, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700,
  },
  mobileMenuBtn: {
    background: 'none', border: 'none',
    fontSize: 20, cursor: 'pointer', display: 'none',
  },
  content: { padding: '28px 24px', flex: 1 },
};