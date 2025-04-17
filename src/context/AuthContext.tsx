// src/context/AuthContext.tsx (ИСПРАВЛЕНО: Используем ОДИН клиент)
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// --- ИМПОРТИРУЕМ ОБЩИЙ КЛИЕНТ ---
import { supabase } from '@/lib/supabase/client'; // <--- ИЗМЕНЕНИЕ ЗДЕСЬ
// --- КОНЕЦ ИЗМЕНЕНИЯ ---
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // --- УДАЛИЛИ СОЗДАНИЕ ЛИШНЕГО КЛИЕНТА ЗДЕСЬ ---
  // const supabaseListenerClient = createBrowserClient(...) // <-- УДАЛЕНО

  useEffect(() => {
    console.log("AuthProvider useEffect running");
    let isMounted = true;

    const fetchSession = async () => {
      console.log("AuthProvider: Fetching session...");
      try {
        // --- ИСПОЛЬЗУЕМ ИМПОРТИРОВАННЫЙ КЛИЕНТ ---
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        // --- КОНЕЦ ИЗМЕНЕНИЯ ---
        if (isMounted) {
          if (error) { console.error("AuthProvider: Error getting session:", error.message); }
          console.log("AuthProvider: Fetched session:", currentSession);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
           setLoading(false);
           console.log("AuthProvider: Initial loading finished.");
        }
      } catch (e) {
         console.error("AuthProvider: Exception getting session:", e);
          if (isMounted) setLoading(false);
      }
    };

    fetchSession();

    // --- ИСПОЛЬЗУЕМ ИМПОРТИРОВАННЫЙ КЛИЕНТ ---
    const { data: authListener } = supabase.auth.onAuthStateChange(
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---
      (_event, currentSession) => {
        if (isMounted) {
            console.log("AuthProvider: Auth state changed! Event:", _event);
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
             if (loading) setLoading(false);
        }
      }
    );

    return () => {
      console.log("AuthProvider cleanup: Unsubscribing auth listener.");
      isMounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []); // Пустой массив зависимостей


  const value = { user, session, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};