import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { STRESS_CONFIG, getBadgeClass } from '../utils/stress';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSeedling, faMagnifyingGlass, faFaceSmile,
  faTriangleExclamation, faUsers, faCow, faFile, faFire,
} from '@fortawesome/free-solid-svg-icons';
import { FiClock, FiAlertTriangle, FiMenu, FiX } from 'react-icons/fi';

// ── Google Fonts ──────────────────────────────────────────────────────────────
const _fl = document.createElement('link');
_fl.rel = 'stylesheet';
_fl.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap';
if (!document.head.querySelector('[href*="DM+Serif"]')) document.head.appendChild(_fl);

// ── Responsive hook ───────────────────────────────────────────────────────────
function useResponsive() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return {
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}

// ── Theme tokens ──────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    pageBg: '#000000',
    cardBg: '#1E1E1E',
    cardBorder: '#333333',
    cardShadow: '0 8px 32px rgba(0,0,0,0.5)',
    title: '#E1E1E1',
    subtitle: '#A0A0A0',
    body: '#A0A0A0',
    muted: '#475569',
    accent: '#2563eb',
    accentEnd: '#1e40af',
    accentShadow: 'rgba(14,165,233,0.4)',
    primaryBg: 'linear-gradient(135deg, #2563eb, #1e40af)',
    divider: 'rgba(255,255,255,0.06)',
    tableHeadText: '#A0A0A0',
    tableStripBg: '#242424',
    tableRowHover: '#2f2f2f',
    tableHead: '#181818',
    tableBorder: 'rgba(255,255,255,0.06)',
    toggleBg: 'rgba(255,255,255,0.08)',
    toggleColor: '#A0A0A0',
    toggleHover: 'rgba(255,255,255,0.14)',
    secondaryBtn: 'rgba(255,255,255,0.08)',
    secondaryBorder: 'rgba(255,255,255,0.14)',
    secondaryColor: '#807e7e',
    weatherBg: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    statIconBg1: 'rgba(34,197,94,0.15)',
    statIconBg2: 'rgba(34,197,94,0.15)',
    statIconBg3: 'rgba(239,68,68,0.15)',
    statIconBg4: 'rgba(37,99,235,0.15)',
    alertBg: 'rgba(239,68,68,0.1)',
    alertBorder: 'rgba(239,68,68,0.3)',
    alertText: '#ef4444',
    rowSel: 'rgba(37,99,235,0.12)',
    tabBg: 'rgba(255,255,255,0.07)',
    tabBorder: 'rgba(255,255,255,0.12)',
    tabText: '#dad0d0',
    tabActiveBg: 'rgba(255,255,255,0.12)',
    tabActiveBorder: 'rgba(255,255,255,0.22)',
    tabActiveText: '#E1E1E1',
  },
  light: {
    pageBg: '#f8fafc',
    cardBg: '#ffffff',
    cardBorder: 'rgba(0,0,0,0.08)',
    cardShadow: '0 4px 20px rgba(0,0,0,0.06)',
    title: '#1e293b',
    subtitle: '#64748b',
    body: '#64748b',
    muted: '#94a3b8',
    accent: '#10b981',
    accentEnd: '#059669',
    accentShadow: 'rgba(0,204,102,0.35)',
    primaryBg: 'linear-gradient(135deg, #10b981, #059669)',
    divider: 'rgba(0,0,0,0.07)',
    tableHead: '#f8fafc',
    tableHeadText: '#64748b',
    tableStripBg: 'rgba(0,0,0,0.018)',
    tableRowHover: 'rgba(0,0,0,0.02)',
    tableBorder: 'rgba(0,0,0,0.06)',
    toggleBg: 'rgba(0,0,0,0.05)',
    toggleColor: '#64748b',
    toggleHover: 'rgba(0,0,0,0.1)',
    secondaryBtn: 'rgba(0,0,0,0.04)',
    secondaryBorder: 'rgba(0,0,0,0.12)',
    secondaryColor: '#64748b',
    weatherBg: 'linear-gradient(135deg, #059669, #10b981)',
    statIconBg1: 'rgba(34,197,94,0.12)',
    statIconBg2: 'rgba(34,197,94,0.12)',
    statIconBg3: 'rgba(239,68,68,0.1)',
    statIconBg4: 'rgba(37,99,235,0.1)',
    alertBg: '#fee2e2',
    alertBorder: '#fca5a5',
    alertText: '#dc2626',
    rowSel: 'rgba(16,185,129,0.08)',
    tabBg: 'rgba(0,0,0,0.04)',
    tabBorder: 'rgba(0,0,0,0.08)',
    tabText: '#545960',
    tabActiveBg: 'rgba(0,0,0,0.07)',
    tabActiveBorder: 'rgba(0,0,0,0.15)',
    tabActiveText: '#1e293b',
  },
};

