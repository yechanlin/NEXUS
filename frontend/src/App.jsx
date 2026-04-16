import { useState, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { Toaster } from 'react-hot-toast';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
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
import ChatBox from './components/ChatBox';
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

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  if (!user && !token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function AppContent() {
  const location = useLocation();
  const showNavbar = !['/', '/login', '/signup', '/profilesetup'].includes(
    location.pathname,
  );

  return (
    <>
      {showNavbar && <Navbar />}
      {showNavbar && <ChatBox />}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e2235',
            color: '#f1f5f9',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6ee7b7', secondary: '#1e2235' } },
          error:   { iconTheme: { primary: '#fca5a5', secondary: '#1e2235' } },
        }}
      />
      <main className="content-wrapper">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profilesetup" element={<ProfileSetup />} />
          <Route path="/mainPage" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
          <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/my-projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
          <Route path="/recruiter" element={<ProtectedRoute><Recruiter /></ProtectedRoute>} />
          <Route path="/searcher" element={<ProtectedRoute><Searcher /></ProtectedRoute>} />
          <Route path="/profile-edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
