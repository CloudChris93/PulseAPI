import {
  getAnalyticsSummary,
  getAnalyticsTimeseries,
  getEndpointStats,
  getLogs,
} from './client.js';

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// ---- Normalizers: match PulseAPI API Contract v1 exactly.

function normalizeSummary(raw) {
  const s = raw ?? {};
  return {
    total: num(s.totalRequests),
    successful: num(s.successfulRequests),
    errors: num(s.errors),
    errorRate: num(s.errorRate),
    avgResponseTime: num(s.averageResponseTime),
  };
}

// data: { points: [{ date, requests }] }
function normalizeTimeseries(raw) {
  return (raw?.points ?? []).map((p) => ({
    label: String(p.date ?? ''),
    count: num(p.requests),
  }));
}

// data: { endpoints: [{ method, endpoint, requests, errors, averageResponseTime }] }
function normalizeEndpoints(raw) {
  return (raw?.endpoints ?? []).map((e) => ({
    method: e.method ?? '',
    endpoint: e.endpoint ?? '',
    requests: num(e.requests),
    errors: num(e.errors),
    avgResponseTime: num(e.averageResponseTime),
  }));
}

// data: { logs: [...], pagination: { page, limit, total, pages } }
function normalizeLogs(raw) {
  const pg = raw?.pagination ?? {};
  return {
    logs: (raw?.logs ?? []).map((l) => ({
      id: l.id,
      method: l.method ?? '',
      endpoint: l.endpoint ?? '',
      statusCode: num(l.statusCode),
      responseTime: num(l.responseTime),
      timestamp: l.timestamp ?? '',
    })),
    page: num(pg.page) || 1,
    total: pg.total === undefined ? null : num(pg.total),
    totalPages: pg.pages === undefined ? null : num(pg.pages),
  };
}

// ---- Public functions used by pages.

export async function fetchSummary(projectId) {
  return normalizeSummary(await getAnalyticsSummary(projectId));
}

export async function fetchTimeseries(projectId) {
  return normalizeTimeseries(await getAnalyticsTimeseries(projectId));
}

export async function fetchEndpoints(projectId) {
  return normalizeEndpoints(await getEndpointStats(projectId));
}

// filters: { method, statusCode, page, limit }
export async function fetchLogs(projectId, filters) {
  const params = { page: filters.page || 1, limit: filters.limit || 10 };
  if (filters.method && filters.method !== 'all') params.method = filters.method;
  if (filters.statusCode && filters.statusCode !== 'all') params.statusCode = filters.statusCode;
  return normalizeLogs(await getLogs(projectId, params));
}