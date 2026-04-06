import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConcurrencyPoint } from '../types';

interface Props {
  data: ConcurrencyPoint[];
}

export function ConcurrencyChart({ data }: Props) {
  const peak = data.reduce((max, p) => (p.count > max.count ? p : max), data[0]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Curva de Concurrencia de Agentes
          </CardTitle>
          {peak && (
            <span className="text-xs font-bold text-accent">
              Pico: {peak.count} agentes @ {peak.timeLabel}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="concurrencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(195,95%,74%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(195,95%,74%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(236,30%,28%)" />
              <XAxis dataKey="timeLabel" tick={{ fill: 'hsl(230,25%,65%)', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: 'hsl(230,25%,65%)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(236,36%,20%)', border: '1px solid hsl(236,30%,28%)', borderRadius: 8 }}
                labelStyle={{ color: 'white', fontWeight: 600 }}
                formatter={(value: number) => [`${value} agentes`, 'Concurrencia']}
              />
              <Area type="monotone" dataKey="count" stroke="hsl(195,95%,74%)" fill="url(#concurrencyGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
