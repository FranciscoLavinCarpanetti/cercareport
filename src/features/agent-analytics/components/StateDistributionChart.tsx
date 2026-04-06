import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AgentStateDistribution } from '../types';

const STATE_COLORS = [
  'hsl(36, 100%, 51%)',   // orange
  'hsl(195, 95%, 74%)',   // electric
  'hsl(142, 71%, 45%)',   // green
  'hsl(0, 84%, 60%)',     // red
  'hsl(262, 83%, 58%)',   // purple
  'hsl(200, 98%, 39%)',   // blue
  'hsl(45, 93%, 47%)',    // yellow
  'hsl(330, 81%, 60%)',   // pink
];

interface Props {
  data: AgentStateDistribution[];
  uniqueStates: string[];
}

export function StateDistributionChart({ data, uniqueStates }: Props) {
  const chartData = data.map(d => {
    const row: Record<string, unknown> = { agent: d.agentName };
    for (const state of uniqueStates) {
      row[state] = d.totalSeconds > 0 ? Math.round(((d.states[state] || 0) / d.totalSeconds) * 100) : 0;
    }
    return row;
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Distribución de Estados por Agente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: 'hsl(230,25%,65%)', fontSize: 11 }} />
              <YAxis type="category" dataKey="agent" width={100} tick={{ fill: 'hsl(0,0%,100%)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(236,36%,20%)', border: '1px solid hsl(236,30%,28%)', borderRadius: 8 }}
                labelStyle={{ color: 'white', fontWeight: 600 }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {uniqueStates.map((state, i) => (
                <Bar key={state} dataKey={state} stackId="a" fill={STATE_COLORS[i % STATE_COLORS.length]} radius={i === uniqueStates.length - 1 ? [0, 4, 4, 0] : undefined} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
