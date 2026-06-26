import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';

/**
 * Sidebar — Conversation history panel with full management
 *
 * FEATURES:
 * - List of all user conversations, ordered by newest
 * - New chat button
 * - Click to select conversation
 * - Hover to reveal delete button (red trash icon)
 * - Double-click conversation title to rename inline
 * - User profile + logout at the bottom
 * - Responsive: collapsible on mobile via `isMobileOpen` prop
 *
 * PATTERNS USED:
 * - Optimistic UI: delete/rename update local state before Firestore
 * - Inline editing: controlled input with blur/enter to confirm
 */

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar = ({ isMobileOpen, onMobileClose }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const {
    conversations, selectedConversationId,
    selectConversation, createNewConversation,
    deleteConversation, renameConversation,
    isStreaming,
  } = useChat();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => signOut();

  const startRename = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setRenameValue(currentTitle);
    // Focus input after render
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const confirmRename = (id: string) => {
    if (renameValue.trim()) renameConversation(id, renameValue.trim());
    setRenamingId(null);
  };

  const handleRenameKey = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') confirmRename(id);
    if (e.key === 'Escape') setRenamingId(null);
  };

  const handleNewChat = async () => {
    await createNewConversation();
    onMobileClose();
  };

  const sidebarContent = (
    <aside
      className="flex flex-col h-full select-none"
      style={{
        width: 260,
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--gradient-accent)', boxShadow: 'var(--shadow-glow-sm)' }}
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H5.5L8 4L12.5 20L16.5 9L19 12H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="font-bold text-base gradient-text">PulseAI</span>
      </div>

      {/* ── New Chat Button ───────────────────────────────────── */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={handleNewChat}
          disabled={isStreaming}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: 'var(--gradient-accent)',
            color: '#fff',
            boxShadow: 'var(--shadow-glow-sm)',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </button>
      </div>

      {/* ── Conversations List ────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No conversations yet.<br />Start a new chat above!
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest px-2 mb-2" style={{ color: 'var(--text-muted)' }}>
              History
            </p>
            <div className="space-y-1">
              {conversations.map(convo => {
                const isActive = selectedConversationId === convo.id;
                const isRenaming = renamingId === convo.id;

                return (
                  <div
                    key={convo.id}
                    className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isActive ? 'conv-item-active' : ''}`}
                    style={{
                      border: '1px solid transparent',
                      background: isActive ? undefined : 'transparent',
                    }}
                    onClick={() => { if (!isRenaming) { selectConversation(convo.id); onMobileClose(); } }}
                    onDoubleClick={() => startRename(convo.id, convo.title)}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    title="Double-click to rename"
                  >
                    {/* Chat icon */}
                    <svg className="w-4 h-4 flex-shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>

                    {/* Title or rename input */}
                    {isRenaming ? (
                      <input
                        ref={renameInputRef}
                        className="flex-1 text-sm bg-transparent outline-none"
                        style={{ color: 'var(--text-primary)', border: 'none' }}
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => confirmRename(convo.id)}
                        onKeyDown={e => handleRenameKey(e, convo.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="flex-1 text-sm truncate"
                        style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}
                      >
                        {convo.title}
                      </span>
                    )}

                    {/* Actions (shows on hover) */}
                    {!isRenaming && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center flex-shrink-0">
                        <button
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onClick={e => { e.stopPropagation(); startRename(convo.id, convo.title); }}
                          title="Rename conversation"
                          aria-label="Rename conversation"
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onClick={e => { e.stopPropagation(); deleteConversation(convo.id); }}
                          title="Delete conversation"
                          aria-label="Delete conversation"
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* ── User Profile + Logout ─────────────────────────────── */}
      <div
        className="px-3 py-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background: 'var(--bg-overlay)' }}>
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'var(--gradient-accent)', color: '#fff' }}
          >
            {user?.email?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <span className="text-xs truncate flex-1" style={{ color: 'var(--text-secondary)' }}>
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile sidebar — slide-in overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/60" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 h-full" style={{ zIndex: 50 }}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;