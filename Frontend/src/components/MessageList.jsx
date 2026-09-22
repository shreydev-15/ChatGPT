import { useEffect, useRef } from 'react';
import { AI_WELCOME_MESSAGE } from '../utils/chatConstants';
import Message from './Message';
import LoadingState from './LoadingState';

export default function MessageList({
  messages,
  messagesStatus,
  messagesError,
  pendingUserText,
  isSending,
}) {
  const endRef = useRef(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, pendingUserText, isSending, messagesStatus]);

  if (messagesStatus === 'loading') {
    return (
      <div className="message-list message-list--loading">
        <LoadingState label="Loading messages…" />
      </div>
    );
  }

  if (messagesStatus === 'error') {
    return (
      <div className="message-list message-list--error" role="alert">
        <p>{messagesError}</p>
      </div>
    );
  }

  const showWelcome = messages.length === 0 && !pendingUserText;

  return (
    <div className="message-list" ref={scrollerRef}>
      {showWelcome ? (
        <Message
          message={{ role: 'model', content: AI_WELCOME_MESSAGE }}
          isWelcome
        />
      ) : null}

      {messages.map((msg) => (
        <Message key={msg._id} message={msg} />
      ))}

      {pendingUserText ? (
        <Message
          message={{ role: 'user', content: pendingUserText, createdAt: null }}
          isPending
        />
      ) : null}

      {isSending ? (
        <div className="message-row message-row--assistant" aria-live="polite">
          <div className="message message--assistant message--typing">
            <span className="message-typing">
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>
      ) : null}

      <div ref={endRef} className="message-list__anchor" aria-hidden="true" />
    </div>
  );
}
