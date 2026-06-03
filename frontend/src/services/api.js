import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status;
    const body = err.response?.data;
    const shouldLogout =
      status === 401 || (status === 403 && body?.error === 'ACCOUNT_LOCKED');

    if (shouldLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (body?.error === 'ACCOUNT_LOCKED' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(body || err);
  },
);

export default api;
