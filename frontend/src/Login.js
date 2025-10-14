import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check password against environment variable or hardcoded value
    const correctPassword = process.env.REACT_APP_PASSWORD || 'alwaysbeclosing';
    console.log('Expected password:', correctPassword);
    console.log('Entered password:', password);

    if (password === correctPassword) {
      // Store authentication in sessionStorage (lasts until browser closes)
      sessionStorage.setItem('isAuthenticated', 'true');
      onLogin(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logos">
          <img src="/mcgraw-logo.avif" alt="McGraw Motors" className="login-logo" />
          <img src="/ford-logo.png" alt="Ford" className="ford-logo" />
        </div>
        <h1>McGraw Motors</h1>
        <h2>Sales Dashboard</h2>
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
