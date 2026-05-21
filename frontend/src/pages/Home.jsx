import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import { Sparkles, Wrench, Zap, Leaf, Paintbrush, Package, BookOpen, Camera, Search, Star, CalendarCheck } from 'lucide-react';

const CATEGORIES = [
  { name: 'Cleaning',    Icon: Sparkles },
  { name: 'Plumbing',    Icon: Wrench },
  { name: 'Electrical',  Icon: Zap },
  { name: 'Gardening',   Icon: Leaf },
  { name: 'Painting',    Icon: Paintbrush },
  { name: 'Moving',      Icon: Package },
  { name: 'Tutoring',    Icon: BookOpen },
  { name: 'Photography', Icon: Camera },
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
          <div className="hero-badge">Trusted by 10,000+ customers</div>
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
              <span className="hero-search-icon"><Search size={17} strokeWidth={2} /></span>
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
                <span className="category-icon"><cat.Icon size={26} strokeWidth={1.5} /></span>
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
              <h2 className="h2">Featured Services</h2>
              <p className="text-muted mt-2">Top-rated services chosen for quality</p>
            </div>
            <Link to="/services" className="btn btn-outline hide-mobile">View All →</Link>
          </div>
          {loading ? (
            <div className="spinner-container"><div className="spinner" /></div>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{display:'flex',justifyContent:'center',opacity:0.4}}><Search size={40} strokeWidth={1.5}/></div>
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
              { step: '01', Icon: Search,        title: 'Search Services', desc: 'Browse hundreds of local services. Filter by category, location, price, or rating.' },
              { step: '02', Icon: CalendarCheck,  title: 'Book Instantly',  desc: 'Select your preferred date and time. Add special notes for the provider.' },
              { step: '03', Icon: Star,           title: 'Rate & Review',   desc: 'After service completion, share your experience to help others.' },
            ].map((item) => (
              <div key={item.step} className="how-card">
                <div className="how-step">{item.step}</div>
                <div className="how-icon"><item.Icon size={32} strokeWidth={1.5} /></div>
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
          min-height: 90vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding-top: 64px;
          background: linear-gradient(160deg, #F0F9FF 0%, #E0F2FE 60%, #BAE6FD 100%);
        }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(14,165,233,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 85% 80%, rgba(99,102,241,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-orb {
          position: absolute; border-radius: 50%; filter: blur(70px);
          pointer-events: none; animation: float 8s ease-in-out infinite;
        }
        .hero-orb-1 { width: 360px; height: 360px; background: rgba(14,165,233,0.12); top: 5%; left: -80px; }
        .hero-orb-2 { width: 260px; height: 260px; background: rgba(56,189,248,0.1); bottom: 10%; right: -40px; animation-delay:-4s; }
        .hero-content {
          position: relative; text-align: center;
          padding: var(--space-12) 0 var(--space-16);
          display: flex; flex-direction: column; align-items: center; gap: var(--space-5);
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: var(--space-2);
          padding: 7px 18px;
          background: rgba(14,165,233,0.12);
          border: 1px solid rgba(14,165,233,0.3);
          border-radius: var(--radius-full);
          font-size: 0.82rem; font-weight: 700; color: var(--primary-dark);
          animation: slideUp 0.6s ease;
        }
        .hero-title {
          font-size: clamp(2rem, 6vw, 4.2rem); font-weight: 900; line-height: 1.1;
          color: var(--text-primary); animation: slideUp 0.7s ease;
        }
        .hero-subtitle {
          font-size: clamp(0.95rem, 2vw, 1.15rem); color: var(--text-secondary);
          max-width: 520px; line-height: 1.7; animation: slideUp 0.8s ease;
        }
        .hero-search { width: 100%; max-width: 620px; animation: slideUp 0.9s ease; padding: 0 var(--space-4); }
        .hero-search-inner {
          display: flex; align-items: center;
          background: #fff;
          border: 2px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 6px 6px 6px 16px;
          box-shadow: var(--shadow-md); transition: var(--transition);
        }
        .hero-search-inner:focus-within { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-glow), var(--shadow-md); }
        .hero-search-icon { font-size: 1.1rem; margin-right: var(--space-2); flex-shrink: 0; color: var(--text-muted); }
        .hero-search-input {
          flex: 1; background: none; border: none; outline: none;
          color: var(--text-primary); font-size: 0.95rem; min-width: 0;
        }
        .hero-search-input::placeholder { color: var(--text-muted); }
        .hero-stats {
          display: flex; align-items: center; gap: var(--space-5);
          animation: slideUp 1s ease;
          background: #fff; border: 1px solid var(--border);
          border-radius: var(--radius-xl); padding: var(--space-3) var(--space-6);
          box-shadow: var(--shadow-sm);
        }
        .hero-stat { display: flex; flex-direction: column; align-items: center; }
        .hero-stat-value { font-size: 1.2rem; font-weight: 800; color: var(--primary-dark); }
        .hero-stat-label { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; }
        .hero-stat-divider { width: 1px; height: 28px; background: var(--border); }

        /* Categories */
        .section-title { font-size: clamp(1.4rem, 3vw, 2.1rem); font-weight: 800; color: var(--text-primary); }
        .section-subtitle { margin-top: var(--space-2); margin-bottom: var(--space-6); }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
          margin-top: var(--space-6);
        }
        .category-card {
          display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
          padding: var(--space-4);
          background: #fff; border: 1.5px solid var(--border);
          border-radius: var(--radius-lg); transition: var(--transition);
          cursor: pointer; box-shadow: var(--shadow-sm);
        }
        .category-card:hover {
          border-color: var(--primary); transform: translateY(-3px);
          box-shadow: var(--shadow-md); background: var(--primary-glow);
        }
        .category-icon { display:flex; align-items:center; justify-content:center; color: var(--primary-dark); }
        .category-name { font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); text-align: center; }
        .category-card:hover .category-name { color: var(--primary-dark); }

        /* How It Works */
        .how-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-4); }
        .how-card {
          background: #fff; border: 1.5px solid var(--border);
          border-radius: var(--radius-lg); padding: var(--space-6);
          text-align: center; position: relative; overflow: hidden;
          transition: var(--transition); box-shadow: var(--shadow-sm);
        }
        .how-card:hover { border-color: var(--border-hover); transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .how-step {
          position: absolute; top: var(--space-3); right: var(--space-4);
          font-size: 2.5rem; font-weight: 900;
          color: rgba(14,165,233,0.06); line-height: 1;
        }
        .how-icon { margin-bottom: var(--space-3); display:flex; justify-content:center; align-items:center; color: var(--primary-dark); }
        .how-title { font-size: 1rem; font-weight: 700; margin-bottom: var(--space-2); color: var(--text-primary); }
        .how-desc { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; }

        /* CTA */
        .cta-section { position: relative; padding: var(--space-12) 0; overflow: hidden; background: var(--gradient-primary); }
        .cta-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-content {
          position: relative; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: var(--space-5);
        }
        .cta-title { font-size: clamp(1.6rem, 4vw, 2.8rem); font-weight: 900; color: #fff; }
        .cta-subtitle { color: rgba(255,255,255,0.85); font-size: 1rem; }
        .cta-buttons { display: flex; flex-direction: column; gap: var(--space-3); width: 100%; max-width: 300px; }
        .cta-buttons .btn { width: 100%; background: #fff; color: var(--primary-dark); border-color: #fff; }
        .cta-buttons .btn:last-child { background: rgba(255,255,255,0.15); color: #fff; border-color: rgba(255,255,255,0.4); }
        .cta-buttons .btn:hover { background: rgba(255,255,255,0.95); }

        @media (min-width: 480px) {
          .categories-grid { grid-template-columns: repeat(4, 1fr); }
          .cta-buttons { flex-direction: row; max-width: none; }
          .cta-buttons .btn { width: auto; }
        }
        @media (min-width: 768px) {
          .hero { min-height: 100vh; padding-top: 72px; }
          .hero-search { padding: 0; }
          .how-grid { grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
          .cta-section { padding: var(--space-16) 0; }
        }
      `}</style>
    </div>
  );
};

export default Home;
