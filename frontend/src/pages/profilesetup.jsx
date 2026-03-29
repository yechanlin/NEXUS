import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import '../styles/profilesetup.css';

const ProfileSetup = () => {
  const { user, updateProfileData } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    profileImage: '',
    userName: '',
    dateOfBirth: '',
    school: '',
    fieldOfStudy: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    const userId = user?.id || user?._id;
    if (!token || !userId) {
      setError('You must be logged in. Please sign up or log in first.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.users}/profilesetup`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          userName: formData.userName,
          dateOfBirth: formData.dateOfBirth,
          school: formData.school,
          fieldOfStudy: formData.fieldOfStudy,
          bio: formData.bio,
          profileImage: formData.profileImage,
          profilePicture: formData.profileImage,
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        updateProfileData(formData);
        navigate('/mainPage');
      } else {
        setError(data.message || 'Failed to save profile.');
      }
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ps-navbar">
        <h1 className="ps-logo">NEXUS</h1>
      </div>
      <div className="profile-setup">
        <h1>Create Your Profile</h1>
        <p className="ps-subtitle">Tell collaborators about yourself</p>

        <div className="profile-picture-wrapper">
          <div className="ps-circle">
            {formData.profileImage ? (
              <img className="profile-image" src={formData.profileImage} alt="Profile" />
            ) : (
              <span className="ps-avatar-placeholder">
                {formData.userName ? formData.userName.charAt(0).toUpperCase() : '?'}
              </span>
            )}
          </div>
          <label htmlFor="profile-upload" className="ps-edit-icon" title="Upload photo">
            <FiEdit2 size={14} />
          </label>
          <input
            type="file"
            id="profile-upload"
            className="file-input"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <form onSubmit={handleSubmit} className="ps-form">
          <div className="ps-field-group">
            <label className="ps-label">Username *</label>
            <input
              type="text"
              name="userName"
              placeholder="Enter your username"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ps-field-group">
            <label className="ps-label">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className="ps-field-group">
            <label className="ps-label">Field of Study</label>
            <input
              type="text"
              name="fieldOfStudy"
              placeholder="e.g. Computer Science, Business, Design"
              value={formData.fieldOfStudy}
              onChange={handleChange}
            />
          </div>

          <div className="ps-field-group">
            <label className="ps-label">School</label>
            <input
              type="text"
              name="school"
              placeholder="Enter your school or university"
              value={formData.school}
              onChange={handleChange}
            />
          </div>

          <div className="ps-field-group">
            <label className="ps-label">Bio</label>
            <textarea
              name="bio"
              placeholder="Tell collaborators about yourself, your skills, and what you're looking to build..."
              value={formData.bio}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {error && <div className="ps-error">{error}</div>}

          <button type="submit" className="ps-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Create Profile'}
          </button>
        </form>
      </div>
    </>
  );
};

export default ProfileSetup;
