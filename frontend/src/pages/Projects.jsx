import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Projects() {
  const {
    projects,
    projectsLoading,
    projectsError,
    createProject,
    updateProject,
    deleteProject,
    setSelectedProjectId,
  } = useApp();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [actionError, setActionError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Project name is required.');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      await createProject({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'Could not create the project. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(project) {
    setActionError('');
    setEditingId(project._id);
    setEditName(project.name);
  }

  async function saveEdit(id) {
    if (!editName.trim()) return;
    setActionError('');
    try {
      await updateProject(id, { name: editName.trim() });
      setEditingId(null);
    } catch (err) {
      setActionError(err.message || 'Could not update the project. Please try again.');
    }
  }

  async function handleDelete(id, projectName) {
    const confirmed = window.confirm(`Delete "${projectName}"? This cannot be undone.`);
    if (!confirmed) return;
    setActionError('');
    try {
      await deleteProject(id);
    } catch (err) {
      setActionError(err.message || 'Could not delete the project. Please try again.');
    }
  }

  function openProject(project) {
    setSelectedProjectId(project._id);
    navigate(`/app/projects/${project._id}/integration`);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22 }}>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {actionError && <p className="error-text" style={{ marginBottom: 16 }}>{actionError}</p>}

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
          <input
            className="input"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
          />
          <input
            className="input"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
          />
          {formError && <p className="error-text">{formError}</p>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      )}

      {projectsLoading && <p style={{ color: '#5b6370' }}>Loading projects...</p>}

      {projectsError && !projectsLoading && (
        <p className="error-text">We couldn't load your projects. {projectsError}</p>
      )}

      {!projectsLoading && !projectsError && projects.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ marginBottom: 8, fontWeight: 600 }}>You don't have any projects yet.</p>
          <p style={{ color: '#5b6370', fontSize: 14 }}>Create your first monitored API project.</p>
        </div>
      )}

      {!projectsLoading && projects.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {projects.map((project) => (
            <div className="card" key={project._id}>
              {editingId === project._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    className="input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => saveEdit(project._id)}>
                      Save
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: 16, marginBottom: 4 }}>{project.name}</h3>
                  <p style={{ color: '#5b6370', fontSize: 13, marginBottom: 16, minHeight: 18 }}>
                    {project.description || 'No description'}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => openProject(project)}>
                      Open
                    </button>
                    <button className="btn btn-secondary" onClick={() => startEdit(project)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ color: '#c0392b' }}
                      onClick={() => handleDelete(project._id, project.name)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}