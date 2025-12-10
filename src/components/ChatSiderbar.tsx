import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: string;
  isAI?: boolean;
}

const aiConversations: ChatMessage[] = [
  {
    id: '1',
    username: 'Jake_Limited',
    message: 'yo how does the transaction import actually work?',
    timestamp: '2 min ago',
    isAI: true,
  },
  {
    id: '2',
    username: 'SniperBot',
    avatar: '🤖',
    message: 'It scans your Roblox transaction history automatically! Just click import and it finds all your limited purchases with the exact prices you paid.',
    timestamp: '2 min ago',
    isAI: true,
  },
  {
    id: '3',
    username: 'RblxTrader99',
    message: 'wait so it calculates profit automatically too?',
    timestamp: '5 min ago',
    isAI: true,
  },
  {
    id: '4',
    username: 'SniperBot',
    avatar: '🤖',
    message: 'Yep! It fetches the current RAP from Rolimons and compares it to what you paid. Shows profit in both Robux and GBP 💰',
    timestamp: '5 min ago',
    isAI: true,
  },
  {
    id: '5',
    username: 'LimitedKing',
    message: 'is my cookie safe tho? kinda worried about that',
    timestamp: '8 min ago',
    isAI: true,
  },
  {
    id: '6',
    username: 'SniperBot',
    avatar: '🤖',
    message: 'Your cookie is only stored locally on your device, never on our servers. We just use it to verify your account and fetch your transactions. You can logout anytime to clear it.',
    timestamp: '8 min ago',
    isAI: true,
  },
  {
    id: '7',
    username: 'SnipeQueen',
    message: 'the watchlist feature is actually so useful, finally found a good tracker',
    timestamp: '12 min ago',
    isAI: true,
  },
  {
    id: '8',
    username: 'TradeMaster',
    message: 'how many pages does it scan for transactions?',
    timestamp: '15 min ago',
    isAI: true,
  },
  {
    id: '9',
    username: 'SniperBot',
    avatar: '🤖',
    message: 'Up to 10 pages! So even your older limited purchases get picked up. Shows progress while scanning too.',
    timestamp: '15 min ago',
    isAI: true,
  },
  {
    id: '10',
    username: 'NewTrader2024',
    message: 'what does RAP mean exactly?',
    timestamp: '18 min ago',
    isAI: true,
  },
  {
    id: '11',
    username: 'SniperBot',
    avatar: '🤖',
    message: 'RAP = Recent Average Price. It\'s the average price limiteds have sold for recently. We pull this data from Rolimons to calculate your profits accurately.',
    timestamp: '18 min ago',
    isAI: true,
  },
];

export function ChatSidebar() {
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(aiConversations);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      username: user?.name || 'User',
      message: newMessage.trim(),
      timestamp: 'now',
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
  };

  return (
    <div className="w-80 bg-card/50 backdrop-blur-sm border-l border-border/50 flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Community Chat</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Ask questions about features</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="group">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                {msg.avatar || msg.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium truncate ${msg.avatar === '🤖' ? 'text-primary' : 'text-foreground'}`}>
                    {msg.username}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed break-words">
                  {msg.message}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border/50">
        {isAuthenticated ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 h-9 text-sm bg-background/50"
            />
            <Button type="submit" size="sm" className="h-9 px-3">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2 px-3 bg-muted/30 rounded-md">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Login to chat</span>
          </div>
        )}
      </div>
    </div>
  );
}