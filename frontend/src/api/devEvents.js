// DEV ONLY — fake events + local analytics so pages can be built without a
// backend. Returns data in the SAME shape as the real API contract.
// DELETE this file once Dev Login is removed.

const KEY = 'devEvents';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function writeAll(all) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getDevEvents(projectId) {
  return readAll()[projectId] || [];
}

export function addDevEvent(projectId, event) {
  const all = readAll();
  const list = all[projectId] || [];
  list.push({ _id: 'evt-' + Date.now() + '-' + Math.floor(Math.random() * 100000), ...event });
  all[projectId] = list;
  writeAll(all);
}

const SAMPLE = [
  ['GET', '/api/products'],
  ['GET', '/api/users'],
  ['POST', '/api/orders'],
  ['POST', '/api/login'],
  ['DELETE', '/api/orders/:id'],
];

// Adds 60 random events spread across the last 24 hours.
export function seedDevEvents(projectId) {
  const now = Date.now();
  for (let i = 0; i < 60; i++) {
    const [method, endpoint] = SAMPLE[Math.floor(Math.random() * SAMPLE.length)];
    const isError = Math.random() < 0.15;
    const statusCode = isError
      ? [400, 401, 404, 500][Math.floor(Math.random() * 4)]
      : method === 'POST' ? 201 : 200;
    addDevEvent(projectId, {
      method,
      endpoint,
      statusCode,
      responseTime: 40 + Math.floor(Math.random() * 600),
      timestamp: new Date(now - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
    });
  }
}

// -> { totalRequests, successfulRequests, errors, errorRate, averageResponseTime }
export function computeSummary(events) {
  const total = events.length;
  const errors = events.filter((e) => e.statusCode >= 400).length;
  const avg = total ? events.reduce((s, e) => s + e.responseTime, 0) / total : 0;
  return {
    totalRequests: total,
    successfulRequests: total - errors,
    errors,
    errorRate: total ? (errors / total) * 100 : 0,
    averageResponseTime: avg,
  };
}

// -> { points: [{ date, requests }] }  (requests per hour, last 24 hours)
export function computeTimeseries(events) {
  const hour = 60 * 60 * 1000;
  const start = Math.floor(Date.now() / hour) * hour;
  const buckets = [];
  for (let i = 23; i >= 0; i--) {
    const t = start - i * hour;
    buckets.push({ t, date: new Date(t).getHours().toString().padStart(2, '0') + ':00', requests: 0 });
  }
  events.forEach((e) => {
    const t = new Date(e.timestamp).getTime();
    const b = buckets.find((x) => t >= x.t && t < x.t + hour);
    if (b) b.requests += 1;
  });
  return { points: buckets.map(({ date, requests }) => ({ date, requests })) };
}

// -> { endpoints: [{ method, endpoint, requests, errors, averageResponseTime }] }
export function computeEndpoints(events) {
  const map = {};
  events.forEach((e) => {
    const k = e.method + ' ' + e.endpoint;
    if (!map[k]) map[k] = { method: e.method, endpoint: e.endpoint, requests: 0, errors: 0, totalTime: 0 };
    map[k].requests += 1;
    if (e.statusCode >= 400) map[k].errors += 1;
    map[k].totalTime += e.responseTime;
  });
  const endpoints = Object.values(map)
    .map((r) => ({
      method: r.method,
      endpoint: r.endpoint,
      requests: r.requests,
      errors: r.errors,
      averageResponseTime: r.totalTime / r.requests,
    }))
    .sort((a, b) => b.requests - a.requests);
  return { endpoints };
}

// -> { logs: [...], pagination: { page, limit, total, pages } }
// Filters by method and exact statusCode, newest first, like the real backend.
export function computeLogs(events, { method, statusCode, page = 1, limit = 10 }) {
  let list = [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (method && method !== 'all') list = list.filter((e) => e.method === method);
  if (statusCode && statusCode !== 'all') {
    list = list.filter((e) => e.statusCode === Number(statusCode));
  }

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return {
    logs: list.slice(start, start + limit).map((e) => ({
      id: e._id,
      method: e.method,
      endpoint: e.endpoint,
      statusCode: e.statusCode,
      responseTime: e.responseTime,
      timestamp: e.timestamp,
    })),
    pagination: { page, limit, total, pages },
  };
}