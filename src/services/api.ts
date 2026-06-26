/**
 * Backend API service
 * Handles all HTTP communication with FastAPI backend (no Firebase)
 */

const resolveApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (envUrl && envUrl !== 'http://localhost:8080') {
    return envUrl;
  }

  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1';

  return isLocalhost ? 'http://localhost:8081' : (envUrl || window.location.origin);
};

const API_URL = resolveApiUrl();

// ──────────────────────────────────────────────────────────────────────────
// TOKEN STORAGE
// ──────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'pulseai_token';
const USER_KEY = 'pulseai_user';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string, user: object) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// ──────────────────────────────────────────────────────────────────────────
// FETCH HELPERS
// ──────────────────────────────────────────────────────────────────────────

// Attach Bearer token to requests
const getHeaders = (includeContentType = true): Record<string, string> => {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

/**
 * Smart fetch wrapper: auto-clears auth and redirects to /auth on 401.
 * This prevents silent empty-conversation bugs when a token expires.
 */
const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, options);
  if (response.status === 401) {
    console.warn('[PulseAI] 401 Unauthorized — clearing session, redirecting to login');
    clearAuth();
    // Redirect to login page
    if (window.location.pathname !== '/auth') {
      window.location.href = '/auth';
    }
    throw new Error('Session expired. Please log in again.');
  }
  return response;
};

// ──────────────────────────────────────────────────────────────────────────
// AUTH API
// ──────────────────────────────────────────────────────────────────────────

export const registerUser = async (email: string, password: string, fullName?: string) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password, full_name: fullName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }

  const data = await response.json();
  setToken(data.access_token, data.user);
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  const data = await response.json();
  setToken(data.access_token, data.user);
  return data;
};

export const getCurrentUser = async () => {
  // Don't use apiFetch here — AuthContext handles 401 explicitly
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Session invalid');
  }

  return response.json();
};

// ──────────────────────────────────────────────────────────────────────────
// CONVERSATION API
// ──────────────────────────────────────────────────────────────────────────

export const getConversations = async () => {
  const response = await apiFetch(`${API_URL}/conversations`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }

  return response.json();
};

export const createConversation = async (title = 'New Chat') => {
  const response = await apiFetch(`${API_URL}/conversations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }

  return response.json();
};

export const updateConversation = async (convId: string, title: string) => {
  const response = await apiFetch(`${API_URL}/conversations/${convId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error('Failed to update conversation');
  }

  return response.json();
};

export const deleteConversation = async (convId: string) => {
  const response = await apiFetch(`${API_URL}/conversations/${convId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete conversation');
  }

  return response.json();
};

// ──────────────────────────────────────────────────────────────────────────
// MESSAGE API
// ──────────────────────────────────────────────────────────────────────────

export const getMessages = async (convId: string) => {
  const response = await apiFetch(`${API_URL}/conversations/${convId}/messages`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  return response.json();
};

export const streamAsk = async (convId: string, question: string, chatHistory: object[] = []) => {
  const response = await apiFetch(`${API_URL}/conversations/${convId}/ask/stream`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ question, chat_history: chatHistory }),
  });

  if (!response.ok) {
    throw new Error('Failed to stream response');
  }

  return response;
};

// ──────────────────────────────────────────────────────────────────────────
// SUMMARIZE API
// ──────────────────────────────────────────────────────────────────────────

export const summarizeConversation = async (convId: string, messages: object[]) => {
  const response = await apiFetch(`${API_URL}/conversations/${convId}/summarize`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error('Failed to summarize conversation');
  }

  return response.json();
};

// ──────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ──────────────────────────────────────────────────────────────────────────

export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
