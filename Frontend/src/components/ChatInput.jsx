import { useCallback, useState } from 'react';

export default function ChatInput({ onSend, disabled, error }) {
  const [value, setValue] = useState('');

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }, [value, disabled, onSend]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="chat-input">
      {error ? (
        <p className="chat-input__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="chat-input__row">
        <textarea
          className="chat-input__field"
          rows={1}
          placeholder="Message…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          aria-label="Message input"
        />
        <button
          type="button"
          className="btn btn--primary chat-input__send"
          onClick={submit}
          disabled={disabled || !value.trim()}
        >
          Send
        </button>
      </div>
      <p className="chat-input__hint">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
