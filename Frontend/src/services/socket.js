import { io } from 'socket.io-client';
import { getAuthToken } from './api';

let socket = null;
const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

export function getSocket() {
  if (!socket) {
    socket = io(backendUrl || undefined, {
      path: '/socket.io',
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  const token = getAuthToken();
  if (token) {
    s.auth = { token };
  }
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function sendAiMessage(chatId, content) {
  const s = connectSocket();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Response timed out. Please try again.'));
    }, 120000);

    const onResponse = (payload) => {
      const payloadChatId = payload?.chat?._id ?? payload?.chat;
      if (payloadChatId?.toString?.() !== chatId.toString()) return;
      cleanup();
      resolve(payload);
    };

    const onError = (payload) => {
      cleanup();
      reject(new Error(payload?.message || 'Unable to generate a response.'));
    };

    const cleanup = () => {
      clearTimeout(timeout);
      s.off('ai-response', onResponse);
      s.off('ai-error', onError);
    };

    s.on('ai-response', onResponse);
    s.on('ai-error', onError);

    s.emit('ai-message', { chat: chatId, content });
  });
}
