import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './Login';

function Main() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  return <App />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
