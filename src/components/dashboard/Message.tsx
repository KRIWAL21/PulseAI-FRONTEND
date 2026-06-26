/**
 * Message — Individual chat message bubble
 *
 * FEATURES:
 * 1. Markdown rendering (react-markdown + remark-gfm) for bot messages
 *    - Formats headings, bullet points, bold, code, blockquotes properly
 * 2. Source citations accordion (expandable list of source documents)
 * 3. Copy-to-clipboard button on bot messages
 * 4. Text-to-speech via the speak prop
 * 5. Typing indicator (animated dots) while waiting for response
 * 6. Streaming cursor (blinking ▋) while streaming
 *
 * WHY REACT-MARKDOWN?
 * The LLM often responds with markdown (## headings, **bold**, - bullets).
 * Without a renderer, "## Aspirin" appears literally instead of as a heading.
 * react-markdown safely converts markdown to React elements (no dangerouslySetInnerHTML).
 */

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../hooks/useAuth';
import type { Message as MessageType } from '../../context/ChatContext';

interface MessageProps {
  message: MessageType;
  isTyping?: boolean;
  isStreaming?: boolean;
  onSpeak?: (text: string) => void;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      title="Copy to clipboard"
      className="p-1 rounded transition-colors"
      style={{ color: copied ? 'var(--success)' : 'var(--text-muted)' }}
      onMouseEnter={e => { if (!copied) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
      onMouseLeave={e => { if (!copied) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
    >
      {copied ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      )}
    </button>
  );
};

const SourcesAccordion = ({ sources }: { sources: string[] }) => {
  const [open, setOpen] = useState(false);
  if (!sources.length) return null;

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs font-medium transition-colors"
        style={{ color: open ? 'var(--accent)' : 'var(--text-muted)' }}
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {sources.length} source{sources.length > 1 ? 's' : ''} referenced
      </button>

      {open && (
        <div className="flex flex-wrap gap-1.5 mt-2" style={{ animation: 'fadeSlideUp 0.2s ease-out' }}>
          {sources.map(src => (
            <span key={src} className="source-chip">
              📄 {src}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const Message: React.FC<MessageProps> = ({
  message,
  isTyping = false,
  isStreaming = false,
  onSpeak,
}) => {
  const { user } = useAuth();
  const isUser = message.sender === 'user';

  return (
    <div
      className={`msg-enter flex items-end gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      style={{ maxWidth: '85%', ...(isUser ? { marginLeft: 'auto' } : {}) }}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isStreaming && !isUser ? 'avatar-pulse' : ''}`}
        style={{
          background: isUser ? 'rgba(139, 92, 246, 0.3)' : 'var(--gradient-accent)',
          border: `2px solid ${isUser ? 'rgba(139,92,246,0.4)' : 'rgba(0,212,255,0.3)'}`,
          boxShadow: !isUser ? 'var(--shadow-glow-sm)' : 'none',
          color: 'white',
        }}
      >
        {isUser
          ? (user?.email?.charAt(0).toUpperCase() ?? 'U')
          : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M3 12H5.5L8 4L12.5 20L16.5 9L19 12H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        }
      </div>

      {/* Bubble */}
      <div
        className="rounded-2xl px-4 py-3 text-sm"
        style={{
          background: isUser ? 'var(--gradient-user-msg)' : 'var(--bg-overlay)',
          border: isUser ? 'none' : '1px solid var(--border)',
          color: isUser ? '#fff' : 'var(--text-primary)',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          maxWidth: '100%',
          wordBreak: 'break-word',
        }}
      >
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}

        {/* Message content */}
        {!isTyping && (
          <>
            {isUser ? (
              <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div className={`md ${isStreaming ? 'streaming-cursor' : ''}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.text}
                </ReactMarkdown>
              </div>
            )}

            {/* Source citations */}
            {!isUser && message.sources && message.sources.length > 0 && !isStreaming && (
              <SourcesAccordion sources={message.sources} />
            )}

            {/* Action buttons for bot messages */}
            {!isUser && !isStreaming && (
              <div
                className="flex items-center gap-1 mt-2 pt-2"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <CopyButton text={message.text} />
                {onSpeak && (
                  <button
                    onClick={() => onSpeak(message.text)}
                    title="Read aloud"
                    className="p-1 rounded transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12m-4.95-9.05a5 5 0 000 7.072" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Message;