import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { RobloxItem } from '@/hooks/useRobloxData';

interface ProfitChartProps {
  items: RobloxItem[];
}

export function ProfitChart({ items }: ProfitChartProps) {
  // Generate chart data from items
  const chartData = items.map((item, index) => {
    const profit = (item.currentRap || 0) - item.boughtFor;
    return {
      name: item.name.substring(0, 10),
      gain: profit > 0 ? profit : 0,
      loss: profit < 0 ? Math.abs(profit) : 0,
      index,
    };
  });

  // If no items, show placeholder data
  const displayData = chartData.length > 0 ? chartData : [
    { name: 'No data', gain: 0, loss: 0, index: 0 },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Profit Performance</h3>
            <p className="text-xs text-muted-foreground">Per-item profit chart</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Gain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-loss" />
            <span className="text-xs text-muted-foreground">Loss</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Add items to see profit performance
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} barCategoryGap="20%">
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
              />
              <Bar dataKey="gain" radius={[4, 4, 0, 0]}>
                {displayData.map((entry, index) => (
                  <Cell 
                    key={`cell-gain-${index}`} 
                    fill={entry.gain > 0 ? 'hsl(142 70% 45%)' : 'transparent'} 
                  />
                ))}
              </Bar>
              <Bar dataKey="loss" radius={[4, 4, 0, 0]}>
                {displayData.map((entry, index) => (
                  <Cell 
                    key={`cell-loss-${index}`} 
                    fill={entry.loss > 0 ? 'hsl(0 85% 55%)' : 'transparent'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
