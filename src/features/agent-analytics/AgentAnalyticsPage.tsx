import { motion } from 'framer-motion';
import { RotateCcw, Users, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadZone } from '@/components/UploadZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { useAgentAnalytics } from './hooks/useAgentAnalytics';
import { StateDistributionChart } from './components/StateDistributionChart';
import { ConcurrencyChart } from './components/ConcurrencyChart';
import { EfficiencyTable } from './components/EfficiencyTable';

export default function AgentAnalyticsPage() {
  const { status, data, error, handleFile, reset } = useAgentAnalytics();

  if (status === 'idle' || status === 'error') {
    return (
      <div className="relative">
        <UploadZone
          onFileSelected={handleFile}
          subtitle="Sube un Excel con sesiones de agentes (agentId, start, end, state)"
        />
        {error && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-destructive/10 border border-destructive/30 rounded-lg px-5 py-3 text-sm text-destructive font-medium">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (status === 'loading') {
    return <ProcessingOverlay />;
  }

  if (!data) return null;

  const avgEfficiency = data.efficiencies.length > 0
    ? Math.round(data.efficiencies.reduce((s, e) => s + e.efficiency, 0) / data.efficiencies.length * 100)
    : 0;

  const peakConcurrency = data.concurrencyCurve.reduce((max, p) => Math.max(max, p.count), 0);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analítica de <span className="text-accent">Agentes</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.sessions.length} sesiones · {data.uniqueAgents.length} agentes · {data.uniqueStates.length} estados
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reset} className="gap-2 border-border text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-3.5 h-3.5" /> Nuevo
        </Button>
      </div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <KpiCard icon={Users} label="Agentes" value={data.uniqueAgents.length} />
        <KpiCard icon={Activity} label="Pico Concurrencia" value={peakConcurrency} suffix=" agentes" />
        <KpiCard icon={TrendingUp} label="Eficiencia Media" value={avgEfficiency} suffix="%" />
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-6"
      >
        <StateDistributionChart data={data.stateDistributions} uniqueStates={data.uniqueStates} />
        <ConcurrencyChart data={data.concurrencyCurve} />
        <EfficiencyTable data={data.efficiencies} />
      </motion.div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, suffix = '' }: { icon: React.ElementType; label: string; value: number; suffix?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
        <div className="text-2xl font-bold text-foreground">{value}{suffix}</div>
      </div>
    </div>
  );
}
