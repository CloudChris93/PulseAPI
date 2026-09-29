import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useApp();

  if (authLoading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}