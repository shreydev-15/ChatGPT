import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function getAuthToken() {
  return authToken;
}

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const chatApi = {
  list: () => api.get('/chat'),
  create: (title) => api.post('/chat', title ? { title } : {}),
  messages: (chatId) => api.get(`/chat/${chatId}/messages`),
  remove: (chatId) => api.delete(`/chat/${chatId}`),
};

export default api;
