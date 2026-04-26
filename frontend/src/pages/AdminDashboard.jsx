import { useState, useEffect } from 'react';
import API from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (err) { toast.error('Failed to load stats'); }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (err) { toast.error('Failed to load users'); }
  };

  const fetchServices = async () => {
    try {
      const res = await API.get('/admin/services');
      setServices(res.data);
    } catch (err) { toast.error('Failed to load services'); }
  };

  const fetchBookings = async () => {
    try {
      const res = await API.get('/admin/bookings');
      setBookings(res.data);
    } catch (err) { toast.error('Failed to load bookings'); }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (tab === 'users') fetchUsers();
    if (tab === 'services') fetchServices();
    if (tab === 'bookings') fetchBookings();
  }, [tab]);

  const handleToggleUser = async (id) => {
    try {
      await API.patch(`/admin/users/${id}/status`);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) { toast.error('Failed to update user'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) { toast.error('Failed to delete user'); }
  };

  const handleDeleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await API.delete(`/admin/services/${id}`);
      toast.success('Service deleted');
      fetchServices();
    } catch (err) { toast.error('Failed to delete service'); }
  };

  const ROLE_COLORS = { admin: '#6C63FF', provider: '#00D4AA', customer: '#FFBE0B' };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <h1 className="h2">👑 Admin Dashboard</h1>
          <p className="text-muted mt-2">Platform management & analytics</p>
        </div>
      </div>

      <div className="container section-sm">
        {/* Tabs */}
        <div className="tabs mb-8" style={{ maxWidth: 600 }}>
          {['overview','users','services','bookings'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? '📊' : t === 'users' ? '👥' : t === 'services' ? '🛠️' : '📅'} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-container"><div className="spinner" /></div>
        ) : (
          <>
            {/* ─── Overview ─────────────────────────────────── */}
            {tab === 'overview' && stats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                <div className="grid-4 grid">
                  {[
                    { label: 'Total Users', value: stats.totals.users, icon: '👥', color: '#6C63FF' },
                    { label: 'Active Services', value: stats.totals.services, icon: '🛠️', color: '#00D4AA' },
                    { label: 'Total Bookings', value: stats.totals.bookings, icon: '📅', color: '#FF6584' },
                    { label: 'Total Reviews', value: stats.totals.reviews, icon: '⭐', color: '#FFBE0B' },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <div className="stat-icon" style={{ background: `${s.color}22` }}>{s.icon}</div>
                      <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                  {/* Bookings by Status */}
                  <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 'var(--space-5)' }}>📊 Bookings by Status</h3>
                    {stats.bookingsByStatus.map(s => {
                      const total = stats.totals.bookings || 1;
                      const pct = Math.round((parseInt(s.count) / total) * 100);
                      const colors = { pending: '#FFBE0B', confirmed: '#6C63FF', completed: '#00D4AA', cancelled: '#FF4757' };
                      return (
                        <div key={s.status} style={{ marginBottom: 'var(--space-4)' }}>
                          <div className="flex-between mb-2">
                            <span style={{ fontSize: '.85rem', fontWeight: 600, textTransform: 'capitalize' }}>{s.status}</span>
                            <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>{s.count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 8, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: colors[s.status] || '#6C63FF', borderRadius: 4, transition: 'width .5s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Categories */}
                  <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 'var(--space-5)' }}>🏷️ Services by Category</h3>
                    {stats.categoryStats.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>No services yet</p>
                    ) : stats.categoryStats.map((c, i) => (
                      <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < stats.categoryStats.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ fontSize: '.875rem', color: 'var(--text-secondary)' }}>{c.category}</span>
                        <span className="badge badge-primary">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Bookings */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>🕐 Recent Bookings</h3>
                  <div className="table-wrapper">
                    <table className="table">
                      <thead><tr><th>Customer</th><th>Service</th><th>Date</th><th>Status</th></tr></thead>
                      <tbody>
                        {stats.recentBookings.map(b => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 600 }}>{b.customer_name}</td>
                            <td>{b.service_title}</td>
                            <td>{new Date(b.booking_date).toLocaleDateString()}</td>
                            <td><StatusBadge status={b.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Users ─────────────────────────────────────── */}
            {tab === 'users' && (
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Location</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className="avatar" style={{ width: 32, height: 32, fontSize: '.75rem' }}>{u.name[0]?.toUpperCase()}</div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className="badge" style={{ background: `${ROLE_COLORS[u.role]}22`, color: ROLE_COLORS[u.role], border: `1px solid ${ROLE_COLORS[u.role]}44` }}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.location || '—'}</td>
                        <td>
                          <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {u.is_active ? '● Active' : '● Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggleUser(u.id)}>
                              {u.is_active ? '🔒 Deactivate' : '🔓 Activate'}
                            </button>
                            {u.role !== 'admin' && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>🗑️</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ─── Services ──────────────────────────────────── */}
            {tab === 'services' && (
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Service</th><th>Provider</th><th>Category</th><th>Price</th><th>Rating</th><th>Bookings</th><th>Actions</th></tr></thead>
                  <tbody>
                    {services.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.location}</div>
                        </td>
                        <td>{s.provider_name}</td>
                        <td><span className="badge badge-primary">{s.category}</span></td>
                        <td style={{ color: 'var(--success)', fontWeight: 700 }}>${parseFloat(s.price).toFixed(2)}</td>
                        <td>⭐ {parseFloat(s.avg_rating || 0).toFixed(1)} ({s.review_count})</td>
                        <td>{s.booking_count}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteService(s.id)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ─── Bookings ──────────────────────────────────── */}
            {tab === 'bookings' && (
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Customer</th><th>Service</th><th>Provider</th><th>Date</th><th>Price</th><th>Status</th></tr></thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600 }}>{b.customer_name}</td>
                        <td>{b.service_title}</td>
                        <td>{b.provider_name}</td>
                        <td>{new Date(b.booking_date).toLocaleDateString()}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 700 }}>${parseFloat(b.price).toFixed(2)}</td>
                        <td><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
