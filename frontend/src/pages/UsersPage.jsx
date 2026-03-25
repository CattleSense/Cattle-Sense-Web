import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get('/users'); setUsers(data.users); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const changeRole = async (id, role) => {
    try { await api.put(`/users/${id}/role`, { role }); toast.success(`Role changed to ${role}`); fetch(); }
    catch { toast.error('Failed to change role'); }
  };

  const toggle = async (id) => {
    try { const { data } = await api.put(`/users/${id}/toggle`); toast.success(data.message); fetch(); }
    catch { toast.error('Failed to toggle user'); }
  };

  const del = async (id) => {
    if (!confirm('Permanently delete this user?')) return;
    try { await api.delete(`/users/${id}`); toast.success('User deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>👥 User Management</h1>
        <p>Manage farmer and admin accounts · {users.length} total users</p>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:20, justifyContent:'space-between', alignItems:'center' }}>
        <input className="form-input" placeholder="🔍 Search by name or email..." style={{ maxWidth:300 }}
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display:'flex', gap:8 }}>
          <span style={{ background:'#dcfce7', color:'#15803d', padding:'6px 14px', borderRadius:20, fontSize:'.82rem', fontWeight:600 }}>
            👑 {users.filter(u => u.role === 'admin').length} Admins
          </span>
          <span style={{ background:'#dbeafe', color:'#1d4ed8', padding:'6px 14px', borderRadius:20, fontSize:'.82rem', fontWeight:600 }}>
            🌾 {users.filter(u => u.role === 'farmer').length} Farmers
          </span>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div style={{ textAlign:'center', padding:'48px', color:'var(--muted)' }}>
              <div style={{ fontSize:'2rem' }} className="pulse">👥</div>
              <p style={{ marginTop:8 }}>Loading users...</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Farm</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="avatar" style={{ width:32, height:32, fontSize:'.78rem', flexShrink:0, background: u.role==='admin' ? 'var(--green-700)' : '#3b82f6' }}>
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'.9rem' }}>{u.name}</div>
                          {u.phone && <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:'.88rem' }}>{u.email}</td>
                    <td>
                      <span style={{ padding:'4px 12px', borderRadius:20, fontSize:'.78rem', fontWeight:600, background: u.role==='admin' ? '#dcfce7' : '#dbeafe', color: u.role==='admin' ? '#15803d' : '#1d4ed8' }}>
                        {u.role === 'admin' ? '👑 Admin' : '🌾 Farmer'}
                      </span>
                    </td>
                    <td style={{ fontSize:'.85rem' }}>{u.farmName || '—'}</td>
                    <td>
                      <span style={{ padding:'4px 10px', borderRadius:20, fontSize:'.78rem', fontWeight:600, background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#15803d' : '#dc2626' }}>
                        {u.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize:'.82rem', color:'var(--muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-LK', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td>
                      {u._id !== me._id && (
                        <div style={{ display:'flex', gap:6 }}>
                          {u.role === 'farmer'
                            ? <button className="btn btn-secondary btn-sm" onClick={() => changeRole(u._id, 'admin')}>→ Admin</button>
                            : <button className="btn btn-secondary btn-sm" onClick={() => changeRole(u._id, 'farmer')}>→ Farmer</button>
                          }
                          <button className="btn btn-secondary btn-sm" onClick={() => toggle(u._id)}>
                            {u.isActive ? '🔒' : '🔓'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(u._id)}>🗑️</button>
                        </div>
                      )}
                      {u._id === me._id && <span style={{ fontSize:'.78rem', color:'var(--muted)' }}>You</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
