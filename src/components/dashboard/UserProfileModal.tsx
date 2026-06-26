import React from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { conversations } = useChat();

  if (!isOpen) return null;

  // Calculate some fun user stats
  const totalChats = conversations.length;
  const recentTopics = conversations.slice(0, 4);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👑 User Profile & Analytics">
      <div className="space-y-6 py-2">
        
        {/* User Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 avatar-pulse"
            style={{ background: 'var(--gradient-accent)', color: '#fff', boxShadow: 'var(--shadow-glow-sm)' }}
          >
            {user?.email?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-base text-white truncate">
                {user?.full_name || user?.email?.split('@')[0] || 'Medical Explorer'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
                PRO VIP
              </span>
            </div>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>

        {/* Analytics Grid */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            📊 Usage Statistics
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <span className="text-xl block mb-1">💬</span>
              <span className="text-lg font-bold text-white block">{totalChats}</span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Total Consultations</span>
            </div>
            <div className="p-3.5 rounded-xl border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <span className="text-xl block mb-1">⚡</span>
              <span className="text-lg font-bold text-cyan-400 block">Active</span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>RAG Grounding Engine</span>
            </div>
            <div className="p-3.5 rounded-xl border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <span className="text-xl block mb-1">🛡️</span>
              <span className="text-lg font-bold text-emerald-400 block">Encrypted</span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Data Privacy Status</span>
            </div>
            <div className="p-3.5 rounded-xl border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <span className="text-xl block mb-1">🧠</span>
              <span className="text-lg font-bold text-purple-400 block">Gemini 2.5</span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>AI Inference Model</span>
            </div>
          </div>
        </div>

        {/* Recent Inquiries */}
        {recentTopics.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>
              🕒 Recent Topics
            </h4>
            <div className="space-y-1.5">
              {recentTopics.map(topic => (
                <div key={topic.id} className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-cyan-400">🩺</span>
                  <span className="truncate flex-1 text-gray-300 font-medium">{topic.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};

export default UserProfileModal;
