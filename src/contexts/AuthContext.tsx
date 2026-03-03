import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type UserRole = 'client' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@zonapt.com': {
    password: 'admin123',
    user: {
      id: 'admin-1',
      email: 'admin@zonapt.com',
      name: 'Dr. Zona',
      role: 'admin',
    },
  },
  'patient@example.com': {
    password: 'patient123',
    user: {
      id: 'client-1',
      email: 'patient@example.com',
      name: 'John Smith',
      role: 'client',
    },
  },
  'mary@example.com': {
    password: 'mary123',
    user: {
      id: 'client-2',
      email: 'mary@example.com',
      name: 'Mary Johnson',
      role: 'client',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
