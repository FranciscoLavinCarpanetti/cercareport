import { motion } from "framer-motion";
import { DeltaIndicator } from "./DeltaIndicator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface SimKpiCardProps {
  label: string;
  currentValue: number;
  simulatedValue: number;
  unit?: string;
  delta?: number;
  deltaSuffix?: string;
  invertDelta?: boolean;
  tooltip?: string;
  index?: number;
}

export function SimKpiCard({ label, currentValue, simulatedValue, unit = '', delta, deltaSuffix = '%', invertDelta = false, tooltip, index = 0 }: SimKpiCardProps) {
  const fmt = (v: number) => new Intl.NumberFormat('es-ES', { useGrouping: true }).format(Math.round(v));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.3, bounce: 0, delay: index * 0.04 }}
      className="bg-card rounded-xl border border-border p-5 snap-transition duration-150 hover:border-orange/30"
    >
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[9px] text-muted-foreground uppercase tracking-[1.8px] font-semibold">{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3 h-3 text-muted-foreground/50 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[28px] font-extrabold leading-none tracking-[-1px] tabular-nums text-orange">
            {fmt(simulatedValue)}<span className="text-sm font-semibold text-muted-foreground ml-0.5">{unit}</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1.5">
            Actual: <span className="text-foreground/70 font-medium">{fmt(currentValue)}{unit}</span>
          </div>
        </div>
        {delta !== undefined && (
          <DeltaIndicator value={delta} suffix={deltaSuffix} invertColors={invertDelta} />
        )}
      </div>
    </motion.div>
  );
}
