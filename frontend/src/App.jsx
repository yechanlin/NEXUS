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

function App() {
  return (
    <Router>
      <AppContent />
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
        </Routes>
      </main>
    </>
  );
}

export default App;
