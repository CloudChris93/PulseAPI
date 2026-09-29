import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token) {
  if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete client.defaults.headers.common.Authorization;
}

// Converts any backend/network error into a plain, friendly message.
// Components should only ever show err.message, never the raw error.
function toFriendlyError(error) {
  if (!error.response) {
    return { message: 'We could not reach the server. Please try again.' };
  }
  const status = error.response.status;
  const backendMessage = error.response.data?.message;
  const isAuthRequest = (error.config?.url || '').startsWith('/auth/');
  const defaults = {
    400: 'That request was not valid.',
    401: isAuthRequest
      ? 'Invalid email or password.'
      : 'Your session has expired. Please log in again.',
    403: "You don't have access to that.",
    404: 'Not found.',
    409: 'That already exists.',
    500: 'Something went wrong. Please try again.',
  };
  return { status, message: backendMessage || defaults[status] || 'Something went wrong.' };
}

// AppContext registers a function here that logs the user out.
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    // A 401 on login/register just means wrong credentials, not an expired session.
    if (err.response?.status === 401 && !url.startsWith('/auth/') && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(toFriendlyError(err));
  }
);

// Every backend response looks like { success, message, data }.
// unwrap() returns just the "data" part.
const unwrap = (res) => res.data?.data;

// The contract uses "id"; the rest of the app uses "_id". Convert once, here.
const toProject = (p) => ({ ...p, _id: p.id ?? p._id });

// ---------- Auth ----------  (returns { user, token })
export const registerUser = (payload) => client.post('/auth/register', payload).then(unwrap);
export const loginUser = (payload) => client.post('/auth/login', payload).then(unwrap);

// ---------- Projects ----------
export const getProjects = () =>
  client.get('/projects').then((r) => (unwrap(r)?.projects || []).map(toProject));
export const getProject = (id) =>
  client.get(`/projects/${id}`).then((r) => toProject(unwrap(r).project));
export const createProject = (payload) =>
  client.post('/projects', payload).then((r) => toProject(unwrap(r).project));
export const updateProject = (id, payload) =>
  client.patch(`/projects/${id}`, payload).then((r) => toProject(unwrap(r).project));
export const deleteProject = (id) => client.delete(`/projects/${id}`).then(unwrap);

// ---------- Analytics ----------
export const getAnalyticsSummary = (id) =>
  client.get(`/projects/${id}/analytics/summary`).then(unwrap);
export const getAnalyticsTimeseries = (id) =>
  client.get(`/projects/${id}/analytics/timeseries`).then(unwrap);
export const getEndpointStats = (id) =>
  client.get(`/projects/${id}/analytics/endpoints`).then(unwrap);

// ---------- Logs ----------
export const getLogs = (id, params = {}) =>
  client.get(`/projects/${id}/logs`, { params }).then(unwrap);

// ---------- Ingestion ----------
// Uses the project's API key (x-api-key), NOT the user's JWT — separate axios call.
export function sendTestEvent(projectKey, event) {
  return axios
    .post(`${BASE_URL}/ingest`, event, { headers: { 'x-api-key': projectKey } })
    .then(unwrap)
    .catch((err) => Promise.reject(toFriendlyError(err)));
}