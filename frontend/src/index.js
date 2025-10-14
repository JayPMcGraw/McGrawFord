import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './Login';

function Main() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const currentVersion = '2.0'; // Increment this to force re-login

    // Check localStorage first (Remember Me), then sessionStorage
    const localAuth = localStorage.getItem('isAuthenticated');
    const localVersion = localStorage.getItem('authVersion');
    const sessionAuth = sessionStorage.getItem('isAuthenticated');
    const sessionVersion = sessionStorage.getItem('authVersion');

    if (localAuth === 'true' && localVersion === currentVersion) {
      setIsAuthenticated(true);
    } else if (sessionAuth === 'true' && sessionVersion === currentVersion) {
      setIsAuthenticated(true);
    } else {
      // Clear old session data from both storages
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('authVersion');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authVersion');
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (status, rememberMe) => {
    setIsAuthenticated(status);
    // Note: Storage is already set in Login component
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <App />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
