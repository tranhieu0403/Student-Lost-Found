import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatCircleDots } from '@phosphor-icons/react';
import ConversationList from '../components/chat/ConversationList.jsx';
import ChatBox from '../components/chat/ChatBox.jsx';
import { chatService } from '../services/chatService.js';
import { useChat } from '../hooks/useChat.js';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Chat() {
  useDocumentTitle('Tin nhắn');
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const peerId = partnerId ? Number(partnerId) : null;

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const { messages, loading, sending, sendMessage } = useChat(peerId);

  useEffect(() => {
    let mounted = true;
    setLoadingList(true);
    chatService
      .getConversations()
      .then((res) => {
        if (!mounted) return;
        const items = Array.isArray(res?.data) ? res.data : res?.data?.items || [];
        setConversations(items);
      })
      .catch(() => mounted && setConversations([]))
      .finally(() => mounted && setLoadingList(false));
    return () => {
      mounted = false;
    };
  }, [peerId]);

  const activePeer = (() => {
    const conv = conversations.find(
      (c) => (c.userId || c.user?.id) === peerId,
    );
    return conv?.user || (conv ? { id: conv.userId, name: conv.name } : null);
  })();

  const relatedPost = conversations.find(
    (c) => (c.userId || c.user?.id) === peerId,
  )?.post;

  return (
    <div className="flex h-[calc(100dvh-3rem-3.5rem)] md:h-[calc(100dvh-3.5rem)] bg-white border-t border-gray-100">
      {/* Sidebar */}
      <aside
        className={`w-full md:w-80 md:border-r md:border-gray-100 overflow-y-auto ${
          peerId ? 'hidden md:block' : 'block'
        }`}
      >
        <header className="px-4 h-14 flex items-center border-b border-gray-100 sticky top-0 bg-white z-10">
          <h1 className="text-base font-medium text-gray-900">Tin nhắn</h1>
        </header>
        <ConversationList
          conversations={conversations}
          activeId={peerId}
          loading={loadingList}
          onSelect={(id) => navigate(`/chat/${id}`)}
        />
      </aside>

      {/* Chat area */}
      <main className={`flex-1 ${peerId ? 'block' : 'hidden md:block'}`}>
        {peerId ? (
          <ChatBox
            peer={activePeer}
            relatedPost={relatedPost}
            messages={messages}
            loading={loading}
            sending={sending}
            currentUserId={user?.id}
            onSend={sendMessage}
            onBack={() => navigate('/chat')}
          />
        ) : (
          <EmptyChat />
        )}
      </main>
    </div>
  );
}

function EmptyChat() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center px-6">
        <ChatCircleDots size={48} weight="light" className="text-gray-300" />
        <h3 className="text-base font-medium text-gray-900 mt-4">Chọn một cuộc trò chuyện</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          Chọn người liên hệ từ danh sách bên trái để xem tin nhắn.
        </p>
      </div>
    </div>
  );
}
