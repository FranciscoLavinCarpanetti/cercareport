import type { Report } from "@/lib/excel-parser";
import { formatDate } from "@/lib/excel-parser";
import { KpiCard } from "./KpiCard";
import { motion } from "framer-motion";

interface ReportBlockProps {
  report: Report;
}

function SectionBar({ children, variant = "orange" }: { children: React.ReactNode; variant?: "orange" | "electric" }) {
  return (
    <div className={`px-8 py-2 text-[11px] font-bold tracking-[2px] uppercase flex items-center justify-center ${
      variant === "electric"
        ? "bg-electric text-navy-deep"
        : "bg-orange text-navy-deep"
    }`}>
      {children}
    </div>
  );
}

export function ReportBlock({ report }: ReportBlockProps) {
  const { esp, pt, total, reportDate } = report;
  const dateStr = formatDate(reportDate);

  return (
    <motion.div
      id="report-block"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0 }}
      className="bg-navy rounded-[16px] overflow-hidden border border-border shadow-card max-w-[840px] mx-auto mb-6"
    >
      {/* Report Header */}
      <div className="relative px-8 py-6 text-center bg-navy-deep">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-orange to-transparent" />
        <h1 className="text-xl font-bold tracking-[2px] uppercase leading-[1.1]">
          Cierre DIA España & Portugal
        </h1>
        <div className="text-[10px] text-orange tracking-[1.5px] uppercase mt-2 font-semibold">
          Indicadores Clave de Rendimiento · {dateStr}
        </div>
      </div>

      {/* España */}
      <SectionBar variant="orange">
        Cerca España
      </SectionBar>
      <div className="grid grid-cols-4 border-b border-foreground/[0.06]">
        <KpiCard label="Total Llamadas" value={esp.totalCalls} variant="orange" index={0} />
        <KpiCard label="Agentes" value={esp.agents} variant="white" index={1} />
        <KpiCard label="ATT Promedio" value={esp.attAvg} unit="s" variant="white" index={2} />
        <KpiCard label="WT Promedio" value={esp.wtAvg} unit="s" variant="white" index={3} />
      </div>

      {/* Portugal */}
      <SectionBar variant="electric">
        Cerca Portugal
      </SectionBar>
      <div className="grid grid-cols-4 border-b border-foreground/[0.06]">
        <KpiCard label="Total Llamadas" value={pt.totalCalls} variant="orange" index={0} />
        <KpiCard label="Agentes" value={pt.agents} variant="white" index={1} />
        <KpiCard label="ATT Promedio" value={pt.attAvg} unit="s" variant="white" index={2} />
        <KpiCard label="WT Promedio" value={pt.wtAvg} unit="s" variant="white" index={3} />
      </div>

      {/* Analysis */}
      <div className="px-8 py-4 border-t border-foreground/[0.06] text-[11px] text-gray-400">
        <div className="text-orange font-bold text-[10px] tracking-[1.5px] uppercase mb-2.5">
          Análisis y Observaciones
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-normal">
            <span className="w-1 h-1 rounded-full bg-orange shrink-0" />
            Tiempos medio de conversación (ATT)
          </div>
          <div className="flex items-center gap-2 font-normal">
            <span className="w-1 h-1 rounded-full bg-orange shrink-0" />
            Tiempos medio de espera (WT)
          </div>
        </div>
      </div>

      {/* Total Consolidado */}
      <div className="bg-navy-deep border-t border-foreground/[0.06]">
        <div className="px-8 py-4 text-center border-b border-orange/20">
          <h2 className="text-[15px] font-bold tracking-[2px] uppercase text-foreground/80">
            Cierre Total DIA España & Portugal
          </h2>
        </div>
        <div className="bg-orange/10 px-8 py-2 text-[11px] font-bold tracking-[2px] uppercase text-orange flex items-center justify-center border-y border-orange/10">
          Cerca — Consolidado
        </div>
        <div className="grid grid-cols-4">
          <KpiCard label="Total Llamadas" value={total.totalCalls} variant="orange" index={0} />
          <KpiCard label="Agentes" value={total.agents} variant="white" index={1} />
          <KpiCard label="ATT Promedio" value={total.attAvg} unit="s" variant="white" index={2} />
          <KpiCard label="WT Promedio" value={total.wtAvg} unit="s" variant="white" index={3} />
        </div>
      </div>
    </motion.div>
  );
}
