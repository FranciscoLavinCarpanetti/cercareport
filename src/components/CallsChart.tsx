import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import type { CallRecord } from "@/lib/excel-parser";

interface ChartDataEntry {
  name: string;
  calls: number;
  country: string;
}

interface TooltipProps {
  payload: ChartDataEntry;
}

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.15 }}
      className="max-w-[840px] mx-auto mb-7 bg-navy rounded-[16px] border border-border overflow-hidden shadow-card"
    >
      <div className="bg-navy-deep px-6 py-3.5 border-b border-border flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-foreground/80">
          Llamadas por Agente
        </span>
        <div className="flex gap-4 text-[10px] text-gray-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-sm bg-orange" /> España
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-sm bg-electric" /> Portugal
          </span>
        </div>
      </div>
      <div className="px-6 py-5">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barCategoryGap="18%">
            <XAxis
              dataKey="name"
              tick={{ fill: '#7a88b8', fontSize: 10, fontFamily: 'Poppins' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#7a88b8', fontSize: 10, fontFamily: 'Poppins' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: '#202245',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '10px 14px',
                fontFamily: 'Poppins',
                fontSize: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#FF9903', fontWeight: 700, fontSize: 11 }}
              itemStyle={{ color: '#fff' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              formatter={(value: number, _name: string, props: TooltipProps) => [
                `${value.toLocaleString('es-ES')} llamadas · ${props.payload.country}`,
                ''
              ]}
            />
            <Bar dataKey="calls" radius={[5, 5, 0, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.country === 'España' ? '#FF9903' : '#7EDBFC'}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
