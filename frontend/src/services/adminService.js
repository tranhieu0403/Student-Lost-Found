import api from './api.js';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getAllPosts: (params) => api.get('/admin/posts', { params }),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  toggleLockUser: (id) => api.patch(`/admin/users/${id}/lock`),
};
