  import React, { useState, useRef, useEffect } from 'react';
  import { MessageCircle, Send, Lock } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { useAuth } from '@/contexts/AuthContext';
  import { useAdmin } from '@/contexts/AdminContext';
  
  export function ChatSidebar() {
    const { isAuthenticated, user } = useAuth();
    const { chatMessages, typingUser, snipeFeeds } = useAdmin();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  
    useEffect(() => {
      scrollToBottom();
    }, [chatMessages, snipeFeeds, typingUser]);
  
    const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !isAuthenticated) return;
      // Users can't actually send - this is controlled by admin
      setNewMessage('');
    };
  
    // Combine and sort all feed items by timestamp
    const allFeedItems = [
      ...chatMessages.map(msg => ({ ...msg, type: 'chat' as const })),
      ...snipeFeeds.map(snipe => ({ ...snipe, type: 'snipe' as const })),
    ].sort((a, b) => parseInt(a.id) - parseInt(b.id));
  
    return (
      <div className="fixed right-4 top-1/2 -translate-y-1/2 w-72 h-[500px] bg-card/90 backdrop-blur-md border border-border/50 rounded-xl flex flex-col z-40 shadow-xl">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Community Chat</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Live snipes & chat</p>
        </div>
  
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {allFeedItems.length === 0 && !typingUser && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No messages yet
            </div>
          )}
  
          {allFeedItems.map((item) => (
            <div key={`${item.type}-${item.id}`} className="group">
              {item.type === 'chat' ? (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium text-primary">
                        {item.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.username}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed break-words">
                      {item.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 border border-success/20">
                  {item.itemThumbnail && (
                    <img 
                      src={item.itemThumbnail} 
                      alt={item.itemName}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">
                      <span className="font-semibold text-success">{item.username}</span>
                      {' sniped '}
                      <span className="font-semibold">{item.itemName}</span>
                      {' for '}
                      <span className="text-success font-semibold">{item.price}R$</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
  
          {/* Typing Indicator */}
          {typingUser && (
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                {typingUser.avatar ? (
                  <img src={typingUser.avatar} alt={typingUser.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-medium text-primary">
                    {typingUser.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {typingUser.username}
                  </span>
                </div>
                <div className="flex items-center gap-1 py-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
  
          <div ref={messagesEndRef} />
        </div>
  
        <div className="p-3 border-t border-border/50">
          {isAuthenticated ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Chat disabled..."
                className="flex-1 h-9 text-sm bg-background/50"
                disabled
              />
              <Button type="submit" size="sm" className="h-9 px-3" disabled>
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
