import { useState, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import '../styles/profileEdit.css';

// Mock function to simulate fetching user data
const fetchUserData = async () => {
  return {
    profileImage: '/images/default-profile.png',
    userName: 'JaneDoe',
    dateOfBirth: '1998-07-15',
    school: 'State University',
    fieldOfStudy: 'Computer Science',
    bio: 'Lover of code, coffee, and hiking. Excited to connect with fellow developers and learn new things!',
  };
};

const ProfileEdit = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [initialData, setInitialData] = useState<typeof formData>({
    profileImage: '',
    userName: '',
    dateOfBirth: '',
    school: '',
    fieldOfStudy: '',
    bio: '',
  });
  const [formData, setFormData] = useState({
    profileImage: '',
    userName: '',
    dateOfBirth: '',
    school: '',
    fieldOfStudy: '',
    bio: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      const userData = await fetchUserData();
      setFormData(userData);
      setInitialData(userData);
    };
    loadUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(initialData); // Revert changes
    setIsEditing(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log('Saving profile data:', formData);
    setInitialData(formData); // Update the "saved" state
    setIsEditing(false);
  };

  return (
    <div className="profile-setup">
      <h1>{isEditing ? 'Edit Profile' : 'My Profile'}</h1>
      <div className="profile-picture">
        <div className="circle">
          <img
            className="profile-image"
            src={formData.profileImage || '/images/default-profile.png'}
            alt="Profile"
          />
        </div>
        {isEditing && (
          <label htmlFor="profile-upload" className="edit-icon">
            <div className="edit-icon-container">
              <FiEdit2 size={16} color="white" />
            </div>
          </label>
        )}
        <input
          type="file"
          id="profile-upload"
          className="file-input"
          accept="image/*"
          onChange={handleFileChange}
          disabled={!isEditing}
        />
      </div>

      {!isEditing && (
        <button
          type="button"
          className="edit-profile-icon-btn"
          onClick={handleEdit}
          aria-label="Edit Profile"
        >
          <FiEdit2 size={18} />
          <span>Edit</span>
        </button>
      )}

      <form onSubmit={handleSave} className="form">
        <label className="input-label">Username</label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          disabled={!isEditing}
          required
        />

        <label className="input-label">Date of Birth</label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <label className="input-label">Field of Study</label>
        <input
          type="text"
          name="fieldOfStudy"
          value={formData.fieldOfStudy}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <label className="input-label">School</label>
        <input
          type="text"
          name="school"
          value={formData.school}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <label className="input-label">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          disabled={!isEditing}
        ></textarea>

        {isEditing && (
          <div className="button-group">
            <button type="submit" className="save-button">
              Save Changes
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileEdit;
