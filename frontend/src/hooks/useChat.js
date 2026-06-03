import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import chatService from '../services/chatService.js';
import { useAuth } from '../hooks/useAuth.js';

// Socket singleton — chỉ tạo 1 lần toàn app
let socketInstance = null;

export const getSocket = (token) => {
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

const useChat = (partnerId) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('new_message', (message) => {
      setMessages((prev) => {
        const partnerId_ = Number(partnerId);
        const isCurrentConv =
          (message.sender_id === partnerId_ && message.receiver_id === user?.id) ||
          (message.sender_id === user?.id && message.receiver_id === partnerId_);
        if (!isCurrentConv) return prev;
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on('conversation_updated', () => {
      loadConversations();
    });

    socket.on('messages_read', ({ readBy }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === user?.id && m.receiver_id === readBy
            ? { ...m, is_read: true }
            : m,
        ),
      );
      loadConversations();
    });

    return () => {
      socket.off('new_message');
      socket.off('conversation_updated');
      socket.off('messages_read');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [token, partnerId, user?.id]);

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const res = await chatService.getConversations();
      const conversations = res?.data || res || [];
      setConversations(conversations);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!partnerId) {
      setMessages([]);
      return;
    }

    setLoadingMsgs(true);
    chatService
      .getMessages(partnerId)
      .then((res) => {
        const data = res?.data || res || {};
        setMessages(data?.messages || []);
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));

    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_read', { partnerId: Number(partnerId) });
    } else {
      chatService.markAsRead(partnerId).catch(() => {});
    }

    loadConversations();
  }, [partnerId]);

  useEffect(() => {
    if (!partnerId || connected) return;
    const interval = setInterval(() => {
      chatService
        .getMessages(partnerId)
        .then((data) => {
          const messages = data?.data || data || {};
          setMessages(messages.messages || []);
        })
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, [partnerId, connected]);

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || !partnerId || sending) return;
      setSending(true);

      const socket = socketRef.current;
      if (socket?.connected) {
        const tempMsg = {
          id: `temp-${Date.now()}`,
          sender_id: user.id,
          receiver_id: Number(partnerId),
          content: content.trim(),
          is_read: false,
          created_at: new Date().toISOString(),
          isOptimistic: true,
        };
        setMessages((prev) => [...prev, tempMsg]);

        socket.emit('send_message', {
          receiverId: Number(partnerId),
          content: content.trim(),
        });

        setTimeout(() => {
          setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
        }, 2000);
      } else {
        try {
          await chatService.sendMessage(partnerId, content.trim());
          const data = await chatService.getMessages(partnerId);
          const messages = data?.data || data || {};
          setMessages(messages.messages || []);
          loadConversations();
        } catch (err) {
          console.error(err);
        }
      }

      setSending(false);
    },
    [partnerId, sending, user?.id, loadConversations],
  );

  return {
    conversations,
    messages,
    loadingConvs,
    loadingMsgs,
    sending,
    connected,
    sendMessage,
    loadConversations,
  };
};

export default useChat;
