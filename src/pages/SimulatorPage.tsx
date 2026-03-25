import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Sliders, RotateCcw, Save, Upload } from "lucide-react";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { simulateCapacity, type SimulationInput } from "@/lib/workforce/simulation";
import { SimKpiCard } from "@/components/dashboard/SimKpiCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UploadZone } from "@/components/UploadZone";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ScenarioParams {
  newStaff: number;
  newVolume: number;
  newAHT: number;
}

export default function SimulatorPage() {
  const { daily, monthly, activeMode, handleFile } = useWorkforce();
  const state = activeMode === 'daily' ? daily : monthly;
  const report = state.report;

  const defaults = useMemo(() => {
    if (!report) return { staff: 10, volume: 500, aht: 180, wt: 30 };
    return {
      staff: report.total.agents,
      volume: report.total.totalCalls,
      aht: report.total.attAvg,
      wt: report.total.wtAvg,
    };
  }, [report]);

  const [params, setParams] = useState<ScenarioParams>({
    newStaff: defaults.staff,
    newVolume: defaults.volume,
    newAHT: defaults.aht,
  });

  // Sync defaults when report changes
  const [lastDefaults, setLastDefaults] = useState(defaults);
  if (defaults !== lastDefaults) {
    setParams({ newStaff: defaults.staff, newVolume: defaults.volume, newAHT: defaults.aht });
    setLastDefaults(defaults);
  }

  const [savedScenarios, setSavedScenarios] = useState<Array<{ name: string; params: ScenarioParams }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('wfm-scenarios') || '[]');
    } catch { return []; }
  });

  const input: SimulationInput = {
    currentStaff: defaults.staff,
    currentVolume: defaults.volume,
    currentAHT: defaults.aht,
    currentWT: defaults.wt,
    newStaff: params.newStaff,
    newVolume: params.newVolume,
    newAHT: params.newAHT,
  };

  const result = useMemo(() => simulateCapacity(input), [input.currentStaff, input.currentVolume, input.currentAHT, input.currentWT, input.newStaff, input.newVolume, input.newAHT]);

  const handleReset = useCallback(() => {
    setParams({ newStaff: defaults.staff, newVolume: defaults.volume, newAHT: defaults.aht });
  }, [defaults]);

  const handleSave = useCallback(() => {
    const name = `Escenario ${savedScenarios.length + 1}`;
    const updated = [...savedScenarios, { name, params }];
    setSavedScenarios(updated);
    localStorage.setItem('wfm-scenarios', JSON.stringify(updated));
    toast.success(`${name} guardado`);
  }, [params, savedScenarios]);

  if (!report) {
    return (
      <>
        <ProcessingOverlay active={state.processing} />
        <UploadZone
          onFileSelected={(file) => handleFile(file, activeMode)}
          subtitle="Carga un Excel para alimentar el simulador de capacidad"
        />
      </>
    );
  }

  const staffMin = Math.max(1, Math.floor(defaults.staff * 0.3));
  const staffMax = Math.ceil(defaults.staff * 2.5) || 50;
  const volMin = 0;
  const volMax = Math.ceil(defaults.volume * 2.5) || 2000;
  const ahtMin = Math.max(1, Math.floor(defaults.aht * 0.3));
  const ahtMax = Math.ceil(defaults.aht * 3) || 600;

  return (
    <div className="min-h-screen bg-background bg-dot-pattern p-6 lg:p-8">
      <ProcessingOverlay active={state.processing} />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-orange/15 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-orange" />
          </div>
          <h1 className="text-2xl font-bold tracking-[-0.04em]">Simulador <span className="text-orange">What-If</span></h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">Simula escenarios modificando staff, volumen y AHT en tiempo real</p>
      </motion.div>

      {/* Status */}
      <div className="flex items-center gap-3 mb-6">
        <StatusBadge status={result.status} />
        <span className="text-[10px] text-muted-foreground tracking-wide uppercase">
          WT simulado: {result.simulatedWT}s · Ocupación: {result.occupancy}%
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <SimKpiCard label="Wait Time" currentValue={defaults.wt} simulatedValue={result.simulatedWT} unit="s" delta={result.wtDelta} invertDelta tooltip="Tiempo medio de espera simulado" index={0} />
        <SimKpiCard label="Ocupación" currentValue={Math.round((defaults.volume * defaults.aht) / (defaults.staff * 3600) * 1000) / 10} simulatedValue={result.occupancy} unit="%" delta={result.occupancyDelta} deltaSuffix="pp" invertDelta tooltip="Porcentaje de ocupación estimado" index={1} />
        <SimKpiCard label="Staff" currentValue={defaults.staff} simulatedValue={params.newStaff} unit="" delta={defaults.staff > 0 ? Math.round(((params.newStaff - defaults.staff) / defaults.staff) * 1000) / 10 : 0} index={2} />
        <SimKpiCard label="Volumen" currentValue={defaults.volume} simulatedValue={params.newVolume} unit="" delta={defaults.volume > 0 ? Math.round(((params.newVolume - defaults.volume) / defaults.volume) * 1000) / 10 : 0} index={3} />
      </div>

      {/* Sliders */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold tracking-[1.5px] uppercase text-muted-foreground">Parámetros de Simulación</h2>
          <div className="flex gap-2">
            <button onClick={handleReset} className="h-8 px-3 rounded-lg border border-border text-muted-foreground text-[10px] font-semibold tracking-[0.5px] uppercase inline-flex items-center gap-1.5 hover:text-foreground hover:border-foreground/20 transition-colors">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button onClick={handleSave} className="h-8 px-3 rounded-lg bg-orange/15 text-orange text-[10px] font-semibold tracking-[0.5px] uppercase inline-flex items-center gap-1.5 hover:bg-orange/25 transition-colors">
              <Save className="w-3 h-3" /> Guardar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Staff */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[1.5px] font-semibold">Staff</label>
              <Input
                type="number"
                value={params.newStaff}
                onChange={(e) => setParams(p => ({ ...p, newStaff: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-20 h-7 text-xs text-center bg-navy-deep border-border tabular-nums"
              />
            </div>
            <Slider
              value={[params.newStaff]}
              min={staffMin}
              max={staffMax}
              step={1}
              onValueChange={([v]) => setParams(p => ({ ...p, newStaff: v }))}
              className="[&_[role=slider]]:bg-orange [&_[role=slider]]:border-orange [&_.relative>div]:bg-orange"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground/60 mt-1 tabular-nums">
              <span>{staffMin}</span><span>{staffMax}</span>
            </div>
          </div>

          {/* Volume */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[1.5px] font-semibold">Volumen</label>
              <Input
                type="number"
                value={params.newVolume}
                onChange={(e) => setParams(p => ({ ...p, newVolume: Math.max(0, parseInt(e.target.value) || 0) }))}
                className="w-24 h-7 text-xs text-center bg-navy-deep border-border tabular-nums"
              />
            </div>
            <Slider
              value={[params.newVolume]}
              min={volMin}
              max={volMax}
              step={1}
              onValueChange={([v]) => setParams(p => ({ ...p, newVolume: v }))}
              className="[&_[role=slider]]:bg-electric [&_[role=slider]]:border-electric [&_.relative>div]:bg-electric"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground/60 mt-1 tabular-nums">
              <span>{volMin}</span><span>{new Intl.NumberFormat('es-ES').format(volMax)}</span>
            </div>
          </div>

          {/* AHT */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] text-muted-foreground uppercase tracking-[1.5px] font-semibold">AHT (seg)</label>
              <Input
                type="number"
                value={params.newAHT}
                onChange={(e) => setParams(p => ({ ...p, newAHT: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-20 h-7 text-xs text-center bg-navy-deep border-border tabular-nums"
              />
            </div>
            <Slider
              value={[params.newAHT]}
              min={ahtMin}
              max={ahtMax}
              step={1}
              onValueChange={([v]) => setParams(p => ({ ...p, newAHT: v }))}
              className="[&_[role=slider]]:bg-foreground [&_[role=slider]]:border-foreground [&_.relative>div]:bg-foreground"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground/60 mt-1 tabular-nums">
              <span>{ahtMin}s</span><span>{ahtMax}s</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Saved Scenarios */}
      {savedScenarios.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-[10px] font-bold tracking-[1.5px] uppercase text-muted-foreground mb-3">Escenarios Guardados</h3>
          <div className="flex flex-wrap gap-2">
            {savedScenarios.map((s, i) => (
              <button
                key={i}
                onClick={() => setParams(s.params)}
                className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-semibold text-muted-foreground hover:text-orange hover:border-orange/30 transition-colors"
              >
                {s.name}
              </button>
            ))}
            <button
              onClick={() => { setSavedScenarios([]); localStorage.removeItem('wfm-scenarios'); toast.info('Escenarios eliminados'); }}
              className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-destructive/60 hover:text-destructive transition-colors"
            >
              Limpiar
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
