import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { fetchLogs } from '../api/data.js';

const LIMIT = 10;
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const STATUS_CODES = [200, 201, 400, 401, 403, 404, 409, 500];
const NO_FILTERS = { method: 'all', statusCode: 'all' };

function StatusBadge({ code }) {
  const isError = code >= 400;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: isError ? '#fdecea' : '#e8f7ee',
        color: isError ? '#c0392b' : '#17803d',
      }}
    >
      {code}
    </span>
  );
}

export default function Logs() {
  const { projectId } = useParams();
  const { projects, projectsLoading } = useApp();
  const project = projects.find((p) => p._id === projectId);

  const [draft, setDraft] = useState(NO_FILTERS);
  const [applied, setApplied] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ status: 'idle', logs: [], total: null, totalPages: null });

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));

    fetchLogs(projectId, { ...applied, page, limit: LIMIT })
      .then((res) => {
        if (!cancelled) setState({ status: 'ready', logs: res.logs, total: res.total, totalPages: res.totalPages });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', logs: [], total: null, totalPages: null });
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, project, applied, page, reloadKey]);

  useEffect(() => {
    setDraft(NO_FILTERS);
    setApplied(NO_FILTERS);
    setPage(1);
  }, [projectId]);

  function applyFilters() {
    setApplied(draft);
    setPage(1);
  }

  function clearFilters() {
    setDraft(NO_FILTERS);
    setApplied(NO_FILTERS);
    setPage(1);
  }

  if (projectsLoading) return <p style={{ color: '#5b6370' }}>Loading project...</p>;

  if (!project) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>Project not found.</p>
        <p style={{ color: '#5b6370', fontSize: 14, marginBottom: 16 }}>
          It may have been deleted, or you may not have access to it.
        </p>
        <Link to="/app/projects" className="btn btn-primary">Back to Projects</Link>
      </div>
    );
  }

  const { status, logs, total, totalPages } = state;
  const filtersActive = applied.method !== 'all' || applied.statusCode !== 'all';
  const canPrev = page > 1;
  const canNext = totalPages !== null ? page < totalPages : logs.length === LIMIT;

  const pageNumbers = [];
  if (totalPages !== null) {
    const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
    const endPage = Math.min(totalPages, startPage + 4);
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22 }}>Logs</h1>
        <p style={{ color: '#5b6370', fontSize: 14 }}>
          Recent API events for <strong>{project.name}</strong>
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ fontSize: 13, color: '#5b6370', display: 'flex', flexDirection: 'column', gap: 4 }}>
          Method
          <select
            className="project-select"
            value={draft.method}
            onChange={(e) => setDraft({ ...draft, method: e.target.value })}
          >
            <option value="all">All</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <label style={{ fontSize: 13, color: '#5b6370', display: 'flex', flexDirection: 'column', gap: 4 }}>
          Status code
          <select
            className="project-select"
            value={draft.statusCode}
            onChange={(e) => setDraft({ ...draft, statusCode: e.target.value })}
          >
            <option value="all">All</option>
            {STATUS_CODES.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
        <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
      </div>

      {status === 'loading' && <p style={{ color: '#5b6370' }}>Loading logs...</p>}

      {status === 'error' && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>We couldn't load your logs.</p>
          <p style={{ color: '#5b6370', fontSize: 14, marginBottom: 16 }}>Please try again.</p>
          <button className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>Retry</button>
        </div>
      )}

      {status === 'ready' && logs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          {filtersActive ? (
            <>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>No logs match these filters.</p>
              <p style={{ color: '#5b6370', fontSize: 14, marginBottom: 16 }}>Try changing or clearing the filters.</p>
              <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
            </>
          ) : (
            <>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>No API events yet.</p>
              <p style={{ color: '#5b6370', fontSize: 14, marginBottom: 16 }}>
                Send a test event to start collecting data.
              </p>
              <Link to={`/app/projects/${project._id}/integration`} className="btn btn-primary">
                Go to Integration
              </Link>
            </>
          )}
        </div>
      )}

      {status === 'ready' && logs.length > 0 && (
        <div className="card">
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 560 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#5b6370', borderBottom: '1px solid #e3e6eb' }}>
                  <th style={{ padding: '8px 10px' }}>Method</th>
                  <th style={{ padding: '8px 10px' }}>Endpoint</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Response time</th>
                  <th style={{ padding: '8px 10px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                    <td style={{ padding: '10px', fontWeight: 700, fontSize: 12 }}>{log.method}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: 13 }}>{log.endpoint}</td>
                    <td style={{ padding: '10px' }}><StatusBadge code={log.statusCode} /></td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{Math.round(log.responseTime)} ms</td>
                    <td style={{ padding: '10px', color: '#5b6370', whiteSpace: 'nowrap' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 16,
            }}
          >
            <span style={{ fontSize: 13, color: '#5b6370' }}>
              {total !== null
                ? `Showing ${(page - 1) * LIMIT + 1}–${(page - 1) * LIMIT + logs.length} of ${total}`
                : `Page ${page}`}
            </span>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" disabled={!canPrev} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  className={n === page ? 'btn btn-primary' : 'btn btn-secondary'}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button className="btn btn-secondary" disabled={!canNext} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}