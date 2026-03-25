import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faCrown } from '@fortawesome/free-solid-svg-icons';
import {
  FiDownload, FiFileText, FiInfo,
  FiCalendar, FiTag, FiBarChart2,
  FiPercent, FiUser, FiFilter,
} from 'react-icons/fi';

// ── Load Google Fonts ─────────────────────────────────────────────────────────
const _fl = document.createElement('link');
_fl.rel = 'stylesheet';
_fl.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap';
if (!document.head.querySelector('[href*="DM+Serif"]')) document.head.appendChild(_fl);

// ── Theme tokens ──────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    pageBg:          '#000000',
    cardBg:          '#1E1E1E',
    cardBorder:      '#333333',
    cardShadow:      '0 8px 32px rgba(0,0,0,0.5)',
    title:           '#E1E1E1',
    subtitle:        '#A0A0A0',
    body:            '#A0A0A0',
    muted:           '#475569',
    accent:          '#2563eb',
    accentEnd:       '#1e40af',
    accentShadow:    'rgba(14,165,233,0.4)',
    primaryBg:       'linear-gradient(135deg, #2563eb, #1e40af)',
    inputBg:         '#111111',
    inputBorder:     '#333333',
    inputColor:      '#E1E1E1',
    divider:         'rgba(255,255,255,0.06)',
    listItemBg:      '#111111',
    listItemBorder:  '#222222',
    adminBoxBg:      'rgba(34,197,94,0.08)',
    adminBoxBorder:  'rgba(34,197,94,0.25)',
    adminTitle:      '#22c55e',
    adminText:       '#86efac',
    infoIconBg:      'rgba(37,99,235,0.12)',
    toggleBg:        'rgba(255,255,255,0.08)',
    toggleColor:     '#A0A0A0',
    toggleHover:     'rgba(255,255,255,0.14)',
    secondaryBtn:    'rgba(255,255,255,0.08)',
    secondaryBorder: 'rgba(255,255,255,0.14)',
    secondaryColor:  '#A0A0A0',
  },
  light: {
    pageBg:          '#f8fafc',
    cardBg:          '#ffffff',
    cardBorder:      'rgba(0,0,0,0.08)',
    cardShadow:      '0 4px 20px rgba(0,0,0,0.06)',
    title:           '#1e293b',
    subtitle:        '#64748b',
    body:            '#64748b',
    muted:           '#94a3b8',
    accent:          '#10b981',
    accentEnd:       '#059669',
    accentShadow:    'rgba(0,204,102,0.35)',
    primaryBg:       'linear-gradient(135deg, #10b981, #059669)',
    inputBg:         '#f8fafc',
    inputBorder:     'rgba(0,0,0,0.12)',
    inputColor:      '#1e293b',
    divider:         'rgba(0,0,0,0.07)',
    listItemBg:      '#f8fafc',
    listItemBorder:  'rgba(0,0,0,0.06)',
    adminBoxBg:      '#dcfce7',
    adminBoxBorder:  '#86efac',
    adminTitle:      '#15803d',
    adminText:       '#166534',
    infoIconBg:      'rgba(16,185,129,0.1)',
    toggleBg:        'rgba(0,0,0,0.05)',
    toggleColor:     '#64748b',
    toggleHover:     'rgba(0,0,0,0.1)',
    secondaryBtn:    'rgba(0,0,0,0.04)',
    secondaryBorder: 'rgba(0,0,0,0.12)',
    secondaryColor:  '#64748b',
  },
};

const F = {
  serif: "'DM Serif Display', Georgia, serif",
  sans:  "'DM Sans', -apple-system, sans-serif",
};

