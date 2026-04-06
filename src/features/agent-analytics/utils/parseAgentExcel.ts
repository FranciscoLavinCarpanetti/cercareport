import * as XLSX from 'xlsx';
import type { Session } from '../types';

export interface ColumnMapping {
  agentId: number;
  agentName: number | null;
  start: number;
  end: number;
  state: number;
}

export interface ExcelPreview {
  headers: string[];
  sampleRows: string[][];
  totalRows: number;
  autoMapping: Partial<ColumnMapping>;
}

const HEURISTICS: Record<keyof ColumnMapping, string[]> = {
  agentId: ['agentid', 'agent_id', 'agent id', 'id agente', 'id', 'agente', 'agent', 'usuario', 'user', 'user id', 'empleado'],
  agentName: ['agentname', 'agent_name', 'agent name', 'nombre', 'nombre agente', 'name', 'nombre completo', 'full name'],
  start: ['inicio sesion', 'inicio sesión', 'start', 'inicio', 'fecha inicio', 'start_time', 'hora inicio', 'start time', 'login', 'session start'],
  end: ['fin sesion', 'fin sesión', 'end', 'fin', 'fecha fin', 'end_time', 'hora fin', 'end time', 'logout', 'session end'],
  state: ['state', 'estado', 'status', 'activity', 'actividad', 'aux', 'reason', 'motivo', 'tipo'],
};

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function autoDetect(headers: string[]): Partial<ColumnMapping> {
  const norm = headers.map(normalize);
  const mapping: Partial<ColumnMapping> = {};

  for (const [field, candidates] of Object.entries(HEURISTICS)) {
    for (const c of candidates) {
      const idx = norm.indexOf(c);
      if (idx !== -1) {
        (mapping as Record<string, number | null>)[field] = idx;
        break;
      }
    }
    // Also try partial/contains match
    if ((mapping as Record<string, number | null>)[field] === undefined) {
      for (const c of candidates) {
        const idx = norm.findIndex(h => h.includes(c) || c.includes(h));
        if (idx !== -1) {
          (mapping as Record<string, number | null>)[field] = idx;
          break;
        }
      }
    }
  }

  return mapping;
}

export function readExcelHeaders(buffer: ArrayBuffer): ExcelPreview {
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' }) as unknown[][];

  if (rows.length < 2) throw new Error('El archivo no tiene datos suficientes (mínimo 1 fila de cabecera + 1 de datos).');

  const headers = rows[0].map(h => String(h));
  const sampleRows = rows.slice(1, 6).map(r => r.map(c => String(c ?? '')));
  const autoMapping = autoDetect(headers);

  return { headers, sampleRows, totalRows: rows.length - 1, autoMapping };
}

function parseExcelDate(val: unknown): Date | null {
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    const d = new Date((val - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string' && val.trim()) {
    const d = new Date(val.trim());
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function parseWithMapping(buffer: ArrayBuffer, mapping: ColumnMapping): Session[] {
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' }) as unknown[][];

  const sessions: Session[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;

    const agentId = String(row[mapping.agentId] ?? '').trim();
    if (!agentId) continue;

    const start = parseExcelDate(row[mapping.start]);
    const end = parseExcelDate(row[mapping.end]);
    if (!start || !end) continue;
    if (end <= start) continue;

    const state = String(row[mapping.state] ?? '').trim();
    if (!state) continue;

    sessions.push({
      agentId,
      agentName: mapping.agentName !== null ? String(row[mapping.agentName] ?? '').trim() || undefined : undefined,
      start,
      end,
      state,
    });
  }

  if (sessions.length === 0) throw new Error('No se encontraron sesiones válidas con el mapeo seleccionado.');
  return sessions;
}
