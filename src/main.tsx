import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { ChatProvider } from './context/ChatContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import ErrorBoundary from './components/common/ErrorBoundary.tsx'

/**
 * Provider Order (outer → inner):
 * ErrorBoundary → ToastProvider → AuthProvider → ChatProvider → App
 *
 * ChatProvider uses useAuth() and useToast(), so both must wrap it.
 * ToastProvider must be outside ErrorBoundary's children so toasts
 * still work even if part of the tree errors.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </AuthProvider>
    </ToastProvider>
  </ErrorBoundary>,
)
