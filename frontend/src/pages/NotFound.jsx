import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/app/dashboard" style={{ color: '#4f46e5' }}>Return to Dashboard</Link>
    </div>
  );
}