import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, LoginCredentials } from '../api/authApi';
import { setToken } from '../utils/auth';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await login(credentials);
      setToken(response.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo credentials
  const fillDemoCredentials = () => {
    setCredentials({
      email: 'test@example.com',
      password: 'password123'
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand">
          <div className="logo">
            GEO<span className="logo-dot">.</span>IP<span className="logo-dot">.</span>APP
          </div>
          <p className="subtitle">Professional IP Geolocation Service</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email (e.g., user@example.com)"
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className={loading ? 'loading' : ''}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials" onClick={fillDemoCredentials} style={{ cursor: 'pointer' }}>
          <p>Demo Access</p>
          <p>test@example.com</p>
          <p>password123</p>
          <p style={{ fontSize: '0.7rem', marginTop: '8px', color: 'var(--accent)' }}>
            Click to auto-fill demo credentials
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;