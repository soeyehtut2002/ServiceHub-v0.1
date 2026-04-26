import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import ServiceCard from '../components/ServiceCard';

const CATEGORIES = [
  { name: 'Cleaning',      icon: '🧹' },
  { name: 'Plumbing',      icon: '🔧' },
  { name: 'Electrical',    icon: '⚡' },
  { name: 'Gardening',     icon: '🌿' },
  { name: 'Painting',      icon: '🎨' },
  { name: 'Moving',        icon: '📦' },
  { name: 'Tutoring',      icon: '📚' },
  { name: 'Photography',   icon: '📷' },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get('/services/featured');
        setFeatured(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?keyword=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  return (
    <div className="home">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="container hero-content">
          <div className="hero-badge">✨ Trusted by 10,000+ customers</div>
          <h1 className="hero-title">
            Find Trusted Local<br />
            <span className="gradient-text">Services Near You</span>
          </h1>
          <p className="hero-subtitle">
            Connect with verified service professionals in your area.<br />
            Book instantly. Rate honestly. Trust fully.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-inner">
              <span className="hero-search-icon">🔍</span>
              <input
                type="text"
                placeholder="What service are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
              />
              <button type="submit" className="btn btn-primary btn-lg">
                Search
              </button>
            </div>
          </form>
          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-value">500+</span><span className="hero-stat-label">Services</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-value">200+</span><span className="hero-stat-label">Providers</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-value">4.9★</span><span className="hero-stat-label">Avg Rating</span></div>
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────── */}
      <section className="section section-sm" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <h2 className="section-title text-center">Browse by Category</h2>
          <p className="section-subtitle text-center text-muted">Find exactly what you need</p>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/services?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Services ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="flex-between mb-8">
            <div>
              <h2 className="h2">⭐ Featured Services</h2>
              <p className="text-muted mt-2">Top-rated services chosen for quality</p>
            </div>
            <Link to="/services" className="btn btn-outline hide-mobile">View All →</Link>
          </div>
          {loading ? (
            <div className="spinner-container"><div className="spinner" /></div>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>No services yet. <Link to="/register" className="text-primary-color">Be the first provider!</Link></p>
            </div>
          ) : (
            <div className="grid-services grid">
              {featured.map((s) => <ServiceCard key={s.id} service={s} />)}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/services" className="btn btn-primary btn-lg">Explore All Services →</Link>
          </div>
        </div>
      </section>

      {/* ─── How it Works ─────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <h2 className="h2 text-center mb-8">How ServiceHub Works</h2>
          <div className="how-grid">
            {[
              { step: '01', icon: '🔍', title: 'Search Services', desc: 'Browse hundreds of local services. Filter by category, location, price, or rating.' },
              { step: '02', icon: '📅', title: 'Book Instantly', desc: 'Select your preferred date and time. Add special notes for the provider.' },
              { step: '03', icon: '⭐', title: 'Rate & Review', desc: 'After service completion, share your experience to help others.' },
            ].map((item) => (
              <div key={item.step} className="how-card">
                <div className="how-step">{item.step}</div>
                <div className="how-icon">{item.icon}</div>
                <h3 className="how-title">{item.title}</h3>
                <p className="how-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="container cta-content">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-subtitle">Join thousands of satisfied customers and trusted service providers</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-xl">Get Started Free</Link>
            <Link to="/services" className="btn btn-ghost btn-xl">Browse Services</Link>
          </div>
        </div>
      </section>

      <style>{`
        /* Hero */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding-top: 72px;
          background: var(--gradient-hero);
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(255,101,132,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }
        .hero-orb-1 { width: 400px; height: 400px; background: rgba(108,99,255,0.08); top: 10%; left: -100px; }
        .hero-orb-2 { width: 300px; height: 300px; background: rgba(255,101,132,0.06); bottom: 15%; right: -50px; animation-delay: -4s; }
        .hero-content {
          position: relative;
          text-align: center;
          padding: var(--space-16) 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 8px 20px;
          background: rgba(108,99,255,0.15);
          border: 1px solid rgba(108,99,255,0.3);
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--primary-light);
          animation: slideUp 0.6s ease;
        }
        .hero-title {
          font-size: clamp(2.2rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 1.1;
          animation: slideUp 0.7s ease;
        }
        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: var(--text-secondary);
          max-width: 540px;
          line-height: 1.7;
          animation: slideUp 0.8s ease;
        }
        .hero-search {
          width: 100%;
          max-width: 640px;
          animation: slideUp 0.9s ease;
        }
        .hero-search-inner {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.07);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 6px 6px 6px 16px;
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow-lg);
          transition: var(--transition);
        }
        .hero-search-inner:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-glow), var(--shadow-lg);
        }
        .hero-search-icon { font-size: 1.1rem; margin-right: var(--space-3); flex-shrink: 0; }
        .hero-search-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 1rem;
          min-width: 0;
        }
        .hero-search-input::placeholder { color: var(--text-muted); }
        .hero-stats {
          display: flex;
          align-items: center;
          gap: var(--space-6);
          animation: slideUp 1s ease;
        }
        .hero-stat { display: flex; flex-direction: column; align-items: center; }
        .hero-stat-value { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); }
        .hero-stat-label { font-size: 0.75rem; color: var(--text-muted); }
        .hero-stat-divider { width: 1px; height: 32px; background: var(--border); }

        /* Categories */
        .section-title { font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 800; }
        .section-subtitle { margin-top: var(--space-2); margin-bottom: var(--space-8); }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
          margin-top: var(--space-8);
        }
        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-6);
          background: var(--gradient-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          transition: var(--transition);
          cursor: pointer;
          box-shadow: var(--shadow-card);
        }
        .category-card:hover {
          border-color: var(--primary);
          transform: translateY(-4px);
          box-shadow: var(--shadow-md), var(--shadow-glow);
          background: rgba(108,99,255,0.08);
        }
        .category-icon { font-size: 2rem; }
        .category-name { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); text-align: center; }
        .category-card:hover .category-name { color: var(--primary-light); }

        /* How It Works */
        .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
        .how-card {
          background: var(--gradient-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-8);
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: var(--transition);
          box-shadow: var(--shadow-card);
        }
        .how-card:hover { border-color: var(--border-hover); transform: translateY(-4px); }
        .how-step {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          font-size: 3rem;
          font-weight: 900;
          color: rgba(255,255,255,0.04);
          line-height: 1;
        }
        .how-icon { font-size: 2.5rem; margin-bottom: var(--space-4); }
        .how-title { font-size: 1.1rem; font-weight: 700; margin-bottom: var(--space-3); }
        .how-desc { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }

        /* CTA */
        .cta-section {
          position: relative;
          padding: var(--space-16) 0;
          overflow: hidden;
        }
        .cta-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(255,101,132,0.1) 100%);
          pointer-events: none;
        }
        .cta-content {
          position: relative;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
        }
        .cta-title { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 900; }
        .cta-subtitle { color: var(--text-secondary); font-size: 1.05rem; }
        .cta-buttons { display: flex; gap: var(--space-4); flex-wrap: wrap; justify-content: center; }

        @media (max-width: 768px) {
          .categories-grid { grid-template-columns: repeat(2, 1fr); }
          .how-grid { grid-template-columns: 1fr; }
          .hero-stats { gap: var(--space-4); }
          .cta-buttons { flex-direction: column; width: 100%; max-width: 300px; }
          .cta-buttons .btn { width: 100%; }
        }
        @media (max-width: 480px) {
          .categories-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
        }
      `}</style>
    </div>
  );
};

export default Home;
