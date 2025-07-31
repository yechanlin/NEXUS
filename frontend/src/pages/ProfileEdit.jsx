import { useState, useEffect, useContext } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const ProfileEdit = () => {
  const { user, setUser } = useContext(AuthContext);
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      console.log('user', user.id);
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.users}/${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        // console.log('User data received:', data);

        const userData = {
          profileImage: data.data.doc.profilePicture || '',
          userName: data.data.doc.userName || '',
          dateOfBirth: data.data.doc.dateOfBirth
            ? new Date(data.data.doc.dateOfBirth).toISOString().split('T')[0]
            : '',
          school: data.data.doc.school || '',
          fieldOfStudy: data.data.doc.fieldOfStudy || '',
          bio: data.data.doc.bio || '',
        };

        setFormData(userData);
        setInitialData(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id, user?.token]);

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

      setUser((prevUser) => ({
        ...prevUser,
        userName: formData.userName,
      }));

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
      <div className="flex h-full items-center justify-center pt-16">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full pt-16">
      <div className="mx-auto max-w-lg rounded-2xl bg-[#1e1e1e] p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">
          {isEditing ? 'Edit Profile' : 'My Profile'}
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500 bg-red-500/20 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="relative mb-6 flex justify-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-gray-600 shadow-md">
            <img
              className="h-full w-full object-cover"
              src={formData.profileImage || '/images/default-profile.png'}
              alt="Profile"
            />
          </div>
          {isEditing && (
            <label
              htmlFor="profile-upload"
              className="absolute bottom-0 right-1/2 translate-x-8 translate-y-2 transform cursor-pointer rounded-full bg-blue-500 p-2 shadow-lg transition-colors hover:bg-blue-600"
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
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600"
            onClick={handleEdit}
            aria-label="Edit Profile"
          >
            <FiEdit2 size={18} />
            <span>Edit</span>
          </button>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              disabled={!isEditing}
              required
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Field of Study
            </label>
            <input
              type="text"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              School
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:text-gray-400"
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-gray-600 px-4 py-2 font-medium text-gray-200 transition-colors hover:bg-gray-500"
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
  );
};

export default ProfileEdit;
