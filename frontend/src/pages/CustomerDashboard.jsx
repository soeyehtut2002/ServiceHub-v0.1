import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ReviewForm from '../components/ReviewForm';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [reviewBooking, setReviewBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings/my');
      setBookings(res.data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await API.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);
  const counts = { pending: bookings.filter(b=>b.status==='pending').length, confirmed: bookings.filter(b=>b.status==='confirmed').length, completed: bookings.filter(b=>b.status==='completed').length };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <div className="flex-between">
            <div>
              <h1 className="h2">👋 My Dashboard</h1>
              <p className="text-muted mt-2">Welcome back, {user?.name}</p>
            </div>
            <Link to="/services" className="btn btn-primary">Browse Services</Link>
          </div>
        </div>
      </div>

      <div className="container section-sm">
        {/* Stats */}
        <div className="grid-4 grid mb-8">
          {[
            { label:'Total Bookings', value:bookings.length, icon:'📅', color:'#6C63FF' },
            { label:'Pending', value:counts.pending, icon:'⏳', color:'#FFBE0B' },
            { label:'Confirmed', value:counts.confirmed, icon:'✅', color:'#6C63FF' },
            { label:'Completed', value:counts.completed, icon:'🎉', color:'#00D4AA' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{background:`${s.color}22`}}>{s.icon}</div>
              <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs mb-6">
          {['all','pending','confirmed','completed','cancelled'].map(t => (
            <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-container"><div className="spinner"/></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No {tab === 'all' ? '' : tab} bookings</h3>
            <p>Start by browsing available services</p>
            <Link to="/services" className="btn btn-primary mt-4">Browse Services</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Service</th><th>Provider</th><th>Date</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{fontWeight:700,color:'var(--text-primary)'}}>{b.service_title}</div>
                      <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{b.category}</div>
                    </td>
                    <td>{b.provider_name}</td>
                    <td>{new Date(b.booking_date).toLocaleString()}</td>
                    <td style={{color:'var(--success)',fontWeight:700}}>${parseFloat(b.price).toFixed(2)}</td>
                    <td><StatusBadge status={b.status}/></td>
                    <td>
                      <div style={{display:'flex',gap:'var(--space-2)',flexWrap:'wrap'}}>
                        <Link to={`/services/${b.service_id}`} className="btn btn-ghost btn-sm">View</Link>
                        {b.status === 'pending' && <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancel</button>}
                        {b.status === 'completed' && <button className="btn btn-outline btn-sm" onClick={() => setReviewBooking(b)}>Review</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Review Modal */}
        {reviewBooking && (
          <div className="modal-overlay" onClick={(e) => e.target===e.currentTarget && setReviewBooking(null)}>
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Review: {reviewBooking.service_title}</h3>
                <button className="modal-close" onClick={() => setReviewBooking(null)}>✕</button>
              </div>
              <ReviewForm serviceId={reviewBooking.service_id} bookingId={reviewBooking.id} onReviewSubmitted={() => { setReviewBooking(null); toast.success('Review submitted!'); }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
