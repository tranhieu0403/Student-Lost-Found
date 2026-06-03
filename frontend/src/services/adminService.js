import api from './api.js';

const adminService = {
  getStats: () => api.get('/admin/stats').then((r) => r.data),

  getAllPosts: (params) => api.get('/admin/posts', { params }).then((r) => r.data),

  hardDeletePost: (id) => api.delete(`/admin/posts/${id}`).then((r) => r),

  getAllUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data),

  toggleLockUser: (id, isCurrentlyLocked = false) => (
    isCurrentlyLocked
      ? api.patch(`/admin/users/${id}/unlock`).then((r) => r.data)
      : api.patch(`/admin/users/${id}/lock`).then((r) => r.data)
  ),
};

export default adminService;
