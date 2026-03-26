import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend } from "recharts";
import type { IntervalResult } from "@/lib/workforce/staffing";

interface Props {
  intervals: IntervalResult[];
}

export function StaffingChart({ intervals }: Props) {
  const data = intervals.map(i => ({
    hour: i.hour,
    calls: i.calls,
    staff: i.staffRequired,
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-xs font-bold tracking-[1.5px] uppercase text-muted-foreground mb-4">Volumen vs Staff Requerido</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(236 30% 28% / 0.5)" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(230 25% 65%)' }} interval={1} />
            <YAxis yAxisId="calls" orientation="left" tick={{ fontSize: 10, fill: 'hsl(230 25% 65%)' }} />
            <YAxis yAxisId="staff" orientation="right" tick={{ fontSize: 10, fill: 'hsl(195 95% 74%)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(236 36% 20%)',
                border: '1px solid hsl(236 30% 28%)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'white',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar yAxisId="calls" dataKey="calls" name="Llamadas" fill="hsl(36 100% 51% / 0.6)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="staff" dataKey="staff" name="Staff" type="monotone" stroke="hsl(195 95% 74%)" strokeWidth={2.5} dot={{ fill: 'hsl(195 95% 74%)', r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
