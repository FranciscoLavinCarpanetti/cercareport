import type { Report } from "@/lib/excel-parser";
import { formatDate } from "@/lib/excel-parser";
import { KpiCard } from "./KpiCard";
import { motion } from "framer-motion";

interface ReportBlockProps {
  report: Report;
  mode?: 'daily' | 'monthly';
}

function SectionBar({ children, variant = "orange" }: { children: React.ReactNode; variant?: "orange" | "electric" }) {
  return (
    <div className={`px-8 py-2.5 text-[11px] font-bold tracking-[2px] uppercase flex items-center gap-2 ${
      variant === "electric"
        ? "bg-electric/90 text-navy-deep"
        : "bg-orange text-navy-deep"
    }`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {children}
    </div>
  );
}

export function ReportBlock({ report, mode = 'daily' }: ReportBlockProps) {
  const { esp, pt, total, reportDate, startDate, endDate, uniqueDays } = report;
  const isMonthly = mode === 'monthly';
  const dateStr = isMonthly
    ? `${formatDate(startDate)} — ${formatDate(endDate)}`
    : formatDate(reportDate);
  const title = isMonthly ? 'Cierre Mensual España & Portugal' : 'Cierre DIA España & Portugal';
  const totalTitle = isMonthly ? 'Cierre Total Mensual España & Portugal' : 'Cierre Total DIA España & Portugal';

  return (
    <motion.div
      id="report-block"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0 }}
      className="bg-card rounded-2xl overflow-hidden border border-border shadow-card max-w-[840px] mx-auto mb-6"
    >
      {/* Report Header */}
      <div className="relative px-8 py-6 text-center bg-navy-deep">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-orange to-transparent" />
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-orange flex items-center justify-center">
            <span className="text-accent-foreground font-extrabold text-[14px] leading-none">T</span>
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-[2px] uppercase leading-[1.1]">
          {title}
        </h1>
        <div className="text-[10px] text-orange tracking-[1.5px] uppercase mt-2 font-semibold">
          Indicadores Clave de Rendimiento · {dateStr}
        </div>
        {isMonthly && (
          <div className="text-[10px] text-electric tracking-[1px] mt-1 font-medium">
            {uniqueDays} días evaluados
          </div>
        )}
      </div>

      {/* España */}
      <SectionBar variant="orange">
        Cerca España
      </SectionBar>
      <div className="grid grid-cols-4 border-b border-border">
        <KpiCard label="Total Llamadas" value={esp.totalCalls} variant="orange" index={0} />
        <KpiCard label="Agentes" value={esp.agents} variant="orange" index={1} />
        <KpiCard label="ATT Promedio" value={esp.attAvg} unit="s" variant="white" index={2} />
        <KpiCard label="WT Promedio" value={esp.wtAvg} unit="s" variant="white" index={3} />
      </div>

      {/* Portugal */}
      <SectionBar variant="electric">
        Cerca Portugal
      </SectionBar>
      <div className="grid grid-cols-4 border-b border-border">
        <KpiCard label="Total Llamadas" value={pt.totalCalls} variant="orange" index={0} />
        <KpiCard label="Agentes" value={pt.agents} variant="orange" index={1} />
        <KpiCard label="ATT Promedio" value={pt.attAvg} unit="s" variant="white" index={2} />
        <KpiCard label="WT Promedio" value={pt.wtAvg} unit="s" variant="white" index={3} />
      </div>

      {/* Analysis */}
      <div className="px-8 py-4 border-t border-border text-[11px] text-muted-foreground">
        <div className="text-orange font-bold text-[10px] tracking-[1.5px] uppercase mb-2.5">
          Análisis y Observaciones
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
            Tiempos medio de conversación (ATT)
          </div>
          <div className="flex items-center gap-2 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
            Tiempos medio de espera (WT)
          </div>
        </div>
      </div>

      {/* Total Consolidado */}
      <div className="bg-navy-deep border-t border-border">
        <div className="px-8 py-4 text-center border-b border-orange/20">
          <h2 className="text-[15px] font-bold tracking-[2px] uppercase text-foreground/80">
            {totalTitle}
          </h2>
        </div>
        <div className="bg-orange/10 px-8 py-2.5 text-[11px] font-bold tracking-[2px] uppercase text-orange flex items-center gap-2 justify-center border-y border-orange/10">
          <span className="w-1.5 h-1.5 rounded-full bg-orange opacity-60" />
          Cerca — Consolidado
        </div>
        <div className="grid grid-cols-4">
          <KpiCard label="Total Llamadas" value={total.totalCalls} variant="orange" index={0} />
          <KpiCard label="Agentes" value={total.agents} variant="orange" index={1} />
          <KpiCard label="ATT Promedio" value={total.attAvg} unit="s" variant="white" index={2} />
          <KpiCard label="WT Promedio" value={total.wtAvg} unit="s" variant="white" index={3} />
        </div>
      </div>
    </motion.div>
  );
}
