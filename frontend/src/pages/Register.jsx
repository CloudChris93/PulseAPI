import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return 'Please fill in all fields.';
    }
    if (form.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationMessage = validate();
    setFieldError(validationMessage);
    if (validationMessage) return;

    setError('');
    setLoading(true);
    try {
      const data = await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      // If the backend logs the user in immediately (returns a token),
      // AppContext already stored the session — go straight to the app.
      // Otherwise, send them to log in.
      if (data?.token) {
        navigate('/app/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>Create your account</h1>
        <p style={{ color: '#5b6370', fontSize: 14, marginBottom: 20 }}>
          Start monitoring your API in minutes.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="input"
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
          />
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
          <input
            className="input"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />

          {fieldError && <p className="error-text">{fieldError}</p>}
          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 14, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600 }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}