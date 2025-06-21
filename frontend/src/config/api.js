// Environment-based API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5001" : "https://your-backend-domain.vercel.app");

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/api/users/login`,
  signup: `${API_BASE_URL}/api/users/signup`,
  projects: `${API_BASE_URL}/api/projects`,
  userProjects: `${API_BASE_URL}/api/projects/my-projects`,
  // Add other endpoints as needed
};

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(endpoint, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}; 