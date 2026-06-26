/**
 * ChatWindow — Main chat interface with streaming support
 *
 * STREAMING FLOW:
 * 1. User submits a question
 * 2. ChatContext.sendMessage() opens SSE connection to /ask/stream
 * 3. As tokens arrive, `streamingMessage` state updates in ChatContext
 * 4. ChatWindow renders a live "streaming" Message bubble showing the partial answer
 * 5. When streaming is done, Firestore saves the complete message
 * 6. onSnapshot fires → messages list updates → streaming bubble disappears
 *    and is replaced by the persisted message from Firestore
 *
 * This creates the ChatGPT-like "words appearing one by one" effect.
 */

import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useSpeech } from '../../hooks/useSpeech';
import Welcome from './Welcome';
import Message from './Message';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatWindow = () => {
  const {
    messages, sendMessage, selectedConversationId,
    loadingMessages, summarizeConversation,
    streamingMessage, streamingSources, isStreaming,
  } = useChat();

  const { isListening, transcript, startListening, stopListening, speak } = useSpeech();

  const [input, setInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync speech transcript → input field
  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  // Auto-scroll to bottom on new message or streaming update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const isSubmittingRef = useRef(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedConversationId || isStreaming || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    const text = input.trim();
    setInput('');
    
    try {
      await sendMessage(text);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleSummarize = async () => {
    setIsModalOpen(true);
    setIsSummarizing(true);
    const text = await summarizeConversation();
    setSummary(text);
    setIsSummarizing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (!selectedConversationId || (messages.length === 0 && !isStreaming && !loadingMessages && !streamingMessage)) {
    return <Welcome />;
  }

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* ── Chat Header ────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
      >
        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: isStreaming ? 'var(--warning)' : 'var(--success)', animation: isStreaming ? 'pulseGlow 1s infinite' : 'none' }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {isStreaming ? 'Generating...' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Summarize button */}
        <button
          onClick={handleSummarize}
          disabled={messages.length === 0 || isStreaming}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'var(--accent-dim)',
            border: '1px solid rgba(0,212,255,0.2)',
            color: 'var(--accent)',
          }}
          onMouseEnter={e => {
            if (!e.currentTarget.disabled) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.2)';
            }
          }}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
        >
          ✨ Summarize
        </button>
      </div>

      {/* ── Messages Area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <Spinner size={20} />
            <span className="text-sm">Loading messages...</span>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <Message
                key={msg.id}
                message={msg}
                onSpeak={speak}
              />
            ))}

            {/* ── Live Streaming Message ── */}
            {streamingMessage !== null && (
              <div
                className="msg-enter flex items-end gap-3"
                style={{ maxWidth: '85%' }}
              >
                {/* Bot avatar — pulsing while streaming */}
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center avatar-pulse"
                  style={{
                    background: 'var(--gradient-accent)',
                    border: '2px solid rgba(0,212,255,0.3)',
                    boxShadow: 'var(--shadow-glow-sm)',
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12H5.5L8 4L12.5 20L16.5 9L19 12H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div
                  className="rounded-2xl px-4 py-3 text-sm flex-1"
                  style={{
                    background: 'var(--bg-overlay)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: '18px 18px 18px 4px',
                  }}
                >
                  {streamingMessage ? (
                    <div className="md streaming-cursor">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {streamingMessage}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 py-0.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  )}

                  {/* Show sources as they arrive during streaming */}
                  {streamingSources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sources:</span>
                      {streamingSources.map(src => (
                        <span key={src} className="source-chip">{src}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ─────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-4 sm:px-8 py-4"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
      >
        <form onSubmit={handleSend} className="flex items-end gap-2">
          {/* Textarea-style input */}
          <div
            className="focus-ring flex-1 flex items-center gap-2 rounded-2xl px-4 py-3 transition-all"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
            }}
          >
            <textarea
              id="chat-input"
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? '🎙️ Recording clinical audio...' : 'Describe symptoms, paste lab results, or inquire about medications...'}
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed disabled:opacity-50"
              style={{
                color: 'var(--text-primary)',
                maxHeight: 120,
                overflow: 'auto',
              }}
            />

            {/* Voice input button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              title={isListening ? 'Stop recording' : 'Start voice input'}
              className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
              style={{ color: isListening ? 'var(--error)' : 'var(--text-muted)' }}
              onMouseEnter={e => { if (!isListening) (e.currentTarget.style.color = 'var(--accent)'); }}
              onMouseLeave={e => { if (!isListening) (e.currentTarget.style.color = 'var(--text-muted)'); }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isListening ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10h6v4H9z" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="btn-accent w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
          >
            {isStreaming ? (
              <span className="spinner" style={{ width: 18, height: 18 }} />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>

        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
          PulseAI may produce inaccurate information. Verify with a healthcare professional.
        </p>
      </div>

      {/* ── Summary Modal ──────────────────────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="✨ Conversation Summary">
        {isSummarizing ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Spinner size={32} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Analyzing conversation...</p>
          </div>
        ) : (
          <div className="md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatWindow;
