import { useState, useCallback } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { Copy, ImageDown, Calendar, CalendarRange } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UploadZone } from "@/components/UploadZone";
import { ReportBlock } from "@/components/ReportBlock";
import { CallsChart } from "@/components/CallsChart";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { generateReportText, formatDate, type Report } from "@/lib/excel-parser";
import { useWorkforce } from "@/contexts/WorkforceContext";

type ReportMode = 'daily' | 'monthly';

function ReportView({ mode, report, processing, error, onFile, onReset }: {
  mode: ReportMode; report: Report | null; processing: boolean; error: string | null; onFile: (file: File) => void; onReset: () => void;
}) {
  const handleExport = useCallback(async () => {
    const reportEl = document.getElementById('report-block');
    if (!reportEl) return;
    toast.info('Capturando informe…');
    try {
      const canvas = await html2canvas(reportEl, { scale: 2, useCORS: true, backgroundColor: '#181a38', logging: false });
      const link = document.createElement('a');
      const fecha = report?.reportDate?.replace(/\//g, '-') || 'informe';
      const prefix = mode === 'monthly' ? 'cierre-mensual' : 'cierre-dia';
      link.download = `${prefix}-espana-portugal_${fecha}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('Imagen descargada');
    } catch { toast.error('Error al generar la imagen'); }
  }, [report, mode]);

  const handleCopy = useCallback(() => {
    if (!report) return;
    navigator.clipboard.writeText(generateReportText(report, mode))
      .then(() => toast.success('Copiado al portapapeles'))
      .catch(() => toast.error('No se pudo copiar'));
  }, [report, mode]);

  const subtitle = mode === 'monthly' ? 'Carga tu informe mensual para generar el cierre ejecutivo' : 'Carga tu informe diario para generar el cierre ejecutivo';

  return (
    <>
      <ProcessingOverlay active={processing} />
      {!report && !error && <UploadZone onFileSelected={onFile} subtitle={subtitle} />}
      {error && (
        <div className="max-w-[540px] mx-auto mt-10 bg-destructive/[0.06] border border-destructive/30 rounded-2xl p-6">
          <strong className="text-sm font-bold block mb-2 text-destructive">Error al procesar</strong>
          <p className="text-sm text-destructive/80 whitespace-pre-wrap">{error}</p>
          <button onClick={onReset} className="mt-4 h-9 px-4 rounded-lg border border-border text-muted-foreground text-[11px] font-semibold tracking-[0.5px] uppercase snap-transition duration-150 hover:text-foreground hover:border-foreground/20">↩ Reintentar</button>
        </div>
      )}
      {report && (
        <div className="animate-fade-up px-6 pb-12">
          <div className="max-w-[840px] mx-auto flex gap-2 flex-wrap items-center pt-6 mb-5">
            <button onClick={handleCopy} className="h-9 px-4 rounded-lg border border-border text-muted-foreground text-[11px] font-semibold tracking-[0.5px] uppercase inline-flex items-center gap-2 snap-transition duration-150 hover:text-foreground hover:border-foreground/20 hover:-translate-y-px">
              <Copy className="w-3.5 h-3.5" /> Copiar Email
            </button>
            <button onClick={handleExport} className="h-9 px-4 rounded-lg border border-border text-muted-foreground text-[11px] font-semibold tracking-[0.5px] uppercase inline-flex items-center gap-2 snap-transition duration-150 hover:text-foreground hover:border-foreground/20 hover:-translate-y-px">
              <ImageDown className="w-3.5 h-3.5" /> Exportar
            </button>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium tracking-wide bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg px-3.5 py-1.5">
              {mode === 'monthly' ? (<><CalendarRange className="w-3 h-3 text-electric" />{formatDate(report.startDate)} — {formatDate(report.endDate)}</>) : (<><Calendar className="w-3 h-3 text-orange" />{formatDate(report.reportDate)}</>)}
            </span>
          </div>
          <ReportBlock report={report} mode={mode} />
          <CallsChart rows={report.allRows} />
        </div>
      )}
    </>
  );
}

export default function ReportPage() {
  const { daily, monthly, activeMode, setActiveMode, handleFile, resetReport } = useWorkforce();
  const hasReport = daily.report || monthly.report;

  return (
    <div className="min-h-screen bg-background bg-dot-pattern">
      <div className="max-w-[840px] mx-auto pt-6 px-6">
        <div className="flex items-center justify-between mb-4">
          <div />
          {hasReport && (
            <button onClick={() => resetReport(activeMode)} className="h-9 px-4 rounded-lg border border-border text-muted-foreground text-[11px] font-semibold tracking-[0.5px] uppercase inline-flex items-center gap-1.5 snap-transition duration-150 hover:text-foreground hover:border-foreground/20 hover:-translate-y-px">
              ↩ Nuevo
            </button>
          )}
        </div>
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as ReportMode)}>
          <TabsList className="bg-navy-deep border border-border w-full grid grid-cols-2 h-11">
            <TabsTrigger value="daily" className="text-[11px] font-bold tracking-[1px] uppercase data-[state=active]:bg-orange data-[state=active]:text-accent-foreground data-[state=active]:shadow-none gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Cierre Diario
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-[11px] font-bold tracking-[1px] uppercase data-[state=active]:bg-electric data-[state=active]:text-accent-foreground data-[state=active]:shadow-none gap-1.5">
              <CalendarRange className="w-3.5 h-3.5" /> Cierre Mensual
            </TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-0">
            <ReportView mode="daily" report={daily.report} processing={daily.processing} error={daily.error} onFile={(f) => handleFile(f, 'daily')} onReset={() => resetReport('daily')} />
          </TabsContent>
          <TabsContent value="monthly" className="mt-0">
            <ReportView mode="monthly" report={monthly.report} processing={monthly.processing} error={monthly.error} onFile={(f) => handleFile(f, 'monthly')} onReset={() => resetReport('monthly')} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
