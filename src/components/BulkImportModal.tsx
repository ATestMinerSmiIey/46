import { useState } from 'react';
import { X, Upload, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: { assetId: number; boughtFor: number }[]) => Promise<void>;
}

const placeholderText = `[
  { "assetId": 33872839, "boughtFor": 100 },
  { "assetId": 12345678, "boughtFor": 500 }
]`;

export function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please enter JSON data');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      
      if (!Array.isArray(parsed)) {
        toast.error('JSON must be an array');
        return;
      }

      const validItems = parsed.filter(
        (item: any) => 
          typeof item.assetId === 'number' && 
          typeof item.boughtFor === 'number'
      );

      if (validItems.length === 0) {
        toast.error('No valid items found. Each item needs assetId and boughtFor');
        return;
      }

      setIsImporting(true);
      await onImport(validItems);
      toast.success(`Imported ${validItems.length} items`);
      onClose();
      setJsonInput('');
    } catch (e) {
      toast.error('Invalid JSON format');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <FileJson className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Bulk Import</h2>
              <p className="text-xs text-muted-foreground">Import multiple items via JSON</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setShowPlaceholder(false);
              }}
              onFocus={() => setShowPlaceholder(false)}
              onBlur={() => setShowPlaceholder(jsonInput === '')}
              placeholder=""
              className="min-h-[200px] font-mono text-sm bg-secondary border-border"
            />
            {showPlaceholder && !jsonInput && (
              <pre className="absolute top-3 left-3 text-xs text-muted-foreground pointer-events-none font-mono">
                {placeholderText}
              </pre>
            )}
          </div>

          <div className="rounded-lg border border-border bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Format:</strong> Array of objects with <code className="text-primary">assetId</code> (number) and <code className="text-primary">boughtFor</code> (number in Robux)
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting}>
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import Items'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
