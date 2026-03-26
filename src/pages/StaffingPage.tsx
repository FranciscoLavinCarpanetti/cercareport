import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, CheckCircle, MinusCircle, HelpCircle, Info } from "lucide-react";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { calculateStaffing, type StaffingInput } from "@/lib/workforce/staffing";
import { UploadZone } from "@/components/UploadZone";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function StaffingPage() {
  const { daily, monthly, activeMode, handleFile } = useWorkforce();
  const state = activeMode === 'daily' ? daily : monthly;
  const report = state.report;

  const defaults = useMemo(() => {
    if (!report) return { staff: 10, volume: 500, aht: 180 };
    return { staff: report.total.agents, volume: report.total.totalCalls, aht: report.total.attAvg };
  }, [report]);

  const [volume, setVolume] = useState(defaults.volume);
  const [aht, setAht] = useState(defaults.aht);
  const [slaTarget, setSlaTarget] = useState(80);
  const [timeTarget, setTimeTarget] = useState(30);
  const [occupancyTarget, setOccupancyTarget] = useState(85);
  const [shrinkage, setShrinkage] = useState(20);
  const [shiftHours, setShiftHours] = useState(8);

  const [lastDefaults, setLastDefaults] = useState(defaults);
  if (defaults !== lastDefaults) {
    setVolume(defaults.volume);
    setAht(defaults.aht);
    setLastDefaults(defaults);
  }

  const input: StaffingInput = { volume, aht, slaTarget, timeTarget, occupancyTarget, shrinkage, currentStaff: defaults.staff, shiftHours };
  const result = useMemo(() => calculateStaffing(input), [volume, aht, slaTarget, timeTarget, occupancyTarget, shrinkage, defaults.staff, shiftHours]);

  const fmt = (v: number) => new Intl.NumberFormat('es-ES', { useGrouping: true }).format(v);

  if (!report) {
    return (
      <>
        <ProcessingOverlay active={state.processing} />
        <UploadZone onFileSelected={(file) => handleFile(file, activeMode)} subtitle="Carga un Excel para calcular el dimensionamiento de staff" />
      </>
    );
  }

  const gapIcon = result.gapType === 'deficit'
    ? <AlertTriangle className="w-4 h-4 text-destructive" />
    : result.gapType === 'excess'
    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
    : <MinusCircle className="w-4 h-4 text-muted-foreground" />;

  const gapColor = result.gapType === 'deficit' ? 'text-destructive' : result.gapType === 'excess' ? 'text-emerald-400' : 'text-muted-foreground';
  const gapLabel = result.gapType === 'deficit' ? 'Déficit' : result.gapType === 'excess' ? 'Exceso' : 'Equilibrado';

  return (
    <div className="min-h-screen bg-background bg-dot-pattern p-6 lg:p-8">
      <ProcessingOverlay active={state.processing} />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-electric/15 flex items-center justify-center">
            <Users className="w-4 h-4 text-electric" />
          </div>
          <h1 className="text-2xl font-bold tracking-[-0.04em]">Dimensionamiento <span className="text-electric">Inverso</span></h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">Calcula el staff necesario basado en volumen diario, AHT y horas productivas por agente</p>
      </motion.div>

      {/* Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5">
          <span className="text-[9px] text-muted-foreground uppercase tracking-[1.8px] font-semibold">Staff Requerido</span>
          <div className="text-[36px] font-extrabold leading-none tracking-[-1px] tabular-nums text-electric mt-2">
            {fmt(result.staffRequired)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1.5">Actual: <span className="text-foreground/70 font-medium">{fmt(defaults.staff)}</span></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="bg-card rounded-xl border border-border p-5">
          <span className="text-[9px] text-muted-foreground uppercase tracking-[1.8px] font-semibold">Gap</span>
          <div className="flex items-center gap-2 mt-2">
            {gapIcon}
            <span className={`text-[28px] font-extrabold leading-none tracking-[-1px] tabular-nums ${gapColor}`}>
              {result.gapType === 'deficit' ? '-' : result.gapType === 'excess' ? '+' : ''}{fmt(result.gap)}
            </span>
          </div>
          <div className={`text-[10px] font-semibold mt-1.5 ${gapColor}`}>{gapLabel}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-card rounded-xl border border-border p-5">
          <span className="text-[9px] text-muted-foreground uppercase tracking-[1.8px] font-semibold">Ocupación Estimada</span>
          <div className="text-[36px] font-extrabold leading-none tracking-[-1px] tabular-nums text-orange mt-2">
            {result.occupancyEstimated}<span className="text-sm font-semibold text-muted-foreground ml-0.5">%</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1.5">Objetivo: {occupancyTarget}%</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted-foreground uppercase tracking-[1.8px] font-semibold">SLA Erlang C</span>
            <Tooltip>
              <TooltipTrigger asChild><HelpCircle className="w-3 h-3 text-muted-foreground/50 cursor-help" /></TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-xs">Nivel de servicio calculado con el modelo Erlang C (aproximación hora pico)</TooltipContent>
            </Tooltip>
          </div>
          <div className={`text-[36px] font-extrabold leading-none tracking-[-1px] tabular-nums mt-2 ${result.erlangSLA >= slaTarget ? 'text-emerald-400' : 'text-destructive'}`}>
            {result.erlangSLA}<span className="text-sm font-semibold text-muted-foreground ml-0.5">%</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1.5">Objetivo: {slaTarget}%</div>
        </motion.div>
      </div>

      {/* Calculation Breakdown */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="bg-card/60 rounded-xl border border-border/50 p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-electric" />
          <h3 className="text-xs font-bold tracking-[1.5px] uppercase text-muted-foreground">Desglose del Cálculo</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Carga operativa total</span>
            <span className="text-foreground font-semibold tabular-nums">{result.workloadHours} horas-agente</span>
            <span className="text-[9px] text-muted-foreground block">{fmt(volume)} llamadas × {aht}s ÷ 3600</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Horas productivas/agente</span>
            <span className="text-foreground font-semibold tabular-nums">{result.productiveHoursPerAgent}h</span>
            <span className="text-[9px] text-muted-foreground block">{shiftHours}h × {occupancyTarget}%</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Staff base</span>
            <span className="text-foreground font-semibold tabular-nums">{result.staffBase}</span>
            <span className="text-[9px] text-muted-foreground block">{result.workloadHours}h / {result.productiveHoursPerAgent}h</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Staff final (+shrinkage)</span>
            <span className="text-electric font-bold tabular-nums">{fmt(result.staffRequired)}</span>
            <span className="text-[9px] text-muted-foreground block">{result.staffBase} / (1 - {shrinkage}%)</span>
          </div>
        </div>
      </motion.div>

      {/* Inputs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xs font-bold tracking-[1.5px] uppercase text-muted-foreground mb-6">Parámetros de Dimensionamiento</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Volume */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[1.5px] font-semibold">Volumen Diario</label>
              <Input type="number" value={volume} onChange={(e) => setVolume(Math.max(0, parseInt(e.target.value) || 0))} className="w-24 h-7 text-xs text-center bg-navy-deep border-border tabular-nums" />
            </div>
            <Slider value={[volume]} min={0} max={Math.ceil(defaults.volume * 3) || 2000} step={1} onValueChange={([v]) => setVolume(v)} className="[&_[role=slider]]:bg-electric [&_[role=slider]]:border-electric [&_.relative>div]:bg-electric" />
          </div>

          {/* AHT */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[1.5px] font-semibold">AHT (seg)</label>
              <Input type="number" value={aht} onChange={(e) => setAht(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 h-7 text-xs text-center bg-navy-deep border-border tabular-nums" />
            </div>
            <Slider value={[aht]} min={1} max={Math.ceil(defaults.aht * 3) || 600} step={1} onValueChange={([v]) => setAht(v)} className="[&_[role=slider]]:bg-orange [&_[role=slider]]:border-orange [&_.relative>div]:bg-orange" />
          </div>

          {/* Shift Hours */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[1.5px] font-semibold">Horas de Turno</label>
              <Input type="number" value={shiftHours} onChange={(e) => setShiftHours(Math.min(24, Math.max(1, parseInt(e.target.value) || 1)))} className="w-20 h-7 text-xs text-center bg-navy-deep border-border tabular-nums" />
            </div>
            <Slider value={[shiftHours]} min={1} max={24} step={0.5} onValueChange={([v]) => setShiftHours(v)} className="[&_[role=slider]]:bg-electric [&_[role=slider]]:border-electric [&_.relative>div]:bg-electric" />
          </div>

          {/* SLA Target */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[1.5px] font-semibold">SLA Objetivo (%)</label>
              <Input type="number" value={slaTarget} onChange={(e) => setSlaTarget(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} className="w-20 h-7 text-xs text-center bg-navy-deep border-border tabular-nums" />
            </div>
            <Slider value={[slaTarget]} min={50} max={100} step={1} onValueChange={([v]) => setSlaTarget(v)} className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500 [&_.relative>div]:bg-emerald-500" />
          </div>

          {/* Time Target */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[1.5px] font-semibold">Tiempo Objetivo (seg)</label>
              <Input type="number" value={timeTarget} onChange={(e) => setTimeTarget(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 h-7 text-xs text-center bg-navy-deep border-border tabular-nums" />
            </div>
            <Slider value={[timeTarget]} min={5} max={120} step={1} onValueChange={([v]) => setTimeTarget(v)} />
          </div>

          {/* Occupancy Target */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[1.5px] font-semibold">Ocupación Objetivo (%)</label>
              <Input type="number" value={occupancyTarget} onChange={(e) => setOccupancyTarget(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} className="w-20 h-7 text-xs text-center bg-navy-deep border-border tabular-nums" />
            </div>
            <Slider value={[occupancyTarget]} min={50} max={100} step={1} onValueChange={([v]) => setOccupancyTarget(v)} className="[&_[role=slider]]:bg-orange [&_[role=slider]]:border-orange [&_.relative>div]:bg-orange" />
          </div>

          {/* Shrinkage */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[1.5px] font-semibold">Shrinkage (%)</label>
              <Input type="number" value={shrinkage} onChange={(e) => setShrinkage(Math.min(80, Math.max(0, parseInt(e.target.value) || 0)))} className="w-20 h-7 text-xs text-center bg-navy-deep border-border tabular-nums" />
            </div>
            <Slider value={[shrinkage]} min={0} max={50} step={1} onValueChange={([v]) => setShrinkage(v)} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
