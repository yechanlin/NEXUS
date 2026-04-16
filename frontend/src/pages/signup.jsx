import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/signup.css';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';

const getPasswordStrength = (password) => {
  if (!password) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: 'Weak',   color: '#fca5a5', width: '25%' };
  if (score === 2) return { label: 'Fair',   color: '#fbbf24', width: '50%' };
  if (score === 3) return { label: 'Good',   color: '#a5b4fc', width: '75%' };
  return              { label: 'Strong', color: '#6ee7b7', width: '100%' };
};

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    retypePassword: '',
    termsAccepted: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSignUp = async () => {
    if (!formData.termsAccepted) { setError('You must accept the terms and conditions'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (formData.password !== formData.retypePassword) { setError('Passwords do not match'); return; }

    setSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.retypePassword,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.message || 'Failed to sign up');

        if (responseData.token) {
          localStorage.setItem('token', responseData.token);
          const userData = {
            ...responseData.data.user,
            id: responseData.data.user._id || responseData.data.user.id,
            token: responseData.token,
          };
          login(userData);
        }
        navigate('/profilesetup');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="signup-page-container">
      <div className="signup">
        <div className="logo">
          <img src="/images/nexus_logo.png" alt="NEXUS Logo" />
        </div>
        <div className="userFields">
          <input
            className="field"
            type="text"
            name="email"
            placeholder="  Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            className="field"
            type="password"
            name="password"
            placeholder="  Password (min 8 characters)"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Password strength indicator */}
          {formData.password.length > 0 && (
            <div style={{ marginBottom: '8px', padding: '0 2px' }}>
              <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: strength.width,
                  background: strength.color,
                  transition: 'width 0.3s, background 0.3s',
                }} />
              </div>
              <span style={{ fontSize: '11px', color: strength.color, marginTop: '4px', display: 'block' }}>
                {strength.label}
              </span>
            </div>
          )}

          <input
            className="field"
            type="password"
            name="retypePassword"
            placeholder="  Retype Password"
            value={formData.retypePassword}
            onChange={handleChange}
          />
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="terms"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
            />
            <label htmlFor="terms">
              I confirm that I have read and agree to{' '}
              <Link to="/terms" style={{ color: 'var(--accent-light, #818cf8)' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: 'var(--accent-light, #818cf8)' }}>Privacy Policy</Link>.
            </label>
          </div>
          <button
            className="loginField field"
            onClick={handleSignUp}
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
          {error && <div className="error">{error}</div>}
        </div>
        <div className="footer-container">
          <footer className="text-link">
            Already have an account? <Link to="/">Log in here.</Link>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Signup;
