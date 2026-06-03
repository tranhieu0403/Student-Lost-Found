import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import useChat from '../hooks/useChat.js';
import {
  formatRelativeTime,
  formatMessageTime,
  formatDaySeparator,
  isSameDay,
} from '../utils/formatDate.js';
import {
  ChatCircle,
  ChatCircleDots,
  PaperPlaneRight,
  ArrowLeft,
  WifiHigh,
  WifiSlash,
} from '@phosphor-icons/react';

export default function Chat() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const peerId = partnerId ? Number(partnerId) : null;

  const [showChat, setShowChat] = useState(Boolean(peerId));
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const {
    conversations,
    messages,
    loadingConvs,
    loadingMsgs,
    sending,
    connected,
    sendMessage,
    loadConversations,
  } = useChat(peerId);

  const refreshConversations = () => loadConversations();

  useEffect(() => {
    setShowChat(Boolean(partnerId));
  }, [partnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations.find(
    (conv) => (conv.id ?? conv.partner_id) === peerId,
  );
  const partnerName = activeConversation?.name ?? activeConversation?.partner_name ?? 'Người dùng';
  const relatedPost = activeConversation?.post;

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + (conv.unread_count || 0),
    0,
  );

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !peerId) return;
    await sendMessage(trimmed);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100dvh-64px)] bg-white overflow-hidden">
      <aside
        className={`flex-shrink-0 flex flex-col border-r border-gray-100 bg-white w-full md:w-60 ${
          showChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Tin nhắn</h2>
          
        </div>

        <div className="overflow-y-auto flex-1">
          {loadingConvs ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded-full bg-gray-100 w-3/4" />
                    <div className="h-3 rounded-full bg-gray-100 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-gray-400 p-8">
              <ChatCircle size={40} weight="thin" />
              <p className="text-sm text-center">Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {conversations.map((conv) => {
                const id = conv.id ?? conv.partner_id;
                const name = conv.name ?? conv.partner_name ?? 'Người dùng';
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      navigate(`/chat/${id}`);
                      setShowChat(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-l-2 ${
                      partnerId && Number(partnerId) === id
                        ? 'border-l-teal-500 bg-teal-50'
                        : 'border-l-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-sm">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium text-gray-900 truncate">{name}</span>
                        <span className="text-[11px] text-gray-400 flex-shrink-0">
                          {formatRelativeTime(conv.last_message_at)}
                        </span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {conv.last_message || 'Bắt đầu cuộc trò chuyện'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <section className={`flex-1 flex flex-col bg-gray-50 min-w-0 ${!showChat ? 'hidden md:flex' : 'flex'}`}>
        {!peerId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <ChatCircleDots size={56} weight="thin" className="text-gray-300" />
            <p className="text-sm text-gray-400">Chọn cuộc trò chuyện để bắt đầu</p>
          </div>
        ) : (
          <>
            <div className="bg-white border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/chat');
                    setShowChat(false);
                  }}
                  className="md:hidden p-1 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-sm">
                  {partnerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">{partnerName}</h3>
                  {relatedPost && (
                    <span className="text-xs text-teal-600 truncate">re: {relatedPost.title}</span>
                  )}
                </div>
                <div className={`flex items-center gap-1 text-xs ${connected ? 'text-green-500' : 'text-gray-400'}`}>
                  {connected ? <WifiHigh size={14} /> : <WifiSlash size={14} />}
                  <span>{connected ? 'Đang kết nối' : 'Ngoại tuyến'}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loadingMsgs ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <p className="text-sm">Không có tin nhắn trong cuộc trò chuyện này.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((msg, index) => {
                    const prevMsg = messages[index - 1];
                    const showDateSep = !prevMsg || !isSameDay(prevMsg.created_at, msg.created_at);
                    const isMine = msg.sender_id === user?.id;
                    const isOptimistic = msg.isOptimistic;

                    return (
                      <Fragment key={msg.id}>
                        {showDateSep && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 px-2 whitespace-nowrap">
                              {formatDaySeparator(msg.created_at)}
                            </span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                        )}

                        <div className={`flex items-end gap-2 mb-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMine && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] font-semibold text-gray-600 mb-0.5">
                              {partnerName.charAt(0)}
                            </div>
                          )}

                          <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? `bg-teal-600 text-white rounded-br-sm ${isOptimistic ? 'opacity-70' : 'opacity-100'}` : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100 shadow-sm'}`}>
                              {msg.content}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 px-1">
                              <span className="text-[11px] text-gray-400">{formatMessageTime(msg.created_at)}</span>
                              {isMine && !isOptimistic && (
                                <span className={`text-[11px] font-bold ${msg.is_read ? 'text-teal-500' : 'text-gray-300'}`}>
                                  ✓✓
                                </span>
                              )}
                              {isOptimistic && (
                                <span className="text-[11px] text-gray-300">✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="bg-white border-t px-4 py-3">
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    className="w-full resize-none border border-gray-200 rounded-2xl px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white transition-colors max-h-32"
                    style={{ height: 'auto', overflowY: 'hidden' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                      e.target.style.overflowY = e.target.scrollHeight > 128 ? 'auto' : 'hidden';
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 flex-shrink-0 shadow-sm"
                >
                  <PaperPlaneRight size={18} weight="fill" className="text-white" />
                </button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
