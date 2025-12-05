import { useState, useEffect } from 'react';
import { Target, DollarSign, Wallet, TrendingUp, LayoutDashboard, Eye, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { ProfitChart } from '@/components/ProfitChart';
import { SnipedItemsTable } from '@/components/SnipedItemsTable';
import { AddItemModal } from '@/components/AddItemModal';
import { BulkImportModal } from '@/components/BulkImportModal';
import { TransactionImportModal } from '@/components/TransactionImportModal';
import { Watchlist } from '@/components/Watchlist';
import { Settings } from '@/components/Settings';
import { useRobloxData } from '@/hooks/useRobloxData';
import { cn } from '@/lib/utils';
import { robuxToGBP, formatGBP } from '@/lib/currency';

type Tab = 'dashboard' | 'watchlist' | 'settings';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isTransactionImportOpen, setIsTransactionImportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { items, stats, addItem, addItemFromTransaction, removeItem, refreshItems } = useRobloxData();

  // Auto-refresh prices based on settings
  useEffect(() => {
    const settingsStr = localStorage.getItem('sniper_settings');
    const settings = settingsStr ? JSON.parse(settingsStr) : { autoRefreshInterval: 30 };
    
    const interval = setInterval(() => {
      if (activeTab === 'dashboard' && items.length > 0) {
        refreshItems();
      }
    }, settings.autoRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [activeTab, items.length, refreshItems]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshItems();
    setIsRefreshing(false);
  };

  const handleBulkImport = async (importItems: { assetId: number; boughtFor: number }[]) => {
    for (const item of importItems) {
      await addItem(item.assetId, item.boughtFor);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'watchlist', label: 'Watchlist', icon: <Eye className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="h-4 w-4" /> },
  ];

  return (
    <main className="min-h-screen px-6 pt-24 pb-12">
      <div className="mx-auto max-w-6xl">
        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            icon={<Target className="h-4 w-4" />}
            label="Total Snipes"
            value={stats.totalSnipes.toString()}
          />
          <StatsCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Total Invested"
            value={`R$ ${stats.totalInvested.toLocaleString()}`}
            subValue={formatGBP(robuxToGBP(stats.totalInvested))}
            variant="default"
          />
          <StatsCard
            icon={<Wallet className="h-4 w-4" />}
            label="Portfolio Value"
            value={`R$ ${stats.portfolioValue.toLocaleString()}`}
            subValue={formatGBP(robuxToGBP(stats.portfolioValue))}
          />
          <StatsCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="All-Time Profit"
            value={`${stats.allTimeProfit >= 0 ? '+' : ''}R$ ${stats.allTimeProfit.toLocaleString()}`}
            subValue={`${stats.allTimeProfit >= 0 ? '+' : ''}${formatGBP(robuxToGBP(stats.allTimeProfit))} (${stats.profitPercentage >= 0 ? '+' : ''}${stats.profitPercentage.toFixed(1)}%)`}
            variant={stats.allTimeProfit >= 0 ? "success" : "loss"}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                activeTab === tab.id && "bg-primary text-primary-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <ProfitChart items={items} />
            <SnipedItemsTable 
              items={items} 
              onRefresh={handleRefresh}
              onAddClick={() => setIsAddModalOpen(true)}
              onBulkImportClick={() => setIsBulkImportOpen(true)}
              onTransactionImportClick={() => setIsTransactionImportOpen(true)}
              onRemove={removeItem}
              isRefreshing={isRefreshing}
            />
          </div>
        )}

        {activeTab === 'watchlist' && <Watchlist />}
        {activeTab === 'settings' && <Settings />}
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addItem}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
      />

      <TransactionImportModal
        isOpen={isTransactionImportOpen}
        onClose={() => setIsTransactionImportOpen(false)}
        onImport={addItemFromTransaction}
        existingAssetIds={items.map(i => i.assetId)}
      />
    </main>
  );
}
