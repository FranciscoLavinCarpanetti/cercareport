import * as XLSX from 'xlsx';

export interface CallRecord {
  country: string;
  date: string;
  calls: number;
  awt: number;
  att: number;
}

export interface Metrics {
  totalCalls: number;
  agents: number;
  attAvg: number;
  wtAvg: number;
}

export interface Report {
  esp: Metrics;
  pt: Metrics;
  total: Metrics;
  reportDate: string;
  allRows: CallRecord[];
}

function timeToSeconds(val: unknown): number {
  if (val == null || val === '') return 0;
  if (typeof val === 'number') return Math.round(val * 86400);
  const s = String(val).trim();
  if (!s || s === '0') return 0;
  const parts = s.split(':');
  if (parts.length === 3) return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
  if (parts.length === 2) return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
  return parseFloat(s) || 0;
}

function normalizeCountry(val: unknown): string | null {
  if (!val) return null;
  const v = String(val).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (v === 'espana' || v === 'espagna' || v === 'españa') return 'España';
  if (v === 'portugal') return 'Portugal';
  return null;
}

export function formatDate(val: string): string {
  if (!val) return '';
  const s = String(val).trim();
  const m = s.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
  let d: Date;
  if (m) d = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  else d = new Date(s);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function parseExcel(arrayBuffer: ArrayBuffer): CallRecord[] {
  const wb = XLSX.read(new Uint8Array(arrayBuffer), {
    type: 'array', raw: false, cellDates: false, cellText: true
  });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' }) as string[][];
  const parsed: CallRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;
    const country = normalizeCountry(row[0]);
    if (!country) continue;
    parsed.push({
      country,
      date: row[1] as string,
      calls: parseInt(String(row[2]).replace(/[^\d]/g, ''), 10) || 0,
      awt: timeToSeconds(row[7]),
      att: timeToSeconds(row[8]),
    });
  }
  return parsed;
}

function calculateMetrics(rows: CallRecord[]): Metrics {
  if (!rows || rows.length === 0) return { totalCalls: 0, agents: 0, attAvg: 0, wtAvg: 0 };
  const totalCalls = rows.reduce((s, r) => s + r.calls, 0);
  const agents = rows.length;
  const attSum = rows.reduce((s, r) => s + r.att, 0);
  const wtSum = rows.reduce((s, r) => s + r.awt, 0);
  return {
    totalCalls,
    agents,
    attAvg: agents > 0 ? Math.round(attSum / agents) : 0,
    wtAvg: agents > 0 ? Math.round(wtSum / agents) : 0,
  };
}

export function generateReport(rows: CallRecord[]): Report {
  const grouped: Record<string, CallRecord[]> = {};
  rows.forEach(r => {
    if (!grouped[r.country]) grouped[r.country] = [];
    grouped[r.country].push(r);
  });
  const espRows = grouped['España'] || [];
  const ptRows = grouped['Portugal'] || [];
  const freq: Record<string, number> = {};
  rows.forEach(r => { const k = String(r.date).trim(); freq[k] = (freq[k] || 0) + 1; });
  const reportDate = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || '';
  return {
    esp: calculateMetrics(espRows),
    pt: calculateMetrics(ptRows),
    total: calculateMetrics(rows),
    reportDate,
    allRows: rows,
  };
}

export function generateReportText(report: Report): string {
  const { esp, pt, total, reportDate } = report;
  const d = formatDate(reportDate);
  return [
    `CIERRE DIA España & Portugal`,
    `Indicadores Clave de Rendimiento · ${d}`, ``,
    `══ Cerca ESPAÑA ══`,
    `Total Llamadas : ${esp.totalCalls.toLocaleString('es-ES')}`,
    `Agentes        : ${esp.agents}`,
    `ATT Promedio   : ${esp.attAvg}s`,
    `WT Promedio    : ${esp.wtAvg}s`, ``,
    `══ Cerca PORTUGAL ══`,
    `Total Llamadas : ${pt.totalCalls.toLocaleString('es-ES')}`,
    `Agentes        : ${pt.agents}`,
    `ATT Promedio   : ${pt.attAvg}s`,
    `WT Promedio    : ${pt.wtAvg}s`, ``,
    `══ CIERRE TOTAL DIA España & Portugal ══`,
    `Total Llamadas : ${total.totalCalls.toLocaleString('es-ES')}`,
    `Agentes        : ${total.agents}`,
    `ATT Promedio   : ${total.attAvg}s`,
    `WT Promedio    : ${total.wtAvg}s`,
  ].join('\n');
}
