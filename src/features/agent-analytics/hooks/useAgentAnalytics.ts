import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { AnalyticsData } from '../types';
import { readExcelHeaders, parseWithMapping, type ExcelPreview, type ColumnMapping } from '../utils/parseAgentExcel';
import { processAnalytics } from '../utils/analytics';

type Status = 'idle' | 'mapping' | 'loading' | 'success' | 'error';

interface State {
  status: Status;
  data: AnalyticsData | null;
  error: string | null;
  preview: ExcelPreview | null;
  buffer: ArrayBuffer | null;
}

export function useAgentAnalytics() {
  const [state, setState] = useState<State>({ status: 'idle', data: null, error: null, preview: null, buffer: null });

  const handleFile = useCallback((file: File) => {
    setState(prev => ({ ...prev, status: 'loading', error: null }));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target!.result as ArrayBuffer;
        const preview = readExcelHeaders(buffer);
        setState({ status: 'mapping', data: null, error: null, preview, buffer });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        setState({ status: 'error', data: null, error: msg, preview: null, buffer: null });
        toast.error(msg);
      }
    };
    reader.onerror = () => {
      setState({ status: 'error', data: null, error: 'Error al leer el archivo', preview: null, buffer: null });
      toast.error('Error al leer el archivo');
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const confirmMapping = useCallback((mapping: ColumnMapping) => {
    if (!state.buffer) return;
    setState(prev => ({ ...prev, status: 'loading' }));

    try {
      const sessions = parseWithMapping(state.buffer, mapping);
      const data = processAnalytics(sessions);
      setTimeout(() => {
        setState({ status: 'success', data, error: null, preview: null, buffer: null });
        toast.success(`Analítica generada · ${sessions.length} sesiones · ${data.uniqueAgents.length} agentes`);
      }, 300);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setState(prev => ({ ...prev, status: 'error', error: msg }));
      toast.error(msg);
    }
  }, [state.buffer]);

  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null, preview: null, buffer: null });
  }, []);

  return { ...state, handleFile, confirmMapping, reset };
}
