import { toPlainChatText } from '../utils/plainText';

function formatTime(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export default function Message({ message, isPending, isWelcome }) {
  const isUser = message.role === 'user';
  const body = isUser ? message.content : toPlainChatText(message.content);

  return (
    <div
      className={`message-row ${isUser ? 'message-row--user' : 'message-row--assistant'}`}
    >
      <article
        className={`message ${isUser ? 'message--user' : 'message--assistant'}${isPending ? ' message--pending' : ''}${isWelcome ? ' message--welcome' : ''}`}
      >
        <div className="message__body">
          {body.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 ? <br /> : null}
            </span>
          ))}
        </div>
        {!isPending && !isWelcome && message.createdAt ? (
          <time className="message__time" dateTime={message.createdAt}>
            {formatTime(message.createdAt)}
          </time>
        ) : null}
      </article>
    </div>
  );
}
