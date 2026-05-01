import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiBookmark, FiMapPin, FiUsers, FiTag, FiX, FiCheck } from 'react-icons/fi';
import { API_ENDPOINTS, apiCall } from '../config/api';
import '../styles/savedProjects.css';

const CATEGORY_TINTS = {
  Software:    'rgba(99, 102, 241, 0.18)',
  Design:      'rgba(168, 85, 247, 0.18)',
  Research:    'rgba(6, 182, 212, 0.18)',
  Business:    'rgba(245, 158, 11, 0.18)',
  Competition: 'rgba(16, 185, 129, 0.18)',
};

const SavedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const data = await apiCall(API_ENDPOINTS.savedProjects);
      setProjects(data?.data?.projects || []);
    } catch (err) {
      toast.error('Failed to load saved projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (projectId) => {
    setActioningId(projectId);
    try {
      await apiCall(API_ENDPOINTS.saveProject(projectId), { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      toast.success('Removed from saved');
    } catch (err) {
      toast.error('Failed to remove');
    } finally {
      setActioningId(null);
    }
  };

  const handleApply = async (projectId) => {
    setActioningId(projectId);
    try {
      await apiCall(API_ENDPOINTS.applyProject(projectId), { method: 'POST' });
      toast.success('Application submitted');
      // remove from saved list since user has now applied
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err) {
      toast.error(err.message || 'Failed to apply');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="saved-loading">
        <div className="saved-spinner" />
        <p>Loading saved projects…</p>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <div className="saved-container">
        <header className="saved-header">
          <div className="saved-header-icon"><FiBookmark size={20} /></div>
          <div>
            <h1>Saved Projects</h1>
            <p>Projects you saved for later. Apply or remove anytime.</p>
          </div>
        </header>

        {projects.length === 0 ? (
          <div className="saved-empty">
            <FiBookmark size={36} />
            <h3>No saved projects yet</h3>
            <p>Swipe up on a project on the discover page to save it for later.</p>
            <Link to="/mainPage" className="saved-empty-btn">Discover Projects</Link>
          </div>
        ) : (
          <div className="saved-list">
            {projects.map((p) => (
              <div
                key={p._id}
                className="saved-card"
                style={{ '--cat-tint': CATEGORY_TINTS[p.category] || CATEGORY_TINTS.Software }}
              >
                <div className="saved-card-main">
                  <div className="saved-card-tags">
                    {p.category && <span className="saved-tag saved-tag-cat">{p.category}</span>}
                    {p.projectType && <span className="saved-tag">{p.projectType}</span>}
                  </div>
                  <h3 className="saved-card-title">{p.title}</h3>
                  <p className="saved-card-desc">{p.description}</p>
                  <div className="saved-card-meta">
                    {p.location && (
                      <span><FiMapPin size={12} /> {p.location}</span>
                    )}
                    {p.maxMembers && (
                      <span><FiUsers size={12} /> Up to {p.maxMembers}</span>
                    )}
                    {p.creator?.userName && (
                      <span><FiTag size={12} /> by {p.creator.userName}</span>
                    )}
                  </div>
                  {p.skillsRequired?.length > 0 && (
                    <div className="saved-card-skills">
                      {p.skillsRequired.slice(0, 5).map((s, i) => (
                        <span key={i} className="saved-skill">{s}</span>
                      ))}
                      {p.skillsRequired.length > 5 && (
                        <span className="saved-skill saved-skill-more">
                          +{p.skillsRequired.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="saved-card-actions">
                  <button
                    className="saved-btn saved-btn-apply"
                    disabled={actioningId === p._id}
                    onClick={() => handleApply(p._id)}
                  >
                    <FiCheck size={14} /> Apply
                  </button>
                  <button
                    className="saved-btn saved-btn-remove"
                    disabled={actioningId === p._id}
                    onClick={() => handleUnsave(p._id)}
                  >
                    <FiX size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedProjects;
