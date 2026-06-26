/**
 * AuthContext — JWT-based authentication (no Firebase)
 *
 * Handles:
 * - User registration and login
 * - Token management (localStorage)
 * - Session persistence
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { registerUser, loginUser, getStoredUser, clearAuth, getCurrentUser } from '../services/api';
import { useToast } from './ToastContext';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

// ─────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // ── Check if user is logged in (on mount) ───────────────────────────────

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      // Verify token is still valid with the backend
      getCurrentUser()
        .then((freshUser) => {
          // Update with fresh user data from server
          setUser(freshUser);
        })
        .catch(() => {
          console.log('Token expired or invalid, logging out');
          clearAuth();
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      setIsLoading(true);
      const response = await registerUser(email, password, fullName);
      setUser(response.user);
      showToast('Account created successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      showToast(message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await loginUser(email, password);
      setUser(response.user);
      showToast('Logged in successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      showToast(message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const signOut = useCallback(() => {
    clearAuth();
    setUser(null);
    showToast('Logged out', 'info');
  }, [showToast]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
