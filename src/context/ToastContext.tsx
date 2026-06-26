/**
 * ToastContext — Global notification system
 * 
 * HOW IT WORKS:
 * - ToastProvider wraps the app and maintains a list of toast messages
 * - Any component can call `useToast().showToast(message, type)` to trigger a notification
 * - Toast auto-dismisses after 4 seconds
 * - Multiple toasts stack vertically in the top-right corner
 * 
 * INTERVIEW TALKING POINT:
 * "I implemented a custom toast system using React Context + useReducer instead
 *  of a third-party library to demonstrate React patterns and keep bundle size minimal."
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
}

type ToastAction =
  | { type: 'ADD'; payload: Toast }
  | { type: 'REMOVE'; payload: string };

function toastReducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case 'ADD':    return [...state, action.payload];
    case 'REMOVE': return state.filter(t => t.id !== action.payload);
    default:       return state;
  }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', payload: id });
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    dispatch({ type: 'ADD', payload: { id, message, type } });
    // Auto-dismiss after 4 seconds
    setTimeout(() => dismissToast(id), 4000);
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
