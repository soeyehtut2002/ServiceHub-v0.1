import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const CATEGORIES = ['Cleaning','Plumbing','Electrical','Gardening','Painting','Moving','Tutoring','Photography','Other'];

const AVAILABILITY_OPTIONS = [
  { value: 'available',    icon: '🟢', label: 'Available',          desc: 'Open for new bookings' },
  { value: 'fully_booked', icon: '🔴', label: 'Fully Booked',       desc: 'No more bookings accepted' },
  { value: 'paused',       icon: '⏸️', label: 'Temporarily Paused', desc: 'Pause without deactivating' },
];

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [tab,            setTab]            = useState('bookings');
  const [bookings,       setBookings]       = useState([]);
  const [services,       setServices]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showAddService, setShowAddService] = useState(false);
  const [editService,    setEditService]    = useState(null);
  const [slotService,    setSlotService]    = useState(null); // service for slot manager

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        API.get('/bookings/provider'),
        API.get('/services/provider/mine'),
      ]);
      setBookings(bRes.data);
      setServices(sRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Update booking status (confirm/complete/cancel/pause)
  const handleStatusUpdate = async (id, status) => {
    try {
      if (status === 'paused') {
        await API.patch(`/bookings/${id}/pause`);
      } else {
        await API.patch(`/bookings/${id}/status`, { status });
      }
      toast.success(`Booking ${status}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  // Toggle service availability
  const handleAvailability = async (serviceId, availability_status) => {
    try {
      await API.patch(`/services/${serviceId}/availability`, { availability_status });
      toast.success('Availability updated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update availability');
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    try {
      await API.delete(`/services/${id}`);
      toast.success('Service deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete service');
    }
  };

  const counts = {
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    paused:    bookings.filter(b => b.status === 'paused').length,
  };

  const availabilityColor = { available:'#00D4AA', fully_booked:'#FF4757', paused:'#FF9800' };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <div className="flex-between">
            <div>
              <h1 className="h2">🔧 Provider Dashboard</h1>
              <p className="text-muted mt-2">Manage your services and bookings</p>
            </div>
            <div style={{display:'flex',gap:'var(--space-3)'}}>
              <Link to="/profile" className="btn btn-ghost">👤 My Profile</Link>
              <button className="btn btn-primary" onClick={() => { setEditService(null); setShowAddService(true); }}>
                ➕ Add Service
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container section-sm">
        {/* Stats */}
        <div className="grid-4 grid mb-8">
          {[
            { label:'My Services',      value:services.length,  icon:'🛠️', color:'#6C63FF' },
            { label:'Pending Requests', value:counts.pending,   icon:'⏳', color:'#FFBE0B' },
            { label:'Confirmed',        value:counts.confirmed, icon:'✅', color:'#6C63FF' },
            { label:'Completed',        value:counts.completed, icon:'🎉', color:'#00D4AA' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{background:`${s.color}22`}}>{s.icon}</div>
              <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs mb-6">
          <button className={`tab-btn ${tab==='bookings'?'active':''}`} onClick={() => setTab('bookings')}>
            📅 Bookings ({bookings.length})
            {counts.paused > 0 && <span className="tab-badge">{counts.paused} paused</span>}
          </button>
          <button className={`tab-btn ${tab==='services'?'active':''}`} onClick={() => setTab('services')}>
            🛠️ My Services ({services.length})
          </button>
        </div>

        {loading ? (
          <div className="spinner-container"><div className="spinner"/></div>
        ) : tab === 'bookings' ? (
          bookings.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><h3>No bookings yet</h3><p>Bookings will appear here once customers book your services</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Customer</th><th>Service</th><th>Date / Slot</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{fontWeight:700,color:'var(--text-primary)'}}>{b.customer_name}</div>
                        <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{b.customer_email}</div>
                        {b.customer_phone && <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>📞 {b.customer_phone}</div>}
                      </td>
                      <td>
                        <div style={{fontWeight:600}}>{b.service_title}</div>
                        <div style={{fontSize:'.75rem',color:'var(--success)',fontWeight:700}}>${parseFloat(b.price).toFixed(2)}</div>
                      </td>
                      <td>
                        {b.slot_date ? (
                          <div>
                            <div style={{fontWeight:600}}>{new Date(b.slot_date+'T00:00:00').toLocaleDateString()}</div>
                            <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</div>
                          </div>
                        ) : new Date(b.booking_date).toLocaleString()}
                      </td>
                      <td><span style={{fontSize:'.82rem',color:'var(--text-secondary)'}}>{b.notes || '—'}</span></td>
                      <td><StatusBadge status={b.status}/></td>
                      <td>
                        <div style={{display:'flex',gap:'var(--space-2)',flexWrap:'wrap'}}>
                          {b.status === 'pending' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(b.id,'confirmed')}>✅ Confirm</button>
                              <button className="btn btn-ghost btn-sm"   onClick={() => handleStatusUpdate(b.id,'paused')}>⏸️ Pause</button>
                              <button className="btn btn-danger btn-sm"  onClick={() => handleStatusUpdate(b.id,'cancelled')}>❌ Reject</button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(b.id,'completed')}>🎉 Complete</button>
                              <button className="btn btn-ghost btn-sm"   onClick={() => handleStatusUpdate(b.id,'paused')}>⏸️ Pause</button>
                              <button className="btn btn-danger btn-sm"  onClick={() => handleStatusUpdate(b.id,'cancelled')}>❌ Cancel</button>
                            </>
                          )}
                          {b.status === 'paused' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(b.id,'confirmed')}>▶️ Resume</button>
                              <button className="btn btn-danger btn-sm"  onClick={() => handleStatusUpdate(b.id,'cancelled')}>❌ Cancel</button>
                            </>
                          )}
                          <Link to={`/chat/${b.customer_id}`} className="btn btn-ghost btn-sm">💬</Link>
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
                      <span style={{color:'var(--success)',fontWeight:700}}>${parseFloat(s.price).toFixed(2)}</span>
                    </div>
                    <div className="provider-service-stats">
                      <span>⭐ {parseFloat(s.avg_rating||0).toFixed(1)} ({s.review_count} reviews)</span>
                      <span>📅 {s.booking_count} bookings</span>
                    </div>

                    {/* Availability Control */}
                    <div className="avail-row">
                      <span style={{fontSize:'.78rem',color:'var(--text-muted)',fontWeight:600}}>Availability:</span>
                      <div className="avail-pills">
                        {AVAILABILITY_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            className={`avail-pill ${s.availability_status===opt.value?'active':''}`}
                            style={s.availability_status===opt.value ? {borderColor:availabilityColor[opt.value],color:availabilityColor[opt.value]} : {}}
                            onClick={() => handleAvailability(s.id, opt.value)}
                            title={opt.desc}
                          >
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="provider-service-actions">
                      <button className="btn btn-ghost btn-sm"    onClick={() => { setEditService(s); setShowAddService(true); }}>✏️ Edit</button>
                      <button className="btn btn-outline btn-sm"  onClick={() => setSlotService(s)}>🕐 Slots</button>
                      <Link   to={`/services/${s.id}`} className="btn btn-ghost btn-sm">👁️ View</Link>
                      <button className="btn btn-danger btn-sm"   onClick={() => handleDeleteService(s.id)}>🗑️</button>
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

      {slotService && (
        <SlotManagerModal
          service={slotService}
          onClose={() => setSlotService(null)}
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
        .avail-row { display:flex; flex-direction:column; gap:var(--space-2); }
        .avail-pills { display:flex; flex-wrap:wrap; gap:var(--space-1); }
        .avail-pill { padding:3px 8px; border-radius:20px; font-size:.72rem; font-weight:600; border:1px solid var(--border); background:transparent; color:var(--text-muted); cursor:pointer; transition:var(--transition); }
        .avail-pill.active { background:rgba(255,255,255,.06); }
        .avail-pill:hover { border-color:var(--border-hover); }
        .provider-service-actions { display:flex; gap:var(--space-2); flex-wrap:wrap; border-top:1px solid var(--border); padding-top:var(--space-3); }
        .tab-badge { margin-left:6px; background:#FF9800; color:#000; border-radius:10px; font-size:.7rem; padding:1px 6px; }
      `}</style>
    </div>
  );
};

// ─── Service Form Modal ───────────────────────────────────────────────────────
const ServiceFormModal = ({ service, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title:          service?.title          || '',
    description:    service?.description    || '',
    category:       service?.category       || '',
    location:       service?.location       || '',
    price:          service?.price          || '',
    duration_hours: service?.duration_hours || 1,
    team_count:     service?.team_count     || 1,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(
    service?.image_url
      ? (service.image_url.startsWith('/uploads') ? `http://localhost:5000${service.image_url}` : service.image_url)
      : null
  );
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleChange     = (e) => setForm({ ...form, [e.target.name]: e.target.value });
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
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-content" style={{maxWidth:560}}>
        <div className="modal-header">
          <h3 className="modal-title">{service ? '✏️ Edit Service' : '➕ New Service'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
          <div className="form-group">
            <label className="form-label">Service Title</label>
            <input name="title" className="input" placeholder="e.g. Professional House Cleaning" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="textarea" placeholder="Describe your service in detail..." value={form.description} onChange={handleChange} required rows={4} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--space-4)'}}>
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

          {/* Capacity Settings */}
          <div className="capacity-banner">
            <span style={{fontSize:'1.1rem'}}>⚙️</span>
            <span style={{fontWeight:700,color:'var(--text-primary)'}}>Capacity Settings</span>
            <span style={{fontSize:'.78rem',color:'var(--text-muted)'}}>Controls booking availability</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--space-4)'}}>
            <div className="form-group">
              <label className="form-label">⏱️ Service Duration</label>
              <select name="duration_hours" className="select" value={form.duration_hours} onChange={handleChange}>
                {[1,2,3,4,6,8].map(h => <option key={h} value={h}>{h} hour{h>1?'s':''}</option>)}
              </select>
              <span className="form-hint">How long one job takes</span>
            </div>
            <div className="form-group">
              <label className="form-label">👥 Number of Teams</label>
              <input name="team_count" type="number" min="1" max="50" className="input" value={form.team_count} onChange={handleChange} />
              <span className="form-hint">Teams working in parallel</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input name="location" className="input" placeholder="e.g. New York, NY" value={form.location} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Service Image</label>
            <div className="upload-area" onClick={() => fileRef.current.click()}>
              {preview
                ? <img src={preview} alt="preview" style={{height:140,width:'100%',objectFit:'cover',borderRadius:'var(--radius-md)'}} />
                : <div className="upload-placeholder"><span style={{fontSize:'2rem'}}>📷</span><p>Click to upload image</p><p style={{fontSize:'.75rem',color:'var(--text-muted)'}}>JPG, PNG, WebP — max 5MB</p></div>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFileChange} />
          </div>
          <div style={{display:'flex',gap:'var(--space-3)',justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : service ? '💾 Update Service' : '🚀 Create Service'}</button>
          </div>
        </form>
      </div>
      <style>{`
        .upload-area { border:2px dashed var(--border); border-radius:var(--radius-md); cursor:pointer; transition:var(--transition); overflow:hidden; }
        .upload-area:hover { border-color:var(--primary); background:rgba(108,99,255,.05); }
        .upload-placeholder { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:var(--space-2); padding:var(--space-8); color:var(--text-muted); }
        .capacity-banner { display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3) var(--space-4); background:rgba(108,99,255,.1); border:1px solid rgba(108,99,255,.25); border-radius:var(--radius-md); }
        .form-hint { font-size:.72rem; color:var(--text-muted); margin-top:4px; display:block; }
      `}</style>
    </div>
  );
};

// ─── Slot Manager Modal ───────────────────────────────────────────────────────
const SlotManagerModal = ({ service, onClose }) => {
  const [slots,    setSlots]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [newSlots, setNewSlots] = useState([{ slot_date:'', start_time:'', end_time:'' }]);
  const [saving,   setSaving]   = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchSlots = async () => {
    try {
      const res = await API.get(`/slots/service/${service.id}`, { params: { from: today } });
      setSlots(res.data);
    } catch { setSlots([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSlots(); }, []);

  const addRow    = () => setNewSlots(prev => [...prev, { slot_date:'', start_time:'', end_time:'' }]);
  const removeRow = (i) => setNewSlots(prev => prev.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => {
    setNewSlots(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  // Auto-fill end_time when start_time changes
  const handleStartChange = (i, val) => {
    const dur = parseInt(service.duration_hours) || 1;
    const updated = { ...newSlots[i], start_time: val };
    if (val) {
      const [h, m] = val.split(':').map(Number);
      const endH = h + dur;
      if (endH < 24) updated.end_time = `${String(endH).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    }
    setNewSlots(prev => prev.map((r, idx) => idx === i ? updated : r));
  };

  const capColor = (b, mx) => b >= mx ? '#FF4757' : b / mx >= 0.5 ? '#FF9800' : '#00D4AA';

  const handleSave = async () => {
    const valid = newSlots.filter(s => s.slot_date && s.start_time && s.end_time);
    if (valid.length === 0) return toast.error('Fill in at least one complete slot');
    setSaving(true);
    try {
      await API.post('/slots', { service_id: service.id, slots: valid });
      toast.success(`${valid.length} slot(s) created`);
      setNewSlots([{ slot_date:'', start_time:'', end_time:'' }]);
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create slots');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/slots/${id}`);
      toast.success('Slot removed');
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot delete booked slot');
    }
  };

  const fmtTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}`;
  };

  const dur   = parseInt(service.duration_hours) || 1;
  const teams = parseInt(service.team_count)     || 1;

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-content" style={{maxWidth:620}}>
        <div className="modal-header">
          <h3 className="modal-title">🕐 Manage Slots — {service.title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="sm-info-bar">
          <span className="sm-chip">⏱️ <strong>{dur}h</strong> per job</span>
          <span className="sm-chip">👥 <strong>{teams}</strong> team{teams>1?'s':''} parallel</span>
          <span className="sm-chip sm-hint">End time auto-fills on start change</span>
        </div>

        {/* Add New Slots */}
        <div className="slot-section">
          <h4 style={{fontWeight:700,marginBottom:'var(--space-3)'}}>Add New Slots</h4>
          {newSlots.map((row, i) => (
            <div key={i} className="slot-input-row">
              <input type="date" className="input" min={today} value={row.slot_date}
                onChange={e => updateRow(i,'slot_date',e.target.value)} />
              <input type="time" className="input" value={row.start_time}
                onChange={e => handleStartChange(i, e.target.value)} />
              <input type="time" className="input" value={row.end_time}
                onChange={e => updateRow(i,'end_time',e.target.value)} />
              <button className="btn btn-danger btn-sm" onClick={() => removeRow(i)} disabled={newSlots.length===1}>✕</button>
            </div>
          ))}
          <div style={{display:'flex',gap:'var(--space-3)',marginTop:'var(--space-3)'}}>
            <button className="btn btn-ghost btn-sm" onClick={addRow}>+ Add Row</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving?'Saving...':'💾 Save Slots'}</button>
          </div>
        </div>

        {/* Existing Slots */}
        <div className="slot-section" style={{marginTop:'var(--space-6)'}}>
          <h4 style={{fontWeight:700,marginBottom:'var(--space-3)'}}>Existing Slots</h4>
          {loading ? (
            <div className="spinner-container" style={{minHeight:60}}><div className="spinner"/></div>
          ) : slots.length === 0 ? (
            <p className="text-muted">No slots defined yet. Add slots above.</p>
          ) : (
            <div className="slot-list">
              {slots.map(slot => {
                const booked = parseInt(slot.booked_count) || 0;
                const max    = parseInt(slot.max_capacity) || 1;
                const avail  = max - booked;
                const isFull = avail <= 0;
                const pct    = Math.min(100, Math.round((booked/max)*100));
                const col    = capColor(booked, max);
                return (
                  <div key={slot.id} className={`slot-item${isFull?' slot-full':''}`}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:'.9rem'}}>
                        {new Date(String(slot.slot_date).substring(0,10)+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
                      </div>
                      <div style={{fontSize:'.8rem',color:'var(--text-muted)'}}>
                        {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                      </div>
                      <div style={{marginTop:5}}>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'.7rem',marginBottom:3}}>
                          <span style={{color:col,fontWeight:600}}>{isFull?'🔴 Full':`🟢 ${avail} spot${avail!==1?'s':''} left`}</span>
                          <span style={{color:'var(--text-muted)'}}>{booked}/{max} booked</span>
                        </div>
                        <div style={{height:4,background:'rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden'}}>
                          <div style={{width:`${pct}%`,height:'100%',background:col,borderRadius:4,transition:'width .3s'}}/>
                        </div>
                      </div>
                    </div>
                    <div style={{marginLeft:'var(--space-4)'}}>
                      {booked>0
                        ? <span className="badge badge-warning">{booked} Booked</span>
                        : <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(slot.id)}>🗑️</button>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <style>{`
          .sm-info-bar { display:flex; flex-wrap:wrap; gap:var(--space-3); padding:var(--space-3) var(--space-4); background:rgba(0,212,170,.07); border:1px solid rgba(0,212,170,.2); border-radius:var(--radius-md); margin-bottom:var(--space-5); align-items:center; }
          .sm-chip { font-size:.83rem; color:var(--text-secondary); }
          .sm-hint { font-size:.72rem; color:var(--text-muted); }
          .slot-section {}
          .slot-input-row { display:grid; grid-template-columns:1.2fr 1fr 1fr auto; gap:var(--space-2); margin-bottom:var(--space-2); align-items:center; }
          .slot-list { display:flex; flex-direction:column; gap:var(--space-2); max-height:340px; overflow-y:auto; padding-right:4px; }
          .slot-item { display:flex; align-items:center; padding:var(--space-3) var(--space-4); background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:var(--radius-md); transition:var(--transition); }
          .slot-item:hover { border-color:var(--border-hover); }
          .slot-full { border-color:rgba(255,71,87,.3)!important; background:rgba(255,71,87,.05)!important; }
          @media(max-width:540px){.slot-input-row{grid-template-columns:1fr 1fr;grid-template-rows:auto auto;}}
        `}</style>
      </div>
    </div>
  );
};

export default ProviderDashboard;
