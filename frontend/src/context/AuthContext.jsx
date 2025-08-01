import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  login: () => {},
  logout: () => {},
  profileData: null,
  setProfileData: () => {},
  fetchUserProfile: () => {},
  updateProfileData: () => {},
});
