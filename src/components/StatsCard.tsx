import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subValue?: string;
  variant?: 'default' | 'success' | 'loss';
}

export function StatsCard({ icon, label, value, subValue, variant = 'default' }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          variant === 'success' && "bg-success/20 text-success",
          variant === 'loss' && "bg-loss/20 text-loss",
          variant === 'default' && "bg-primary/20 text-primary"
        )}>
          {icon}
        </div>
      </div>
      <p className={cn(
        "mt-2 text-2xl font-bold font-mono",
        variant === 'success' && "text-success",
        variant === 'loss' && "text-loss",
        variant === 'default' && "text-foreground"
      )}>
        {value}
      </p>
      {subValue && (
        <p className={cn(
          "text-xs",
          variant === 'success' && "text-success/80",
          variant === 'loss' && "text-loss/80",
          variant === 'default' && "text-muted-foreground"
        )}>
          {subValue}
        </p>
      )}
    </div>
  );
}
