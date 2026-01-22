import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface BackendUser {
  email: string;
  role: 'ADMIN' | 'EDITOR';
}

interface AuthContextType {
  user: BackendUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = 'backend_jwt';
const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:10000/api').replace(/\/$/, '');

async function fetchMe(token: string): Promise<BackendUser | null> {
  const res = await fetch(`${apiBase}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user || null;
}

export const BackendAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      const me = await fetchMe(token);
      if (!me) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } else {
        setUser(me);
      }
      setIsLoading(false);
    };
    init();
  }, [token]);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        return { error: 'Identifiants invalides ou API indisponible' };
      }
      const data = await res.json();
      const newToken = data.token as string;
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(data.user);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erreur réseau' };
    }
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isEditor = user?.role === 'EDITOR' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, isEditor, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useBackendAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useBackendAuth must be used within BackendAuthProvider');
  return ctx;
};
