import { useCallback, useEffect, useRef, useState } from 'react';
import { chatService } from '../services/chatService.js';
import { useInterval } from './useInterval.js';

const POLL_MS = 5000;

export function useChat(peerId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchMessages = useCallback(
    async (silent = false) => {
      if (!peerId) return;
      if (!silent) setLoading(true);
      try {
        const res = await chatService.getMessages(peerId);
        const items = Array.isArray(res?.data) ? res.data : res?.data?.items || [];
        if (mounted.current) setMessages(items);
      } catch (e) {
        if (mounted.current) setError(e?.message || 'Không tải được tin nhắn');
      } finally {
        if (mounted.current && !silent) setLoading(false);
      }
    },
    [peerId],
  );

  // Initial load + reset when peer changes
  useEffect(() => {
    setMessages([]);
    setError(null);
    if (peerId) {
      fetchMessages(false);
      chatService.markAsRead(peerId).catch(() => {});
    }
  }, [peerId, fetchMessages]);

  // Polling silently every 5s
  useInterval(() => fetchMessages(true), peerId ? POLL_MS : null);

  const sendMessage = useCallback(
    async (content) => {
      const text = content.trim();
      if (!text || !peerId || sending) return;
      setSending(true);
      try {
        const res = await chatService.sendMessage(peerId, text);
        const created = res?.data || res;
        if (created && mounted.current) {
          setMessages((prev) => [...prev, created]);
        } else {
          await fetchMessages(true);
        }
      } catch (e) {
        if (mounted.current) setError(e?.message || 'Gửi tin nhắn thất bại');
      } finally {
        if (mounted.current) setSending(false);
      }
    },
    [peerId, sending, fetchMessages],
  );

  return { messages, loading, error, sending, sendMessage };
}
