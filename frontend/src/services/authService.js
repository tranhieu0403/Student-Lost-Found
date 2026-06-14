import api from './api.js';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyResetToken: (token) => api.get(`/auth/reset-password/${token}`),
  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password }),
};
