import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      if (from) return navigate(from, { replace: true });
      const routes = { customer: '/', provider: '/dashboard/provider', admin: '/dashboard/admin' };
      navigate(routes[res.data.user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">⚡ ServiceHub</Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input name="email" type="email" className="input" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="input" placeholder="Your password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : '🔐 Sign In'}
          </button>
        </form>
        <div className="auth-demo">
          <p className="demo-title">Demo Credentials</p>
          <div className="demo-creds">
            <div className="demo-item" onClick={() => setForm({ email: 'admin@servicehub.com', password: 'admin123' })}>
              <span className="demo-role">👑 Admin</span>
              <span className="demo-hint">click to fill</span>
            </div>
          </div>
        </div>
        <p className="auth-footer">Don't have an account? <Link to="/register" className="text-primary-color">Sign up free</Link></p>
      </div>
      <style>{`
        .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:var(--space-6); position:relative; background:var(--bg-base); padding-top:96px; }
        .auth-glow { position:fixed; inset:0; background:radial-gradient(ellipse 60% 50% at 50% 0%,rgba(108,99,255,.12) 0%,transparent 70%); pointer-events:none; }
        .auth-card { position:relative; width:100%; max-width:440px; background:var(--gradient-card); border:1px solid var(--border); border-radius:var(--radius-xl); padding:var(--space-10); box-shadow:var(--shadow-lg),var(--shadow-glow); animation:slideUp .4s ease; }
        .auth-header { text-align:center; margin-bottom:var(--space-8); }
        .auth-logo { font-size:1.4rem; font-weight:900; color:var(--text-primary); display:inline-block; margin-bottom:var(--space-4); }
        .auth-title { font-size:1.8rem; font-weight:800; margin-bottom:var(--space-2); }
        .auth-subtitle { color:var(--text-secondary); font-size:.9rem; }
        .auth-form { display:flex; flex-direction:column; gap:var(--space-4); margin-top:var(--space-6); }
        .auth-demo { margin-top:var(--space-6); padding:var(--space-4); background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:var(--radius-md); }
        .demo-title { font-size:.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:var(--space-3); }
        .demo-creds { display:flex; flex-direction:column; gap:var(--space-2); }
        .demo-item { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:rgba(108,99,255,.1); border:1px solid rgba(108,99,255,.2); border-radius:var(--radius-sm); cursor:pointer; transition:var(--transition); }
        .demo-item:hover { background:rgba(108,99,255,.2); }
        .demo-role { font-size:.85rem; font-weight:700; color:var(--primary-light); }
        .demo-hint { font-size:.7rem; color:var(--text-muted); }
        .auth-footer { text-align:center; margin-top:var(--space-6); font-size:.875rem; color:var(--text-secondary); }
        @media(max-width:480px){ .auth-card{padding:var(--space-6);} }
      `}</style>
    </div>
  );
};

export default Login;
