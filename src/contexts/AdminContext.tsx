import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: string;
}

interface SnipeFeed {
  id: string;
  username: string;
  itemId: string;
  itemName: string;
  itemThumbnail: string;
  price: number;
  timestamp: string;
}

interface TypingUser {
  username: string;
  avatar: string;
}

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (username: string, message: string) => void;
  snipeFeeds: SnipeFeed[];
  addSnipeFeed: (username: string, itemId: string, price: number) => Promise<void>;
  typingUser: TypingUser | null;
  setTypingUser: (user: TypingUser | null) => void;
}

const ALLOWED_USERNAMES = [
  '00nlylexx',
  'JUST_KKE',
  'lyicals',
  'epetted',
  'Lowrises',
  'WHENDOESTHEPARTYSTOP'
];

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('verizon_admin') === 'true';
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [snipeFeeds, setSnipeFeeds] = useState<SnipeFeed[]>([]);
  const [typingUser, setTypingUser] = useState<TypingUser | null>(null);

  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('verizon_admin', 'true');
    } else {
      localStorage.removeItem('verizon_admin');
    }
  }, [isAdmin]);

  const getUserAvatar = async (username: string): Promise<string> => {
    try {
      const response = await fetch(`https://users.roblox.com/v1/users/search?keyword=${username}&limit=10`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const user = data.data.find((u: any) => u.name.toLowerCase() === username.toLowerCase());
        if (user) {
          const thumbResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=false`);
          const thumbData = await thumbResponse.json();
          if (thumbData.data && thumbData.data.length > 0) {
            return thumbData.data[0].imageUrl;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
    return '';
  };

  const addChatMessage = async (username: string, message: string) => {
    const avatar = await getUserAvatar(username);
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username,
      avatar,
      message,
      timestamp: 'now',
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const addSnipeFeed = async (username: string, itemId: string, price: number) => {
    try {
      const response = await fetch('https://lyihtixtxsxrcxxsluel.supabase.co/functions/v1/fetch-roblox-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: itemId }),
      });
      const data = await response.json();
      
      const newSnipe: SnipeFeed = {
        id: Date.now().toString(),
        username,
        itemId,
        itemName: data.name || `Item ${itemId}`,
        itemThumbnail: data.thumbnail || '',
        price,
        timestamp: 'now',
      };
      setSnipeFeeds(prev => [...prev, newSnipe]);
    } catch (error) {
      console.error('Error adding snipe:', error);
    }
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      setIsAdmin,
      chatMessages,
      addChatMessage,
      snipeFeeds,
      addSnipeFeed,
      typingUser,
      setTypingUser,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}


export { ALLOWED_USERNAMES };
