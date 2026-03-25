import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { STRESS_CONFIG } from '../utils/stress';
import toast from 'react-hot-toast';
import { FiClipboard, FiSearch, FiDatabase, FiInbox, FiTrash2, FiHeart    } from 'react-icons/fi';

const _fl = document.createElement('link');
_fl.rel = 'stylesheet';
_fl.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Inter:wght@400;500;600;700;800&display=swap';
if (!document.head.querySelector('[href*="Playfair"]')) document.head.appendChild(_fl);

const THEMES = {
  dark: {
    pageBg:'#000000', cardBg:'#1E1E1E', cardBorder:'#333333', cardShadow:'0 8px 32px rgba(0,0,0,0.5)',
    title:'#E1E1E1', subtitle:'#A0A0A0', body:'#A0A0A0', muted:'#475569',
    accent:'#2563eb', accentShadow:'rgba(14,165,233,0.4)',
    primaryBg:'linear-gradient(135deg, #2563eb, #1e40af)',
    inputBg:'#111111', inputBorder:'#333333', inputColor:'#E1E1E1',
    divider:'rgba(255,255,255,0.06)', tableHead:'#111111', tableHeadText:'#A0A0A0',
    tableRowHover:'rgba(255,255,255,0.04)', tableBorder:'rgba(255,255,255,0.06)', tableRowSel:'rgba(37,99,235,0.12)',
    toggleBg:'rgba(255,255,255,0.08)', toggleColor:'#A0A0A0', toggleHover:'rgba(255,255,255,0.14)',
    secondaryBtn:'rgba(255,255,255,0.08)', secondaryBorder:'rgba(255,255,255,0.14)', secondaryColor:'#A0A0A0',
    detailBg:'#111111',
    modalOverlay:'rgba(0,0,0,0.75)',
    modalBg:'#1E1E1E',
    modalBorder:'#333333',
    modalIconBg:'rgba(239,68,68,0.12)',
    modalIconBorder:'rgba(239,68,68,0.25)',
    modalCancelBg:'rgba(255,255,255,0.06)',
    modalCancelBorder:'rgba(255,255,255,0.12)',
    modalCancelColor:'#A0A0A0',
    modalCancelHover:'rgba(255,255,255,0.1)',
    modalShadow:'0 24px 64px rgba(0,0,0,0.6)',
  },
  light: {
    pageBg:'#f8fafc', cardBg:'#ffffff', cardBorder:'rgba(0,0,0,0.08)', cardShadow:'0 4px 20px rgba(0,0,0,0.06)',
    title:'#1e293b', subtitle:'#64748b', body:'#64748b', muted:'#94a3b8',
    accent:'#10b981', accentShadow:'rgba(0,204,102,0.35)',
    primaryBg:'linear-gradient(135deg, #10b981, #059669)',
    inputBg:'#f8fafc', inputBorder:'rgba(0,0,0,0.12)', inputColor:'#1e293b',
    divider:'rgba(0,0,0,0.07)', tableHead:'#f8fafc', tableHeadText:'#64748b',
    tableRowHover:'rgba(0,0,0,0.02)', tableBorder:'rgba(0,0,0,0.06)', tableRowSel:'rgba(16,185,129,0.08)',
    toggleBg:'rgba(0,0,0,0.05)', toggleColor:'#64748b', toggleHover:'rgba(0,0,0,0.1)',
    secondaryBtn:'rgba(0,0,0,0.04)', secondaryBorder:'rgba(0,0,0,0.12)', secondaryColor:'#64748b',
    detailBg:'#f8fafc',
    modalOverlay:'rgba(15,23,42,0.55)',
    modalBg:'#ffffff',
    modalBorder:'rgba(0,0,0,0.08)',
    modalIconBg:'rgba(239,68,68,0.08)',
    modalIconBorder:'rgba(239,68,68,0.18)',
    modalCancelBg:'rgba(0,0,0,0.04)',
    modalCancelBorder:'rgba(0,0,0,0.10)',
    modalCancelColor:'#64748b',
    modalCancelHover:'rgba(0,0,0,0.07)',
    modalShadow:'0 24px 64px rgba(0,0,0,0.14)',
  },
};
const F = { serif:"'Playfair Display', Georgia, serif", sans:"'Inter', -apple-system, sans-serif" };

