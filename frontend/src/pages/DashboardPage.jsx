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
import { FiClock, FiAlertTriangle } from 'react-icons/fi';

// ── Google Fonts ──────────────────────────────────────────────────────────────
const _fl = document.createElement('link');
_fl.rel = 'stylesheet';
_fl.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap';
if (!document.head.querySelector('[href*="DM+Serif"]')) document.head.appendChild(_fl);

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
    //tableHead: '#111111',
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
    // table filter tabs
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
    // table filter tabs
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

// ── Stress config (fallback if not imported) ──────────────────────────────────
const DEFAULT_STRESS_CONFIG = {
  Calm:     { bg: 'rgba(34,197,94,0.15)',   text: '#4ade80',  },
  Moderate: { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24',  },
  High:     { bg: 'rgba(249,115,22,0.15)',  text: '#fb923c',  },
  Extreme:  { bg: 'rgba(239,68,68,0.15)',   text: '#f87171',  },
};

// ── Filter tab definitions ────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all',      label: 'All Stress Levels' },
  { key: 'Calm',     label: 'Calm' },
  { key: 'Moderate', label: 'Moderate' },
  { key: 'High',     label: 'High Stress' },
  { key: 'Extreme',  label: 'Extreme' },
];

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Earliest' },
];

// ── Recent Detections Table Component ────────────────────────────────────────
function RecentDetectionsTable({ records = [], T, isDark, user, navigate }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort]     = useState('newest');

  const SC = STRESS_CONFIG || DEFAULT_STRESS_CONFIG;

  const parseDateTime = (dateStr, timeStr) => {
    try {
      return new Date(`${dateStr} ${timeStr}`);
    } catch {
      return new Date(0);
    }
  };

  const filtered = records
    .filter(r => activeFilter === 'all' || r.stress === activeFilter)
    .sort((a, b) => {
      const da = parseDateTime(a.date, a.time);
      const db = parseDateTime(b.date, b.time);
      return activeSort === 'newest' ? db - da : da - db;
    });

  // ── Shared style helpers ──
  const tab = (isActive) => ({
    background: isActive ? T.tabActiveBg : T.tabBg,
    border: `1px solid ${isActive ? T.tabActiveBorder : T.tabBorder}`,
    color: isActive ? T.tabActiveText : T.tabText,
    borderRadius: 8,
    padding: '5px 13px',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: F.sans,
    cursor: 'pointer',
    transition: 'all 0.18s',
    whiteSpace: 'nowrap',
  });

  const secondaryBtn = {
    background: T.secondaryBtn,
    border: `1px solid ${T.secondaryBorder}`,
    color: T.secondaryColor,
    cursor: 'pointer',
    fontFamily: F.sans,
    borderRadius: 10,
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 600,
  };

  const primaryBtn = {
    background: T.primaryBg,
    border: 'none',
    color: '#fff',
    boxShadow: `0 4px 14px ${T.accentShadow}`,
    cursor: 'pointer',
    fontFamily: F.sans,
    borderRadius: 10,
    padding: '6px 14px',
    fontSize: 12,
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
    'Date',
    'Time',
    'Stress Level',
    ...(user?.role === 'admin' ? ['Farmer'] : []),
  ];

  return (
    <div style={card}>
      {/* ── Card Header ── */}
      <div style={{ padding: '16px 20px 0 20px' }}>
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontFamily: F.serif, fontSize: 18, color: T.title, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <FiClock size={17} style={{ color: T.accent, flexShrink: 0 }} />
            Recent Detections
          </h3>
          
          <button style={{ ...primaryBtn, display: 'flex', alignItems: 'center', gap: 7 }} onClick={() => navigate('/history')}>View All Levels</button>
        </div>

        {/* Filters + Sort row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingBottom: 14, borderBottom: `1px solid ${T.divider}` }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                style={tab(activeFilter === f.key)}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort buttons */}
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            {SORTS.map(s => (
              <button
                key={s.key}
                style={tab(activeSort === s.key)}
                onClick={() => setActiveSort(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.tableHead }}>
              {columns.map(h => (
                <th key={h} style={{
                  padding: '10px 16px',
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
                    {/* # */}
                    <td style={{ padding: '12px 16px', color: T.muted, fontSize: 13, fontFamily: F.sans }}>
                      {i + 1}
                    </td>

                    {/* Cattle ID */}
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: T.accent, fontSize: 14, fontFamily: F.sans }}>
                      #{r.cattle_id}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '12px 16px', color: T.body, fontSize: 13, fontFamily: F.sans }}>
                      {r.date}
                    </td>

                    {/* Time */}
                    <td style={{ padding: '12px 16px', color: T.body, fontSize: 13, fontFamily: F.sans }}>
                      {r.time}
                    </td>

                    {/* Stress Level pill */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: sc.bg,
                        color: sc.text,
                        padding: '4px 11px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: F.sans,
                      }}>
                        {/* Dot indicator */}
                        
                        {r.stress}
                      </span>
                    </td>

                    {/* Farmer (admin only) */}
                    {user?.role === 'admin' && (
                      <td style={{ padding: '12px 16px', color: T.muted, fontSize: 12, fontFamily: F.sans }}>
                        {r.farmerName || '-'}
                      </td>
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

// ── Main Dashboard Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
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
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: 700,
  };

  const secondaryBtn = {
    background: T.secondaryBtn,
    border: `1px solid ${T.secondaryBorder}`,
    color: T.secondaryColor,
    cursor: 'pointer',
    fontFamily: F.sans,
    borderRadius: 10,
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 600,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, background: T.pageBg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12, animation: 'pulse 1s infinite' }}>🐄</div>
        <p style={{ color: T.muted, fontFamily: F.sans }}>Loading dashboard…</p>
      </div>
    </div>
  );

  const stressLabels  = data?.stressDist?.map(s => s._id) || [];
  const stressCounts  = data?.stressDist?.map(s => s.count) || [];
  const SC            = STRESS_CONFIG || DEFAULT_STRESS_CONFIG;

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
    <div style={{ background: T.pageBg, minHeight: '100vh', padding: '28px 24px', fontFamily: F.sans, transition: 'all 0.3s' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 30, fontWeight: 900, color: T.title, letterSpacing: '-0.02em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FontAwesomeIcon icon={faSeedling} style={{ fontSize: 24, color: T.accent }} />
            Welcome back to CattleSense, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ color: T.subtitle, fontSize: 14 }}>
            {user?.role === 'admin' ? 'System-wide overview' : 'Your farm overview'} · {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
        
          <button onClick={() => navigate('/detection')} style={{ ...primaryBtn, display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
            New Detection
          </button>
        </div>
      </div>

      {/* ── Weather ── */}
      {weather && (
        <div style={{ background: T.weatherBg, borderRadius: 16, padding: '18px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, color: '#fff' }}>
          <div style={{ fontSize: '2.4rem' }}>{weather.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: F.serif }}>{weather.temp}°C · {weather.city}</div>
            <div style={{ opacity: 0.85, fontSize: 13, marginTop: 2 }}>{weather.description} · Humidity {weather.humidity}%</div>
            {weather.heatStress === 'high' && (
              <div style={{ marginTop: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 6, padding: '3px 10px', fontSize: 12, display: 'inline-block' }}>
                ⚠️ High temperature may increase cattle stress
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Heat Stress Risk</div>
            <div style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: 16, fontFamily: F.serif }}>{weather.heatStress}</div>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: faMagnifyingGlass, label: 'Total Detections',    value: data?.total || 0,                                                                                  iconBg: T.statIconBg1, iconColor: '#22c55e', color: '#22c55e' },
          { icon: faFaceSmile,       label: 'Calm Cattle',         value: data?.stressDist?.find(s => s._id === 'Calm')?.count || 0,                                         iconBg: T.statIconBg2, iconColor: '#22c55e', color: '#22c55e' },
          { icon: faTriangleExclamation, label: 'High/Extreme Alerts', value: data?.stressDist?.filter(s => ['High','Extreme'].includes(s._id)).reduce((a,b) => a + b.count, 0) || 0, iconBg: T.statIconBg3, iconColor: '#ef4444', color: '#ef4444' },
          user?.role === 'admin'
            ? { icon: faUsers, label: 'Active Farmers', value: '—',                         iconBg: T.statIconBg4, iconColor: '#2563eb', color: '#2563eb' }
            : { icon: faCow,   label: 'Unique Cattle',  value: data?.topCattle?.length || 0, iconBg: T.statIconBg4, iconColor: T.accent,  color: T.accent  },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FontAwesomeIcon icon={s.icon} style={{ fontSize: 20, color: s.iconColor }} />
              </div>
              <div>
                <div style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Stress Distribution Pie */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.divider}` }}>
            <h3 style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 700, color: T.title, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <FontAwesomeIcon icon={faFile} style={{ fontSize: 16, color: T.accent }} />
              Stress Distribution
            </h3>
          </div>
          <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
            {stressCounts.length > 0
              ? (
                <div style={{ width: 260, height: 260 }}>
                  <Doughnut
                    data={pieData}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: T.body, font: { family: F.sans, size: 12 } },
                        },
                      },
                      cutout: '60%',
                    }}
                  />
                </div>
              )
              : (
                <div style={{ textAlign: 'center', color: T.muted, padding: '40px 0' }}>
                  No data yet.<br /><small>Start detecting to see stats</small>
                </div>
              )}
          </div>
        </div>

        {/* Most Stressed Cattle */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.divider}` }}>
            <h3 style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 700, color: T.title, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <FontAwesomeIcon icon={faFire} style={{ fontSize: 16, color: '#ef4444' }} />
              Most Stressed Cattle
            </h3>
          </div>
          <div style={{ padding: 20 }}>
            {data?.topCattle?.length > 0 ? data.topCattle.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${T.divider}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 800, color: T.muted, width: 22, fontSize: 13 }}>#{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: T.title, fontSize: 14 }}>Cattle #{c._id}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{c.totalChecks} checks</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.avgStress >= 4 ? '#ef4444' : c.avgStress >= 3 ? '#f97316' : '#22c55e' }}>
                  Avg Level {c.avgStress?.toFixed(1)}
                </div>
              </div>
            )) : <p style={{ color: T.muted, textAlign: 'center', padding: '28px 0' }}>No cattle data yet</p>}
          </div>
        </div>
      </div>

      {/* ── Recent Detections Table (with filter tabs) ── */}
      <RecentDetectionsTable
        records={data?.recentRecords || []}
        T={T}
        isDark={isDark}
        user={user}
        navigate={navigate}
      />

      {/* ── Alert banner ── */}
      {alertCount > 0 && (
        <div style={{ marginTop: 20, background: T.alertBg, border: `1px solid ${T.alertBorder}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <FiAlertTriangle size={24} style={{ color: T.alertText }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: T.alertText, fontFamily: F.serif, fontSize: 16 }}>{alertCount} recent High/Extreme stress alert(s)</strong>
            <p style={{ fontSize: 13, color: T.alertText, opacity: 0.8, marginTop: 3 }}>Immediate attention may be required for your cattle.</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            style={{ background: '#ef4444', border: 'none', color: '#fff', borderRadius: 9, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F.sans }}
          >
            View Now
          </button>
        </div>
      )}
    </div>
  );
}