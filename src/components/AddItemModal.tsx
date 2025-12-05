import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (assetId: number, boughtFor: number) => Promise<{ success: boolean; error?: string }>;
}

export function AddItemModal({ isOpen, onClose, onAdd }: AddItemModalProps) {
  const [assetId, setAssetId] = useState('');
  const [boughtFor, setBoughtFor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const assetIdNum = parseInt(assetId);
    const boughtForNum = parseInt(boughtFor);
    
    if (isNaN(assetIdNum) || assetIdNum <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid Asset ID",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(boughtForNum) || boughtForNum < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid purchase price",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await onAdd(assetIdNum, boughtForNum);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "Item added to your snipes!",
      });
      setAssetId('');
      setBoughtFor('');
      onClose();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Add Sniped Item</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track a new item you've sniped
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Asset ID
            </label>
            <Input
              type="number"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              placeholder="e.g., 48545806"
              className="font-mono"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Find this in the item's URL on Roblox
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Purchase Price (R$)
            </label>
            <Input
              type="number"
              value={boughtFor}
              onChange={(e) => setBoughtFor(e.target.value)}
              placeholder="e.g., 8500"
              className="font-mono"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] font-semibold" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Item
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