const F = {
  serif: "'DM Serif Display', Georgia, serif",
  sans: "'DM Sans', -apple-system, sans-serif",
};

const DEFAULT_STRESS_CONFIG = {
  Calm: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
  Moderate: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
  High: { bg: 'rgba(249,115,22,0.15)', text: '#fb923c' },
  Extreme: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Calm', label: 'Calm' },
  { key: 'Moderate', label: 'Moderate' },
  { key: 'High', label: 'High' },
  { key: 'Extreme', label: 'Extreme' },
];

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Earliest' },
];

// ── Recent Detections Table ───────────────────────────────────────────────────
function RecentDetectionsTable({ records = [], T, isDark, user, navigate }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');
  const { isMobile, isTablet } = useResponsive();

  const SC = STRESS_CONFIG || DEFAULT_STRESS_CONFIG;

  const parseDateTime = (dateStr, timeStr) => {
    try { return new Date(`${dateStr} ${timeStr}`); }
    catch { return new Date(0); }
  };

  const filtered = records
    .filter(r => activeFilter === 'all' || r.stress === activeFilter)
    .sort((a, b) => {
      const da = parseDateTime(a.date, a.time);
      const db = parseDateTime(b.date, b.time);
      return activeSort === 'newest' ? db - da : da - db;
    });

  const tab = (isActive) => ({
    background: isActive ? T.tabActiveBg : T.tabBg,
    border: `1px solid ${isActive ? T.tabActiveBorder : T.tabBorder}`,
    color: isActive ? T.tabActiveText : T.tabText,
    borderRadius: 8,
    padding: isMobile ? '4px 10px' : '5px 13px',
    fontSize: isMobile ? 11 : 12,
    fontWeight: 600,
    fontFamily: F.sans,
    cursor: 'pointer',
    transition: 'all 0.18s',
    whiteSpace: 'nowrap',
  });

  const primaryBtn = {
    background: T.primaryBg,
    border: 'none',
    color: '#fff',
    boxShadow: `0 4px 14px ${T.accentShadow}`,
    cursor: 'pointer',
    fontFamily: F.sans,
    borderRadius: 10,
    padding: isMobile ? '5px 10px' : '6px 14px',
    fontSize: isMobile ? 11 : 12,
    fontWeight: 700,
  };

  const card = {
    background: T.cardBg,
    border: `1px solid ${T.cardBorder}`,
    boxShadow: T.cardShadow,
    borderRadius: 16,
    transition: 'all 0.3s',
  };

  const columns = [
    '#',
    'Cattle ID',
    ...(isMobile ? [] : ['Date']),
    'Time',
    'Stress',
    ...(user?.role === 'admin' && !isMobile ? ['Farmer'] : []),
  ];

  return (
    <div style={card}>
      {/* Header */}
      <div style={{ padding: isMobile ? '12px 14px 0 14px' : '16px 20px 0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{
            fontFamily: F.serif,
            fontSize: isMobile ? 15 : 18,
            color: T.title,
            display: 'flex', alignItems: 'center', gap: 8,
            margin: 0,
          }}>
            <FiClock size={isMobile ? 14 : 17} style={{ color: T.accent, flexShrink: 0 }} />
            Recent Detections
          </h3>
          <button style={primaryBtn} onClick={() => navigate('/history')}>
            {isMobile ? 'All' : 'View All Levels'}
          </button>
        </div>

        {/* Filters + Sort */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 8,
          paddingBottom: 12,
          borderBottom: `1px solid ${T.divider}`,
        }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
            {FILTERS.map(f => (
              <button key={f.key} style={tab(activeFilter === f.key)} onClick={() => setActiveFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {SORTS.map(s => (
              <button key={s.key} style={tab(activeSort === s.key)} onClick={() => setActiveSort(s.key)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.tableHead }}>
              {columns.map(h => (
                <th key={h} style={{
                  padding: isMobile ? '8px 10px' : '10px 16px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.tableHeadText,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${T.divider}`,
                  fontFamily: F.sans,
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((r, i) => {
                const sc = SC[r.stress] || DEFAULT_STRESS_CONFIG[r.stress] || DEFAULT_STRESS_CONFIG.Calm;
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: `1px solid ${T.tableBorder}`,
                      background: i % 2 === 1 ? T.tableStripBg : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <td style={{ padding: isMobile ? '10px 10px' : '12px 16px', color: T.muted, fontSize: 13, fontFamily: F.sans }}>{i + 1}</td>
                    <td style={{ padding: isMobile ? '10px 10px' : '12px 16px', fontWeight: 700, color: T.accent, fontSize: isMobile ? 13 : 14, fontFamily: F.sans }}>#{r.cattle_id}</td>
                    {!isMobile && <td style={{ padding: '12px 16px', color: T.body, fontSize: 13, fontFamily: F.sans }}>{r.date}</td>}
                    <td style={{ padding: isMobile ? '10px 10px' : '12px 16px', color: T.body, fontSize: 13, fontFamily: F.sans }}>{r.time}</td>
                    <td style={{ padding: isMobile ? '10px 10px' : '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: sc.bg,
                        color: sc.text,
                        padding: isMobile ? '3px 8px' : '4px 11px',
                        borderRadius: 20,
                        fontSize: isMobile ? 11 : 12,
                        fontWeight: 700,
                        fontFamily: F.sans,
                        whiteSpace: 'nowrap',
                      }}>
                        {r.stress}
                      </span>
                    </td>
                    {user?.role === 'admin' && !isMobile && (
                      <td style={{ padding: '12px 16px', color: T.muted, fontSize: 12, fontFamily: F.sans }}>{r.farmerName || '-'}</td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', color: T.muted, padding: '36px', fontFamily: F.sans }}>
                  No detections found.{' '}
                  <button
                    onClick={() => navigate('/detection')}
                    style={{ ...primaryBtn, display: 'inline-block' }}
                  >
                    Start Detection
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [data, setData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/weather/sri-lanka'),
    ]).then(([aRes, wRes]) => {
      setData(aRes.data.data);
      setWeather(wRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const card = {
    background: T.cardBg,
    border: `1px solid ${T.cardBorder}`,
    boxShadow: T.cardShadow,
    borderRadius: 16,
    transition: 'all 0.3s',
  };

  const primaryBtn = {
    background: T.primaryBg,
    border: 'none',
    color: '#fff',
    boxShadow: `0 4px 14px ${T.accentShadow}`,
    cursor: 'pointer',
    fontFamily: F.sans,
    borderRadius: 10,
    padding: isMobile ? '8px 14px' : '8px 18px',
    fontSize: isMobile ? 12 : 13,
    fontWeight: 700,
  };

  // Responsive padding
  const pagePadding = isMobile ? '16px 12px' : isTablet ? '22px 18px' : '28px 24px';

  // Stats grid: 2 cols on mobile, 4 on tablet+
  const statsGrid = isMobile
    ? 'repeat(2, 1fr)'
    : isTablet
      ? 'repeat(2, 1fr)'
      : 'repeat(4, 1fr)';

  // Charts grid: 1 col on mobile/tablet, 2 on desktop
  const chartsGrid = isDesktop ? '1fr 1fr' : '1fr';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, background: T.pageBg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12, animation: 'pulse 1s infinite' }}>🐄</div>
        <p style={{ color: T.muted, fontFamily: F.sans }}>Loading dashboard…</p>
      </div>
    </div>
  );

  const stressLabels = data?.stressDist?.map(s => s._id) || [];
  const stressCounts = data?.stressDist?.map(s => s.count) || [];
  const SC = STRESS_CONFIG || DEFAULT_STRESS_CONFIG;

  const pieData = {
    labels: stressLabels,
    datasets: [{
      data: stressCounts,
      backgroundColor: stressLabels.map(l => SC[l]?.color || '#ccc'),
      borderWidth: 2,
      borderColor: isDark ? '#1E1E1E' : '#fff',
    }],
  };

  const alertCount = data?.recentRecords?.filter(r => r.stress === 'High' || r.stress === 'Extreme').length || 0;

  return (
    <div style={{ background: T.pageBg, minHeight: '100vh', padding: pagePadding, fontFamily: F.sans, transition: 'all 0.3s' }}>

      {/* ── Page header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'center' : 'flex-start',
        marginBottom: isMobile ? 16 : 28,
        gap: 12,
        flexWrap: isMobile ? 'nowrap' : 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontFamily: F.serif,
            fontSize: isMobile ? 20 : isTablet ? 24 : 30,
            fontWeight: 900,
            color: T.title,
            letterSpacing: '-0.02em',
            marginBottom: isMobile ? 4 : 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <FontAwesomeIcon icon={faSeedling} style={{ fontSize: isMobile ? 18 : 24, color: T.accent, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isMobile ? `Hi, ${user?.name?.split(' ')[0]}` : `Welcome back to CattleSense, ${user?.name?.split(' ')[0]}`}
            </span>
          </h1>
          {!isMobile && (
            <p style={{ color: T.subtitle, fontSize: 14 }}>
              {user?.role === 'admin' ? 'System-wide overview' : 'Your farm overview'} · {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/detection')}
          style={{ ...primaryBtn, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
          {isMobile ? 'Detect' : 'New Detection'}
        </button>
      </div>

      {/* ── Weather ── */}
      {weather && (
        <div style={{
          background: T.weatherBg,
          borderRadius: 16,
          padding: isMobile ? '14px 16px' : '18px 24px',
          marginBottom: isMobile ? 14 : 24,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 12 : 16,
          color: '#fff',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <div style={{ fontSize: isMobile ? '1.8rem' : '2.4rem' }}>{weather.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, fontFamily: F.serif }}>
              {weather.temp}°C · {weather.city}
            </div>
            <div style={{ opacity: 0.85, fontSize: isMobile ? 12 : 13, marginTop: 2 }}>
              {weather.description} · Humidity {weather.humidity}%
            </div>
            {weather.heatStress === 'high' && (
              <div style={{ marginTop: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 6, padding: '3px 10px', fontSize: 11, display: 'inline-block' }}>
                ⚠️ High temperature may increase cattle stress
              </div>
            )}
          </div>
          {!isMobile && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Heat Stress Risk</div>
              <div style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: 16, fontFamily: F.serif }}>{weather.heatStress}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: statsGrid, gap: isMobile ? 10 : 16, marginBottom: isMobile ? 14 : 24 }}>
        {[
          { icon: faMagnifyingGlass, label: 'Total Detections', value: data?.total || 0, iconBg: T.statIconBg1, iconColor: '#22c55e', color: '#22c55e' },
          { icon: faFaceSmile, label: 'Calm Cattle', value: data?.stressDist?.find(s => s._id === 'Calm')?.count || 0, iconBg: T.statIconBg2, iconColor: '#22c55e', color: '#22c55e' },
          { icon: faTriangleExclamation, label: 'High/Extreme', value: data?.stressDist?.filter(s => ['High', 'Extreme'].includes(s._id)).reduce((a, b) => a + b.count, 0) || 0, iconBg: T.statIconBg3, iconColor: '#ef4444', color: '#ef4444' },
          user?.role === 'admin'
            ? { icon: faUsers, label: 'Active Farmers', value: '—', iconBg: T.statIconBg4, iconColor: '#2563eb', color: '#2563eb' }
            : { icon: faCow, label: 'Unique Cattle', value: data?.topCattle?.length || 0, iconBg: T.statIconBg4, iconColor: T.accent, color: T.accent },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: isMobile ? '14px' : '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14 }}>
              <div style={{
                width: isMobile ? 38 : 46,
                height: isMobile ? 38 : 46,
                borderRadius: 12,
                background: s.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FontAwesomeIcon icon={s.icon} style={{ fontSize: isMobile ? 16 : 20, color: s.iconColor }} />
              </div>
              <div>
                <div style={{ fontFamily: F.serif, fontSize: isMobile ? 20 : 26, fontWeight: 900, color: s.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: isMobile ? 11 : 12, color: T.muted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: chartsGrid, gap: isMobile ? 12 : 20, marginBottom: isMobile ? 14 : 24 }}>
        {/* Stress Distribution Pie */}
        <div style={card}>
          <div style={{ padding: isMobile ? '12px 14px' : '16px 20px', borderBottom: `1px solid ${T.divider}` }}>
            <h3 style={{ fontFamily: F.serif, fontSize: isMobile ? 15 : 18, fontWeight: 700, color: T.title, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <FontAwesomeIcon icon={faFile} style={{ fontSize: isMobile ? 14 : 16, color: T.accent }} />
              Stress Distribution
            </h3>
          </div>
          <div style={{ padding: isMobile ? '14px' : 20, display: 'flex', justifyContent: 'center' }}>
            {stressCounts.length > 0 ? (
              <div style={{ width: isMobile ? 200 : 260, height: isMobile ? 200 : 260 }}>
                <Doughnut
                  data={pieData}
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: T.body, font: { family: F.sans, size: isMobile ? 10 : 12 } },
                      },
                    },
                    cutout: '60%',
                  }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: T.muted, padding: '40px 0' }}>
                No data yet.<br /><small>Start detecting to see stats</small>
              </div>
            )}
          </div>
        </div>

        {/* Most Stressed Cattle */}
        <div style={card}>
          <div style={{ padding: isMobile ? '12px 14px' : '16px 20px', borderBottom: `1px solid ${T.divider}` }}>
            <h3 style={{ fontFamily: F.serif, fontSize: isMobile ? 15 : 18, fontWeight: 700, color: T.title, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <FontAwesomeIcon icon={faFire} style={{ fontSize: isMobile ? 14 : 16, color: '#ef4444' }} />
              Most Stressed Cattle
            </h3>
          </div>
          <div style={{ padding: isMobile ? '14px' : 20 }}>
            {data?.topCattle?.length > 0 ? data.topCattle.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${T.divider}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 800, color: T.muted, width: 22, fontSize: 13 }}>#{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: T.title, fontSize: isMobile ? 13 : 14 }}>Cattle #{c._id}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{c.totalChecks} checks</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.avgStress >= 4 ? '#ef4444' : c.avgStress >= 3 ? '#f97316' : '#22c55e' }}>
                  Avg {c.avgStress?.toFixed(1)}
                </div>
              </div>
            )) : <p style={{ color: T.muted, textAlign: 'center', padding: '28px 0' }}>No cattle data yet</p>}
          </div>
        </div>
      </div>

      {/* ── Recent Detections Table ── */}
      <RecentDetectionsTable
        records={data?.recentRecords || []}
        T={T}
        isDark={isDark}
        user={user}
        navigate={navigate}
      />

      {/* ── Alert banner ── */}
      {alertCount > 0 && (
        <div style={{
          marginTop: isMobile ? 12 : 20,
          background: T.alertBg,
          border: `1px solid ${T.alertBorder}`,
          borderRadius: 14,
          padding: isMobile ? '12px 14px' : '16px 20px',
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 10 : 14,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <FiAlertTriangle size={isMobile ? 20 : 24} style={{ color: T.alertText, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: T.alertText, fontFamily: F.serif, fontSize: isMobile ? 14 : 16 }}>
              {alertCount} recent High/Extreme stress alert(s)
            </strong>
            <p style={{ fontSize: 13, color: T.alertText, opacity: 0.8, marginTop: 3 }}>
              Immediate attention may be required for your cattle.
            </p>
          </div>
          <button
            onClick={() => navigate('/history')}
            style={{
              background: '#ef4444', border: 'none', color: '#fff',
              borderRadius: 9, padding: isMobile ? '7px 12px' : '8px 16px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: F.sans, flexShrink: 0,
            }}
          >
            View Now
          </button>
        </div>
      )}
    </div>
  );
}
