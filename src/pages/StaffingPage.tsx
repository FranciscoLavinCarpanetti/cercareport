import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Clock, BarChart3, AlertTriangle, Upload, RotateCcw, Plus, Minus } from "lucide-react";
import { useWorkforce } from "@/contexts/WorkforceContext";
import {
  calculateIntervalStaffing,
  generateDefaultIntervals,
  type IntervalData,
  type StaffingParams,
} from "@/lib/workforce/staffing";
import { UploadZone } from "@/components/UploadZone";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IntervalTable } from "@/components/staffing/IntervalTable";
import { StaffingChart } from "@/components/staffing/StaffingChart";
import { toast } from "sonner";
import * as XLSX from "xlsx";

function parseStaffingExcel(buffer: ArrayBuffer): IntervalData[] | null {
  try {
    const wb = XLSX.read(new Uint8Array(buffer), { type: "array", raw: false, cellText: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" }) as string[][];

    const intervals: IntervalData[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 2) continue;
      const hourRaw = String(row[0]).trim();
      const callsRaw = parseInt(String(row[1]).replace(/[^\d]/g, ""), 10) || 0;
      // Accept HH:mm or just HH
      const hourMatch = hourRaw.match(/^(\d{1,2}):?(\d{2})?$/);
      if (!hourMatch) continue;
      const h = hourMatch[1].padStart(2, "0");
      const m = hourMatch[2] || "00";
      intervals.push({ hour: `${h}:${m}`, calls: callsRaw });
    }
    return intervals.length > 0 ? intervals : null;
  } catch {
    return null;
  }
}

export default function StaffingPage() {
  const { daily, monthly, activeMode, handleFile, resetReport } = useWorkforce();
  const state = activeMode === "daily" ? daily : monthly;
  const report = state.report;

  // Interval data source
  const [intervals, setIntervals] = useState<IntervalData[] | null>(null);
  const [useManual, setUseManual] = useState(false);
  const [staffingFileLoaded, setStaffingFileLoaded] = useState(false);

  // Params
  const [aht, setAht] = useState(report?.total.attAvg || 180);
  const [slaTarget, setSlaTarget] = useState(80);
  const [timeTarget, setTimeTarget] = useState(30);
  const [shrinkage, setShrinkage] = useState(20);

  // Sync AHT from report
  const [lastReport, setLastReport] = useState(report);
  if (report !== lastReport) {
    if (report) setAht(report.total.attAvg || 180);
    setLastReport(report);
  }

  const activeIntervals = useMemo(() => {
    if (intervals) return intervals;
    if (report && !useManual) {
      // Generate default distribution from daily volume
      return generateDefaultIntervals(report.total.totalCalls, 8, 20);
    }
    return null;
  }, [intervals, report, useManual]);

  const params: StaffingParams = { aht, slaTarget, timeTarget, shrinkage, intervalMinutes: 60 };
  const result = useMemo(
    () => (activeIntervals ? calculateIntervalStaffing(activeIntervals, params) : null),
    [activeIntervals, aht, slaTarget, timeTarget, shrinkage]
  );

  const handleStaffingFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseStaffingExcel(e.target!.result as ArrayBuffer);
      if (parsed) {
        setIntervals(parsed);
        setStaffingFileLoaded(true);
        setUseManual(false);
        toast.success(`${parsed.length} intervalos cargados`);
      } else {
        toast.error("No se encontraron datos horarios. Formato esperado: Hora | Llamadas");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleManualEdit = useCallback((index: number, calls: number) => {
    setIntervals((prev) => {
      const arr = prev ? [...prev] : generateDefaultIntervals(0, 0, 24);
      arr[index] = { ...arr[index], calls: Math.max(0, calls) };
      return arr;
    });
  }, []);

  const handleGenerateManual = useCallback(() => {
    const vol = report?.total.totalCalls || 500;
    setIntervals(generateDefaultIntervals(vol, 8, 20));
    setUseManual(true);
    setStaffingFileLoaded(false);
  }, [report]);

  const handleReset = useCallback(() => {
    setIntervals(null);
    setUseManual(false);
    setStaffingFileLoaded(false);
  }, []);

  const fmt = (v: number) => new Intl.NumberFormat("es-ES").format(v);

  // Show base upload if no report
  if (!report) {
    return (
      <>
        <ProcessingOverlay active={state.processing} />
        <UploadZone onFileSelected={(file) => handleFile(file, activeMode)} subtitle="Carga un Excel para calcular el dimensionamiento de staff" />
      </>
    );
  }

  // No interval data yet
  if (!activeIntervals) {
    return (
      <div className="min-h-screen bg-background bg-dot-pattern p-6 lg:p-8">
        <Header onNuevo={() => resetReport(activeMode)} />
        <div className="max-w-2xl mx-auto mt-12 space-y-6">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-orange mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Distribución horaria requerida</h2>
            <p className="text-sm text-muted-foreground mb-6">
              El dimensionamiento por Erlang C requiere datos de volumen por intervalo horario. Elige una opción:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <label className="cursor-pointer">
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleStaffingFile(e.target.files[0])} />
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric/15 text-electric text-sm font-semibold hover:bg-electric/25 transition-colors">
                  <Upload className="w-4 h-4" /> Subir Excel horario
                </div>
              </label>
              <Button variant="outline" onClick={handleGenerateManual} className="gap-2">
                <BarChart3 className="w-4 h-4" /> Distribución uniforme ({fmt(report.total.totalCalls)} llamadas)
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4">Formato Excel: columna A = Hora (HH:mm), columna B = Llamadas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-dot-pattern p-6 lg:p-8">
      <ProcessingOverlay active={state.processing} />
      <Header onNuevo={() => { handleReset(); resetReport(activeMode); }} />

      {/* Source indicator */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          Datos: {staffingFileLoaded ? "Excel horario" : useManual ? "Distribución uniforme" : "Reporte cargado"}
        </span>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleStaffingFile(e.target.files[0])} />
            <span className="text-[10px] text-electric hover:underline cursor-pointer">Cambiar Excel</span>
          </label>
          <button onClick={handleReset} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <KpiCard label="Peak Staff" value={fmt(result.peakStaff)} sub={`Hora pico: ${result.peakHour}`} color="text-electric" delay={0} />
            <KpiCard label="Staff Medio" value={String(result.avgStaff)} sub={`${result.intervals.filter(i => i.calls > 0).length} intervalos activos`} color="text-orange" delay={0.04} />
            <KpiCard label="SLA Ponderado" value={`${result.weightedSLA}%`} sub={`Objetivo: ${slaTarget}%`} color={result.weightedSLA >= slaTarget ? "text-emerald-400" : "text-destructive"} delay={0.08} />
            <KpiCard label="Ocupación Media" value={`${result.avgOccupancy}%`} sub={`${fmt(result.totalCalls)} llamadas totales`} color="text-orange" delay={0.12} />
          </div>

          {/* Chart */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mb-8">
            <StaffingChart intervals={result.intervals} />
          </motion.div>

          {/* Interval Table */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <h3 className="text-xs font-bold tracking-[1.5px] uppercase text-muted-foreground mb-3">Detalle por Intervalo</h3>
            <IntervalTable intervals={result.intervals} slaTarget={slaTarget} />
          </motion.div>
        </>
      )}

      {/* Params */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-xs font-bold tracking-[1.5px] uppercase text-muted-foreground mb-6">Parámetros Erlang C</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          <ParamSlider label="AHT (seg)" value={aht} min={10} max={600} step={1} onChange={setAht} color="orange" />
          <ParamSlider label="SLA Objetivo (%)" value={slaTarget} min={50} max={100} step={1} onChange={setSlaTarget} color="emerald" />
          <ParamSlider label="Tiempo Objetivo (seg)" value={timeTarget} min={5} max={120} step={1} onChange={setTimeTarget} color="default" />
          <ParamSlider label="Shrinkage (%)" value={shrinkage} min={0} max={50} step={1} onChange={setShrinkage} color="default" />
        </div>
      </motion.div>

      {/* Manual interval editor */}
      {(useManual || staffingFileLoaded) && activeIntervals && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold tracking-[1.5px] uppercase text-muted-foreground">Editar Intervalos</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                const last = activeIntervals[activeIntervals.length - 1];
                const lastH = parseInt(last.hour.split(":")[0]);
                const nextH = (lastH + 1) % 24;
                setIntervals([...activeIntervals, { hour: `${String(nextH).padStart(2, "0")}:00`, calls: 0 }]);
              }} className="gap-1 text-xs h-7">
                <Plus className="w-3 h-3" /> Intervalo
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {activeIntervals.map((iv, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                <span className="font-mono text-[11px] text-muted-foreground w-12">{iv.hour}</span>
                <Input
                  type="number"
                  value={iv.calls}
                  onChange={(e) => handleManualEdit(idx, parseInt(e.target.value) || 0)}
                  className="h-7 text-xs text-center bg-background border-border tabular-nums w-20"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Header({ onNuevo }: { onNuevo?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-electric/15 flex items-center justify-center">
            <Users className="w-4 h-4 text-electric" />
          </div>
          <h1 className="text-2xl font-bold tracking-[-0.04em]">Dimensionamiento <span className="text-electric">Erlang C</span></h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">Cálculo por intervalo horario con modelo Erlang C real</p>
      </div>
      {onNuevo && (
        <button onClick={onNuevo} className="h-9 px-4 rounded-lg border border-border text-muted-foreground text-[11px] font-semibold tracking-[0.5px] uppercase inline-flex items-center gap-1.5 snap-transition duration-150 hover:text-foreground hover:border-foreground/20 hover:-translate-y-px">
          ↩ Nuevo
        </button>
      )}
    </motion.div>
  );
}

function KpiCard({ label, value, sub, color, delay }: { label: string; value: string; sub: string; color: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-card rounded-xl border border-border p-5">
      <span className="text-[9px] text-muted-foreground uppercase tracking-[1.8px] font-semibold">{label}</span>
      <div className={`text-[36px] font-extrabold leading-none tracking-[-1px] tabular-nums mt-2 ${color}`}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground mt-1.5">{sub}</div>
    </motion.div>
  );
}

function ParamSlider({ label, value, min, max, step, onChange, color }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; color: string;
}) {
  const colorClasses = color === "orange"
    ? "[&_[role=slider]]:bg-orange [&_[role=slider]]:border-orange [&_.relative>div]:bg-orange"
    : color === "emerald"
    ? "[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500 [&_.relative>div]:bg-emerald-500"
    : "";

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="text-[10px] text-muted-foreground uppercase tracking-[1.5px] font-semibold">{label}</label>
        <Input type="number" value={value} onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
          className="w-20 h-7 text-xs text-center bg-navy-deep border-border tabular-nums" />
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className={colorClasses} />
    </div>
  );
}
