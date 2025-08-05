import { useState, useEffect, useContext, useRef } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const ProfileEdit = () => {
  const { user, profileData, updateProfileData, fetchUserProfile } =
    useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
  const dataLoaded = useRef(false); // Track if data has been loaded

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id || !user?.token || dataLoaded.current) return;

      // If profile data is already available in context, use it
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
        dataLoaded.current = true;
        return;
      }

      // Otherwise, fetch the data
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
          dataLoaded.current = true;
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id, user?.token, profileData, fetchUserProfile]);

  // Reset data loaded flag when user changes
  useEffect(() => {
    dataLoaded.current = false;
  }, [user?.id]);

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
          profileImage: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updateData = {
        userId: user.id,
        profileImage: formData.profileImage,
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

      const data = await response.json();
      console.log('Update response:', data);

      // Update the context with new profile data
      updateProfileData(formData);
      setInitialData(formData);
      setIsEditing(false);

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.userName) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#e0e0e0]">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center px-4 py-8">
          <div className="text-center text-lg text-[#888]">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#e0e0e0]">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h2 className="mb-8 text-center text-4xl font-bold text-[#00aaff]">
          {isEditing ? 'Edit Profile' : 'My Profile'}
        </h2>

        {error && (
          <div className="mx-auto mb-6 max-w-md rounded-md border border-[#ff4d4d] bg-[#ff4d4d]/10 p-3 text-center text-[#ff4d4d]">
            {error}
          </div>
        )}

        <div className="mx-auto max-w-2xl rounded-2xl border border-[#333] bg-[#1e1e1e] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
          {/* Profile Image Section */}
          <div className="relative mb-6 flex justify-center">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-[#333] shadow-md">
              <img
                className="h-full w-full object-cover"
                src={formData.profileImage || '/images/default-profile.png'}
                alt="Profile"
              />
            </div>
            {isEditing && (
              <label
                htmlFor="profile-upload"
                className="absolute bottom-0 right-1/2 translate-x-8 translate-y-2 transform cursor-pointer rounded-full bg-[#0088cc] p-2 shadow-[0_0_5px_#00aaff] transition-all duration-300 hover:bg-[#00aaff] hover:shadow-[0_0_10px_#00aaff,0_0_20px_#00aaff]"
              >
                <FiEdit2 size={16} color="white" />
              </label>
            )}
            <input
              type="file"
              id="profile-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={!isEditing}
            />
          </div>

          {!isEditing && (
            <button
              type="button"
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0088cc] px-4 py-3 font-semibold text-white shadow-[0_0_5px_#00aaff] transition-all duration-300 hover:bg-[#00aaff] hover:shadow-[0_0_10px_#00aaff,0_0_20px_#00aaff]"
              onClick={handleEdit}
              aria-label="Edit Profile"
            >
              <FiEdit2 size={18} />
              <span>Edit Profile</span>
            </button>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Form Row for Username and Date of Birth */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#00aaff]">
                  Username
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className="rounded-lg border border-[#333] bg-[#2a2a2a] px-3 py-3 text-[#e0e0e0] transition-all duration-300 focus:border-[#00aaff] focus:shadow-[0_0_5px_#00aaff] focus:outline-none disabled:bg-[#1a1a1a] disabled:text-[#666]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#00aaff]">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="rounded-lg border border-[#333] bg-[#2a2a2a] px-3 py-3 text-[#e0e0e0] transition-all duration-300 focus:border-[#00aaff] focus:shadow-[0_0_5px_#00aaff] focus:outline-none disabled:bg-[#1a1a1a] disabled:text-[#666]"
                />
              </div>
            </div>

            {/* Form Row for School and Field of Study */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#00aaff]">
                  School
                </label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="rounded-lg border border-[#333] bg-[#2a2a2a] px-3 py-3 text-[#e0e0e0] transition-all duration-300 focus:border-[#00aaff] focus:shadow-[0_0_5px_#00aaff] focus:outline-none disabled:bg-[#1a1a1a] disabled:text-[#666]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#00aaff]">
                  Field of Study
                </label>
                <input
                  type="text"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="rounded-lg border border-[#333] bg-[#2a2a2a] px-3 py-3 text-[#e0e0e0] transition-all duration-300 focus:border-[#00aaff] focus:shadow-[0_0_5px_#00aaff] focus:outline-none disabled:bg-[#1a1a1a] disabled:text-[#666]"
                />
              </div>
            </div>

            {/* Bio Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#00aaff]">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className="min-h-[100px] resize-none rounded-lg border border-[#333] bg-[#2a2a2a] px-3 py-3 text-[#e0e0e0] transition-all duration-300 focus:border-[#00aaff] focus:shadow-[0_0_5px_#00aaff] focus:outline-none disabled:bg-[#1a1a1a] disabled:text-[#666]"
              />
            </div>

            {isEditing && (
              <div className="flex flex-col gap-3 pt-4 md:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-[#0088cc] px-6 py-3 font-semibold text-white shadow-[0_0_5px_#00aaff] transition-all duration-300 hover:bg-[#00aaff] hover:shadow-[0_0_10px_#00aaff,0_0_20px_#00aaff] disabled:cursor-not-allowed disabled:bg-[#333] disabled:text-[#666] disabled:shadow-none"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-[#555] bg-[#333] px-6 py-3 font-semibold text-[#e0e0e0] transition-all duration-300 hover:border-[#666] hover:bg-[#444]"
                  onClick={handleCancel}
                  disabled={loading}
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
