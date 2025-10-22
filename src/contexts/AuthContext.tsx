
import { Session, User } from '@supabase/supabase-js';
import React, { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN') {
        closeAuthModal();
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); 
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Updated signOut to only sign out without clearing local storage
  const signOut = async () => {
    await supabase.auth.signOut();
    // We no longer clear localStorage here to preserve the user's data cache on sign out.
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error('Error signing in with Google:', error);
  };
  
  const signUpWithEmail = (email, password) => supabase.auth.signUp({ email, password });
  const signInWithEmail = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  
  const value = useMemo(() => ({
    session, 
    user, 
    loading, 
    isAuthModalOpen,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    openAuthModal,
    closeAuthModal,
  }), [session, user, loading, isAuthModalOpen]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
