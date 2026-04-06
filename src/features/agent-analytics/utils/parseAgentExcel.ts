import * as XLSX from 'xlsx';
import type { Session } from '../types';

function parseExcelDate(val: unknown): Date | null {
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    // Excel serial date
    const d = new Date((val - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string' && val.trim()) {
    const d = new Date(val.trim());
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function findColumnIndex(headers: string[], candidates: string[]): number {
  const normalized = headers.map(h => String(h).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  for (const c of candidates) {
    const idx = normalized.indexOf(c.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseAgentExcel(buffer: ArrayBuffer): Session[] {
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' }) as unknown[][];

  if (rows.length < 2) throw new Error('El archivo no tiene datos suficientes.');

  const headers = rows[0].map(h => String(h));

  const agentIdCol = findColumnIndex(headers, ['agentid', 'agent_id', 'agent id', 'id agente', 'id', 'agente']);
  const agentNameCol = findColumnIndex(headers, ['agentname', 'agent_name', 'agent name', 'nombre', 'nombre agente']);
  const startCol = findColumnIndex(headers, ['start', 'inicio', 'fecha inicio', 'start_time', 'hora inicio']);
  const endCol = findColumnIndex(headers, ['end', 'fin', 'fecha fin', 'end_time', 'hora fin']);
  const stateCol = findColumnIndex(headers, ['state', 'estado', 'status', 'activity', 'actividad']);

  if (agentIdCol === -1) throw new Error('No se encontró columna de ID de agente (agentId, id, agente).');
  if (startCol === -1) throw new Error('No se encontró columna de inicio (start, inicio).');
  if (endCol === -1) throw new Error('No se encontró columna de fin (end, fin).');
  if (stateCol === -1) throw new Error('No se encontró columna de estado (state, estado).');

  const sessions: Session[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;

    const agentId = String(row[agentIdCol] ?? '').trim();
    if (!agentId) continue;

    const start = parseExcelDate(row[startCol]);
    const end = parseExcelDate(row[endCol]);
    if (!start || !end) continue;
    if (end <= start) continue;

    const state = String(row[stateCol] ?? '').trim();
    if (!state) continue;

    sessions.push({
      agentId,
      agentName: agentNameCol !== -1 ? String(row[agentNameCol] ?? '').trim() || undefined : undefined,
      start,
      end,
      state,
    });
  }

  if (sessions.length === 0) throw new Error('No se encontraron sesiones válidas en el archivo.');
  return sessions;
}