const STRESS_TIPS = {
  Calm:['Body temperature is normal (38–39.5°C)','Breathing rate is healthy (12–30/min)','Eating and ruminating normally','Good social behavior with herd'],
  Mild:['Check body temperature – slight rise possible','Ensure fresh clean water is available','Check feeding routine and food quality','Observe for 2–3 hours for improvement'],
  Moderate:['Body temperature may be elevated (40–40.5°C)','Move to cooler, quieter area','Reduce herd density if possible','Monitor breathing rate closely'],
  High:['ALERT: Temperature likely 40.5–41°C','Apply cooling fans or water misting','Provide electrolyte solutions','Reduce handling and movement immediately'],
  Extreme:['CRITICAL: Call veterinarian IMMEDIATELY','Apply cold water to neck and groin','Do NOT force the animal to move','Document symptoms and time of onset'],
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ cattle_id: '', date: '', stress: '' });
  const [selected, setSelected] = useState(null);
 const [deleteModal, setDeleteModal] = useState({ open: false, id: null, cattleId: null });
  
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

  const card = { background: T.cardBg, border: `1px solid ${T.cardBorder}`, boxShadow: T.cardShadow, borderRadius: 16, transition: 'all 0.3s' };
  const primaryBtn = { background: T.primaryBg, border: 'none', color: '#fff', boxShadow: `0 4px 14px ${T.accentShadow}`, cursor: 'pointer', fontFamily: F.sans, borderRadius: 10, fontWeight: 700, transition: 'all 0.2s' };
  const secondaryBtn = { background: T.secondaryBtn, border: `1px solid ${T.secondaryBorder}`, color: T.secondaryColor, cursor: 'pointer', fontFamily: F.sans, borderRadius: 10, fontWeight: 600, transition: 'all 0.2s' };
  const inputStyle = { padding: '9px 12px', borderRadius: 9, border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.inputColor, fontSize: 13, fontFamily: F.sans, outline: 'none', transition: 'border 0.2s' };

  const fetchRecords = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) });
      const { data } = await api.get(`/history?${params}`);
      setRecords(data.records); setTotal(data.total); setPages(data.pages); setPage(p);
    } catch { toast.error('Failed to load records'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(1); }, []);

  const handleFilter = (e) => { e.preventDefault(); fetchRecords(1); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      await api.delete(`/history/${id}`);
      toast.success('Record deleted'); fetchRecords(page);
      if (selected?._id === id) setSelected(null);
    } catch { toast.error('Delete failed'); }
  };

  /* ─────────────────────────────────────────────
   DeleteConfirmModal
───────────────────────────────────────────── */
function DeleteConfirmModal({ isOpen, onConfirm, onCancel, recordId, T }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: T.modalOverlay,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(18px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.modalBg,
          border: `1px solid ${T.modalBorder}`,
          borderRadius: 20,
          boxShadow: T.modalShadow,
          padding: '32px 28px 28px',
          width: '100%',
          maxWidth: 400,
          fontFamily: F.sans,
          animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
        }}
      >
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: T.modalIconBg,
            border: `1.5px solid ${T.modalIconBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            <FiTrash2 size={30} />
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: F.serif, fontSize: 22, fontWeight: 900,
          color: T.title, textAlign: 'center', marginBottom: 10,
          letterSpacing: '-0.02em',
        }}>
          Delete Record?
        </h2>

        {/* Body */}
        <p style={{
          color: T.body, fontSize: 14, textAlign: 'center',
          lineHeight: 1.6, marginBottom: 8,
        }}>
          You're about to permanently delete the detection record
          {recordId && (
            <> for cattle <strong style={{ color: T.title }}>#{recordId}</strong></>
          )}.
        </p>
        <p style={{
          color: T.muted, fontSize: 12, textAlign: 'center',
          marginBottom: 26,
        }}>
          This action cannot be undone.
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: T.modalBorder, marginBottom: 20 }} />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Cancel */}
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px 0',
              background: T.modalCancelBg,
              border: `1px solid ${T.modalCancelBorder}`,
              color: T.modalCancelColor,
              borderRadius: 11, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: F.sans,
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.modalCancelHover}
            onMouseLeave={e => e.currentTarget.style.background = T.modalCancelBg}
          >
            Cancel
          </button>

          {/* Delete */}
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '11px 0',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              color: '#fff',
              borderRadius: 11, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: F.sans,
              boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
           
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Opens the custom modal instead of native confirm()
  const openDeleteModal = (id, cattleId) => {
    setDeleteModal({ open: true, id, cattleId });
  };

  const handleDeleteConfirm = async () => {
    const { id } = deleteModal;
    setDeleteModal({ open: false, id: null, cattleId: null });
    try {
      await api.delete(`/history/${id}`);
      toast.success('Record deleted');
      fetchRecords(page);
      if (selected?._id === id) setSelected(null);
    } catch { toast.error('Delete failed'); }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, id: null, cattleId: null });
  };


  return (
    <div style={{ background: T.pageBg, minHeight: '100vh', padding: '28px 24px', fontFamily: F.sans, transition: 'all 0.3s' }}>

{/* ── Custom Delete Confirmation Modal ── */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        recordId={deleteModal.cattleId}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        T={T}
      />

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 900, color: T.title, letterSpacing: '-0.02em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
  <FiClipboard size={24} style={{ color: T.accent, flexShrink: 0 }} />
  Detection History
</h1>
          <p style={{ color: T.subtitle, fontSize: 14 }}>
            {user?.role === 'admin' ? "All farmers' cattle detection records" : 'Your cattle detection records'} · {total} total
          </p>
        </div>
        
      </div>

      {/* ── Filters ── */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ padding: 18 }}>
          <form onSubmit={handleFilter} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 5, letterSpacing: '0.04em' }}>CATTLE ID</label>
              <input style={{ ...inputStyle, width: 160 }} placeholder="Search cattle ID…" value={filters.cattle_id}
                onChange={e => setFilters(p => ({ ...p, cattle_id: e.target.value }))}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.inputBorder} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 5, letterSpacing: '0.04em' }}>DATE</label>
              <input type="date" style={{ ...inputStyle, width: 160 }} value={filters.date}
                onChange={e => setFilters(p => ({ ...p, date: e.target.value }))}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.inputBorder} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 5, letterSpacing: '0.04em' }}>STRESS LEVEL</label>
              <select style={{ ...inputStyle, width: 150 }} value={filters.stress}
                onChange={e => setFilters(p => ({ ...p, stress: e.target.value }))}>
                <option value="">All Levels</option>
                {['Calm', 'Mild', 'Moderate', 'High', 'Extreme'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button
  type="submit"
  style={{
    ...primaryBtn, padding: '9px 20px', fontSize: 13,
    display: 'flex', alignItems: 'center', gap: 7,
  }}
>
  <FiSearch size={14} />
  Search
</button>
            <button type="button" style={{ ...secondaryBtn, padding: '9px 16px', fontSize: 13 }}
              onClick={() => { setFilters({ cattle_id: '', date: '', stress: '' }); setTimeout(() => fetchRecords(1), 50); }}>
              Clear
            </button>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* ── Table ── */}
        <div style={card}>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '52px', color: T.muted }}>
                <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
  <FiDatabase size={36} style={{ color: T.accent }} />
</div>
                <p style={{ fontFamily: F.sans }}>Loading records…</p>
              </div>
            ) : records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '52px', color: T.muted }}>
                <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
  <FiInbox size={40} style={{ color: T.muted }} />
</div>
                <p>No records found</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: T.tableHead }}>
                    {['Cattle ID', 'Date', 'Time', 'Stress Level',  ...(user?.role === 'admin' ? ['Farmer'] : []), 'Actions'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, 
                        color: T.tableHeadText, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: `1px solid ${T.divider}`, 
                        fontFamily: F.sans }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r._id}
                      onClick={() => setSelected(selected?._id === r._id ? null : r)}
                      style={{ cursor: 'pointer', background: selected?._id === r._id ? T.tableRowSel : 'transparent', borderBottom: `1px solid ${T.tableBorder}`, transition: 'background 0.2s' }}
                      onMouseEnter={e => { if (selected?._id !== r._id) e.currentTarget.style.background = T.tableRowHover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = selected?._id === r._id ? T.tableRowSel : 'transparent'; }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: T.accent, fontSize: 14 }}>#{r.cattle_id}</td>
                      <td style={{ padding: '12px 16px', color: T.body, fontSize: 13 }}>{r.date}</td>
                      <td style={{ padding: '12px 16px', color: T.body, fontSize: 13 }}>{r.time}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: STRESS_CONFIG[r.stress]?.bg, color: STRESS_CONFIG[r.stress]?.text, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {STRESS_CONFIG[r.stress]?.icon} {r.stress}
                        </span>
                      </td>
                      
                      {user?.role === 'admin' && <td style={{ padding: '12px 16px', color: T.muted, fontSize: 12 }}>{r.user_id?.name || '-'}</td>}
                      <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                       <button
                          onClick={() => openDeleteModal(r._id, r.cattle_id)}
                          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '5px 10px', fontSize: 13, cursor: 'pointer', fontFamily: F.sans, transition: 'all 0.18s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                        >
  <FiTrash2 size={14} />
</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px', borderTop: `1px solid ${T.divider}` }}>
              <button style={{ ...secondaryBtn, padding: '7px 16px', fontSize: 12 }} onClick={() => fetchRecords(page - 1)} disabled={page === 1}>← Prev</button>
              <span style={{ fontSize: 13, color: T.muted }}>Page {page} of {pages}</span>
              <button style={{ ...secondaryBtn, padding: '7px 16px', fontSize: 12 }} onClick={() => fetchRecords(page + 1)} disabled={page === pages}>Next →</button>
            </div>
          )}
        </div>

        {/* ── Detail Panel ── */}
        {selected && (() => {
          const cfg = STRESS_CONFIG[selected.stress];
          const tips = STRESS_TIPS[selected.stress] || [];
          return (
            <div style={{ ...card, alignSelf: 'start' }}>
              <div style={{ padding: '14px 18px', background: cfg?.bg, borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: F.serif, fontSize: 17, fontWeight: 800, color: cfg?.text }}>{cfg?.icon} {selected.stress} Stress</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: cfg?.text }}>✕</button>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: 'Cattle ID', value: `#${selected.cattle_id}` },
                    { label: 'Date', value: selected.date },
                    { label: 'Time', value: selected.time },
                    //{ label: 'Confidence', value: `${selected.confidence || 0}%` },
                    ...(user?.role === 'admin' ? [{ label: 'Farmer', value: selected.user_id?.name || '-' }] : []),
                  ].map((item, i) => (
                    <div key={i} style={{ background: T.detailBg, borderRadius: 8, padding: '9px 12px' }}>
                      <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.title, marginTop: 3 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: cfg?.bg, border: `1px solid ${cfg?.color}`, borderRadius: 10, padding: '12px', marginBottom: 14 }}>
                  <strong style={{ color: cfg?.text, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
  <FiClipboard size={12} />
  Recommendation
</strong>
                  <p style={{ color: cfg?.text, fontSize: 13, marginTop: 4 }}>{selected.recommendation}</p>
                </div>
                <strong style={{ fontSize: 13, color: T.title, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontFamily: F.serif }}>
  <FiHeart size={13} style={{ color: T.accent, flexShrink: 0 }} />
  Care Checklist
</strong>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {tips.map((tip, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: cfg?.color, fontSize: 15, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: T.body }}>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}