import { useState } from 'react';

export const useLocalStorage = () => {
  const [value, setValue] = useState(null);

  const setItem = (newValue) => {
    try {
      const valueToStore =
        typeof newValue === 'function' ? newValue(value) : newValue;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      setValue(valueToStore);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };
  const getItem = () => {
    try {
      const item = localStorage.getItem(key);
      const parsedValue = item ? JSON.parse(item) : initialValue;
      setValue(parsedValue);
      return parsedValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  };
  const removeItem = (key) => {
    try {
      localStorage.removeItem(key);
      setValue(null);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  };

  return { value, setItem, getItem, removeItem };
};
