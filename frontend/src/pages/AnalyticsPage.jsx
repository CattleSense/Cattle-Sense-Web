import { useEffect, useState } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart, ArcElement, BarElement, LineElement,
  CategoryScale, LinearScale, PointElement,
  Tooltip, Legend, Filler,
} from 'chart.js';
import api from '../utils/api';
import { STRESS_CONFIG } from '../utils/stress';
import { useAuth } from '../context/AuthContext';
Chart.register(ArcElement, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);
import {
  FiSearch, FiSmile, FiMeh, FiAlertOctagon, FiBarChart2,
  FiPieChart, FiCalendar, FiTrendingUp, FiAward,
} from 'react-icons/fi';

// ── Google Fonts ──────────────────────────────────────────────────────────────
const _fl = document.createElement('link');
_fl.rel = 'stylesheet';
_fl.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Inter:wght@400;500;600;700;800&display=swap';
if (!document.head.querySelector('[href*="Playfair"]')) document.head.appendChild(_fl);

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
    accentShadow: 'rgba(14,165,233,0.4)',
    primaryBg: 'linear-gradient(135deg, #2563eb, #1e40af)',
    divider: 'rgba(255,255,255,0.06)',
    chartGrid: 'rgba(255,255,255,0.06)',
    chartTick: '#A0A0A0',
    barColor: 'rgba(34,197,94,0.7)',
    barBorder: '#22c55e',
    lineColor: '#f97316',
    lineFill: 'rgba(249,115,22,0.12)',
    statIconBg1: 'rgba(34,197,94,0.15)',
    statIconBg2: 'rgba(34,197,94,0.15)',
    statIconBg3: 'rgba(234,179,8,0.15)',
    statIconBg4: 'rgba(239,68,68,0.15)',
    rankBg1: 'rgba(251,191,36,0.2)',
    rankBg2: 'rgba(148,163,184,0.15)',
    rankBg3: 'rgba(180,83,9,0.15)',
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
    accentShadow: 'rgba(0,204,102,0.35)',
    primaryBg: 'linear-gradient(135deg, #10b981, #059669)',
    divider: 'rgba(0,0,0,0.07)',
    chartGrid: 'rgba(0,0,0,0.05)',
    chartTick: '#94a3b8',
    barColor: 'rgba(34,197,94,0.65)',
    barBorder: '#22c55e',
    lineColor: '#f97316',
    lineFill: 'rgba(249,115,22,0.08)',
    statIconBg1: 'rgba(34,197,94,0.12)',
    statIconBg2: 'rgba(34,197,94,0.12)',
    statIconBg3: 'rgba(234,179,8,0.1)',
    statIconBg4: 'rgba(239,68,68,0.1)',
    rankBg1: 'rgba(251,191,36,0.15)',
    rankBg2: 'rgba(148,163,184,0.1)',
    rankBg3: 'rgba(180,83,9,0.1)',
  },
};

const F = {
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Inter', -apple-system, sans-serif",
};

