import { formatTime } from '../../utils/formatDate.js';

export default function MessageBubble({ message, isMine, showTime = true }) {
  const time = message?.createdAt || message?.created_at;
  const wrapper = isMine ? 'items-end' : 'items-start';
  const bubble = isMine
    ? 'bg-accent text-white rounded-2xl rounded-br-sm'
    : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm';

  return (
    <div className={`flex flex-col ${wrapper}`}>
      <div
        className={`max-w-[80%] md:max-w-[70%] px-3 py-2 text-sm whitespace-pre-wrap break-words ${bubble}`}
      >
        {message?.content}
      </div>
      {showTime && time && (
        <span className="text-[11px] text-gray-400 mt-1 px-1">{formatTime(time)}</span>
      )}
    </div>
  );
}
