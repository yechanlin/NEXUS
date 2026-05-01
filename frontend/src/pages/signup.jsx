import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/signup.css';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';

const getPasswordStrength = (password) => {
  if (!password) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (password.length >= 8)          score++;
  if (password.length >= 12)         score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
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
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
          login({
            ...responseData.data.user,
            id: responseData.data.user._id || responseData.data.user.id,
            token: responseData.token,
          });
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
    <div className="auth-page">
      {/* Left brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-brand-wordmark">NEXUS</div>
          <p className="auth-brand-tagline">
            Discover projects.<br />Join the next big thing.
          </p>
          <div className="auth-brand-points">
            <div className="auth-brand-point">
              <span className="auth-point-bar" />
              <span>Create your profile and showcase your skills</span>
            </div>
            <div className="auth-brand-point">
              <span className="auth-point-bar" />
              <span>Swipe through opportunities that excite you</span>
            </div>
            <div className="auth-brand-point">
              <span className="auth-point-bar" />
              <span>Build remarkable projects with talented people</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h1>Create account</h1>
            <p>Start building with NEXUS today</p>
          </div>
          <div className="auth-fields">
            <div className="auth-field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="text"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                name="password"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
              {formData.password.length > 0 && (
                <div className="auth-pw-strength">
                  <div className="auth-pw-bar-track">
                    <div
                      className="auth-pw-bar-fill"
                      style={{ width: strength.width, background: strength.color }}
                    />
                  </div>
                  <span className="auth-pw-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>
            <div className="auth-field">
              <label htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                name="retypePassword"
                placeholder="••••••••"
                value={formData.retypePassword}
                onChange={handleChange}
              />
            </div>
            <div className="auth-checkbox">
              <input
                type="checkbox"
                id="terms"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <label htmlFor="terms">
                I confirm that I have read and agree to{' '}
                <Link to="/terms">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy">Privacy Policy</Link>.
              </label>
            </div>
            <button
              className="auth-submit-btn"
              onClick={handleSignUp}
              disabled={submitting}
            >
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
            {error && <div className="auth-error">{error}</div>}
          </div>
          <div className="auth-form-footer">
            Already have an account?{' '}
            <Link to="/">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
