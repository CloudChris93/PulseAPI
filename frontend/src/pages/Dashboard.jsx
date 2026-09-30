import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext.jsx';
import { fetchSummary, fetchTimeseries, fetchEndpoints } from '../api/data.js';

function StatCard({ label, value, tone }) {
  return (
    <div className="card">
      <p style={{ color: '#5b6370', fontSize: 13, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: tone || '#14171f' }}>{value}</p>
    </div>
  );
}

function MethodBadge({ method }) {
  const colors = { GET: '#17803d', POST: '#4f46e5', PUT: '#b45309', PATCH: '#b45309', DELETE: '#c0392b' };
  return (
    <span style={{ fontWeight: 700, fontSize: 12, color: colors[method] || '#5b6370' }}>{method}</span>
  );
}

export default function Dashboard() {
  const { selectedProject, projectsLoading } = useApp();
  const projectId = selectedProject?._id;

  const [state, setState] = useState({ status: 'idle', summary: null, series: [], endpoints: [] });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false; // ignore late responses if the user switches project
    setState({ status: 'loading', summary: null, series: [], endpoints: [] });

    Promise.all([fetchSummary(projectId), fetchTimeseries(projectId), fetchEndpoints(projectId)])
      .then(([summary, series, endpoints]) => {
        if (!cancelled) setState({ status: 'ready', summary, series, endpoints });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', summary: null, series: [], endpoints: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadKey]);

  if (projectsLoading) return <p style={{ color: '#5b6370' }}>Loading projects...</p>;

  if (!selectedProject) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>No project selected.</p>
        <p style={{ color: '#5b6370', fontSize: 14, marginBottom: 16 }}>
          Create or select a project to see its analytics.
        </p>
        <Link to="/app/projects" className="btn btn-primary">Go to Projects</Link>
      </div>
    );
  }

  const { status, summary, series, endpoints } = state;
  const hasData = status === 'ready' && summary.total > 0;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22 }}>Dashboard</h1>
        <p style={{ color: '#5b6370', fontSize: 14 }}>
          Analytics for <strong>{selectedProject.name}</strong>
        </p>
      </div>

      {status === 'loading' && <p style={{ color: '#5b6370' }}>Loading analytics...</p>}

      {status === 'error' && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>We couldn't load your analytics.</p>
          <p style={{ color: '#5b6370', fontSize: 14, marginBottom: 16 }}>Please try again.</p>
          <button className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>Retry</button>
        </div>
      )}

      {status === 'ready' && !hasData && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Not enough data yet.</p>
          <p style={{ color: '#5b6370', fontSize: 14, marginBottom: 16 }}>
            Send your first test event from the Integration page to see analytics.
          </p>
          <Link to={`/app/projects/${projectId}/integration`} className="btn btn-primary">
            Go to Integration
          </Link>
        </div>
      )}

      {hasData && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 20 }}>
            <StatCard label="Total Requests" value={summary.total.toLocaleString()} />
            <StatCard label="Successful Requests" value={summary.successful.toLocaleString()} tone="#17803d" />
            <StatCard label="Errors" value={summary.errors.toLocaleString()} tone={summary.errors > 0 ? '#c0392b' : undefined} />
            <StatCard label="Error Rate" value={summary.errorRate.toFixed(1) + '%'} />
            <StatCard label="Avg Response Time" value={Math.round(summary.avgResponseTime) + ' ms'} />
          </div>

          {/* Requests over time */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, marginBottom: 16 }}>Requests over time</h2>
            {series.length === 0 ? (
              <p style={{ color: '#5b6370', fontSize: 14 }}>No request data yet.</p>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e3e6eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" name="Requests" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Endpoint performance */}
          <div className="card">
            <h2 style={{ fontSize: 16, marginBottom: 16 }}>Endpoint performance</h2>
            {endpoints.length === 0 ? (
              <p style={{ color: '#5b6370', fontSize: 14 }}>No endpoint data yet.</p>
            ) : (
              <div className="table-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 480 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#5b6370', borderBottom: '1px solid #e3e6eb' }}>
                      <th style={{ padding: '8px 10px' }}>Method</th>
                      <th style={{ padding: '8px 10px' }}>Endpoint</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Requests</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Errors</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Avg time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.map((e) => (
                      <tr key={e.method + e.endpoint} style={{ borderBottom: '1px solid #f0f2f5' }}>
                        <td style={{ padding: '10px' }}><MethodBadge method={e.method} /></td>
                        <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: 13 }}>{e.endpoint}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{e.requests}</td>
                        <td style={{ padding: '10px', textAlign: 'right', color: e.errors > 0 ? '#c0392b' : undefined }}>{e.errors}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{Math.round(e.avgResponseTime)} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}