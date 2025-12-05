import { useState } from 'react';
import { X, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [cookie, setCookie] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cookie.trim()) {
      toast({
        title: "Error",
        description: "Please enter your .ROBLOSECURITY cookie",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await login(cookie.trim());
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "Successfully connected your Roblox account!",
      });
      onClose();
      setCookie('');
    } else {
      toast({
        title: "Authentication Failed",
        description: result.error || "Invalid cookie. Please try again.",
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
          <h2 className="text-xl font-bold text-foreground">Connect Your Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your .ROBLOSECURITY cookie to authenticate
          </p>
        </div>

        <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-xs text-foreground/80">
            Your cookie is stored locally and encrypted. Never share your cookie with anyone else.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              .ROBLOSECURITY Cookie
            </label>
            <Textarea
              value={cookie}
              onChange={(e) => setCookie(e.target.value)}
              placeholder="_|WARNING:-DO-NOT-SHARE-THIS..."
              className="h-32 resize-none font-mono text-xs"
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
                Validating...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Connect Account
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Need help finding your cookie?{' '}
          <a href="#" className="text-primary hover:underline">
            View tutorial
          </a>
        </p>
      </div>
    </div>
  );
}
