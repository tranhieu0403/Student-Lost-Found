import api from './api.js';

export const uploadService = {
  getPresignedUrl: (filename, contentType) =>
    api.post('/upload/presign', { filename, contentType }),

  uploadToS3: async (presignedUrl, file) => {
    const res = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) throw new Error('Tải ảnh lên S3 thất bại');
    return presignedUrl.split('?')[0];
  },
};
