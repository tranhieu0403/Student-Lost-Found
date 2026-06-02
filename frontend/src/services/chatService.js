import api from './api.js';

export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (partnerId) => api.get(`/chat/messages/${partnerId}`),
  sendMessage: (receiverId, content) =>
    api.post('/chat/messages', { receiverId, content }),
  markAsRead: (partnerId) => api.patch(`/chat/messages/${partnerId}/read`),
};
