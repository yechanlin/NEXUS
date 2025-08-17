import '../styles/login.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      navigate('/mainPage');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Attempting login with:', API_ENDPOINTS.login);
      console.log('Login data:', formData);

      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(formData),
      });

      // console.log('Response status:', response.status);
      const data = await response.json();
      // console.log('Response data:', data);

      if (data.status === 'success' && data.token) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);

        // Update user state in context with user data and token
        const userData = {
          ...data.data.user,
          token: data.token,
        };

        login(userData);
        navigate('/mainPage');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(`Login failed: ${error.message}`);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login">
        <div className="logo">
          <img src="/images/nexus_logo.png" alt="NEXUS Logo" />
        </div>
        <div className="back-link">
          <Link
            to="/"
            className="text-blue-400 transition-colors hover:text-blue-300"
          >
            ← Back to Home
          </Link>
        </div>
        <div className="userFields">
          <input
            className="field"
            type="email"
            placeholder="  Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <input
            className="field"
            type="password"
            placeholder="  Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <button className="loginField field" onClick={handleSubmit}>
            Login
          </button>
          {error && <div className="error">{error}</div>}
        </div>
        <div className="footer-container">
          <footer className="text-link">
            Don&apos;t have an account? <Link to="/signup">Sign up here.</Link>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
