import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { sendTestEvent } from '../api/client.js';
import { addDevEvent } from '../api/devEvents.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SAMPLE_ENDPOINTS = [
  ['GET', '/api/products'],
  ['GET', '/api/users'],
  ['POST', '/api/orders'],
  ['POST', '/api/login'],
];

function randomEvent(statusCode) {
  const [method, endpoint] = SAMPLE_ENDPOINTS[Math.floor(Math.random() * SAMPLE_ENDPOINTS.length)];
  return {
    method,
    endpoint,
    statusCode,
    responseTime: 50 + Math.floor(Math.random() * 550),
    timestamp: new Date().toISOString(),
  };
}

function CodeBlock({ label, code }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#5b6370', fontWeight: 600 }}>{label}</span>
        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          background: '#14171f',
          color: '#e3e6eb',
          padding: 14,
          borderRadius: 8,
          fontSize: 13,
          overflowX: 'auto',
        }}
      >
        {code}
      </pre>
    </div>
  );
}

export default function Integration() {
  const { projectId } = useParams();
  const { projects, projectsLoading, isDev } = useApp();
  const project = projects.find((p) => p._id === projectId);

  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [keyCopied, setKeyCopied] = useState(false);

  if (projectsLoading) {
    return <p style={{ color: '#5b6370' }}>Loading project...</p>;
  }

  if (!project) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>Project not found.</p>
        <p style={{ color: '#5b6370', fontSize: 14, marginBottom: 16 }}>
          It may have been deleted, or you may not have access to it.
        </p>
        <Link to="/app/projects" className="btn btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(project.apiKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 1500);
    } catch {
      setKeyCopied(false);
    }
  }

  async function handleSend(statusCode) {
    setStatus({ type: 'sending', message: 'Sending test event...' });
    const event = randomEvent(statusCode);
    try {
      if (isDev) {
        // DEV ONLY: no backend yet, so store the event locally.
        addDevEvent(project._id, event);
      } else {
        await sendTestEvent(project.apiKey, event);
      }
      setStatus({
        type: 'success',
        message: `Test event sent successfully (${event.method} ${event.endpoint} → ${event.statusCode}).`,
      });
    } catch {
      setStatus({
        type: 'error',
        message: 'The test event could not be sent. Please try again.',
      });
    }
  }

  const sampleEvent = JSON.stringify(
    {
      method: 'GET',
      endpoint: '/api/products',
      statusCode: 200,
      responseTime: 143,
      timestamp: '2026-09-25T10:30:00Z',
    },
    null,
    2
  );

  const curlExample = `curl -X POST ${API_BASE_URL}/ingest \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${project.apiKey}" \\
  -d '{"method":"GET","endpoint":"/api/products","statusCode":200,"responseTime":143}'`;

  const sending = status.type === 'sending';

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Integration</h1>
      <p style={{ color: '#5b6370', fontSize: 14, marginBottom: 20 }}>
        Connect <strong>{project.name}</strong> to PulseAPI.
      </p>

      {/* Project key */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Project API key</h2>
        <p style={{ color: '#5b6370', fontSize: 13, marginBottom: 12 }}>
          Your API sends this key in the <code>x-api-key</code> header when reporting events.
          It is only used for event ingestion.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <code
            style={{
              flex: 1,
              minWidth: 200,
              background: '#f7f8fa',
              border: '1px solid #e3e6eb',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              wordBreak: 'break-all',
            }}
          >
            {project.apiKey}
          </code>
          <button className="btn btn-secondary" onClick={copyKey}>
            {keyCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>How to send events</h2>
        <p style={{ color: '#5b6370', fontSize: 13, marginBottom: 16 }}>
          Send a <code>POST</code> request to <code>/api/ingest</code> for each request your API handles.
        </p>
        <CodeBlock label="Event body (JSON)" code={sampleEvent} />
        <CodeBlock label="Example request (curl)" code={curlExample} />
      </div>

      {/* Send test event */}
      <div className="card">
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Send a test event</h2>
        <p style={{ color: '#5b6370', fontSize: 13, marginBottom: 16 }}>
          Sends a sample event to this project so you can see it on the Dashboard and Logs pages.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <button className="btn btn-primary" disabled={sending} onClick={() => handleSend(200)}>
            {sending ? 'Sending...' : 'Send Test Event'}
          </button>
          <button className="btn btn-secondary" disabled={sending} onClick={() => handleSend(500)}>
            Send Error Event (500)
          </button>
        </div>

        {status.type === 'success' && (
          <p style={{ color: '#17803d', fontSize: 14 }}>{status.message}</p>
        )}
        {status.type === 'error' && <p className="error-text">{status.message}</p>}
        {sending && <p style={{ color: '#5b6370', fontSize: 14 }}>{status.message}</p>}

        {status.type === 'success' && (
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <Link to="/app/dashboard" style={{ color: '#4f46e5', fontWeight: 600, fontSize: 14 }}>
              View Dashboard →
            </Link>
            <Link to={`/app/projects/${project._id}/logs`} style={{ color: '#4f46e5', fontWeight: 600, fontSize: 14 }}>
              View Logs →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}