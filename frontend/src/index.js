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
    const authStatus = sessionStorage.getItem('isAuthenticated');
    const authVersion = sessionStorage.getItem('authVersion');
    const currentVersion = '2.0'; // Increment this to force re-login

    if (authStatus === 'true' && authVersion === currentVersion) {
      setIsAuthenticated(true);
    } else {
      // Clear old session data
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('authVersion');
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    if (status) {
      sessionStorage.setItem('authVersion', '2.0');
    }
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
