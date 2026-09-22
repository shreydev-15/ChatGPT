import { useChat } from '../context/ChatContext';
import ChatInput from './ChatInput';
import MessageList from './MessageList';

export default function ChatWindow({ onOpenSidebar }) {
  const {
    activeChat,
    activeChatId,
    messages,
    messagesStatus,
    messagesError,
    isSending,
    sendError,
    pendingUserText,
    sendMessage,
  } = useChat();

  if (!activeChatId) {
    return (
      <div className="chat-window chat-window--empty">
        <header className="chat-window__header">
          <button
            type="button"
            className="btn btn--ghost chat-window__menu"
            onClick={onOpenSidebar}
            aria-label="Open conversations"
          >
            Menu
          </button>
          <h1 className="chat-window__title">Chat</h1>
        </header>
        <div className="chat-window__empty">
          <p className="chat-window__empty-title">No conversation selected</p>
          <p className="chat-window__empty-hint">
            Choose a chat from the sidebar or start a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <header className="chat-window__header">
        <button
          type="button"
          className="btn btn--ghost chat-window__menu"
          onClick={onOpenSidebar}
          aria-label="Open conversations"
        >
          Menu
        </button>
        <h1 className="chat-window__title">{activeChat?.title || 'Conversation'}</h1>
      </header>

      <MessageList
        messages={messages}
        messagesStatus={messagesStatus}
        messagesError={messagesError}
        pendingUserText={pendingUserText}
        isSending={isSending}
      />

      <ChatInput
        onSend={sendMessage}
        disabled={isSending || messagesStatus === 'loading'}
        error={sendError}
      />
    </div>
  );
}
