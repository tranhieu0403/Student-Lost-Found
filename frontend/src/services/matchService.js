import api from './api.js';

export const matchService = {
  getMatches: (postId) => api.get(`/matches/${postId}`),
};
