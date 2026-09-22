import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chatApi } from '../services/api';
import { sendAiMessage } from '../services/socket';
import { getErrorMessage } from '../utils/errors';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [chats, setChats] = useState([]);
  const [chatsStatus, setChatsStatus] = useState('idle');
  const [chatsError, setChatsError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [messagesStatus, setMessagesStatus] = useState('idle');
  const [messagesError, setMessagesError] = useState(null);

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [pendingUserText, setPendingUserText] = useState(null);

  const activeChatId = conversationId || null;
  const activeChat = useMemo(
    () => chats.find((c) => c._id === activeChatId) || null,
    [chats, activeChatId]
  );

  const loadChats = useCallback(async () => {
    setChatsStatus('loading');
    setChatsError(null);
    try {
      const { data } = await chatApi.list();
      setChats(data.chats || []);
      setChatsStatus('ready');
    } catch (err) {
      setChatsError(getErrorMessage(err, 'Could not load conversations.'));
      setChatsStatus('error');
    }
  }, []);

  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) {
      setMessages([]);
      setMessagesStatus('idle');
      return;
    }
    setMessagesStatus('loading');
    setMessagesError(null);
    try {
      const { data } = await chatApi.messages(chatId);
      setMessages(data.messages || []);
      setMessagesStatus('ready');
    } catch (err) {
      setMessagesError(getErrorMessage(err, 'Could not load messages.'));
      setMessagesStatus('error');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    } else {
      setChats([]);
      setMessages([]);
    }
  }, [isAuthenticated, loadChats]);

  useEffect(() => {
    setSendError(null);
    setPendingUserText(null);
    loadMessages(activeChatId);
  }, [activeChatId, loadMessages]);

  const createChat = useCallback(async () => {
    setChatsError(null);
    try {
      const { data } = await chatApi.create();
      const chat = data.chat;
      setChats((prev) => [chat, ...prev]);
      navigate(`/chat/${chat._id}`);
      return chat;
    } catch (err) {
      const message = getErrorMessage(err, 'Could not create a new chat.');
      setChatsError(message);
      throw new Error(message);
    }
  }, [navigate]);

  const deleteChat = useCallback(
    async (chatId) => {
      setChatsError(null);
      try {
        await chatApi.remove(chatId);
        setChats((prev) => prev.filter((c) => c._id !== chatId));
        if (activeChatId === chatId) {
          navigate('/chat');
        }
      } catch (err) {
        const message = getErrorMessage(err, 'Could not delete this chat.');
        setChatsError(message);
        throw new Error(message);
      }
    },
    [activeChatId, navigate]
  );

  const sendMessage = useCallback(
    async (text) => {
      const content = text.trim();
      if (!content || !activeChatId || isSending) return;

      setIsSending(true);
      setSendError(null);
      setPendingUserText(content);

      try {
        await sendAiMessage(activeChatId, content);
        await loadMessages(activeChatId);
        await loadChats();
      } catch (err) {
        setSendError(err.message || 'Failed to send message.');
      } finally {
        setPendingUserText(null);
        setIsSending(false);
      }
    },
    [activeChatId, isSending, loadMessages, loadChats]
  );

  const value = useMemo(
    () => ({
      chats,
      chatsStatus,
      chatsError,
      activeChatId,
      activeChat,
      messages,
      messagesStatus,
      messagesError,
      isSending,
      sendError,
      pendingUserText,
      loadChats,
      createChat,
      deleteChat,
      sendMessage,
      selectChat: (id) => navigate(`/chat/${id}`),
    }),
    [
      chats,
      chatsStatus,
      chatsError,
      activeChatId,
      activeChat,
      messages,
      messagesStatus,
      messagesError,
      isSending,
      sendError,
      pendingUserText,
      loadChats,
      createChat,
      deleteChat,
      sendMessage,
      navigate,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
