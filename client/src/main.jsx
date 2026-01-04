/* eslint-disable react-refresh/only-export-components */
// main.jsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App.jsx';
import Login from './components/Login.jsx';
import theme from './theme/index.js';
import { getSession, logout as logoutWithCookie, setAuthenticated } from './services/auth.js';
import { getApiBase } from './services/apiClient.js';

function Root() {
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const session = await getSession({ apiBase: getApiBase() });
        if (!mounted) return;
        setToken(session.authenticated ? 'cookie' : null);
        setAuthenticated(!!session.authenticated);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // After successful login, the App needs an authenticated session.
  // Re-check session so the in-memory session state is synced and requests succeed.
  const handleLoginAndSync = async () => {
    setToken('cookie');
    try {
      await getSession({ apiBase: getApiBase() });
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    logoutWithCookie({ apiBase: getApiBase() })
      .catch(() => {})
      .finally(() => setToken(null));
  };

  if (checking) return null;
  return token ? <App onLogout={handleLogout} /> : <Login onLogin={handleLoginAndSync} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Root />
    </ChakraProvider>
  </React.StrictMode>,
);
