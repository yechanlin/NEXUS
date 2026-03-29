import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profilesetup.css';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';

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

    const token = localStorage.getItem('token');
    const userId = user?.id || user?._id;
    if (!token || !userId) {
      setError('You must be logged in. Please sign up or log in first.');
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
          userId: userId,
          profileImage: formData.profileImage,
          userName: formData.userName,
          dateOfBirth: formData.dateOfBirth,
          school: formData.school,
          fieldOfStudy: formData.fieldOfStudy,
          bio: formData.bio,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        updateProfileData(formData);
        navigate('/mainPage');
      } else {
        setError(data.message || 'Failed to save profile.');
      }
    } catch (err) {
      console.error('Profile setup error:', err);
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <>
      <div className="navbar">
        <nav>
          <h1 className="logo-text">NEXUS</h1>
        </nav>
      </div>
      <div className="profile-setup">
        <h1>Create Profile</h1>
        <div className="profile-picture">
          <label>Profile Picture</label>
          <div className="circle">
            <img
              className="profile-image"
              src={formData.profileImage || '/images/default-profile.png'}
              alt="Profile"
            />
          </div>
          <label htmlFor="profile-upload" className="edit-icon">
            <div className="pencil">
              <img src="../..images/Vector.png" alt="Edit" />
            </div>
          </label>
          <input
            type="file"
            id="profile-upload"
            className="file-input"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <form onSubmit={handleSubmit} className="form">
          <label className="input-label">
            Username&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </label>
          <input
            type="text"
            name="userName"
            placeholder="Enter your username"
            value={formData.userName}
            onChange={handleChange}
            required
          />
          <label className="input-label">Date of Birth&nbsp;</label>
          <input
            type="date"
            name="dateOfBirth"
            placeholder="Pick a date"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
          <label className="input-label">Field of Study</label>
          <input
            type="text"
            name="fieldOfStudy"
            placeholder="Enter your field of study"
            value={formData.fieldOfStudy}
            onChange={handleChange}
          />
          <label className="input-label">
            School&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </label>
          <input
            type="text"
            name="school"
            placeholder="Enter your school"
            value={formData.school}
            onChange={handleChange}
          />
          <label className="input-label">
            Bio&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </label>
          <textarea
            name="bio"
            placeholder="Tell us about yourself"
            value={formData.bio}
            onChange={handleChange}
          ></textarea>
          {error && <div style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}
          <button type="submit">
            Create Profile
          </button>
        </form>
      </div>
    </>
  );
};

export default ProfileSetup;
