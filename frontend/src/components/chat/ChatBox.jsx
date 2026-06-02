import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PaperPlaneRight, ArrowLeft, Article } from '@phosphor-icons/react';
import MessageBubble from './MessageBubble.jsx';

const GROUP_GAP_MS = 60 * 1000; // 1 phút

export default function ChatBox({
  peer,
  relatedPost,
  messages = [],
  loading,
  sending,
  currentUserId,
  onSend,
  onBack,
}) {
  const scrollRef = useRef(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!draft.trim() || sending) return;
    onSend(draft);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const initial = (peer?.name || '?').trim().charAt(0).toUpperCase() || '?';

  return (
    <section className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 shrink-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-900"
            aria-label="Quay lại"
          >
            <ArrowLeft size={20} weight="light" />
          </button>
        )}
        <span className="w-9 h-9 rounded-full bg-accent-light text-accent text-sm font-medium flex items-center justify-center">
          {initial}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {peer?.name || 'Người dùng'}
          </p>
          {relatedPost?.id && (
            <Link
              to={`/posts/${relatedPost.id}`}
              className="text-xs text-accent hover:underline inline-flex items-center gap-1 truncate"
            >
              <Article size={12} weight="light" />
              <span className="truncate">{relatedPost.title || 'Xem bài đăng'}</span>
            </Link>
          )}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loading && messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Đang tải tin nhắn...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
          </p>
        ) : (
          messages.map((m, idx) => {
            const isMine = m.senderId === currentUserId || m.sender_id === currentUserId;
            const prev = messages[idx - 1];
            const next = messages[idx + 1];
            const prevSameSender =
              prev && (prev.senderId || prev.sender_id) === (m.senderId || m.sender_id);
            const nextSameSender =
              next && (next.senderId || next.sender_id) === (m.senderId || m.sender_id);
            const t = new Date(m.createdAt || m.created_at).getTime();
            const nextT = next ? new Date(next.createdAt || next.created_at).getTime() : 0;
            const closeToNext = nextSameSender && nextT - t < GROUP_GAP_MS;
            const showTime = !closeToNext;

            return (
              <div key={m.id || idx} className={prevSameSender ? 'pt-0.5' : 'pt-3'}>
                <MessageBubble message={m} isMine={isMine} showTime={showTime} />
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-gray-100 px-3 py-2 flex items-end gap-2 bg-white"
      >
        <textarea
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
          className="flex-1 resize-none text-sm bg-bg-subtle border border-transparent rounded-2xl px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent max-h-32"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="shrink-0 w-10 h-10 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Gửi"
        >
          <PaperPlaneRight size={18} weight="fill" />
        </button>
      </form>
    </section>
  );
}
