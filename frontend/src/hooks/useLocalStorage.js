import { useState } from 'react';

export const useLocalStorage = (key, initialValue = null) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

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

  const getItem = (itemKey = key) => {
    try {
      const item = localStorage.getItem(itemKey);
      const parsedValue = item ? JSON.parse(item) : initialValue;
      if (itemKey === key) setValue(parsedValue);
      return parsedValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  };

  const removeItem = (itemKey = key) => {
    try {
      localStorage.removeItem(itemKey);
      if (itemKey === key) setValue(null);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  };

  return { value, setItem, getItem, removeItem };
};
