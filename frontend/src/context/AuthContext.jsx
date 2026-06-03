import { createContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { USER_ROLE } from '../utils/constants.js';

export const AuthContext = createContext(null);

const KEY_TOKEN = 'token';
const KEY_USER = 'user';

function extractData(response) {
  return response?.data || response;
}

export function AuthProvider({ children }) {
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

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { user: nextUser, token: nextToken } = extractData(res);

    if (!nextUser || !nextToken) {
      throw new Error('Phản hồi đăng nhập không hợp lệ');
    }

    localStorage.setItem(KEY_TOKEN, nextToken);
    localStorage.setItem(KEY_USER, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    return nextUser;
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