// ── Report info items ─────────────────────────────────────────────────────────
const INFO_ITEMS = [
  { icon: <FiTag     size={15} />, text: 'All cattle stress detection records'       },
  { icon: <FiCalendar size={15} />, text: 'Date, time, cattle ID for each detection' },
  { icon: <FiBarChart2 size={15} />, text: 'Stress level with color coding'           },
 
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [month,    setMonth]    = useState('');
  const [cattleId, setCattleId] = useState('');
  const [loading,  setLoading]  = useState(false);

  const [date, setDate] = useState('');

  // ── Theme ─────────────────────────────────────────────────────────────────
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
  // ─────────────────────────────────────────────────────────────────────────

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (month)    params.append('month',     month);
      if (cattleId) params.append('cattle_id', cattleId);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reports/pdf?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Report generation failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `cattle-stress-report-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF report downloaded!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const card      = { background: T.cardBg, border: `1px solid ${T.cardBorder}`, boxShadow: T.cardShadow, borderRadius: 16, transition: 'all 0.3s' };
  const cardHd    = { padding: '15px 20px', borderBottom: `1px solid ${T.divider}` };
  const inputSty  = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1px solid ${T.inputBorder}`,
    background: T.inputBg, color: T.inputColor,
    fontSize: 14, fontFamily: F.sans, outline: 'none',
    transition: 'border 0.2s', boxSizing: 'border-box',
  };
  const labelSty  = { display: 'block', fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 6, letterSpacing: '0.06em', fontFamily: F.sans };
  const primaryBtn = {
    background: T.primaryBg, border: 'none', color: '#fff',
    boxShadow: `0 4px 14px ${T.accentShadow}`,
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: F.sans, borderRadius: 10, fontWeight: 700,
    opacity: loading ? 0.7 : 1, transition: 'all 0.3s',
  };
  const secBtn = {
    background: T.secondaryBtn, border: `1px solid ${T.secondaryBorder}`,
    color: T.secondaryColor, cursor: 'pointer',
    fontFamily: F.sans, borderRadius: 10, fontWeight: 500,
  };

  return (
    <div style={{ background: T.pageBg, minHeight: '100vh', padding: '28px 24px', fontFamily: F.sans, transition: 'all 0.3s' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 30, color: T.title, letterSpacing: '-0.02em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FontAwesomeIcon icon={faFilePdf} style={{ fontSize: 26, color: T.accent }} />
            Reports
          </h1>
          <p style={{ color: T.subtitle, fontSize: 14, fontFamily: F.sans }}>
            Generate and export cattle stress detection reports
          </p>
        </div>
        
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Export card ── */}
        <div style={card}>
          <div style={cardHd}>
            <h3 style={{ fontFamily: F.serif, fontSize: 18, color: T.title, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiDownload size={17} style={{ color: T.accent, flexShrink: 0 }} />
              Export PDF Report
            </h3>
          </div>
          <div style={{ padding: 20 }}>

            {/* Month filter */}
            <div style={{ marginBottom: 16 }}>
  <label style={labelSty}>
    FILTER BY DATE (OPTIONAL)
  </label>

  <div style={{ position: 'relative' }}>
    <div
      style={{
        position: 'absolute',
        left: 13,
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none'
      }}
    >
      <FiCalendar size={14} style={{ color: T.muted }} />
    </div>

    <input
      type="date"
      value={date}
      onChange={e => setDate(e.target.value)}
      style={{ ...inputSty, paddingLeft: 36 }}
      onFocus={e => (e.target.style.borderColor = T.accent)}
      onBlur={e => (e.target.style.borderColor = T.inputBorder)}
    />
  </div>

  <small
    style={{
      color: T.muted,
      fontSize: 12,
      marginTop: 4,
      display: 'block',
      fontFamily: F.sans
    }}
  >
    Leave blank to include all records
  </small>
</div>

            {/* Cattle ID filter */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelSty}>
                FILTER BY CATTLE ID (OPTIONAL)
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <FiFilter size={14} style={{ color: T.muted }} />
                </div>
                <input
                  placeholder="e.g. 001"
                  value={cattleId}
                  onChange={e => setCattleId(e.target.value)}
                  style={{ ...inputSty, paddingLeft: 36 }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e  => e.target.style.borderColor = T.inputBorder}
                />
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={downloadPDF}
              disabled={loading}
              style={{
                ...primaryBtn,
                width: '100%', padding: '13px', fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              }}
            >
              {loading
                ? <><FiDownload size={16} /> Generating…</>
                : <><FontAwesomeIcon icon={faFilePdf} style={{ fontSize: 16 }} /> Download PDF Report</>
              }
            </button>
          </div>
        </div>

        {/* ── Info card ── */}
        <div style={card}>
          <div style={cardHd}>
            <h3 style={{ fontFamily: F.serif, fontSize: 18, color: T.title, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiInfo size={17} style={{ color: T.accent, flexShrink: 0 }} />
              Report Information
            </h3>
          </div>
          <div style={{ padding: 20 }}>
            <p style={{ color: T.muted, fontSize: 14, marginBottom: 16, fontFamily: F.sans }}>
              The PDF report includes:
            </p>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {INFO_ITEMS.map((item, i) => (
                <li key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'center',
                  padding: '10px 14px',
                  background: T.listItemBg,
                  border: `1px solid ${T.listItemBorder}`,
                  borderRadius: 10, fontSize: 13, fontFamily: F.sans,
                  color: T.body,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: T.infoIconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: T.accent, flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  {item.text}
                </li>
              ))}

              {/* Role-specific item */}
              <li style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: '10px 14px',
                background: T.listItemBg,
                border: `1px solid ${T.listItemBorder}`,
                borderRadius: 10, fontSize: 13, fontFamily: F.sans,
                color: T.body,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: T.infoIconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.accent, flexShrink: 0,
                }}>
                  <FiUser size={15} />
                </div>
                {user?.role === 'admin' ? 'Farmer names and farm info' : 'Your farm records only'}
              </li>

              <li style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: '10px 14px',
                background: T.listItemBg,
                border: `1px solid ${T.listItemBorder}`,
                borderRadius: 10, fontSize: 13, fontFamily: F.sans,
                color: T.body,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: T.infoIconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.accent, flexShrink: 0,
                }}>
                  <FiFileText size={15} />
                </div>
                Filtered by month or cattle ID if specified
              </li>
            </ul>

            {/* Admin badge */}
            {user?.role === 'admin' && (
              <div style={{
                marginTop: 18,
                background: T.adminBoxBg,
                border: `1px solid ${T.adminBoxBorder}`,
                borderRadius: 10, padding: '14px 16px',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <FontAwesomeIcon icon={faCrown} style={{ fontSize: 16, color: T.adminTitle, marginTop: 1, flexShrink: 0 }} />
                <div>
                  <strong style={{ color: T.adminTitle, fontSize: 13, fontFamily: F.sans }}>Admin Mode</strong>
                  <p style={{ color: T.adminText, fontSize: 12, marginTop: 4, fontFamily: F.sans }}>
                    You can view all farmers' records in this report.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}