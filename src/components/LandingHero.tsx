import { Check, Target, TrendingUp, Shield, Zap, Eye, Bot, Cpu, Globe, Clock, Activity, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/FeatureCard';

interface LandingHeroProps {
  onLoginClick: () => void;
}

const features = [
  "Real-time Rolimon's undervalue scanner",
  "Instant 0-delay purchase execution",
  "AI-powered deal scoring system",
  "Auto-predict rising limiteds using market trends",
  "Global item feed with millisecond refresh rate",
  "Auto-detect hidden/sleeper deals before public APIs update",
  "Check seller reliability to avoid compromised accounts",
  "Smart undercut detection for instant profit flip",
  "Marketplace crash-protection mode",
  "Multi-threaded scanning engine",
  "Dynamic snipe profiles (Safe / Balanced / Aggressive)",
  "Built-in limited value estimator",
  "Auto-proxy rotation for anti-flag safety",
  "Human-like behavior mode to avoid detection",
  "Custom Discord embeds with full snipe analytics",
  "Offline mode that still logs snipes and updates when online",
  "Real-time inventory value tracking",
  "Multi-platform alerting (Telegram, Discord, Email)",
  "Auto-resell profitable snipes for instant ROI",
  "Priority queue system for handling multiple snipe events",
  "Full activity timeline + history replay",
  "Intelligent cooldown manager",
  "Support for private seller snipe feeds",
  "Global leaderboard integration (optional)",
  "Session corruption auto-repair",
  "Hidden test mode for safe trial snipes without spending Robux",
];

export function LandingHero({ onLoginClick }: LandingHeroProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-12">
      <div className="flex flex-col items-center text-center">
        <div className="mb-8 flex h-24 w-24 animate-float items-center justify-center rounded-2xl bg-primary shadow-[0_0_40px_hsl(var(--primary)/0.4),0_0_80px_hsl(var(--primary)/0.2)]">
          <Check className="h-14 w-14 text-primary-foreground" />
        </div>

        <h1 className="mb-4 text-5xl font-extrabold italic tracking-tight bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent sm:text-6xl md:text-7xl">
          VERIZON
        </h1>

        <h2 className="mb-4 text-lg font-medium tracking-widest text-muted-foreground">
          Roblox Limited Sniper
        </h2>

        <p className="mb-8 max-w-md text-sm text-muted-foreground">
          Track your snipes, analyze profits, and dominate the limited market with precision analytics
        </p>

        <div className="flex items-center gap-4 mb-8">
          <Button 
            size="lg" 
            onClick={onLoginClick}
            className="h-14 px-10 text-base bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3),0_0_40px_hsl(var(--primary)/0.15)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.4),0_0_80px_hsl(var(--primary)/0.2)] font-semibold transition-all duration-300"
          >
            <Check className="h-5 w-5" />
            Connect Your Account
          </Button>

          <a
            href="https://discord.gg/6WJqJjx6y7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center gap-2 rounded-lg border-2 border-[#5865F2] bg-[#5865F2]/10 px-6 text-base font-semibold text-[#5865F2] transition-all hover:bg-[#5865F2]/20 hover:shadow-[0_0_20px_rgba(88,101,242,0.3)]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join Discord
          </a>
        </div>
      </div>

      <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        <FeatureCard
          icon={<Target className="h-6 w-6" />}
          title="Precision Sniping"
          description="Lightning-fast item detection"
        />
        <FeatureCard
          icon={<TrendingUp className="h-6 w-6" />}
          title="Profit Tracking"
          description="Real-time portfolio analytics"
        />
        <FeatureCard
          icon={<Shield className="h-6 w-6" />}
          title="Secure"
          description="Local encryption for your data"
        />
      </div>

      {/* Feature List */}
      <div className="mt-20 w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            <span className="text-primary">26+</span> Powerful Features
          </h3>
          <p className="text-muted-foreground text-sm">Everything you need to dominate the limited market</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:bg-card"
            >
              <span className="text-success font-bold">(+)</span>
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
