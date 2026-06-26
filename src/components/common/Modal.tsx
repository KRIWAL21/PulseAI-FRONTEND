import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6, 11, 24, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-elevated)', animation: 'fadeSlideUp 0.25s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          className="px-6 py-4 overflow-y-auto text-sm leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onClose}
            className="btn-ghost px-4 py-2 rounded-xl text-sm w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;