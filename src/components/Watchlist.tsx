import { useState, useEffect } from 'react';
import { Eye, Plus, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WatchlistItem {
  id: string;
  assetId: number;
  name: string;
  currentRap: number | null;
  targetPrice: number;
  addedAt: string;
  isLoading?: boolean;
}

export function Watchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newAssetId, setNewAssetId] = useState('');
  const [newTargetPrice, setNewTargetPrice] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('watchlist_items');
    if (stored) {
      setItems(JSON.parse(stored));
      refreshPrices(JSON.parse(stored));
    }
  }, []);

  const refreshPrices = async (itemsToRefresh: WatchlistItem[]) => {
    setIsRefreshing(true);
    const updated = await Promise.all(
      itemsToRefresh.map(async (item) => {
        try {
          const { data } = await supabase.functions.invoke('fetch-roblox-item', {
            body: { assetId: item.assetId }
          });
          return { ...item, currentRap: data?.rap || item.currentRap, isLoading: false };
        } catch {
          return { ...item, isLoading: false };
        }
      })
    );
    setItems(updated);
    localStorage.setItem('watchlist_items', JSON.stringify(updated));
    setIsRefreshing(false);
  };

  const addItem = async () => {
    if (!newAssetId) return;
    
    setIsAddingItem(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-roblox-item', {
        body: { assetId: parseInt(newAssetId) }
      });

      if (error || !data?.success) {
        toast.error('Failed to fetch item');
        return;
      }

      const newItem: WatchlistItem = {
        id: `${Date.now()}`,
        assetId: parseInt(newAssetId),
        name: data.name,
        currentRap: data.rap,
        targetPrice: parseInt(newTargetPrice) || data.rap * 0.9,
        addedAt: new Date().toLocaleDateString(),
      };

      const updated = [...items, newItem];
      setItems(updated);
      localStorage.setItem('watchlist_items', JSON.stringify(updated));
      setNewAssetId('');
      setNewTargetPrice('');
      toast.success('Added to watchlist');
    } catch {
      toast.error('Failed to add item');
    } finally {
      setIsAddingItem(false);
    }
  };

  const removeItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('watchlist_items', JSON.stringify(updated));
    toast.success('Removed from watchlist');
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Watchlist
          </h3>
          <p className="text-xs text-muted-foreground">Track items you want to snipe</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refreshPrices(items)} disabled={isRefreshing}>
          <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Add Item Form */}
      <div className="border-b border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Asset ID"
            value={newAssetId}
            onChange={(e) => setNewAssetId(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Target Price (R$)"
            value={newTargetPrice}
            onChange={(e) => setNewTargetPrice(e.target.value)}
            className="w-32"
          />
          <Button onClick={addItem} disabled={isAddingItem || !newAssetId}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center">
          <Eye className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No items in watchlist</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => {
            const isUnderTarget = item.currentRap !== null && item.currentRap <= item.targetPrice;
            return (
              <div key={item.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-3 w-3 rounded-full",
                    isUnderTarget ? "bg-success animate-pulse" : "bg-muted"
                  )} />
                  <div>
                    <a
                      href={`https://www.roblox.com/catalog/${item.assetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-medium text-foreground hover:text-primary"
                    >
                      {item.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <p className="text-xs text-muted-foreground">#{item.assetId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-mono text-foreground">
                      R$ {item.currentRap?.toLocaleString() || 'N/A'}
                    </p>
                    <p className={cn(
                      "text-xs font-mono",
                      isUnderTarget ? "text-success" : "text-muted-foreground"
                    )}>
                      Target: R$ {item.targetPrice.toLocaleString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-loss" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
