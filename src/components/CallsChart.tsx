import { useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { CallRecord } from "@/lib/excel-parser";

interface CallsChartProps {
  rows: CallRecord[];
}

export function CallsChart({ rows }: CallsChartProps) {
  const data = rows.map((r, i) => ({
    name: `A${i + 1}`,
    calls: r.calls,
    country: r.country,
  }));

  return (
    <div className="max-w-[840px] mx-auto mb-7 bg-navy rounded-[14px] border border-foreground/[0.07] overflow-hidden shadow-card">
      <div className="bg-gradient-to-r from-navy-deep to-navy px-6 py-3.5 border-b-2 border-orange/35 flex items-center justify-between">
        <span className="text-xs font-bold tracking-[1.5px] uppercase">📈 Llamadas por Agente</span>
      </div>
      <div className="px-6 py-5">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#7a88b8', fontSize: 10, fontFamily: 'Poppins' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#7a88b8', fontFamily: 'Poppins' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#2a2e5c',
                border: '1px solid #FF9903',
                borderRadius: 8,
                padding: '10px',
                fontFamily: 'Poppins',
                fontSize: 12,
              }}
              labelStyle={{ color: '#FF9903', fontWeight: 700 }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number, _name: string, props: any) => [
                `${value} llamadas · ${props.payload.country}`,
                ''
              ]}
            />
            <Bar dataKey="calls" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.country === 'España' ? '#FF9903' : '#7EDBFC'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-5 mt-3.5 text-[11px] text-gray-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-orange" /> España
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-electric" /> Portugal
          </span>
        </div>
      </div>
    </div>
  );
}
