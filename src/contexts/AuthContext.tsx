import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RobloxUser {
  id: number;
  name: string;
  displayName: string;
  hasVerifiedBadge: boolean;
  avatarUrl?: string;
  robuxBalance?: number;
}

interface AuthContextType {
  user: RobloxUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  cookie: string | null;
  login: (cookie: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RobloxUser | null>(null);
  const [cookie, setCookie] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('roblox_user');
    const storedCookie = localStorage.getItem('roblox_cookie');
    if (storedUser && storedCookie) {
      setUser(JSON.parse(storedUser));
      setCookie(storedCookie);
    }
    setIsLoading(false);
  }, []);

  const login = async (inputCookie: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-roblox-cookie', {
        body: { cookie: inputCookie }
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Invalid cookie' };
      }

      const userData: RobloxUser = {
        id: data.user.id,
        name: data.user.name,
        displayName: data.user.displayName,
        hasVerifiedBadge: data.user.hasVerifiedBadge,
        avatarUrl: data.user.avatarUrl,
        robuxBalance: data.user.robuxBalance,
      };

      setUser(userData);
      setCookie(inputCookie);
      localStorage.setItem('roblox_user', JSON.stringify(userData));
      localStorage.setItem('roblox_cookie', inputCookie);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: 'Failed to validate cookie' };
    }
  };

  const logout = () => {
    setUser(null);
    setCookie(null);
    localStorage.removeItem('roblox_user');
    localStorage.removeItem('roblox_cookie');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      cookie,
      isLoading, 
      isAuthenticated: !!user,
      login, 
      logout 
    }}>
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
