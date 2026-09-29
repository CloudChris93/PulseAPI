import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Landing() {
  const { isAuthenticated } = useApp();

  return (
    <div>
      {/* Navbar */}
      <header style={{ borderBottom: '1px solid #e3e6eb', background: '#fff' }}>
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          <Logo />
          <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {isAuthenticated ? (
              <Link to="/app/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container" style={{ padding: '72px 20px 56px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: 40,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                background: '#eef2ff',
                color: '#4f46e5',
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 999,
                marginBottom: 16,
              }}
            >
              API Analytics, made simple
            </span>
            <h1 style={{ fontSize: 40, lineHeight: 1.15, marginBottom: 16 }}>
              Understand your API performance from one dashboard.
            </h1>
            <p style={{ color: '#5b6370', fontSize: 17, marginBottom: 28, maxWidth: 480 }}>
              PulseAPI helps API owners monitor requests, errors, response time, and
              endpoint performance — without building their own analytics dashboard.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
            </div>
          </div>

          <div
            className="card"
            style={{
              background: '#14171f',
              color: '#e3e6eb',
              fontFamily: 'monospace',
              fontSize: 13,
              padding: 20,
            }}
          >
            <div style={{ color: '#8a91a0', marginBottom: 10 }}>POST /api/ingest</div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`{
  "method": "GET",
  "endpoint": "/api/products",
  "statusCode": 200,
  "responseTime": 143,
  "timestamp": "2026-09-25T10:30:00Z"
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container" style={{ padding: '48px 20px' }}>
        <h2 style={{ fontSize: 22, marginBottom: 4, textAlign: 'center' }}>
          Everything you need to monitor your API
        </h2>
        <p style={{ color: '#5b6370', textAlign: 'center', marginBottom: 28 }}>
          No extra infrastructure. No enterprise bloat. Just the metrics that matter.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {[
            ['📈', 'Request Analytics', 'See total requests and traffic trends for your API over time.'],
            ['⚠️', 'Error Monitoring', 'Track failed requests and your overall error rate at a glance.'],
            ['⚡', 'Performance Tracking', 'Know your average response time, so you catch slowdowns early.'],
            ['📊', 'Endpoint Statistics', 'Break down usage, errors, and speed by individual endpoint.'],
          ].map(([icon, title, desc]) => (
            <div className="card" key={title}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
              <h3 style={{ marginBottom: 8, fontSize: 16 }}>{title}</h3>
              <p style={{ color: '#5b6370', fontSize: 14 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', borderTop: '1px solid #e3e6eb', borderBottom: '1px solid #e3e6eb' }}>
        <div className="container" style={{ padding: '48px 20px' }}>
          <h2 style={{ fontSize: 22, marginBottom: 28, textAlign: 'center' }}>How it works</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            {[
              ['1', 'Create a project', 'Register and set up a project for the API you want to monitor.'],
              ['2', 'Get your project key', 'PulseAPI generates a unique key that identifies your project.'],
              ['3', 'Send usage events', 'Your API (or a quick test call) sends events to the ingestion endpoint.'],
              ['4', 'View analytics', 'Watch requests, errors, and performance show up on your dashboard.'],
            ].map(([num, title, desc]) => (
              <div key={title}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#4f46e5',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  {num}
                </div>
                <h3 style={{ fontSize: 15, marginBottom: 6 }}>{title}</h3>
                <p style={{ color: '#5b6370', fontSize: 13 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container" style={{ padding: '48px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>Ready to see your API's real numbers?</h2>
        <p style={{ color: '#5b6370', marginBottom: 20 }}>
          Set up your first project in a couple of minutes.
        </p>
        <Link to="/register" className="btn btn-primary">
          Get Started
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #e3e6eb',
          padding: '24px 20px',
          textAlign: 'center',
          color: '#8a91a0',
          fontSize: 13,
        }}
      >
        <Logo size={16} /> — Group 44 Capstone Project
      </footer>
    </div>
  );
}