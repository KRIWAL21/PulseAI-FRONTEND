/**
 * ErrorBoundary — Catches React rendering errors
 *
 * WHY THIS MATTERS:
 * Without an Error Boundary, a single component crash blanks the entire app.
 * This catches errors in the component tree, shows a friendly fallback,
 * and lets the user recover without a full page reload.
 *
 * INTERVIEW TALKING POINT:
 * "Error Boundaries must be class components because the lifecycle methods
 * componentDidCatch and getDerivedStateFromError don't have hook equivalents yet."
 */

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex items-center justify-center h-screen"
          style={{ background: 'var(--bg-base)' }}
        >
          <div
            className="glass rounded-2xl p-8 max-w-md text-center"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-accent px-6 py-2 rounded-xl text-sm"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
