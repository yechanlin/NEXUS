import { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Signup from './pages/signup';
import Login from './pages/login';
import ProfileSetup from './pages/profilesetup';
import MainPage from './pages/mainPage';
import CreateProject from './pages/CreateProject';
import MyProjects from './pages/MyProjects';
import Recruiter from './pages/recruiter';
import Searcher from './pages/searcher';
import Navbar from './components/Navbar';
import ProfileEdit from './pages/ProfileEdit';
import { AuthContext } from './context/AuthContext';
import { API_ENDPOINTS } from './config/api';

function App() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Function to fetch complete user profile - memoized to prevent infinite loops
  const fetchUserProfile = useCallback(async (userId, token) => {
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
  }, []);

  // Function to update profile data - memoized to prevent infinite loops
  const updateProfileData = useCallback(
    (newProfileData) => {
      setProfileData(newProfileData);
      // Also update user context if userName changed
      if (newProfileData.userName && user) {
        const updatedUser = { ...user, userName: newProfileData.userName };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    },
    [user],
  );

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setProfileData(null); // Reset profile data on new login
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setProfileData(null);
    localStorage.removeItem('user');
  }, []);

  return (
    <Router>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          login,
          logout,
          profileData,
          setProfileData,
          fetchUserProfile,
          updateProfileData,
        }}
      >
        <AppContent />
      </AuthContext.Provider>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const showNavbar = !['/', '/signup', '/profilesetup'].includes(
    location.pathname,
  );

  return (
    <>
      {showNavbar && <Navbar />}
      <main className="content-wrapper">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profilesetup" element={<ProfileSetup />} />
          <Route path="/mainPage" element={<MainPage />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/recruiter" element={<Recruiter />} />
          <Route path="/searcher" element={<Searcher />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
