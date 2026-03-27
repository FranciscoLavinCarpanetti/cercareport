import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import { parseExcel, generateReport, type Report, type CallRecord } from "@/lib/excel-parser";

interface WorkforceState {
  report: Report | null;
  processing: boolean;
  error: string | null;
  mode: 'daily' | 'monthly';
}

interface WorkforceContextType {
  daily: WorkforceState;
  monthly: WorkforceState;
  activeMode: 'daily' | 'monthly';
  setActiveMode: (mode: 'daily' | 'monthly') => void;
  handleFile: (file: File, mode: 'daily' | 'monthly') => void;
  resetReport: (mode: 'daily' | 'monthly') => void;
  currentReport: Report | null;
}

const WorkforceContext = createContext<WorkforceContextType | null>(null);

export function useWorkforce() {
  const ctx = useContext(WorkforceContext);
  if (!ctx) throw new Error("useWorkforce must be used within WorkforceProvider");
  return ctx;
}

export function WorkforceProvider({ children }: { children: ReactNode }) {
  const [activeMode, setActiveMode] = useState<'daily' | 'monthly'>('daily');
  const [daily, setDaily] = useState<WorkforceState>({ report: null, processing: false, error: null, mode: 'daily' });
  const [monthly, setMonthly] = useState<WorkforceState>({ report: null, processing: false, error: null, mode: 'monthly' });

  const handleFile = useCallback((file: File, mode: 'daily' | 'monthly') => {
    const setState = mode === 'daily' ? setDaily : setMonthly;
    setState(prev => ({ ...prev, processing: true, error: null }));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseExcel(e.target!.result as ArrayBuffer);
        if (rows.length === 0) throw new Error('No se encontraron filas de España o Portugal.');
        const rep = generateReport(rows);
        setTimeout(() => {
          setState({ report: rep, processing: false, error: null, mode });
          toast.success(`Informe generado · ${rows.length} registros procesados`);
        }, 400);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setState(prev => ({ ...prev, processing: false, error: errorMessage }));
      }
    };
    reader.onerror = () => {
      setState(prev => ({ ...prev, processing: false }));
      toast.error('Error al leer el archivo');
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const resetReport = useCallback((mode: 'daily' | 'monthly') => {
    const setState = mode === 'daily' ? setDaily : setMonthly;
    setState({ report: null, processing: false, error: null, mode });
  }, []);

  const currentReport = activeMode === 'daily' ? daily.report : monthly.report;

  return (
    <WorkforceContext.Provider value={{ daily, monthly, activeMode, setActiveMode, handleFile, resetReport, currentReport }}>
      {children}
    </WorkforceContext.Provider>
  );
}
