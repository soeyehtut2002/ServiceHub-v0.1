import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import StatusBadge from '../components/StatusBadge';
import BookingModal from '../components/BookingModal';
import ReviewForm from '../components/ReviewForm';
import toast from 'react-hot-toast';

const ServiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [tab, setTab] = useState('about');

  const fetchService = async () => {
    try {
      const [sRes, rRes] = await Promise.all([
        API.get(`/services/${id}`),
        API.get(`/reviews/service/${id}`),
      ]);
      setService(sRes.data);
      setReviews(rRes.data.reviews || []);
    } catch (err) {
      toast.error('Service not found');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchService(); }, [id]);

  const imgUrl = service?.image_url
    ? service.image_url.startsWith('/uploads') ? `http://localhost:5000${service.image_url}` : service.image_url
    : `https://source.unsplash.com/800x400/?${encodeURIComponent(service?.category || 'service')}`;

  if (loading) return <div className="spinner-container" style={{minHeight:'100vh'}}><div className="spinner"/></div>;
  if (!service) return null;

  return (
    <div className="page-wrapper">
      {/* Hero Image */}
      <div className="detail-hero">
        <img src={imgUrl} alt={service.title} className="detail-hero-img" />
        <div className="detail-hero-overlay" />
        <div className="container detail-hero-content">
          <span className="badge badge-primary">{service.category}</span>
          <h1 className="detail-title">{service.title}</h1>
          <div className="detail-meta">
            <StarRating rating={parseFloat(service.avg_rating)} readonly />
            <span className="detail-rating-val">{parseFloat(service.avg_rating).toFixed(1)}</span>
            <span className="detail-reviews">({service.review_count} reviews)</span>
            <span className="detail-sep">•</span>
            <span>📍 {service.location}</span>
            {service.provider_verified && <span className="verified-badge">✓ Verified Provider</span>}
          </div>
        </div>
      </div>

      <div className="container detail-layout">
        {/* Main Content */}
        <div className="detail-main">
          <div className="tabs mb-6">
            {['about','reviews'].map(t => (
              <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>
                {t === 'about' ? '📋 About' : `⭐ Reviews (${service.review_count})`}
              </button>
            ))}
          </div>

          {tab === 'about' ? (
            <div className="card" style={{padding:'var(--space-6)'}}>
              <h2 style={{fontSize:'1.2rem',fontWeight:700,marginBottom:'var(--space-4)'}}>About this Service</h2>
              <p style={{color:'var(--text-secondary)',lineHeight:1.8}}>{service.description}</p>
              <div className="divider"/>
              <div className="detail-info-grid">
                <div className="detail-info-item"><span className="detail-info-icon">💰</span><div><p className="detail-info-label">Price</p><p className="detail-info-value" style={{color:'var(--success)'}}>
                  ${parseFloat(service.price).toFixed(2)}</p></div></div>
                <div className="detail-info-item"><span className="detail-info-icon">📍</span><div><p className="detail-info-label">Location</p><p className="detail-info-value">{service.location}</p></div></div>
                <div className="detail-info-item"><span className="detail-info-icon">🏷️</span><div><p className="detail-info-label">Category</p><p className="detail-info-value">{service.category}</p></div></div>
                <div className="detail-info-item"><span className="detail-info-icon">⏱️</span><div><p className="detail-info-label">Duration</p><p className="detail-info-value">{service.duration_hours || 1} hour{(service.duration_hours||1)>1?'s':''} per job</p></div></div>
                {(service.team_count || 1) > 1 && (
                  <div className="detail-info-item"><span className="detail-info-icon">👥</span><div><p className="detail-info-label">Capacity</p><p className="detail-info-value">{service.team_count} teams — up to {service.team_count} bookings per slot</p></div></div>
                )}
              </div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
              {user?.role === 'customer' && (
                <ReviewForm
                  serviceId={service.id}
                  existingReview={reviews.find(r => r.customer_id === user.id)}
                  onReviewSubmitted={fetchService}
                />
              )}
              {reviews.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">💬</div><p>No reviews yet. Be the first!</p></div>
              ) : reviews.map((r) => (
                <div key={r.id} className="card review-card">
                  <div className="review-header">
                    <div className="avatar">{r.customer_name?.[0]?.toUpperCase()}</div>
                    <div>
                      <p className="review-author">{r.customer_name}</p>
                      <p className="review-date">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{marginLeft:'auto'}}><StarRating rating={r.rating} readonly size="sm" /></div>
                  </div>
                  {r.comment && <p className="review-comment">{r.comment}</p>}
                  {/* Review images */}
                  {r.image_urls && r.image_urls.length > 0 && (
                    <div className="review-images">
                      {r.image_urls.map((url, i) => (
                        <a key={i} href={url.startsWith('/uploads') ? `http://localhost:5000${url}` : url} target="_blank" rel="noreferrer">
                          <img
                            src={url.startsWith('/uploads') ? `http://localhost:5000${url}` : url}
                            alt={`Review photo ${i+1}`}
                            className="review-img-thumb-view"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="detail-sidebar">
          <div className="booking-card">
            <div className="booking-price"><span className="currency">$</span>{parseFloat(service.price).toFixed(2)}<span className="booking-per"> / service</span></div>
            <div className="divider"/>
            <div className="provider-info">
              <div className="avatar avatar-lg">{service.provider_name?.[0]?.toUpperCase()}</div>
              <div>
                <p className="provider-name">{service.provider_name}</p>
                <p className="provider-label">{service.provider_verified ? '✓ Verified Provider' : 'Service Provider'}</p>
                {service.provider_location && <p style={{fontSize:'.78rem',color:'var(--text-muted)',marginTop:2}}>📍 {service.provider_location}</p>}
              </div>
            </div>
            {service.provider_bio && <p style={{fontSize:'.85rem',color:'var(--text-secondary)',lineHeight:1.6,padding:'var(--space-4)',background:'rgba(255,255,255,.04)',borderRadius:'var(--radius-md)'}}>{service.provider_bio}</p>}
            <div className="divider"/>
            {!user ? (
              <Link to="/login" className="btn btn-primary w-full btn-lg" state={{ from: { pathname: `/services/${id}` } }}>🔐 Login to Book</Link>
            ) : user.role === 'customer' ? (
              <>
                <button className="btn btn-primary w-full btn-lg" onClick={() => setShowBooking(true)}>📅 Book Now</button>
                <Link
                  to={`/chat/${service.provider_id}`}
                  className="btn btn-outline w-full"
                  style={{marginTop:'var(--space-2)',textAlign:'center'}}
                >
                  💬 Message Provider
                </Link>
              </>
            ) : (
              <div className="alert alert-info" style={{textAlign:'center'}}>Only customers can book services</div>
            )}
            {service.provider_phone && <p style={{textAlign:'center',fontSize:'.8rem',color:'var(--text-muted)'}}>📞 {service.provider_phone}</p>}
          </div>
        </aside>
      </div>

      {showBooking && <BookingModal service={service} onClose={() => setShowBooking(false)} onBooked={() => navigate('/dashboard/customer')} />}

      <style>{`
        .detail-hero { position:relative; height:360px; overflow:hidden; margin-bottom:0; }
        .detail-hero-img { width:100%; height:100%; object-fit:cover; }
        .detail-hero-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(10,10,20,.9) 0%,rgba(10,10,20,.3) 100%); }
        .detail-hero-content { position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:100%; padding-bottom:var(--space-8); display:flex; flex-direction:column; gap:var(--space-3); }
        .detail-title { font-size:clamp(1.5rem,3vw,2.5rem); font-weight:900; text-shadow:0 2px 8px rgba(0,0,0,.5); }
        .detail-meta { display:flex; align-items:center; gap:var(--space-3); flex-wrap:wrap; font-size:.875rem; color:var(--text-secondary); }
        .detail-rating-val { font-weight:700; color:var(--text-primary); }
        .detail-reviews { color:var(--text-muted); }
        .detail-sep { color:var(--text-muted); }
        .detail-layout { display:grid; grid-template-columns:1fr 340px; gap:var(--space-8); padding-top:var(--space-8); padding-bottom:var(--space-16); align-items:start; }
        .detail-main {}
        .detail-sidebar {}
        .booking-card { background:var(--gradient-card); border:1px solid var(--border); border-radius:var(--radius-xl); padding:var(--space-6); display:flex; flex-direction:column; gap:var(--space-5); position:sticky; top:88px; box-shadow:var(--shadow-card); }
        .booking-price { font-size:2rem; font-weight:900; color:var(--success); }
        .booking-per { font-size:.9rem; font-weight:400; color:var(--text-muted); }
        .provider-info { display:flex; align-items:center; gap:var(--space-4); }
        .provider-name { font-weight:700; font-size:.95rem; }
        .provider-label { font-size:.75rem; color:var(--success); }
        .detail-info-grid { display:flex; flex-direction:column; gap:var(--space-4); margin-top:var(--space-4); }
        .detail-info-item { display:flex; align-items:center; gap:var(--space-4); }
        .detail-info-icon { font-size:1.4rem; width:36px; text-align:center; }
        .detail-info-label { font-size:.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; }
        .detail-info-value { font-weight:700; font-size:.95rem; margin-top:2px; }
        .review-card { padding:var(--space-5); }
        .review-header { display:flex; align-items:center; gap:var(--space-3); margin-bottom:var(--space-3); }
        .review-author { font-weight:700; font-size:.9rem; }
        .review-date { font-size:.75rem; color:var(--text-muted); }
        .review-comment { font-size:.875rem; color:var(--text-secondary); line-height:1.6; }
        .review-images { display:flex; flex-wrap:wrap; gap:var(--space-2); margin-top:var(--space-3); }
        .review-img-thumb-view { width:72px; height:72px; object-fit:cover; border-radius:var(--radius-md); border:1px solid var(--border); cursor:pointer; transition:var(--transition); }
        .review-img-thumb-view:hover { transform:scale(1.05); border-color:var(--primary); }
        @media(max-width:900px){ .detail-layout{grid-template-columns:1fr;} .booking-card{position:static;} }
      `}</style>
    </div>
  );
};

export default ServiceDetail;
