import api from './api.js';

const uploadService = {
  uploadImages: async (files) => {
    if (!files?.length) return [];

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res?.data?.imageUrls ?? [];
  },
};

export default uploadService;
