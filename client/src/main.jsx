// main.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App.jsx';
import Login from './components/Login.jsx';
import theme from './theme/index.js';

function Root() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const handleLogin = () => setToken(localStorage.getItem('token'));

  const handleLogout = () => {
    const t = localStorage.getItem('token');
    if (t) {
      fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      }).catch(() => {});
    }
    localStorage.removeItem('token');
    setToken(null);
  };

  return token ? <App onLogout={handleLogout} /> : <Login onLogin={handleLogin} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Root />
    </ChakraProvider>
  </React.StrictMode>,
);
