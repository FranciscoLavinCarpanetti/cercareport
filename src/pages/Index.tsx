import { useState, useCallback } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { Copy, ImageDown, Calendar } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { UploadZone } from "@/components/UploadZone";
import { ReportBlock } from "@/components/ReportBlock";
import { CallsChart } from "@/components/CallsChart";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { parseExcel, generateReport, generateReportText, formatDate, type Report } from "@/lib/excel-parser";

export default function Index() {
  const [report, setReport] = useState<Report | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
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
      } catch (err: any) {
        setProcessing(false);
        setError(err.message);
      }
    };
    reader.onerror = () => {
      setProcessing(false);
      toast.error('Error al leer el archivo');
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleReset = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);

  const handleExport = useCallback(async () => {
    const reportEl = document.getElementById('report-block');
    if (!reportEl) return;
    toast.info('Capturando informe…');
    try {
      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#181a38',
        logging: false,
      });
      const link = document.createElement('a');
      const fecha = report?.reportDate?.replace(/\//g, '-') || 'informe';
      link.download = `cierre-dia-espana-portugal_${fecha}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('Imagen descargada');
    } catch {
      toast.error('Error al generar la imagen');
    }
  }, [report]);

  const handleCopy = useCallback(() => {
    if (!report) return;
    const text = generateReportText(report);
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copiado al portapapeles'))
      .catch(() => toast.error('No se pudo copiar'));
  }, [report]);

  return (
    <div className="min-h-screen bg-background bg-dot-pattern">
      <ProcessingOverlay active={processing} />
      <AppHeader
        showActions={!!report}
        onReset={handleReset}
        onExport={handleExport}
      />

      {!report && !error && <UploadZone onFileSelected={handleFile} />}

      {error && (
        <div className="max-w-[540px] mx-auto mt-10 bg-destructive/[0.06] border border-destructive/30 rounded-2xl p-6">
          <strong className="text-sm font-bold block mb-2 text-destructive">Error al procesar</strong>
          <p className="text-sm text-destructive/80 whitespace-pre-wrap">{error}</p>
          <button
            onClick={handleReset}
            className="mt-4 h-9 px-4 rounded-lg border border-border text-gray-400 text-[11px] font-semibold tracking-[0.5px] uppercase snap-transition duration-150 hover:text-foreground hover:border-foreground/20"
          >
            ↩ Reintentar
          </button>
        </div>
      )}

      {report && (
        <div className="animate-fade-up px-6 pb-12">
          {/* Action bar */}
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
              <Calendar className="w-3 h-3 text-orange" />
              {formatDate(report.reportDate)}
            </span>
          </div>

          <ReportBlock report={report} />
          <CallsChart rows={report.allRows} />
        </div>
      )}
    </div>
  );
}
