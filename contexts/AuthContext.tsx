import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  metadata?: any;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  sendOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedUser, storedSession] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('session'),
      ]);

      if (storedUser && storedSession) {
        const user = JSON.parse(storedUser);
        const session = JSON.parse(storedSession);

        // Check if session is still valid
        if (session.expiresAt > Date.now() / 1000) {
          setAuthState({
            user,
            session,
            loading: false,
            isAuthenticated: true,
          });
          return;
        } else {
          // Session expired, clear storage
          await clearStoredAuth();
        }
      }

      setAuthState(prev => ({
        ...prev,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
      }));
    }
  };

  const clearStoredAuth = async () => {
    await Promise.all([
      AsyncStorage.removeItem('user'),
      AsyncStorage.removeItem('session'),
    ]);
  };

  const sendOTP = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await authService.sendOTP(email);
      return { success: true };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return { success: false, error: error.message || 'Network error. Please try again.' };
    }
  };

  const verifyOTP = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authService.verifyOTP(email, token);

      // Store user and session
      await Promise.all([
        AsyncStorage.setItem('user', JSON.stringify(result.user)),
        AsyncStorage.setItem('session', JSON.stringify(result.session)),
      ]);

      setAuthState({
        user: result.user,
        session: result.session,
        loading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return { success: false, error: error.message || 'Network error. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      await clearStoredAuth();
      setAuthState({
        user: null,
        session: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  };

  const clearAuth = () => {
    setAuthState({
      user: null,
      session: null,
      loading: false,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        sendOTP,
        verifyOTP,
        signOut,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};