import { useState, useEffect } from 'react';
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

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <AuthContext.Provider value={{ user, setUser, login, logout }}>
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
