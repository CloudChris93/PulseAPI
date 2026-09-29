import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Login() {
  const { login, devLogin } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  function handleDevLogin() {
    devLogin();
    navigate('/app/dashboard');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: 16 }}>
          <Logo />
        </div>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>Welcome back</h1>
        <p style={{ color: '#5b6370', fontSize: 14, marginBottom: 20 }}>
          Log in to view your API analytics.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 14, textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600 }}>
            Register
          </Link>
        </p>

        {/* DEV ONLY — remove once real backend login works */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed #e3e6eb' }}>
          <button
            type="button"
            onClick={handleDevLogin}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Dev Login (skip backend)
          </button>
          <p style={{ fontSize: 12, color: '#8a91a0', marginTop: 6, textAlign: 'center' }}>
            Temporary — for previewing /app pages before the backend exists.
          </p>
        </div>
      </div>
    </div>
  );
}