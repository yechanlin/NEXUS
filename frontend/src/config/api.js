// Environment-based API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:5001'
    : 'https://nexus-three-phi.vercel.app/');

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/api/users/login`,
  signup: `${API_BASE_URL}/api/users/signup`,
  projects: `${API_BASE_URL}/api/projects`,
  users: `${API_BASE_URL}/api/users`,
  userProjects: `${API_BASE_URL}/api/projects/my-projects`,
  userApplications: `${API_BASE_URL}/api/projects/my-applications`,
  projectApplications: (projectId) =>
    `${API_BASE_URL}/api/projects/${projectId}/applications`,
  updateApplicationStatus: (projectId, applicationId) =>
    `${API_BASE_URL}/api/projects/${projectId}/applications/${applicationId}`,
  skipProject: (projectId) => `${API_BASE_URL}/api/projects/${projectId}/skip`,
  // Add other endpoints as needed
};

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(endpoint, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
