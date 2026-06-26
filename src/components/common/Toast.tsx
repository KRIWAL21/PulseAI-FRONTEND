/**
 * Toast — Visual notification component
 * Renders a stack of toast notifications in the top-right corner.
 * Receives state from ToastContext via useToast().
 */

import { useToast } from '../../context/ToastContext';
import type { Toast as ToastData, ToastType } from '../../context/ToastContext';

const icons: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const colors: Record<ToastType, string> = {
  success: 'border-green-500/40 text-green-300',
  error: 'border-red-500/40 text-red-300',
  warning: 'border-yellow-500/40 text-yellow-300',
  info: 'border-blue-500/40 text-blue-300',
};

const ToastItem = ({ toast }: { toast: ToastData }) => {
  const { dismissToast } = useToast();
  return (
    <div
      className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl glass border ${colors[toast.type]} shadow-lg min-w-64 max-w-sm`}
      style={{ backdropFilter: 'blur(20px)' }}
    >
      <span className="text-lg flex-shrink-0">{icons[toast.type]}</span>
      <p className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
        {toast.message}
      </p>
      <button
        onClick={() => dismissToast(toast.id)}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

const Toast = () => {
  const { toasts } = useToast();
  if (!toasts.length) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
};

export default Toast;
