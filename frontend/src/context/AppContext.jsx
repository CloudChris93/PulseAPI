import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  getProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
  setAuthToken,
  setUnauthorizedHandler,
} from '../api/client.js';

const AppContext = createContext(null);

// ---- DEV-ONLY MOCK DATA -----------------------------------------------
// Used only by devLogin(), so every /app page can be built and previewed
// before a real backend exists. DELETE this whole block, devLogin(), and
// every "if (isDev)" branch below once the backend is connected.
const DEV_TOKEN = 'DEV_TOKEN';
const DEV_USER = { _id: 'dev-user', name: 'Dev User', email: 'dev@example.com' };
const initialDevProjects = [
  {
    _id: 'dev-project-1',
    name: 'Demo API',
    description: 'Sample project for local preview',
    apiKey: 'dev_key_12345',
  },
];

function makeId() {
  return 'dev-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}
function makeApiKey() {
  return 'dev_key_' + Math.random().toString(36).slice(2, 12);
}
// -------------------------------------------------------------------------

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  const isDev = token === DEV_TOKEN;

  // Restore session on load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedToken === DEV_TOKEN) {
        const storedProjects = localStorage.getItem('devProjects');
        const list = storedProjects ? JSON.parse(storedProjects) : initialDevProjects;
        setProjects(list);
        setSelectedProjectId(localStorage.getItem('devSelectedProject') || list[0]?._id || null);
      } else {
        setAuthToken(storedToken);
      }
    }
    setAuthLoading(false);
  }, []);

  // If the backend says our token is invalid/expired, log out everywhere.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setToken(null);
      setAuthToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
  }, []);

  const refreshProjects = useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const data = await getProjects();
      setProjects(data);
      // Keep a valid project selected: keep the current one if it still
      // exists, otherwise fall back to the first project.
      setSelectedProjectId((current) =>
        data.some((p) => p._id === current) ? current : data[0]?._id || null
      );
    } catch (err) {
      setProjectsError(err.message);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token && token !== DEV_TOKEN) {
      refreshProjects();
    } else if (!token) {
      setProjects([]);
      setSelectedProjectId(null);
    }
  }, [token, refreshProjects]);

  // Persist dev projects/selection across refreshes so work isn't lost.
  useEffect(() => {
    if (isDev) localStorage.setItem('devProjects', JSON.stringify(projects));
  }, [isDev, projects]);
  useEffect(() => {
    if (isDev && selectedProjectId) {
      localStorage.setItem('devSelectedProject', selectedProjectId);
    }
  }, [isDev, selectedProjectId]);

  async function login(credentials) {
    const data = await loginUser(credentials);
    setUser(data.user);
    setToken(data.token);
    setAuthToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  async function register(payload) {
    const data = await registerUser(payload);
    if (data.token) {
      setUser(data.user);
      setToken(data.token);
      setAuthToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  // DEV ONLY — remove once real login works.
  function devLogin() {
    setUser(DEV_USER);
    setToken(DEV_TOKEN);
    const storedProjects = localStorage.getItem('devProjects');
    const startProjects = storedProjects ? JSON.parse(storedProjects) : initialDevProjects;
    setProjects(startProjects);
    setSelectedProjectId(startProjects[0]?._id || null);
    localStorage.setItem('token', DEV_TOKEN);
    localStorage.setItem('user', JSON.stringify(DEV_USER));
  }

  function logout() {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dev projects, selection and sample events are kept on purpose,
    // so they are still there the next time you use Dev Login.
  }

  async function createProject(payload) {
    if (isDev) {
      const project = { _id: makeId(), apiKey: makeApiKey(), ...payload };
      setProjects((prev) => [...prev, project]);
      setSelectedProjectId(project._id);
      return project;
    }
    const project = await apiCreateProject(payload);
    await refreshProjects();
    setSelectedProjectId(project._id);
    return project;
  }

  async function updateProject(id, payload) {
    if (isDev) {
      setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, ...payload } : p)));
      return;
    }
    await apiUpdateProject(id, payload);
    await refreshProjects();
  }

  async function deleteProject(id) {
    if (isDev) {
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setSelectedProjectId((current) => (current === id ? null : current));
      return;
    }
    await apiDeleteProject(id);
    await refreshProjects();
  }

  const selectedProject = projects.find((p) => p._id === selectedProjectId) || null;

  const value = {
    user,
    isAuthenticated: Boolean(token),
    authLoading,
    isDev,
    login,
    register,
    devLogin,
    logout,
    projects,
    projectsLoading,
    projectsError,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}