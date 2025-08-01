import { useEffect, useState } from 'react';
import { useUser } from './useUser';
import { useLocalStorage } from './useLocalStorage';
import { API_ENDPOINTS } from '../config/api';

export const useAuth = () => {
  const { user, addUser, removeUser, setUser } = useUser();
  const { getItem, removeItem } = useLocalStorage('user');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const storedUser = getItem('user');
    if (storedUser) {
      try {
        const parsedUser =
          typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser;
        addUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }
  }, [addUser, getItem]);

  // Function to fetch complete user profile
  const fetchUserProfile = async (userId, token) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.users}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const profile = {
          profileImage: data.data.doc.profilePicture || '',
          userName: data.data.doc.userName || '',
          dateOfBirth: data.data.doc.dateOfBirth || '',
          school: data.data.doc.school || '',
          fieldOfStudy: data.data.doc.fieldOfStudy || '',
          bio: data.data.doc.bio || '',
        };
        setProfileData(profile);
        return profile;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    return null;
  };

  // Function to update profile data
  const updateProfileData = (newProfileData) => {
    setProfileData(newProfileData);
    // Also update user context if userName changed
    if (newProfileData.userName && user) {
      setUser((prev) => ({ ...prev, userName: newProfileData.userName }));
    }
  };

  const login = (userData) => {
    addUser(userData);
    setProfileData(null); // Reset profile data on new login
  };

  const logout = () => {
    removeUser();
    setProfileData(null);
    removeItem('user');
  };

  return {
    user,
    login,
    logout,
    setUser,
    profileData,
    setProfileData,
    fetchUserProfile,
    updateProfileData,
  };
};
