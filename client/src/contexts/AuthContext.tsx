import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: 'view' | 'edit' | 'delete' | 'manage_users' | 'manage_categories') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'luxury_deals_auth';
const USERS_KEY = 'luxury_deals_users';

// Default admin user
const DEFAULT_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // In production, this should be hashed
    email: 'admin@luxurydeals.com',
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize default users if not exists
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }

    // Check for existing session
    const storedAuth = localStorage.getItem(STORAGE_KEY);
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setUser(authData.user);
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const storedUsers = localStorage.getItem(USERS_KEY);
      const users = storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS;
      
      const foundUser = users.find(
        (u: any) => u.username === username && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user: userWithoutPassword })
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasPermission = (
    permission: 'view' | 'edit' | 'delete' | 'manage_users' | 'manage_categories'
  ): boolean => {
    if (!user) return false;

    const permissions = {
      admin: ['view', 'edit', 'delete', 'manage_users', 'manage_categories'],
      editor: ['view', 'edit', 'delete'],
      viewer: ['view'],
    };

    return permissions[user.role].includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
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

// User management functions
export function getAllUsers() {
  const storedUsers = localStorage.getItem(USERS_KEY);
  return storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS;
}

export function addUser(userData: {
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}) {
  const users = getAllUsers();
  const newUser = {
    id: Math.max(...users.map((u: any) => u.id), 0) + 1,
    ...userData,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
}

export function updateUser(id: number, userData: Partial<{
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}>) {
  const users = getAllUsers();
  const index = users.findIndex((u: any) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users[index];
  }
  return null;
}

export function deleteUser(id: number) {
  const users = getAllUsers();
  const filteredUsers = users.filter((u: any) => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
  return true;
}
