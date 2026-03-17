import { useState, useCallback } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { AppHeader } from "@/components/AppHeader";
import { UploadZone } from "@/components/UploadZone";
import { ReportBlock } from "@/components/ReportBlock";
import { CallsChart } from "@/components/CallsChart";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { parseExcel, generateReport, generateReportText, type Report } from "@/lib/excel-parser";

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
    toast.info('📷 Capturando informe…');
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
      toast.success('Imagen descargada correctamente');
    } catch {
      toast.error('Error al generar la imagen');
    }
  }, [report]);

  const handleCopy = useCallback(() => {
    if (!report) return;
    const text = generateReportText(report);
    navigator.clipboard.writeText(text)
      .then(() => toast.success('📋 Copiado al portapapeles'))
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
        <div className="max-w-[580px] mx-auto mt-10 bg-destructive/[0.08] border border-destructive/40 rounded-[14px] p-6 text-destructive">
          <strong className="text-sm font-bold block mb-2">❌ Error al procesar el archivo</strong>
          <p className="text-sm whitespace-pre-wrap">{error}</p>
          <button
            onClick={handleReset}
            className="mt-3 h-[38px] px-4 rounded-lg border border-orange/45 text-orange text-[11px] font-bold tracking-[0.9px] uppercase snap-transition duration-150 hover:bg-orange/10"
          >
            ↩ Reintentar
          </button>
        </div>
      )}

      {report && (
        <div className="animate-fade-up px-6 pb-12">
          <div className="max-w-[840px] mx-auto flex gap-2.5 flex-wrap items-center pt-6 mb-5">
            <button
              onClick={handleCopy}
              className="h-[38px] px-4 rounded-lg border border-orange/45 text-orange text-[11px] font-bold tracking-[0.9px] uppercase inline-flex items-center gap-1.5 snap-transition duration-150 hover:bg-orange/10 hover:border-orange hover:-translate-y-px"
            >
              📋 Copiar para Email
            </button>
            <button
              onClick={handleExport}
              className="h-[38px] px-4 rounded-lg border border-orange/45 text-orange text-[11px] font-bold tracking-[0.9px] uppercase inline-flex items-center gap-1.5 snap-transition duration-150 hover:bg-orange/10 hover:border-orange hover:-translate-y-px"
            >
              📷 Exportar imagen
            </button>
            <span className="ml-auto text-[11px] text-gray-400 font-semibold tracking-[0.5px] bg-foreground/5 border border-foreground/[0.08] rounded-md px-3.5 py-1.5">
              {report.reportDate}
            </span>
          </div>

          <ReportBlock report={report} />
          <CallsChart rows={report.allRows} />
        </div>
      )}
    </div>
  );
}
