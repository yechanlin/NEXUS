import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profilesetup.css';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    profileImage: '',
    userName: '',
    dateOfBirth: '',
    school: '',
    fieldOfStudy: '',
    bio: '',
  });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);

    navigate('/mainPage');
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
          <button type="submit" onClick={handleSubmit}>
            Create Profile
          </button>
        </form>
      </div>
    </>
  );
};

export default ProfileSetup;
