import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    retypePassword: '',
    termsAccepted: false,
  });
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle signup
  const handleSignUp = async () => {
    // Validation
    if (!formData.termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }
    if (formData.password !== formData.retypePassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.retypePassword,
        }),
      });

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to sign up');
        }
        navigate('/profilesetup');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <div className="navbar">
        <nav>
          <h1 className="logo-text">NEXUS</h1>
        </nav>
      </div>
      <div className="signup">
        <div className="logo">
          <img src="./src/components/img/nexuslogo.png" alt="NEXUS Logo" />
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
            placeholder="  Password"
            value={formData.password}
            onChange={handleChange}
          />
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
              I confirm that I have read and agree to Terms of Service and
              Privacy Policy.
            </label>
          </div>
          <button className="loginField field" onClick={handleSignUp}>
            Sign Up
          </button>
          {error && <div className="error">{error}</div>}
        </div>
        <div className="footer-container">
          <footer className="text-link">
            Already have an account? <Link to="/">Log in here.</Link>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Signup;
