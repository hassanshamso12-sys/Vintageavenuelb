import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('va_admin_token') || '');

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('va_admin_token', newToken);
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('va_admin_token');
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
