import api from './api.js';

export const postService = {
  getPosts: (params) => api.get('/posts', { params }),
  getMyPosts: (params) => api.get('/posts', { params: { ...params, mine: true } }),
  getPostById: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePostStatus: (id, status) =>
    api.patch(`/posts/${id}/status`, { status }),
  deletePost: (id) => api.delete(`/posts/${id}`),
};
