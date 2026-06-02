import { ChatCircleDots } from '@phosphor-icons/react';
import { formatRelativeTime } from '../../utils/formatDate.js';
import EmptyState from '../common/EmptyState.jsx';

export default function ConversationList({
  conversations = [],
  activeId,
  onSelect,
  loading,
}) {
  if (loading) {
    return (
      <ul className="p-2 space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 p-3 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={ChatCircleDots}
        title="Chưa có cuộc trò chuyện nào"
        message="Khi ai đó nhắn tin cho bạn về bài đăng, cuộc trò chuyện sẽ xuất hiện ở đây."
      />
    );
  }

  return (
    <ul>
      {conversations.map((c) => (
        <ConversationItem
          key={c.userId || c.user?.id}
          conv={c}
          active={(c.userId || c.user?.id) === activeId}
          onClick={() => onSelect(c.userId || c.user?.id)}
        />
      ))}
    </ul>
  );
}

function ConversationItem({ conv, active, onClick }) {
  const peer = conv.user || {};
  const name = peer.name || conv.name || 'Người dùng';
  const initial = name.trim().charAt(0).toUpperCase();
  const last = conv.lastMessage || conv.preview || '';
  const time = conv.lastMessageAt || conv.updatedAt;
  const unread = conv.unreadCount > 0;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-3 text-left border-l-2 ${
          active
            ? 'bg-accent-light/40 border-accent'
            : 'bg-white border-transparent hover:bg-bg-subtle'
        }`}
      >
        <span className="w-10 h-10 shrink-0 rounded-full bg-accent-light text-accent text-sm font-medium flex items-center justify-center">
          {initial}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm truncate ${unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
              {name}
            </p>
            {time && (
              <span className="text-[11px] text-gray-400 shrink-0">
                {formatRelativeTime(time)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className={`text-xs truncate ${unread ? 'text-gray-700' : 'text-gray-500'}`}>
              {last || 'Chưa có tin nhắn'}
            </p>
            {unread && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
          </div>
        </div>
      </button>
    </li>
  );
}