// ── Reusable card header ──────────────────────────────────────────────────────
function CardHeader({ icon, title, T, isMobile }) {
  return (
    <div style={{
      padding: isMobile ? '12px 14px' : '16px 20px',
      borderBottom: `1px solid ${T.divider}`,
    }}>
      <h3 style={{
        fontFamily: F.serif,
        fontSize: isMobile ? 15 : 18,
        fontWeight: 700,
        color: T.title,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        margin: 0,
      }}>
        {icon}
        {title}
      </h3>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [data, setData] = useState(null);
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
    api.get('/analytics/dashboard')
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  // ── Responsive layout ─────────────────────────────────────────────────────
  const pagePadding = isMobile ? '16px 12px' : isTablet ? '22px 18px' : '28px 24px';
  const cardGap = isMobile ? 10 : 16;
  const chartGap = isMobile ? 12 : 20;
  // Stats: 2-col on mobile, 4-col on tablet+
  const statsGrid = isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';
  // Row 1 charts: 1-col on mobile, 2-col on tablet & desktop
  const charts1Grid = isMobile ? '1fr' : '1fr 1fr';
  // Row 2 charts: 1-col on mobile/tablet, 2:1 split on desktop
  const charts2Grid = isDesktop ? '2fr 1fr' : '1fr';

  // ── Card base ─────────────────────────────────────────────────────────────
  const card = {
    background: T.cardBg,
    border: `1px solid ${T.cardBorder}`,
    boxShadow: T.cardShadow,
    borderRadius: 16,
    transition: 'all 0.3s',
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, background: T.pageBg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
        <p style={{ color: T.muted, fontFamily: F.sans }}>Loading analytics…</p>
      </div>
    </div>
  );

  // ── Chart datasets ────────────────────────────────────────────────────────
  const stressLabels = data?.stressDist?.map(s => s._id) || [];
  const stressCounts = data?.stressDist?.map(s => s.count) || [];
  const months = data?.monthlyCounts?.map(m => m._id) || [];
  const monthlyCnt = data?.monthlyCounts?.map(m => m.count) || [];
  const monthlyAvg = data?.monthlyCounts?.map(m => m.avgStressLevel?.toFixed(2)) || [];

  const pieData = {
    labels: stressLabels,
    datasets: [{
      data: stressCounts,
      backgroundColor: stressLabels.map(l => STRESS_CONFIG[l]?.color || '#ccc'),
      borderWidth: 2,
      borderColor: isDark ? '#1E1E1E' : '#fff',
    }],
  };

  const barData = {
    labels: months,
    datasets: [{
      label: 'Detections',
      data: monthlyCnt,
      backgroundColor: T.barColor,
      borderColor: T.barBorder,
      borderWidth: 2,
      borderRadius: 7,
    }],
  };

  const lineData = {
    labels: months,
    datasets: [{
      label: 'Avg Stress Level',
      data: monthlyAvg,
      borderColor: T.lineColor,
      backgroundColor: T.lineFill,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: T.lineColor,
      pointRadius: isMobile ? 3 : 4,
    }],
  };

  const chartOpts = (yLabel) => ({
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: T.chartGrid },
        ticks: {
          color: T.chartTick,
          font: { family: F.sans, size: isMobile ? 9 : 11 },
          maxTicksLimit: isMobile ? 4 : undefined,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: T.chartGrid },
        ticks: {
          color: T.chartTick,
          font: { family: F.sans, size: isMobile ? 9 : 11 },
          callback: yLabel,
        },
      },
    },
  });

  return (
    <div style={{
      background: T.pageBg,
      minHeight: '100vh',
      padding: pagePadding,
      fontFamily: F.sans,
      transition: 'all 0.3s',
    }}>

      {/* ── Page header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: isMobile ? 16 : 28,
      }}>
        <div>
          <h1 style={{
            fontFamily: F.serif,
            fontSize: isMobile ? 22 : isTablet ? 25 : 28,
            fontWeight: 900,
            color: T.title,
            letterSpacing: '-0.02em',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <FiBarChart2
              size={isMobile ? 20 : 24}
              style={{ color: T.accent, flexShrink: 0 }}
            />
            Analytics
          </h1>
          <p style={{ color: T.subtitle, fontSize: isMobile ? 13 : 14 }}>
            {user?.role === 'admin' ? 'System-wide' : 'Your farm'} analytics and stress trends
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: statsGrid,
        gap: cardGap,
        marginBottom: isMobile ? 14 : 24,
      }}>
        {[
          {
            icon: <FiSearch size={isMobile ? 18 : 20} />,
            label: 'Total Detections',
            value: data?.total || 0,
            iconBg: T.statIconBg1,
            iconColor: '#22c55e',
            color: '#22c55e',
          },
          {
            icon: <FiSmile size={isMobile ? 18 : 20} />,
            label: 'Calm',
            value: data?.stressDist?.find(s => s._id === 'Calm')?.count || 0,
            iconBg: T.statIconBg2,
            iconColor: '#22c55e',
            color: '#22c55e',
          },
          {
            icon: <FiMeh size={isMobile ? 18 : 20} />,
            label: 'Moderate',
            value: data?.stressDist?.find(s => s._id === 'Moderate')?.count || 0,
            iconBg: T.statIconBg3,
            iconColor: '#eab308',
            color: '#eab308',
          },
          {
            icon: <FiAlertOctagon size={isMobile ? 18 : 20} />,
            label: 'Extreme',
            value: data?.stressDist?.find(s => s._id === 'Extreme')?.count || 0,
            iconBg: T.statIconBg4,
            iconColor: '#ef4444',
            color: '#ef4444',
          },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: isMobile ? '14px' : '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14 }}>
              {/* Icon bubble */}
              <div style={{
                width: isMobile ? 38 : 46,
                height: isMobile ? 38 : 46,
                borderRadius: 12,
                background: s.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: s.iconColor,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{
                  fontFamily: F.serif,
                  fontSize: isMobile ? 22 : 26,
                  fontWeight: 900,
                  color: s.color,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: isMobile ? 11 : 12, color: T.muted, marginTop: 4, fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row 1: Pie  +  Bar ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: charts1Grid,
        gap: chartGap,
        marginBottom: chartGap,
      }}>

        {/* Stress Distribution Doughnut */}
        <div style={card}>
          <CardHeader
            icon={<FiPieChart size={isMobile ? 14 : 17} style={{ color: T.accent, flexShrink: 0 }} />}
            title="Stress Distribution"
            T={T}
            isMobile={isMobile}
          />
          <div style={{
            padding: isMobile ? '14px' : 20,
            display: 'flex',
            justifyContent: 'center',
          }}>
            {stressCounts.length > 0 ? (
              <div style={{ width: isMobile ? 220 : 280, height: isMobile ? 220 : 280 }}>
                <Doughnut
                  data={pieData}
                  options={{
                    plugins: {
                      legend: {
                        // Legend below chart on mobile to avoid cramped horizontal layout
                        position: isMobile ? 'bottom' : 'right',
                        labels: {
                          color: T.body,
                          font: { family: F.sans, size: isMobile ? 10 : 12 },
                          boxWidth: isMobile ? 10 : 14,
                          padding: isMobile ? 8 : 12,
                        },
                      },
                    },
                    cutout: '55%',
                  }}
                />
              </div>
            ) : (
              <p style={{ color: T.muted, padding: '44px 0', textAlign: 'center' }}>No data yet</p>
            )}
          </div>
        </div>

        {/* Monthly Detections Bar */}
        <div style={card}>
          <CardHeader
            icon={<FiCalendar size={isMobile ? 14 : 17} style={{ color: T.accent, flexShrink: 0 }} />}
            title="Monthly Detections"
            T={T}
            isMobile={isMobile}
          />
          <div style={{ padding: isMobile ? '14px' : 20 }}>
            {months.length > 0
              ? <Bar data={barData} options={chartOpts(undefined)} />
              : <p style={{ color: T.muted, padding: '44px 0', textAlign: 'center' }}>No monthly data yet</p>}
          </div>
        </div>
      </div>

      {/* ── Charts row 2: Line trend  +  Top cattle ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: charts2Grid,
        gap: chartGap,
      }}>

        {/* Average Stress Trend Line */}
        <div style={card}>
          <CardHeader
            icon={<FiTrendingUp size={isMobile ? 14 : 17} style={{ color: T.accent, flexShrink: 0 }} />}
            title="Average Stress Trend"
            T={T}
            isMobile={isMobile}
          />
          <div style={{ padding: isMobile ? '14px' : 20 }}>
            {months.length > 0
              ? <Line data={lineData} options={chartOpts(v => ['', 'Calm', 'Mild', 'Mod.', 'High', 'Ext.'][v] || v)} />
              : <p style={{ color: T.muted, padding: '44px 0', textAlign: 'center' }}>No trend data yet</p>}
          </div>
        </div>

        {/* Most Stressed Cattle */}
        <div style={card}>
          <CardHeader
            icon={<FiAward size={isMobile ? 14 : 17} style={{ color: '#ef4444', flexShrink: 0 }} />}
            title="Most Stressed Cattle"
            T={T}
            isMobile={isMobile}
          />
          <div style={{ padding: isMobile ? '14px' : 20 }}>
            {data?.topCattle?.length > 0 ? (
              data.topCattle.map((c, i) => {
                const level = Math.round(c.avgStress);
                const label = ['', 'Calm', 'Mild', 'Moderate', 'High', 'Extreme'][level] || 'Unknown';
                const cfg = STRESS_CONFIG[label];
                const rankBg = [T.rankBg1, T.rankBg2, T.rankBg3][i] || T.rankBg3;
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 0',
                    borderBottom: `1px solid ${T.divider}`,
                  }}>
                    {/* Rank bubble */}
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: rankBg,
                      color: T.title,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>

                    {/* Cattle info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: isMobile ? 13 : 14,
                        color: T.title,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        Cattle #{c._id}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted }}>
                        {c.totalChecks} detections
                      </div>
                    </div>

                    {/* Stress level badge */}
                    <span style={{
                      background: cfg?.bg,
                      color: cfg?.text,
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {label}
                    </span>
                  </div>
                );
              })
            ) : (
              <p style={{ color: T.muted, textAlign: 'center', padding: '28px 0' }}>No cattle data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
