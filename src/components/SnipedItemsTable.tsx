import { ExternalLink, RefreshCw, Plus, Trash2, FileJson, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RobloxItem } from '@/hooks/useRobloxData';
import { robuxToGBP, formatGBP } from '@/lib/currency';

interface SnipedItemsTableProps {
  items: RobloxItem[];
  onRefresh: () => void;
  onAddClick: () => void;
  onBulkImportClick: () => void;
  onTransactionImportClick: () => void;
  onRemove: (itemId: string) => void;
  isRefreshing?: boolean;
}

export function SnipedItemsTable({ 
  items, 
  onRefresh, 
  onAddClick, 
  onBulkImportClick, 
  onTransactionImportClick,
  onRemove, 
  isRefreshing 
}: SnipedItemsTableProps) {
  const calculateProfit = (boughtFor: number, currentRap: number | null) => {
    if (currentRap === null) return { amount: -boughtFor, percentage: -100 };
    const profit = currentRap - boughtFor;
    const percentage = ((profit / boughtFor) * 100);
    return { amount: profit, percentage };
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="font-semibold text-foreground">Sniped Items</h3>
          <p className="text-xs text-muted-foreground">Your trading history</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onTransactionImportClick}>
            <History className="mr-2 h-4 w-4" />
            Import History
          </Button>
          <Button variant="outline" size="sm" onClick={onBulkImportClick}>
            <FileJson className="mr-2 h-4 w-4" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={onAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No items yet. Add your first snipe!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Item</th>
                <th className="p-4">Bought For</th>
                <th className="p-4">Current RAP</th>
                <th className="p-4">Profit/Loss</th>
                <th className="p-4">Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const profit = calculateProfit(item.boughtFor, item.currentRap);
                const isProfit = profit.amount > 0;
                const isLoading = item.isLoading || item.currentRap === null;

                return (
                  <tr key={item.id} className="border-b border-border/50 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.thumbnailUrl ? (
                          <img 
                            src={item.thumbnailUrl} 
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-secondary text-[10px] font-bold">
                            <span className="text-foreground">{item.name.split(' ')[0]?.substring(0, 6)}</span>
                            <span className="text-muted-foreground">{item.name.split(' ')[1]?.substring(0, 6)}</span>
                            <div className={cn(
                              "mt-1 h-1.5 w-1.5 rounded-full",
                              isLoading ? "bg-loss animate-pulse" : isProfit ? "bg-success" : "bg-loss"
                            )} />
                          </div>
                        )}
                        <div>
                          <a 
                            href={`https://www.roblox.com/catalog/${item.assetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {item.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <p className="text-xs text-muted-foreground">#{item.assetId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-foreground">
                      R$ {item.boughtFor.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-sm">
                      {item.isLoading ? (
                        <span className="text-muted-foreground">Loading...</span>
                      ) : item.currentRap !== null ? (
                        <span className="text-foreground">R$ {item.currentRap.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-lg",
                          isProfit ? "text-success" : "text-loss"
                        )}>
                          {isProfit ? '↗' : '↘'}
                        </span>
                        <div>
                          <p className={cn(
                            "font-mono text-sm font-medium",
                            isProfit ? "text-success" : "text-loss"
                          )}>
                            {isProfit ? '+' : ''}R$ {profit.amount.toLocaleString()}
                          </p>
                          <p className={cn(
                            "font-mono text-xs",
                            isProfit ? "text-success/80" : "text-loss/80"
                          )}>
                            {isProfit ? '+' : ''}{formatGBP(robuxToGBP(profit.amount))}
                          </p>
                          <p className={cn(
                            "text-xs",
                            isProfit ? "text-success/60" : "text-loss/60"
                          )}>
                            {profit.percentage > 0 ? '+' : ''}{profit.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {item.date}
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onRemove(item.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-loss"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
