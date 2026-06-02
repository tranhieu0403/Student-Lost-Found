import { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_ROLE } from '../utils/constants.js';

export const AuthContext = createContext(null);

const KEY_TOKEN = 'token';
const KEY_USER = 'user';

function readUser() {
  try {
    const raw = localStorage.getItem(KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(() => localStorage.getItem(KEY_TOKEN));

  const login = (userData, nextToken) => {
    setUser(userData);
    setToken(nextToken);
    localStorage.setItem(KEY_USER, JSON.stringify(userData));
    localStorage.setItem(KEY_TOKEN, nextToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(KEY_USER);
    localStorage.removeItem(KEY_TOKEN);
    navigate('/login');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === USER_ROLE.ADMIN,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
