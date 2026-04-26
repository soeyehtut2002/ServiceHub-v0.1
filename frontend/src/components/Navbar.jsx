import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getDashboardLink = () => {
    if (!user) return null;
    const paths = { customer: '/dashboard/customer', provider: '/dashboard/provider', admin: '/dashboard/admin' };
    return paths[user.role] || '/';
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Service<span className="gradient-text">Hub</span></span>
        </Link>

        {/* Search */}
        <form className="navbar-search hide-mobile" onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        {/* Nav Links */}
        <div className="navbar-links hide-mobile">
          <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Services
          </NavLink>
          {user && (
            <NavLink to={getDashboardLink()} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
          )}
        </div>

        {/* Auth / User */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu" ref={menuRef}>
              <button className="user-trigger" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="avatar avatar-sm">
                  {getInitials(user.name)}
                </div>
                <span className="user-name hide-mobile">{user.name.split(' ')[0]}</span>
                <span className="chevron">{menuOpen ? '▲' : '▼'}</span>
              </button>
              {menuOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="avatar avatar-lg">{getInitials(user.name)}</div>
                    <div>
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-role">{user.role}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    📊 Dashboard
                  </Link>
                  {user.role === 'provider' && (
                    <Link to="/dashboard/provider" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      ➕ My Services
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn btn-primary">Go</button>
          </form>
          <Link to="/services" className="mobile-link" onClick={() => setMenuOpen(false)}>Services</Link>
          {user ? (
            <>
              <Link to={getDashboardLink()} className="mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button className="mobile-link danger-link" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: var(--z-nav);
          padding: 0 var(--space-6);
          height: 72px;
          transition: var(--transition-slow);
          background: rgba(10,10,20,0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid transparent;
        }
        .navbar-scrolled {
          background: rgba(10,10,20,0.95);
          border-bottom-color: var(--border);
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          height: 100%;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 1.3rem;
          font-weight: 800;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .logo-icon { font-size: 1.4rem; }
        .logo-text { font-family: 'Plus Jakarta Sans', sans-serif; }
        .navbar-search {
          flex: 1;
          max-width: 380px;
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.9rem;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          color: var(--text-primary);
          font-size: 0.875rem;
          padding: 9px 16px 9px 38px;
          outline: none;
          transition: var(--transition);
        }
        .search-input::placeholder { color: var(--text-muted); }
        .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); background: rgba(255,255,255,0.08); }
        .navbar-links { display: flex; align-items: center; gap: var(--space-1); }
        .nav-link {
          padding: 8px 14px;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .nav-link:hover, .nav-link.active { color: var(--text-primary); background: rgba(255,255,255,0.07); }
        .navbar-actions { display: flex; align-items: center; gap: var(--space-3); margin-left: auto; }
        .auth-buttons { display: flex; gap: var(--space-2); }
        .user-menu { position: relative; }
        .user-trigger {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 4px 12px 4px 4px;
          color: var(--text-primary);
          cursor: pointer;
          transition: var(--transition);
        }
        .user-trigger:hover { border-color: var(--primary); background: rgba(108,99,255,0.1); }
        .avatar-sm { width: 32px; height: 32px; font-size: 0.75rem; }
        .user-name { font-size: 0.875rem; font-weight: 600; }
        .chevron { font-size: 0.6rem; color: var(--text-muted); }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 220px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          animation: slideUp 0.15s ease;
          z-index: 10;
        }
        .dropdown-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: rgba(255,255,255,0.03);
        }
        .avatar-lg { width: 40px; height: 40px; font-size: 0.9rem; }
        .dropdown-name { font-weight: 700; font-size: 0.9rem; }
        .dropdown-role {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: capitalize;
          background: var(--primary-glow);
          color: var(--primary-light);
          padding: 2px 6px;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-top: 2px;
        }
        .dropdown-divider { height: 1px; background: var(--border); }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 12px 16px;
          font-size: 0.875rem;
          color: var(--text-secondary);
          transition: var(--transition);
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
        }
        .dropdown-item:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
        .dropdown-item.danger:hover { background: rgba(255,71,87,0.1); color: var(--danger); }
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; padding: 8px; cursor: pointer; }
        .hamburger span { width: 20px; height: 2px; background: var(--text-secondary); border-radius: 2px; transition: var(--transition); display: block; }
        .mobile-menu {
          position: absolute;
          top: 72px;
          left: 0;
          right: 0;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          animation: slideUp 0.2s ease;
        }
        .mobile-search { display: flex; gap: var(--space-2); }
        .mobile-link {
          padding: 12px var(--space-4);
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: var(--transition);
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
        }
        .mobile-link:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }
        .danger-link:hover { color: var(--danger); }
        @media (max-width: 768px) {
          .hamburger { display: flex; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
