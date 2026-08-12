import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AppUser {
  id: string;
  email: string | null;
  displayName?: string | null;
  role?: string;
  user_metadata?: {
    role?: string;
    full_name?: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  loginCustomAdmin: (email: string, displayName?: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  loginCustomAdmin: () => {},
});

const LOCAL_STORAGE_KEY = 'yamtv_admin_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check localStorage session first
    const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.email) {
          setUser({
            id: parsed.id || 'admin_' + Date.now(),
            email: parsed.email,
            displayName: parsed.displayName || parsed.email.split('@')[0],
            role: 'admin',
            user_metadata: { role: 'admin', full_name: parsed.displayName || parsed.email.split('@')[0] }
          });
        }
      } catch (e) {
        console.warn('Invalid saved admin session:', e);
      }
    }

    setLoading(false);

    return () => {
      isMounted = false;
    };
  }, []);

  const loginCustomAdmin = (email: string, displayName?: string) => {
    const adminUser: AppUser = {
      id: 'admin_' + Date.now(),
      email: email,
      displayName: displayName || email.split('@')[0] || 'Admin',
      role: 'admin',
      user_metadata: { role: 'admin', full_name: displayName || email.split('@')[0] || 'Admin' }
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(adminUser));
    setUser(adminUser);
  };

  const signOut = async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, loginCustomAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
