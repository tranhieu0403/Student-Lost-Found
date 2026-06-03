import api from './api.js';

const categoryService = {
  getAll: () => api.get('/categories').then((r) => r.data),
};

export default categoryService;
