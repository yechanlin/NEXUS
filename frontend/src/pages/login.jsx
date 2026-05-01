import '../styles/login.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        mode: 'cors',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === 'success' && data.token) {
        localStorage.setItem('token', data.token);
        login({ ...data.data.user, token: data.token });
        navigate('/mainPage');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    }
  };

  return (
    <div className="auth-page">
      {/* Left brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-brand-wordmark">NEXUS</div>
          <p className="auth-brand-tagline">
            Find your team.<br />Build something real.
          </p>
          <div className="auth-brand-points">
            <div className="auth-brand-point">
              <span className="auth-point-bar" />
              <span>Swipe through curated projects that match your skills</span>
            </div>
            <div className="auth-brand-point">
              <span className="auth-point-bar" />
              <span>Apply and connect with real collaborators</span>
            </div>
            <div className="auth-brand-point">
              <span className="auth-point-bar" />
              <span>Turn ideas into reality with the right team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account</p>
          </div>
          <form className="auth-fields" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="auth-submit-btn">
              Sign In
            </button>
            {error && <div className="auth-error">{error}</div>}
          </form>
          <div className="auth-form-footer">
            Don&apos;t have an account?{' '}
            <Link to="/signup">Sign up here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
