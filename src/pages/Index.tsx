import { useState, useCallback } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { Copy, ImageDown, Calendar, CalendarRange } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AppHeader } from "@/components/AppHeader";
import { UploadZone } from "@/components/UploadZone";
import { ReportBlock } from "@/components/ReportBlock";
import { CallsChart } from "@/components/CallsChart";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { parseExcel, generateReport, generateReportText, formatDate, type Report } from "@/lib/excel-parser";

type ReportMode = 'daily' | 'monthly';

function ReportView({
  mode,
  report,
  processing,
  error,
  onFile,
  onReset,
}: {
  mode: ReportMode;
  report: Report | null;
  processing: boolean;
  error: string | null;
  onFile: (file: File) => void;
  onReset: () => void;
}) {
  const handleExport = useCallback(async () => {
    const reportEl = document.getElementById('report-block');
    if (!reportEl) return;
    toast.info('Capturando informe…');
    try {
      const canvas = await html2canvas(reportEl, {
        scale: 2, useCORS: true, backgroundColor: '#181a38', logging: false,
      });
      const link = document.createElement('a');
      const fecha = report?.reportDate?.replace(/\//g, '-') || 'informe';
      const prefix = mode === 'monthly' ? 'cierre-mensual' : 'cierre-dia';
      link.download = `${prefix}-espana-portugal_${fecha}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('Imagen descargada');
    } catch {
      toast.error('Error al generar la imagen');
    }
  }, [report, mode]);

  const handleCopy = useCallback(() => {
    if (!report) return;
    const text = generateReportText(report, mode);
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copiado al portapapeles'))
      .catch(() => toast.error('No se pudo copiar'));
  }, [report, mode]);

  const subtitle = mode === 'monthly'
    ? 'Carga tu informe mensual para generar el cierre ejecutivo'
    : 'Carga tu informe diario para generar el cierre ejecutivo';

  return (
    <>
      <ProcessingOverlay active={processing} />

      {!report && !error && <UploadZone onFileSelected={onFile} subtitle={subtitle} />}

      {error && (
        <div className="max-w-[540px] mx-auto mt-10 bg-destructive/[0.06] border border-destructive/30 rounded-2xl p-6">
          <strong className="text-sm font-bold block mb-2 text-destructive">Error al procesar</strong>
          <p className="text-sm text-destructive/80 whitespace-pre-wrap">{error}</p>
          <button
            onClick={onReset}
            className="mt-4 h-9 px-4 rounded-lg border border-border text-gray-400 text-[11px] font-semibold tracking-[0.5px] uppercase snap-transition duration-150 hover:text-foreground hover:border-foreground/20"
          >
            ↩ Reintentar
          </button>
        </div>
      )}

      {report && (
        <div className="animate-fade-up px-6 pb-12">
          <div className="max-w-[840px] mx-auto flex gap-2 flex-wrap items-center pt-6 mb-5">
            <button
              onClick={handleCopy}
              className="h-9 px-4 rounded-lg border border-border text-gray-400 text-[11px] font-semibold tracking-[0.5px] uppercase inline-flex items-center gap-2 snap-transition duration-150 hover:text-foreground hover:border-foreground/20 hover:-translate-y-px"
            >
              <Copy className="w-3.5 h-3.5" /> Copiar Email
            </button>
            <button
              onClick={handleExport}
              className="h-9 px-4 rounded-lg border border-border text-gray-400 text-[11px] font-semibold tracking-[0.5px] uppercase inline-flex items-center gap-2 snap-transition duration-150 hover:text-foreground hover:border-foreground/20 hover:-translate-y-px"
            >
              <ImageDown className="w-3.5 h-3.5" /> Exportar
            </button>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-gray-400 font-medium tracking-wide bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg px-3.5 py-1.5">
              {mode === 'monthly' ? (
                <>
                  <CalendarRange className="w-3 h-3 text-electric" />
                  {formatDate(report.startDate)} — {formatDate(report.endDate)}
                </>
              ) : (
                <>
                  <Calendar className="w-3 h-3 text-orange" />
                  {formatDate(report.reportDate)}
                </>
              )}
            </span>
          </div>

          <ReportBlock report={report} mode={mode} />
          <CallsChart rows={report.allRows} />
        </div>
      )}
    </>
  );
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<ReportMode>('daily');

  const [dailyReport, setDailyReport] = useState<Report | null>(null);
  const [dailyProcessing, setDailyProcessing] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);

  const [monthlyReport, setMonthlyReport] = useState<Report | null>(null);
  const [monthlyProcessing, setMonthlyProcessing] = useState(false);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);

  const createFileHandler = useCallback((
    setProcessing: (v: boolean) => void,
    setError: (v: string | null) => void,
    setReport: (v: Report | null) => void,
  ) => (file: File) => {
    setProcessing(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseExcel(e.target!.result as ArrayBuffer);
        if (rows.length === 0) throw new Error(
          'No se encontraron filas de España o Portugal.\nVerifica que la columna A contenga "España" o "Portugal".'
        );
        const rep = generateReport(rows);
        setTimeout(() => {
          setProcessing(false);
          setReport(rep);
          toast.success(`Informe generado · ${rows.length} registros procesados`);
        }, 400);
      } catch (err: unknown) {
        setProcessing(false);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
      }
    };
    reader.onerror = () => {
      setProcessing(false);
      toast.error('Error al leer el archivo');
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDailyFile = useCallback(
    createFileHandler(setDailyProcessing, setDailyError, setDailyReport),
    [createFileHandler]
  );
  const handleMonthlyFile = useCallback(
    createFileHandler(setMonthlyProcessing, setMonthlyError, setMonthlyReport),
    [createFileHandler]
  );

  const handleDailyReset = useCallback(() => { setDailyReport(null); setDailyError(null); }, []);
  const handleMonthlyReset = useCallback(() => { setMonthlyReport(null); setMonthlyError(null); }, []);

  const currentReport = activeTab === 'daily' ? dailyReport : monthlyReport;

  const handleExport = useCallback(async () => {
    const reportEl = document.getElementById('report-block');
    if (!reportEl) return;
    toast.info('Capturando informe…');
    try {
      const canvas = await html2canvas(reportEl, {
        scale: 2, useCORS: true, backgroundColor: '#181a38', logging: false,
      });
      const link = document.createElement('a');
      const fecha = currentReport?.reportDate?.replace(/\//g, '-') || 'informe';
      link.download = `cierre-${activeTab === 'monthly' ? 'mensual' : 'dia'}-espana-portugal_${fecha}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('Imagen descargada');
    } catch {
      toast.error('Error al generar la imagen');
    }
  }, [currentReport, activeTab]);

  const handleReset = useCallback(() => {
    if (activeTab === 'daily') handleDailyReset();
    else handleMonthlyReset();
  }, [activeTab, handleDailyReset, handleMonthlyReset]);

  return (
    <div className="min-h-screen bg-background bg-dot-pattern">
      <AppHeader
        showActions={!!currentReport}
        onReset={handleReset}
        onExport={handleExport}
      />

      <div className="max-w-[840px] mx-auto pt-6 px-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportMode)}>
          <TabsList className="bg-navy-deep border border-border w-full grid grid-cols-2 h-11">
            <TabsTrigger
              value="daily"
              className="text-[11px] font-bold tracking-[1px] uppercase data-[state=active]:bg-orange data-[state=active]:text-navy-deep data-[state=active]:shadow-none gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" /> Cierre Diario
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="text-[11px] font-bold tracking-[1px] uppercase data-[state=active]:bg-electric data-[state=active]:text-navy-deep data-[state=active]:shadow-none gap-1.5"
            >
              <CalendarRange className="w-3.5 h-3.5" /> Cierre Mensual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-0">
            <ReportView
              mode="daily"
              report={dailyReport}
              processing={dailyProcessing}
              error={dailyError}
              onFile={handleDailyFile}
              onReset={handleDailyReset}
            />
          </TabsContent>

          <TabsContent value="monthly" className="mt-0">
            <ReportView
              mode="monthly"
              report={monthlyReport}
              processing={monthlyProcessing}
              error={monthlyError}
              onFile={handleMonthlyFile}
              onReset={handleMonthlyReset}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
