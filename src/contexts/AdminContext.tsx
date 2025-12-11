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
  deleteChatMessage: (id: string) => Promise<void>;
  snipeFeeds: SnipeFeed[];
  addSnipeFeed: (username: string, itemId: string, price: number) => Promise<void>;
  deleteSnipeFeed: (id: string) => Promise<void>;
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
    // Load initial data from database
  useEffect(() => {
    const loadData = async () => {
      // Load chat messages
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (messages) {
        setChatMessages(messages.map(msg => ({
          id: msg.id,
          username: msg.username,
          avatar: msg.avatar || '',
          message: msg.message,
          timestamp: formatTimestamp(msg.created_at),
        })));
      }

      // Load snipe feeds
      const { data: snipes } = await supabase
        .from('snipe_feeds')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (snipes) {
        setSnipeFeeds(snipes.map(snipe => ({
          id: snipe.id,
          username: snipe.username,
          itemId: snipe.item_id,
          itemName: snipe.item_name,
          itemThumbnail: snipe.item_thumbnail || '',
          price: snipe.price,
          timestamp: formatTimestamp(snipe.created_at),
        })));
      }
    };

    loadData();
  }, []);

  // Set up realtime subscriptions
  useEffect(() => {
    const chatChannel = supabase
      .channel('chat-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const msg = payload.new as any;
          setChatMessages(prev => [...prev, {
            id: msg.id,
            username: msg.username,
            avatar: msg.avatar || '',
            message: msg.message,
            timestamp: formatTimestamp(msg.created_at),
          }]);
        }
      )
      .subscribe();

    const snipeChannel = supabase
      .channel('snipe-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'snipe_feeds' },
        (payload) => {
          const snipe = payload.new as any;
          setSnipeFeeds(prev => [...prev, {
            id: snipe.id,
            username: snipe.username,
            itemId: snipe.item_id,
            itemName: snipe.item_name,
            itemThumbnail: snipe.item_thumbnail || '',
            price: snipe.price,
            timestamp: formatTimestamp(snipe.created_at),
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(snipeChannel);
    };
  }, []);

  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('verizon_admin', 'true');
    } else {
      localStorage.removeItem('verizon_admin');
    }
  }, [isAdmin]);

   const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

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
    await supabase.from('chat_messages').insert({
      id: Date.now().toString(),
      username,
      avatar,
      message,
    });
  };

  const addSnipeFeed = async (username: string, itemId: string, price: number) => {
    try {
      const response = await fetch('https://lyihtixtxsxrcxxsluel.supabase.co/functions/v1/fetch-roblox-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: itemId }),
      });
      const data = await response.json();
      
      await supabase.from('snipe_feeds').insert({
        username,
        item_id: itemId,
        item_name: data.name || `Item ${itemId}`,
        item_thumbnail: data.thumbnail || '',
        price,
      });
    } catch (error) {
      console.error('Error adding snipe:', error);
    }
  };
  const deleteChatMessage = async (id: string) => {
    await supabase.from('chat_messages').delete().eq('id', id);
    setChatMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const deleteSnipeFeed = async (id: string) => {
    await supabase.from('snipe_feeds').delete().eq('id', id);
    setSnipeFeeds(prev => prev.filter(snipe => snipe.id !== id));
  };
  return (
    <AdminContext.Provider value={{
      isAdmin,
      setIsAdmin,
      chatMessages,
      addChatMessage,
      deleteChatMessage,
      snipeFeeds,
      addSnipeFeed,
      deleteSnipeFeed,
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


