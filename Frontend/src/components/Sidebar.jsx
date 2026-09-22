import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import LoadingState from './LoadingState';

function formatChatDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const {
    chats,
    chatsStatus,
    chatsError,
    activeChatId,
    createChat,
    deleteChat,
    selectChat,
  } = useChat();

  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleNewChat = async () => {
    setCreating(true);
    try {
      await createChat();
      onClose?.();
    } catch {
      /* error surfaced in context */
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = (id) => {
    selectChat(id);
    onClose?.();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteChat(id);
    } catch {
      /* error in context */
    } finally {
      setDeletingId(null);
    }
  };

  const displayName = user?.fullname
    ? `${user.fullname.firstname} ${user.fullname.lastname}`.trim()
    : user?.email || 'Account';

  return (
    <>
      <div
        className={`sidebar-backdrop${open ? ' sidebar-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`sidebar${open ? ' sidebar--open' : ''}`}
        aria-label="Conversations"
      >
        <div className="sidebar__head">
          <div className="sidebar__brand">
            <span className="sidebar__brand-mark" aria-hidden="true" />
            <span className="sidebar__brand-text">ChatGPT Clone</span>
          </div>
          <button
            type="button"
            className="btn btn--ghost sidebar__close"
            onClick={onClose}
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        <button
          type="button"
          className="btn btn--secondary sidebar__new"
          onClick={handleNewChat}
          disabled={creating}
        >
          {creating ? 'Creating…' : 'New chat'}
        </button>

        <div className="sidebar__list-wrap">
          {chatsStatus === 'loading' ? (
            <LoadingState label="Loading chats…" />
          ) : null}

          {chatsError ? (
            <p className="sidebar__error" role="alert">
              {chatsError}
            </p>
          ) : null}

          {chatsStatus === 'ready' && chats.length === 0 ? (
            <p className="sidebar__empty">No conversations yet.</p>
          ) : null}

          <ul className="sidebar__list">
            {chats.map((chat) => {
              const active = chat._id === activeChatId;
              return (
                <li key={chat._id}>
                  <button
                    type="button"
                    className={`sidebar__item${active ? ' sidebar__item--active' : ''}`}
                    onClick={() => handleSelect(chat._id)}
                  >
                    <span className="sidebar__item-title">{chat.title || 'Untitled'}</span>
                    <span className="sidebar__item-meta">
                      {formatChatDate(chat.lastActivity || chat.updatedAt)}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      className="sidebar__item-delete"
                      onClick={(e) => handleDelete(e, chat._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleDelete(e, chat._id);
                        }
                      }}
                      aria-label="Delete conversation"
                      aria-busy={deletingId === chat._id}
                    >
                      {deletingId === chat._id ? '…' : 'Del'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="sidebar__foot">
          <div className="sidebar__user">
            <span className="sidebar__user-name">{displayName}</span>
            <span className="sidebar__user-email">{user?.email}</span>
          </div>
          <button type="button" className="btn btn--ghost sidebar__logout" onClick={logout}>
            Log out
          </button>
          <div className="sidebar__legal">
            <Link to="/terms" onClick={onClose}>
              Terms
            </Link>
            <Link to="/privacy" onClick={onClose}>
              Privacy
            </Link>
          </div>
        </footer>
      </aside>
    </>
  );
}
