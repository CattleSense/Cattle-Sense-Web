export const STRESS_CONFIG = {
  Calm:     { color: '#22c55e', bg: '#dcfce7', text: '#15803d',  level: 1, label: 'Calm' },
  Mild:     { color: '#84cc16', bg: '#ecfccb', text: '#4d7c0f',  level: 2, label: 'Mild' },
  Moderate: { color: '#eab308', bg: '#fef9c3', text: '#a16207',  level: 3, label: 'Moderate' },
  High:     { color: '#f97316', bg: '#ffedd5', text: '#c2410c',  level: 4, label: 'High' },
  Extreme:  { color: '#ef4444', bg: '#fee2e2', text: '#dc2626',  level: 5, label: 'Extreme' }
};

export const getBadgeClass = (stress) => `badge badge-${stress?.toLowerCase() || 'calm'}`;

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' });
};
