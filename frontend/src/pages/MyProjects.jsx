import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import '../styles/myProjects.css';

const PAGE_LIMIT = 5;

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchMyProjects = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ENDPOINTS.projects}/my-projects?page=${pageNum}&limit=${PAGE_LIMIT}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.data.projects);
        setTotalPages(data.totalPages || 1);
      } else {
        setError(data.message || 'Failed to fetch projects.');
      }
    } catch (err) {
      setError('Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects(page);
    // eslint-disable-next-line
  }, [page]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const handleEdit = (project) => {
    setEditingProject(project._id);
    setEditForm({
      title: project.title,
      description: project.description,
      projectType: project.projectType,
      category: project.category,
      location: project.location,
      skillsRequired: project.skillsRequired.join(', '),
      maxMembers: project.maxMembers,
      status: project.status
    });
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditForm({});
  };

  const handleSaveEdit = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const skillsArray = editForm.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill);
      
      const res = await fetch(`${API_ENDPOINTS.projects}/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editForm,
          skillsRequired: skillsArray
        })
      });

      if (res.ok) {
        // Refresh the projects list
        await fetchMyProjects(page);
        setEditingProject(null);
        setEditForm({});
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update project.');
      }
    } catch (err) {
      setError('Failed to update project.');
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ENDPOINTS.projects}/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Refresh the projects list
        await fetchMyProjects(page);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete project.');
      }
    } catch (err) {
      setError('Failed to delete project.');
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="my-projects-page">
      <div className="my-projects-container">
        <h2>My Projects</h2>
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : projects.length === 0 ? (
          <div className="empty-message">You haven't created any projects yet.</div>
        ) : (
          <>
            <div className="projects-list">
              {projects.map(project => (
                <div className="project-card" key={project._id}>
                  {editingProject === project._id ? (
                    // Edit form
                    <div className="edit-form">
                      <div className="form-group">
                        <label>Title:</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Description:</label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Project Type:</label>
                          <select
                            value={editForm.projectType}
                            onChange={(e) => handleInputChange('projectType', e.target.value)}
                          >
                            <option value="personal">Personal</option>
                            <option value="academic">Academic</option>
                            <option value="professional">Professional</option>
                            <option value="open-source">Open Source</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Category:</label>
                          <select
                            value={editForm.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                          >
                            <option value="technology">Technology</option>
                            <option value="business">Business</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="environment">Environment</option>
                            <option value="social">Social</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Location:</label>
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Max Members:</label>
                          <input
                            type="number"
                            value={editForm.maxMembers}
                            onChange={(e) => handleInputChange('maxMembers', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Skills Required (comma-separated):</label>
                        <input
                          type="text"
                          value={editForm.skillsRequired}
                          onChange={(e) => handleInputChange('skillsRequired', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Status:</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                      </div>
                      <div className="edit-actions">
                        <button 
                          className="save-btn"
                          onClick={() => handleSaveEdit(project._id)}
                        >
                          Save Changes
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="project-header">
                        <h3>{project.title}</h3>
                        <span className={`status-badge ${project.status}`}>{project.status}</span>
                      </div>
                      <div className="project-meta">
                        <span className="project-type">{project.projectType}</span>
                        <span className="project-category">{project.category}</span>
                        <span className="project-location">{project.location}</span>
                      </div>
                      <div className="project-description">{project.description}</div>
                      <div className="project-skills">
                        {project.skillsRequired.map((skill, idx) => (
                          <span className="skill-badge" key={idx}>{skill}</span>
                        ))}
                      </div>
                      <div className="project-footer">
                        <span>Max Members: {project.maxMembers}</span>
                        <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="project-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(project)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(project._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="pagination-controls">
              <button onClick={handlePrev} disabled={page === 1}>&lt; Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={handleNext} disabled={page === totalPages}>Next &gt;</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyProjects; 