/**
 * ChatContext — Core state management for the chat application
 *
 * KEY CHANGES FROM FIREBASE VERSION:
 * 1. Uses REST API instead of real-time Firestore listeners
 * 2. Manual polling/refetching for conversations and messages
 * 3. Streaming still via SSE (/conversations/{id}/ask/stream)
 * 4. JWT authentication via Authorization header
 * 5. Optimistic UI for delete/rename operations
 *
 * ARCHITECTURE: Context owns all business logic. Components are dumb presenters.
 */

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './ToastContext';
import {
  getConversations, createConversation, updateConversation, deleteConversation as deleteConvAPI,
  getMessages, streamAsk, summarizeConversation as summarizeAPI
} from '../services/api';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  conversation_id: string;
  text: string;
  sender: 'user' | 'bot';
  sources?: string[];
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface ChatContextType {
  conversations: Conversation[];
  selectedConversationId: string | null;
  messages: Message[];
  loadingMessages: boolean;
  streamingMessage: string | null;
  streamingSources: string[];
  isStreaming: boolean;
  selectConversation: (id: string | null) => void;
  createNewConversation: () => Promise<Conversation>;
  sendMessage: (text: string, conversationId?: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  summarizeConversation: () => Promise<string>;
}

// ─────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const [streamingSources, setStreamingSources] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Ref to track if we should continue polling
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ── Fetch conversations on auth ─────────────────────────────────────────

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setConversations([]);
      setSelectedConversationId(null);
      return;
    }

    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        if (isMountedRef.current) {
          setConversations(data);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      }
    };

    fetchConversations();

    // Poll every 10 seconds for new conversations
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated]);

  // ── Fetch messages when selected conversation changes ────────────────────

  const isStreamingRef = useRef(isStreaming);
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    if (!selectedConversationId || !isAuthenticated) {
      setMessages([]);
      return;
    }

    const fetchMessages = async (showLoading = true) => {
      if (showLoading) setLoadingMessages(true);
      try {
        const data = await getMessages(selectedConversationId);
        if (isMountedRef.current) {
          setMessages(prev => {
            // Keep local error messages so they don't disappear on poll
            const errorMessages = prev.filter(m => m.id.startsWith('error-'));
            return [...data, ...errorMessages];
          });
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        if (isMountedRef.current && showLoading) {
          setLoadingMessages(false);
        }
      }
    };

    fetchMessages(true);

    // Poll messages every 4 seconds, but pause during active streaming
    // to prevent race conditions / flickering while tokens are arriving.
    const interval = setInterval(() => {
      if (!isStreamingRef.current) fetchMessages(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedConversationId, isAuthenticated]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const selectConversation = useCallback((id: string | null) => {
    setSelectedConversationId(id);
    setStreamingMessage(null);
    setStreamingSources([]);
    setMessages([]);
  }, []);

  const createNewConversation = useCallback(async () => {
    try {
      const newConv = await createConversation('New Chat');
      // Re-fetch the full list from server so the sidebar is always in sync
      const fresh = await getConversations();
      if (isMountedRef.current) {
        setConversations(fresh);
        setSelectedConversationId(newConv.id);
      }
      showToast('Conversation created', 'success');
      return newConv;
    } catch (err) {
      showToast('Failed to create conversation', 'error');
      throw err;
    }
  }, [showToast]);

  /**
   * sendMessage — Streaming via SSE
   *
   * FLOW:
   * 1. Build chat_history from last 10 messages
   * 2. Open SSE stream to /conversations/{id}/ask/stream
   * 3. Read tokens as they arrive → update streamingMessage state
   * 4. Backend saves messages to DB automatically
   * 5. Clear streaming state
   */
  const sendMessage = useCallback(async (text: string, conversationId?: string) => {
    const targetConversationId = conversationId ?? selectedConversationId;
    if (!targetConversationId || isStreaming || !isAuthenticated) return;

    // Optimistically add the user's message to the UI immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: targetConversationId,
      text: text,
      sender: 'user',
      created_at: new Date().toISOString()
    };
    
    // Build chat history for context from existing messages (excluding the temp one)
    const chatHistory = messages.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    // Auto-rename if it's the first message
    if (chatHistory.length === 0) {
      const generatedTitle = text.length > 30 ? text.slice(0, 30) + '...' : text;
      renameConversation(targetConversationId, generatedTitle);
    }

    setMessages(prev => [...prev.filter(m => !m.id.startsWith('error-')), tempUserMessage]);
    setIsStreaming(true);
    setStreamingMessage('');
    setStreamingSources([]);

    let fullAnswer = '';
    let hasError = false;
    let errorMessage = '';

    try {
      const response = await streamAsk(targetConversationId, text, chatHistory);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Read SSE stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const lines = rawChunk.split('\n\n').filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.token) {
              fullAnswer += data.token;
              if (isMountedRef.current) {
                setStreamingMessage(fullAnswer);
              }
            }
            if (data.sources) {
              if (isMountedRef.current) {
                setStreamingSources(data.sources);
              }
            }
            if (data.error) {
              hasError = true;
              errorMessage = data.error;
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
        
        if (hasError) {
          throw new Error(errorMessage);
        }
      }

      // Backend saved messages automatically, fetch them
      const updatedMessages = await getMessages(targetConversationId);
      if (isMountedRef.current) {
        setMessages(updatedMessages);
      }

      showToast('Response received', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection error';
      showToast(`Failed to send message: ${msg}`, 'error');
      // Keep the optimistic user message and append an error message from the bot
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          conversation_id: targetConversationId,
          text: `⚠️ **Error:** ${msg}\n\nYour API quota may be exhausted, or the server encountered an error. Please wait a moment and try again.`,
          sender: 'bot',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      if (isMountedRef.current) {
        setIsStreaming(false);
        setStreamingMessage(null);
        setStreamingSources([]);
      }
    }
  }, [selectedConversationId, messages, isStreaming, isAuthenticated, showToast]);

  const deleteConversation = useCallback(async (id: string) => {
    // Optimistic update
    const prev = conversations;
    setConversations(c => c.filter(x => x.id !== id));

    if (selectedConversationId === id) {
      const remaining = prev.filter(c => c.id !== id);
      setSelectedConversationId(remaining.length > 0 ? remaining[0].id : null);
    }

    try {
      await deleteConvAPI(id);
      showToast('Conversation deleted', 'success');
    } catch (err) {
      // Rollback
      setConversations(prev);
      showToast('Failed to delete conversation', 'error');
    }
  }, [conversations, selectedConversationId, showToast]);

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    const trimmed = newTitle.trim().slice(0, 80);

    // Optimistic update
    setConversations(c => c.map(x => x.id === id ? { ...x, title: trimmed } : x));

    try {
      await updateConversation(id, trimmed);
    } catch (err) {
      showToast('Failed to rename conversation', 'error');
    }
  }, [showToast]);

  const summarizeConversation = useCallback(async (): Promise<string> => {
    if (!messages.length || !selectedConversationId) {
      return 'Nothing to summarize yet.';
    }
    try {
      const result = await summarizeAPI(selectedConversationId, messages);
      return result.summary;
    } catch (err) {
      return 'Sorry, failed to generate summary.';
    }
  }, [messages, selectedConversationId]);

  // ── Context Value ─────────────────────────────────────────────────────────
  const value: ChatContextType = {
    conversations,
    selectedConversationId,
    messages,
    loadingMessages,
    streamingMessage,
    streamingSources,
    isStreaming,
    selectConversation,
    createNewConversation,
    sendMessage,
    deleteConversation,
    renameConversation,
    summarizeConversation,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
