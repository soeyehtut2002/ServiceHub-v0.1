import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const CATEGORIES = ['Cleaning','Plumbing','Electrical','Gardening','Painting','Moving','Tutoring','Photography','Other'];

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddService, setShowAddService] = useState(false);
  const [editService, setEditService] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        API.get('/bookings/provider'),
        API.get('/services/provider/mine'),
      ]);
      setBookings(bRes.data);
      setServices(sRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.patch(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    try {
      await API.delete(`/services/${id}`);
      toast.success('Service deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const counts = {
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <div className="flex-between">
            <div>
              <h1 className="h2">🔧 Provider Dashboard</h1>
              <p className="text-muted mt-2">Manage your services and bookings</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditService(null); setShowAddService(true); }}>
              ➕ Add Service
            </button>
          </div>
        </div>
      </div>

      <div className="container section-sm">
        {/* Stats */}
        <div className="grid-4 grid mb-8">
          {[
            { label: 'My Services', value: services.length, icon: '🛠️', color: '#6C63FF' },
            { label: 'Pending Requests', value: counts.pending, icon: '⏳', color: '#FFBE0B' },
            { label: 'Confirmed', value: counts.confirmed, icon: '✅', color: '#6C63FF' },
            { label: 'Completed', value: counts.completed, icon: '🎉', color: '#00D4AA' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: `${s.color}22` }}>{s.icon}</div>
              <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs mb-6">
          <button className={`tab-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>📅 Bookings ({bookings.length})</button>
          <button className={`tab-btn ${tab === 'services' ? 'active' : ''}`} onClick={() => setTab('services')}>🛠️ My Services ({services.length})</button>
        </div>

        {loading ? (
          <div className="spinner-container"><div className="spinner" /></div>
        ) : tab === 'bookings' ? (
          bookings.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><h3>No bookings yet</h3><p>Bookings will appear here once customers book your services</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Customer</th><th>Service</th><th>Date</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{b.customer_name}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{b.customer_email}</div>
                        {b.customer_phone && <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>📞 {b.customer_phone}</div>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.service_title}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--success)', fontWeight: 700 }}>${parseFloat(b.price).toFixed(2)}</div>
                      </td>
                      <td>{new Date(b.booking_date).toLocaleString()}</td>
                      <td><span style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{b.notes || '—'}</span></td>
                      <td><StatusBadge status={b.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          {b.status === 'pending' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(b.id, 'confirmed')}>✅ Confirm</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(b.id, 'cancelled')}>❌ Reject</button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(b.id, 'completed')}>🎉 Complete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          services.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛠️</div>
              <h3>No services yet</h3>
              <p>Create your first service to start receiving bookings</p>
              <button className="btn btn-primary mt-4" onClick={() => setShowAddService(true)}>➕ Add Service</button>
            </div>
          ) : (
            <div className="grid-services grid">
              {services.map(s => (
                <div key={s.id} className="provider-service-card">
                  <div className="provider-service-img">
                    <img
                      src={s.image_url ? (s.image_url.startsWith('/uploads') ? `http://localhost:5000${s.image_url}` : s.image_url) : `https://source.unsplash.com/400x200/?${encodeURIComponent(s.category)}`}
                      alt={s.title}
                    />
                    {!s.is_active && <div className="inactive-badge">Inactive</div>}
                  </div>
                  <div className="provider-service-body">
                    <h3 className="provider-service-title">{s.title}</h3>
                    <div className="provider-service-meta">
                      <span className="badge badge-primary">{s.category}</span>
                      <span style={{ color: 'var(--success)', fontWeight: 700 }}>${parseFloat(s.price).toFixed(2)}</span>
                    </div>
                    <div className="provider-service-stats">
                      <span>⭐ {parseFloat(s.avg_rating || 0).toFixed(1)} ({s.review_count} reviews)</span>
                      <span>📅 {s.booking_count} bookings</span>
                    </div>
                    <div className="provider-service-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditService(s); setShowAddService(true); }}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteService(s.id)}>🗑️ Delete</button>
                      <Link to={`/services/${s.id}`} className="btn btn-outline btn-sm">👁️ View</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {showAddService && (
        <ServiceFormModal
          service={editService}
          onClose={() => { setShowAddService(false); setEditService(null); }}
          onSaved={() => { setShowAddService(false); setEditService(null); fetchData(); }}
        />
      )}

      <style>{`
        .provider-service-card { background:var(--gradient-card); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; transition:var(--transition); }
        .provider-service-card:hover { border-color:var(--border-hover); transform:translateY(-3px); }
        .provider-service-img { height:160px; overflow:hidden; position:relative; }
        .provider-service-img img { width:100%; height:100%; object-fit:cover; }
        .inactive-badge { position:absolute; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; color:var(--danger); font-weight:700; }
        .provider-service-body { padding:var(--space-4); display:flex; flex-direction:column; gap:var(--space-3); }
        .provider-service-title { font-size:1rem; font-weight:700; color:var(--text-primary); }
        .provider-service-meta { display:flex; align-items:center; justify-content:space-between; }
        .provider-service-stats { display:flex; flex-direction:column; gap:4px; }
        .provider-service-stats span { font-size:.78rem; color:var(--text-muted); }
        .provider-service-actions { display:flex; gap:var(--space-2); flex-wrap:wrap; border-top:1px solid var(--border); padding-top:var(--space-3); }
      `}</style>
    </div>
  );
};

// ─── Service Form Modal ───────────────────────────────────────────────────────
const ServiceFormModal = ({ service, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: service?.title || '',
    description: service?.description || '',
    category: service?.category || '',
    location: service?.location || '',
    price: service?.price || '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(service?.image_url ? (service.image_url.startsWith('/uploads') ? `http://localhost:5000${service.image_url}` : service.image_url) : null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (service) {
        await API.put(`/services/${service.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Service updated!');
      } else {
        await API.post('/services', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Service created!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 className="modal-title">{service ? '✏️ Edit Service' : '➕ New Service'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Service Title</label>
            <input name="title" className="input" placeholder="e.g. Professional House Cleaning" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="textarea" placeholder="Describe your service in detail..." value={form.description} onChange={handleChange} required rows={4} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" className="select" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input name="price" type="number" min="0" step="0.01" className="input" placeholder="0.00" value={form.price} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input name="location" className="input" placeholder="e.g. New York, NY" value={form.location} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Service Image</label>
            <div className="upload-area" onClick={() => fileRef.current.click()}>
              {preview ? <img src={preview} alt="preview" style={{ height: 140, width: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} /> : <div className="upload-placeholder"><span style={{ fontSize: '2rem' }}>📷</span><p>Click to upload image</p><p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>JPG, PNG, WebP — max 5MB</p></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : service ? '💾 Update Service' : '🚀 Create Service'}</button>
          </div>
        </form>
      </div>
      <style>{`
        .upload-area { border:2px dashed var(--border); border-radius:var(--radius-md); cursor:pointer; transition:var(--transition); overflow:hidden; }
        .upload-area:hover { border-color:var(--primary); background:rgba(108,99,255,.05); }
        .upload-placeholder { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:var(--space-2); padding:var(--space-8); color:var(--text-muted); }
      `}</style>
    </div>
  );
};

export default ProviderDashboard;
