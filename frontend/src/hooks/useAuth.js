import { useEffect } from 'react';
import { useUser } from './useUser';
import { useLocalStorage } from './useLocalStorage';

export const useAuth = () => {
  const { user, addUser, removeUser, setUser } = useUser();
  const { getItem } = useLocalStorage();

  useEffect(() => {
    const storedUser = getItem('user');
    if (storedUser) {
      try {
        addUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }
  }, [addUser, getItem]);
  const login = (user) => {
    addUser(user);
  };
  const logout = () => {
    removeUser();
    // Assuming useLocalStorage provides a removeItem method
    // const { removeItem } = useLocalStorage();
    // removeItem('user');
  };
  return { user, login, logout, setUser };
};
