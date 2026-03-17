import type { Report } from "@/lib/excel-parser";
import { formatDate } from "@/lib/excel-parser";
import { KpiCard } from "./KpiCard";

interface ReportBlockProps {
  report: Report;
}

export function ReportBlock({ report }: ReportBlockProps) {
  const { esp, pt, total, reportDate } = report;
  const dateStr = formatDate(reportDate);

  return (
    <div id="report-block" className="bg-navy rounded-[14px] overflow-hidden border border-foreground/[0.07] shadow-card max-w-[840px] mx-auto mb-6">
      {/* Report Header */}
      <div className="relative bg-gradient-to-r from-navy-deep via-navy to-navy-deep px-8 py-5 border-b-[3px] border-orange text-center overflow-hidden">
        <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-orange-bright to-transparent" />
        <h1 className="text-[22px] font-extrabold tracking-[2.5px] uppercase leading-[1.1]">
          Cierre DIA España &amp; Portugal
        </h1>
        <div className="text-[10px] text-orange tracking-[2px] uppercase mt-1.5 font-semibold opacity-85">
          Indicadores Clave de Rendimiento · {dateStr}
        </div>
      </div>

      {/* España */}
      <div className="gradient-orange-bar px-8 py-1.5 text-[11px] font-extrabold tracking-[2.5px] uppercase text-navy-deep flex items-center gap-2">
        <span className="text-sm">🇪🇸</span> Cerca España
      </div>
      <div className="grid grid-cols-4 border-b border-foreground/[0.06]">
        <KpiCard label="Total Llamadas" value={esp.totalCalls} variant="orange" index={0} />
        <KpiCard label="Agentes" value={esp.agents} variant="white" index={1} />
        <KpiCard label="ATT Promedio" value={esp.attAvg} unit="s" variant="white" index={2} />
        <KpiCard label="WT Promedio" value={esp.wtAvg} unit="s" variant="white" index={3} />
      </div>

      {/* Portugal */}
      <div className="gradient-electric-bar px-8 py-1.5 text-[11px] font-extrabold tracking-[2.5px] uppercase text-navy-deep flex items-center gap-2">
        <span className="text-sm">🇵🇹</span> Cerca Portugal
      </div>
      <div className="grid grid-cols-4 border-b border-foreground/[0.06]">
        <KpiCard label="Total Llamadas" value={pt.totalCalls} variant="electric" index={0} />
        <KpiCard label="Agentes" value={pt.agents} variant="white" index={1} />
        <KpiCard label="ATT Promedio" value={pt.attAvg} unit="s" variant="white" index={2} />
        <KpiCard label="WT Promedio" value={pt.wtAvg} unit="s" variant="white" index={3} />
      </div>

      {/* Analysis */}
      <div className="px-8 py-3.5 border-t border-foreground/[0.06] text-[11px] text-gray-400">
        <strong className="text-orange font-bold text-[10px] tracking-[1.5px] uppercase block mb-2">
          Análisis y Observaciones
        </strong>
        <div className="flex items-center gap-1.5 mt-1 font-normal">
          <span className="text-orange text-[10px] shrink-0">▸</span>
          Tiempos medio de conversación (ATT)
        </div>
        <div className="flex items-center gap-1.5 mt-1 font-normal">
          <span className="text-orange text-[10px] shrink-0">▸</span>
          Tiempos medio de espera (WT)
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-br from-navy-deep to-[#1c1f45] border-t border-foreground/[0.06]">
        <div className="px-8 py-4 text-center border-b-2 border-orange/40">
          <h2 className="text-[17px] font-extrabold tracking-[2.5px] uppercase opacity-90">
            Cierre Total DIA España &amp; Portugal
          </h2>
        </div>
        <div className="bg-gradient-to-r from-orange/25 to-orange/[0.08] px-8 py-1.5 text-[11px] font-extrabold tracking-[2.5px] uppercase text-orange flex items-center gap-2 border-t border-orange/15">
          <span className="text-sm">🌍</span> Cerca — Consolidado
        </div>
        <div className="grid grid-cols-4">
          <KpiCard label="Total Llamadas" value={total.totalCalls} variant="orange" index={0} />
          <KpiCard label="Agentes" value={total.agents} variant="white" index={1} />
          <KpiCard label="ATT Promedio" value={total.attAvg} unit="s" variant="white" index={2} />
          <KpiCard label="WT Promedio" value={total.wtAvg} unit="s" variant="white" index={3} />
        </div>
      </div>
    </div>
  );
}
