import { useState, useEffect, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiEdit2 } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { US_UNIVERSITIES, FIELDS_OF_STUDY } from '../data/autocompleteData';
import '../styles/profileEdit.css';

// YYYY-MM-DD → MM/DD/YYYY
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${month}/${day}/${year}`;
};

// MM/DD/YYYY → YYYY-MM-DD for storage
const parseDisplayDate = (display) => {
  if (!display) return '';
  const [month, day, year] = display.split('/');
  if (!month || !day || !year) return display;
  return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
};

const getSuggestions = (list, query) => {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return list.filter((item) => item.toLowerCase().includes(q)).slice(0, 8);
};

// Reusable autocomplete field
const AutocompleteInput = ({ label, name, value, onChange, disabled, list }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    onChange(e);
    const results = getSuggestions(list, e.target.value);
    setSuggestions(results);
    setOpen(results.length > 0);
  };

  const handleSelect = (item) => {
    onChange({ target: { name, value: item } });
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="profile-field-group" ref={containerRef} style={{ position: 'relative' }}>
      <label className="input-label">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
        className="profile-input"
        onFocus={() => {
          if (!disabled) {
            const results = getSuggestions(list, value);
            setSuggestions(results);
            setOpen(results.length > 0);
          }
        }}
      />
      {!disabled && open && (
        <div className="school-suggestions-dropdown">
          {suggestions.map((item) => (
            <div
              key={item}
              className="school-suggestion-item"
              onMouseDown={() => handleSelect(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

AutocompleteInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  list: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const ProfileEdit = () => {
  const { user, profileData, updateProfileData, fetchUserProfile } =
    useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dobDisplay, setDobDisplay] = useState('');
  const [initialData, setInitialData] = useState({
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
  const dataLoaded = useRef(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id || !user?.token || dataLoaded.current) return;

      if (profileData) {
        const userData = {
          profileImage: profileData.profileImage || '',
          userName: profileData.userName || '',
          dateOfBirth: profileData.dateOfBirth
            ? new Date(profileData.dateOfBirth).toISOString().split('T')[0]
            : '',
          school: profileData.school || '',
          fieldOfStudy: profileData.fieldOfStudy || '',
          bio: profileData.bio || '',
        };
        setFormData(userData);
        setInitialData(userData);
        setDobDisplay(formatDisplayDate(userData.dateOfBirth));
        dataLoaded.current = true;
        return;
      }

      setLoading(true);
      try {
        const profile = await fetchUserProfile(user.id, user.token);
        if (profile) {
          const userData = {
            profileImage: profile.profileImage || '',
            userName: profile.userName || '',
            dateOfBirth: profile.dateOfBirth
              ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
              : '',
            school: profile.school || '',
            fieldOfStudy: profile.fieldOfStudy || '',
            bio: profile.bio || '',
          };
          setFormData(userData);
          setInitialData(userData);
          setDobDisplay(formatDisplayDate(userData.dateOfBirth));
          dataLoaded.current = true;
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id, user?.token, profileData, fetchUserProfile]);

  useEffect(() => {
    dataLoaded.current = false;
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dateOfBirth') {
      setDobDisplay(value);
      // Auto-convert to YYYY-MM-DD once fully entered (MM/DD/YYYY = 10 chars)
      if (value.length === 10) {
        setFormData((prev) => ({ ...prev, dateOfBirth: parseDisplayDate(value) }));
      } else {
        setFormData((prev) => ({ ...prev, dateOfBirth: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

  const handleEdit = () => { setIsEditing(true); setError(''); setDobDisplay(formatDisplayDate(formData.dateOfBirth)); };
  const handleCancel = () => { setFormData(initialData); setDobDisplay(formatDisplayDate(initialData.dateOfBirth)); setIsEditing(false); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updateData = {
        userId: user.id,
        profilePicture: formData.profileImage,
        userName: formData.userName,
        dateOfBirth: formData.dateOfBirth,
        school: formData.school,
        fieldOfStudy: formData.fieldOfStudy,
        bio: formData.bio,
      };

      const response = await fetch(`${API_ENDPOINTS.users}/profilesetup`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      updateProfileData(formData);
      setInitialData(formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.userName) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-subtle)', fontSize: '15px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 1rem' }}>
        <h2 style={{
          fontSize: '1.75rem', fontWeight: 700, textAlign: 'center',
          color: 'var(--text-primary)', marginBottom: '2rem', letterSpacing: '-0.3px',
        }}>
          {isEditing ? 'Edit Profile' : 'My Profile'}
        </h2>

        {error && (
          <div style={{
            color: '#fca5a5', background: 'rgba(252,165,165,0.07)',
            border: '1px solid rgba(252,165,165,0.2)', borderRadius: '8px',
            padding: '0.65rem 1rem', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '2rem', boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}>
          {/* Profile image */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden',
              border: '2px solid var(--border-accent)',
              boxShadow: '0 0 0 4px var(--bg-surface), 0 0 0 6px rgba(99,102,241,0.2)',
              background: 'var(--bg-elevated)',
            }}>
              <img
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                src={formData.profileImage || '/images/default-profile.png'}
                alt="Profile"
              />
            </div>
            {isEditing && (
              <label htmlFor="profile-upload" style={{
                position: 'absolute', bottom: '0px', left: 'calc(50% + 28px)',
                background: 'var(--accent)', borderRadius: '50%',
                width: '28px', height: '28px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
              }}>
                <FiEdit2 size={13} color="white" />
              </label>
            )}
            <input
              type="file"
              id="profile-upload"
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
              disabled={!isEditing}
            />
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, var(--accent-dark), var(--accent))',
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer',
                boxShadow: '0 2px 14px rgba(99,102,241,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              <FiEdit2 size={17} />
              <span>Edit Profile</span>
            </button>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="profile-field-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className="profile-input"
                />
              </div>

              <div className="profile-field-group">
                <label className="input-label">Date of Birth</label>
                <input
                  type="text"
                  name="dateOfBirth"
                  value={isEditing ? dobDisplay : formatDisplayDate(formData.dateOfBirth)}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                  className="profile-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <AutocompleteInput
                label="School"
                name="school"
                value={formData.school}
                onChange={handleChange}
                disabled={!isEditing}
                list={US_UNIVERSITIES}
              />
              <AutocompleteInput
                label="Field of Study"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                disabled={!isEditing}
                list={FIELDS_OF_STUDY}
              />
            </div>

            <div className="profile-field-group">
              <label className="input-label">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className="profile-input"
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            {isEditing && (
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1, padding: '0.75rem', fontFamily: 'inherit',
                    background: 'linear-gradient(135deg, var(--accent-dark), var(--accent))',
                    color: '#fff', border: 'none', borderRadius: '8px',
                    fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    boxShadow: '0 2px 12px rgba(99,102,241,0.25)',
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  style={{
                    flex: 1, padding: '0.75rem', fontFamily: 'inherit',
                    background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
