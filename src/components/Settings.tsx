import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Percent, DollarSign, RefreshCw, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SniperSettings {
  minProfitPercent: number;
  maxRobuxSpend: number;
  autoRefreshInterval: number;
  enableNotifications: boolean;
  snipeMode: 'safe' | 'balanced' | 'aggressive';
}

const defaultSettings: SniperSettings = {
  minProfitPercent: 10,
  maxRobuxSpend: 10000,
  autoRefreshInterval: 30,
  enableNotifications: true,
  snipeMode: 'balanced',
};

export function Settings() {
  const [settings, setSettings] = useState<SniperSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sniper_settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const updateSetting = <K extends keyof SniperSettings>(key: K, value: SniperSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('sniper_settings', JSON.stringify(settings));
    setHasChanges(false);
    toast.success('Settings saved');
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-primary" />
            Sniper Settings
          </h3>
          <p className="text-xs text-muted-foreground">Configure your sniper preferences</p>
        </div>
        <Button onClick={saveSettings} disabled={!hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Minimum Profit % */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Percent className="h-4 w-4 text-primary" />
            Minimum Profit Percentage
          </label>
          <p className="text-xs text-muted-foreground">
            Only snipe items with at least this profit margin
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={settings.minProfitPercent}
              onChange={(e) => updateSetting('minProfitPercent', parseInt(e.target.value) || 0)}
              className="w-24"
            />
            <span className="text-muted-foreground">%</span>
          </div>
        </div>

        {/* Maximum Robux Spend */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <DollarSign className="h-4 w-4 text-primary" />
            Maximum Robux Spend
          </label>
          <p className="text-xs text-muted-foreground">
            Maximum amount to spend on a single item
          </p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">R$</span>
            <Input
              type="number"
              value={settings.maxRobuxSpend}
              onChange={(e) => updateSetting('maxRobuxSpend', parseInt(e.target.value) || 0)}
              className="w-32"
            />
          </div>
        </div>

        {/* Auto Refresh Interval */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <RefreshCw className="h-4 w-4 text-primary" />
            Auto Refresh Interval
          </label>
          <p className="text-xs text-muted-foreground">
            How often to refresh item prices (in seconds)
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={settings.autoRefreshInterval}
              onChange={(e) => updateSetting('autoRefreshInterval', parseInt(e.target.value) || 30)}
              className="w-24"
            />
            <span className="text-muted-foreground">seconds</span>
          </div>
        </div>

        {/* Snipe Mode */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Shield className="h-4 w-4 text-primary" />
            Snipe Profile
          </label>
          <p className="text-xs text-muted-foreground">
            Choose your risk tolerance level
          </p>
          <div className="flex gap-2">
            {(['safe', 'balanced', 'aggressive'] as const).map((mode) => (
              <Button
                key={mode}
                variant={settings.snipeMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSetting('snipeMode', mode)}
                className={settings.snipeMode === mode ? 'bg-primary text-primary-foreground' : ''}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {settings.snipeMode === 'safe' && 'Lower risk, higher profit margins required'}
            {settings.snipeMode === 'balanced' && 'Moderate risk and profit balance'}
            {settings.snipeMode === 'aggressive' && 'Higher risk, lower profit margins accepted'}
          </p>
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </label>
          <div className="flex items-center gap-3">
            <Button
              variant={settings.enableNotifications ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSetting('enableNotifications', !settings.enableNotifications)}
              className={settings.enableNotifications ? 'bg-success text-success-foreground hover:bg-success/90' : ''}
            >
              {settings.enableNotifications ? 'Enabled' : 'Disabled'}
            </Button>
            <span className="text-xs text-muted-foreground">
              Get notified when items hit your target prices
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
