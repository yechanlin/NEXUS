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