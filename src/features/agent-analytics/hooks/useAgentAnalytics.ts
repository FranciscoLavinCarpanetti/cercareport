import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { AnalyticsData } from '../types';
import { parseAgentExcel } from '../utils/parseAgentExcel';
import { processAnalytics } from '../utils/analytics';

interface State {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: AnalyticsData | null;
  error: string | null;
}

export function useAgentAnalytics() {
  const [state, setState] = useState<State>({ status: 'idle', data: null, error: null });

  const handleFile = useCallback((file: File) => {
    setState({ status: 'loading', data: null, error: null });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const sessions = parseAgentExcel(e.target!.result as ArrayBuffer);
        const data = processAnalytics(sessions);
        setTimeout(() => {
          setState({ status: 'success', data, error: null });
          toast.success(`Analítica generada · ${sessions.length} sesiones · ${data.uniqueAgents.length} agentes`);
        }, 300);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        setState({ status: 'error', data: null, error: msg });
        toast.error(msg);
      }
    };
    reader.onerror = () => {
      setState({ status: 'error', data: null, error: 'Error al leer el archivo' });
      toast.error('Error al leer el archivo');
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
  }, []);

  return { ...state, handleFile, reset };
}
