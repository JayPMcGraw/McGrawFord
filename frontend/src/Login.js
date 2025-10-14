import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check password against environment variable or hardcoded value
    const correctPassword = process.env.REACT_APP_PASSWORD || 'alwaysbeclosing';

    if (password === correctPassword) {
      // Store authentication based on Remember Me preference
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('isAuthenticated', 'true');
      storage.setItem('authVersion', '2.0');

      onLogin(true, rememberMe);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Enter Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              required
            />
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
