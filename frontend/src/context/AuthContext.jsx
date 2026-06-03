import { createContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { USER_ROLE } from '../utils/constants.js';

export const AuthContext = createContext(null);

const KEY_TOKEN = 'token';
const KEY_USER = 'user';

function extractData(response) {
  return response?.data || response;
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(KEY_TOKEN));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const savedToken = localStorage.getItem(KEY_TOKEN);

    if (!savedToken) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    authService
      .getMe()
      .then((res) => {
        if (!mounted) return;
        const currentUser = extractData(res);
        setUser(currentUser);
        setToken(savedToken);
        localStorage.setItem(KEY_USER, JSON.stringify(currentUser));
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
        setToken(null);
        localStorage.removeItem(KEY_TOKEN);
        localStorage.removeItem(KEY_USER);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = (userData, nextToken) => {
    localStorage.setItem(KEY_TOKEN, nextToken);
    localStorage.setItem(KEY_USER, JSON.stringify(userData));
    setToken(nextToken);
    setUser(userData);

    if (userData.role === USER_ROLE.ADMIN) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const logout = () => {
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_USER);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === USER_ROLE.ADMIN,
    login,
    logout,
  }), [loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
