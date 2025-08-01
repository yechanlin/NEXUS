import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useUser = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useUser must be used within an AuthContext.Provider');
  }

  const {
    user,
    setUser,
    profileData,
    setProfileData,
    fetchUserProfile,
    updateProfileData,
  } = context;

  const addUser = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const removeUser = () => {
    setUser(null);
    setProfileData(null);
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  };

  return {
    user,
    setUser,
    addUser,
    removeUser,
    profileData,
    setProfileData,
    fetchUserProfile,
    updateProfileData,
  };
};
