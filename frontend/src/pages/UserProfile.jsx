import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiBook, FiCalendar } from 'react-icons/fi';
import { API_ENDPOINTS, apiCall } from '../config/api';
import './UserProfile.css';

const CATEGORY_COLORS = {
  Software:    '#6366f1',
  Design:      '#a855f7',
  Research:    '#06b6d4',
  Business:    '#f59e0b',
  Competition: '#10b981',
};

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the public profile from GET /api/users/:id/profile
    // apiCall automatically attaches the auth token from localStorage
    apiCall(API_ENDPOINTS.userProfile(userId))
      .then((res) => {
        setProfile(res.data.user);
        setProjects(res.data.projects);
      })
      .catch(() => setError('Could not load this profile.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="up-loading">Loading profile...</div>;
  if (error)   return <div className="up-error">{error}</div>;

  const joinedYear = profile.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : null;

  return (
    <div className="up-page">
      {/* Back button — goes to previous page in browser history */}
      <button className="up-back" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} /> Back
      </button>

      {/* Profile header card */}
      <div className="up-card">
        <img
          className="up-avatar"
          src={profile.profilePicture || 'https://via.placeholder.com/100'}
          alt={profile.userName || 'User'}
        />
        <h1 className="up-name">{profile.userName || 'Anonymous'}</h1>

        <div className="up-meta">
          {profile.school && (
            <span className="up-meta-item">
              <FiMapPin size={13} /> {profile.school}
            </span>
          )}
          {profile.fieldOfStudy && (
            <span className="up-meta-item">
              <FiBook size={13} /> {profile.fieldOfStudy}
            </span>
          )}
          {joinedYear && (
            <span className="up-meta-item">
              <FiCalendar size={13} /> Joined {joinedYear}
            </span>
          )}
        </div>

        {profile.bio && <p className="up-bio">{profile.bio}</p>}
      </div>

      {/* Projects section — only rendered if they have created projects */}
      {projects.length > 0 && (
        <div className="up-projects">
          <h2 className="up-section-title">Projects</h2>
          <div className="up-project-list">
            {projects.map((p) => (
              <div key={p._id} className="up-project-card">
                <div
                  className="up-project-accent"
                  style={{ background: CATEGORY_COLORS[p.category] || '#6366f1' }}
                />
                <div className="up-project-body">
                  <div className="up-project-header">
                    <span className="up-project-title">{p.title}</span>
                    {p.category && (
                      <span
                        className="up-project-badge"
                        style={{ color: CATEGORY_COLORS[p.category] || '#6366f1' }}
                      >
                        {p.category}
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="up-project-desc">{p.description}</p>
                  )}
                  {p.skillsRequired?.length > 0 && (
                    <div className="up-skills">
                      {p.skillsRequired.slice(0, 5).map((s, i) => (
                        <span key={i} className="up-skill-pill">{s}</span>
                      ))}
                      {p.skillsRequired.length > 5 && (
                        <span className="up-skill-pill">+{p.skillsRequired.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <p className="up-no-projects">No projects created yet.</p>
      )}
    </div>
  );
}
