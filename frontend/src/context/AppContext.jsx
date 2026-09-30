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

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  // Restore session on load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setAuthToken(storedToken);
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
    if (token) {
      refreshProjects();
    } else {
      setProjects([]);
      setSelectedProjectId(null);
    }
  }, [token, refreshProjects]);

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

  function logout() {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async function createProject(payload) {
    const project = await apiCreateProject(payload);
    await refreshProjects();
    setSelectedProjectId(project._id);
    return project;
  }

  async function updateProject(id, payload) {
    await apiUpdateProject(id, payload);
    await refreshProjects();
  }

  async function deleteProject(id) {
    await apiDeleteProject(id);
    await refreshProjects();
  }

  const selectedProject = projects.find((p) => p._id === selectedProjectId) || null;

  const value = {
    user,
    isAuthenticated: Boolean(token),
    authLoading,
    login,
    register,
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