import { useState } from 'react';
import { MessageCircle, Crosshair, Send, LogOut, Loader2, Trash2, Bot, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdmin, ALLOWED_USERNAMES } from '@/contexts/AdminContext';

export function AdminDashboard() {
  const { 
    setIsAdmin, 
    addChatMessage, 
    deleteChatMessage, 
    addSnipeFeed, 
    deleteSnipeFeed, 
    chatMessages, 
    snipeFeeds, 
    setTypingUser,
    autoChatEnabled,
    setAutoChatEnabled
  } = useAdmin();
  
  const [selectedUsername, setSelectedUsername] = useState(ALLOWED_USERNAMES[0]);
  const [chatInput, setChatiInput] = useState('');
  const [snipeUsername, setSnipeUsername] = useState('');
  const [snipeItemId, setSnipeItemId] = useState('');
  const [snipePrice, setSnipePrice] = useState('');
  const [isAddingSnipe, setIsAddingSnipe] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    // Show typing indicator
    const avatar = await getAvatarForUsername(selectedUsername);
    setTypingUser({ username: selectedUsername, avatar });
    setIsTyping(true);
    
    // Wait 2-4 seconds to simulate typing
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    setTypingUser(null);
    setIsTyping(false);
    
    await addChatMessage(selectedUsername, chatInput);
    setChatiInput('');
  };

  const getAvatarForUsername = async (username: string): Promise<string> => {
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

  const handleAddSnipe = async () => {
    if (!snipeUsername.trim() || !snipeItemId.trim() || !snipePrice.trim()) return;
    
    setIsAddingSnipe(true);
    await addSnipeFeed(snipeUsername, snipeItemId, parseInt(snipePrice));
    setSnipeUsername('');
    setSnipeItemId('');
    setSnipePrice('');
    setIsAddingSnipe(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage chats and snipe feeds</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Auto Chat Toggle */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">Auto Chat</h2>
                <p className="text-sm text-muted-foreground">
                  AI generates humanized trading conversations automatically
                </p>
              </div>
            </div>
            <Button
              variant={autoChatEnabled ? "default" : "outline"}
              onClick={() => setAutoChatEnabled(!autoChatEnabled)}
              className="gap-2"
            >
              <Power className="h-4 w-4" />
              {autoChatEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          {autoChatEnabled && (
            <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-success">
                Auto chat is running. Messages will be generated every 30-90 seconds.
              </p>
            </div>
          )}
        </div>

        {/* Chat Management */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Send Chat Message</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Select Username
              </label>
              <select
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {ALLOWED_USERNAMES.map((username) => (
                  <option key={username} value={username}>
                    {username}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Message
              </label>
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatiInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                />
                <Button onClick={handleSendChat} disabled={isTyping}>
                  {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Chats */}
          {chatMessages.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Messages</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {chatMessages.slice(-5).reverse().map((msg) => (
                  <div key={msg.id} className="flex items-center gap-2 text-sm group">
                    <span className="font-medium text-foreground">{msg.username}:</span>
                    <span className="text-muted-foreground truncate flex-1">{msg.message}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      onClick={() => deleteChatMessage(msg.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Snipe Feed Management */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crosshair className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Add Snipe Feed</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Username
              </label>
              <Input
                value={snipeUsername}
                onChange={(e) => setSnipeUsername(e.target.value)}
                placeholder="Roblox username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Item ID
              </label>
              <Input
                value={snipeItemId}
                onChange={(e) => setSnipeItemId(e.target.value)}
                placeholder="Asset ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Price (R$)
              </label>
              <Input
                value={snipePrice}
                onChange={(e) => setSnipePrice(e.target.value)}
                placeholder="129"
                type="number"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAddSnipe} 
            className="mt-4 w-full"
            disabled={isAddingSnipe}
          >
            {isAddingSnipe ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding Snipe...
              </>
            ) : (
              <>
                <Crosshair className="h-4 w-4" />
                Add Snipe
              </>
            )}
          </Button>

          {/* Recent Snipes */}
          {snipeFeeds.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Snipes</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {snipeFeeds.slice(-5).reverse().map((snipe) => (
                  <div key={snipe.id} className="flex items-center gap-3 p-2 rounded-lg bg-background/50 group">
                    {snipe.itemThumbnail && (
                      <img 
                        src={snipe.itemThumbnail} 
                        alt={snipe.itemName}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold text-primary">{snipe.username}</span>
                        {' sniped '}
                        <span className="font-semibold">{snipe.itemName}</span>
                        {' for '}
                        <span className="text-success font-semibold">{snipe.price}R$</span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      onClick={() => deleteSnipeFeed(snipe.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
