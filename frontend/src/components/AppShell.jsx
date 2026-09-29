import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import Logo from './Logo.jsx';



export default function AppShell({ children }) {
  const { user, logout, projects, selectedProjectId, setSelectedProjectId } = useApp();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleProjectChange(e) {
    setSelectedProjectId(e.target.value);
  }

  const projectId = selectedProjectId || projects[0]?._id || '';

  return (
    <div className="app-shell">
      {/* Mobile overlay, closes the drawer when tapped */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 40,
          }}
        />
      )}

      <aside className={`app-sidebar ${drawerOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 12px 16px' }}>
          <Logo />
        </div>

        <NavLink
          to="/app/dashboard"
          className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => setDrawerOpen(false)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/app/projects"
          className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => setDrawerOpen(false)}
        >
          Projects
        </NavLink>
        {projectId && (
          <>
            <NavLink
              to={`/app/projects/${projectId}/integration`}
              className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setDrawerOpen(false)}
            >
              Integration
            </NavLink>
            <NavLink
              to={`/app/projects/${projectId}/logs`}
              className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setDrawerOpen(false)}
            >
              Logs
            </NavLink>
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <button onClick={handleLogout} className="app-sidebar-link" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none' }}>
            Logout
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button className="app-menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            ☰
          </button>

          {projects.length > 0 ? (
            <select className="project-select" value={projectId} onChange={handleProjectChange}>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ color: '#8a91a0', fontSize: 14 }}>No projects yet</span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <span style={{ fontSize: 14, color: '#5b6370' }}>{user?.name || user?.email}</span>
  
</div>
  <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }}>
    Logout
  </button>
</div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}