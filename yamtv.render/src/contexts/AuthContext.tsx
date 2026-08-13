import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

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
  loginCustomAdmin: (email: string, password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  loginCustomAdmin: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLogged = localStorage.getItem('yamtv_admin_logged');
    if (isLogged === 'true') {
      setUser({
        id: 'admin_123',
        email: 'admin@yamtv.bf',
        displayName: 'Admin',
        role: 'admin',
        user_metadata: { role: 'admin', full_name: 'Admin' }
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const loginCustomAdmin = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required");
    if (email.toLowerCase() === 'admin@yamtv.bf' && password === 'Yamtv2026!') {
      localStorage.setItem('yamtv_admin_logged', 'true');
      setUser({
        id: 'admin_123',
        email: 'admin@yamtv.bf',
        displayName: 'Admin',
        role: 'admin',
        user_metadata: { role: 'admin', full_name: 'Admin' }
      });
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const signOut = async () => {
    localStorage.removeItem('yamtv_admin_logged');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, loginCustomAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
