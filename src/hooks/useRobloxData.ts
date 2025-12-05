import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RobloxItem {
  id: string;
  assetId: number;
  name: string;
  boughtFor: number;
  currentRap: number | null;
  date: string;
  isLoading?: boolean;
  thumbnailUrl?: string;
}

export interface UserStats {
  totalSnipes: number;
  totalInvested: number;
  portfolioValue: number;
  allTimeProfit: number;
  profitPercentage: number;
}

export function useRobloxData() {
  const [items, setItems] = useState<RobloxItem[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalSnipes: 0,
    totalInvested: 0,
    portfolioValue: 0,
    allTimeProfit: 0,
    profitPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchItemRAP = async (assetId: number): Promise<{ rap: number | null; thumbnailUrl?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-roblox-item', {
        body: { assetId }
      });
      
      if (error || !data.success) {
        console.error('Error fetching RAP:', error || data.error);
        return { rap: null };
      }
      
      return { rap: data.rap, thumbnailUrl: data.thumbnailUrl };
    } catch (err) {
      console.error('Failed to fetch RAP:', err);
      return { rap: null };
    }
  };

  const calculateStats = (itemsList: RobloxItem[]) => {
    const totalInvested = itemsList.reduce((sum, item) => sum + item.boughtFor, 0);
    const portfolioValue = itemsList.reduce((sum, item) => sum + (item.currentRap || 0), 0);
    const allTimeProfit = portfolioValue - totalInvested;
    
    setStats({
      totalSnipes: itemsList.length,
      totalInvested,
      portfolioValue,
      allTimeProfit,
      profitPercentage: totalInvested > 0 ? (allTimeProfit / totalInvested) * 100 : 0,
    });
  };

  const loadItems = useCallback(async () => {
    const storedItems = localStorage.getItem('sniped_items');
    if (storedItems) {
      const parsed: RobloxItem[] = JSON.parse(storedItems);
      setItems(parsed.map(item => ({ ...item, isLoading: true })));
      
      const updatedItems = await Promise.all(
        parsed.map(async (item) => {
          const { rap, thumbnailUrl } = await fetchItemRAP(item.assetId);
          return { ...item, currentRap: rap, thumbnailUrl: thumbnailUrl || item.thumbnailUrl, isLoading: false };
        })
      );
      
      setItems(updatedItems);
      localStorage.setItem('sniped_items', JSON.stringify(updatedItems));
      calculateStats(updatedItems);
    }
  }, []);

  const addItem = useCallback(async (assetId: number, boughtFor: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-roblox-item', {
        body: { assetId }
      });
      
      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to fetch item');
      }

      // Check if item is a limited
      if (!data.isLimited) {
        return { success: false, error: 'This item is not a Limited. Only Limiteds can be tracked.' };
      }

      const newItem: RobloxItem = {
        id: `${Date.now()}`,
        assetId,
        name: data.name,
        boughtFor,
        currentRap: data.rap,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isLoading: false,
        thumbnailUrl: data.thumbnailUrl,
      };

      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      localStorage.setItem('sniped_items', JSON.stringify(updatedItems));
      calculateStats(updatedItems);

      return { success: true, item: newItem };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, [items]);

  const addItemFromTransaction = useCallback(async (transaction: {
    assetId: number;
    assetName: string;
    robuxSpent: number;
    created: string;
    thumbnailUrl?: string;
    currentRap?: number;
  }) => {
    // Check if item already exists
    const exists = items.some(item => item.assetId === transaction.assetId);
    if (exists) {
      return { success: false, error: 'Item already exists' };
    }

    const newItem: RobloxItem = {
      id: `${Date.now()}-${transaction.assetId}`,
      assetId: transaction.assetId,
      name: transaction.assetName,
      boughtFor: transaction.robuxSpent,
      currentRap: transaction.currentRap || null,
      date: new Date(transaction.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isLoading: false,
      thumbnailUrl: transaction.thumbnailUrl,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    localStorage.setItem('sniped_items', JSON.stringify(updatedItems));
    calculateStats(updatedItems);

    return { success: true, item: newItem };
  }, [items]);

  const removeItem = useCallback((itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    localStorage.setItem('sniped_items', JSON.stringify(updatedItems));
    calculateStats(updatedItems);
  }, [items]);

  const refreshItems = useCallback(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    stats,
    isLoading,
    addItem,
    addItemFromTransaction,
    removeItem,
    refreshItems,
  };
}
