import type { Session, AgentStateDistribution, ConcurrencyPoint, AgentEfficiency, AnalyticsData } from '../types';

const PRODUCTIVE_STATES = ['talking', 'hablando', 'call', 'llamada', 'productive', 'productivo', 'on call', 'en llamada', 'acw', 'after call work', 'wrap', 'wrap up'];

function isProductive(state: string): boolean {
  return PRODUCTIVE_STATES.includes(state.toLowerCase().trim());
}

export function computeStateDistributions(sessions: Session[]): AgentStateDistribution[] {
  const agentMap = new Map<string, { name: string; states: Record<string, number>; total: number }>();

  for (const s of sessions) {
    const dur = (s.end.getTime() - s.start.getTime()) / 1000;
    if (dur <= 0) continue;

    let entry = agentMap.get(s.agentId);
    if (!entry) {
      entry = { name: s.agentName || s.agentId, states: {}, total: 0 };
      agentMap.set(s.agentId, entry);
    }
    entry.states[s.state] = (entry.states[s.state] || 0) + dur;
    entry.total += dur;
  }

  return Array.from(agentMap.entries()).map(([agentId, data]) => ({
    agentId,
    agentName: data.name,
    states: data.states,
    totalSeconds: data.total,
  }));
}

export function computeConcurrencyCurve(sessions: Session[]): ConcurrencyPoint[] {
  if (sessions.length === 0) return [];

  // Find time range
  let minTime = sessions[0].start.getTime();
  let maxTime = sessions[0].end.getTime();
  for (const s of sessions) {
    if (s.start.getTime() < minTime) minTime = s.start.getTime();
    if (s.end.getTime() > maxTime) maxTime = s.end.getTime();
  }

  // Sample every 15 minutes
  const interval = 15 * 60 * 1000;
  const points: ConcurrencyPoint[] = [];

  for (let t = minTime; t <= maxTime; t += interval) {
    let count = 0;
    for (const s of sessions) {
      if (s.start.getTime() <= t && s.end.getTime() > t) count++;
    }
    const d = new Date(t);
    points.push({
      time: d,
      timeLabel: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      count,
    });
  }

  return points;
}

export function computeEfficiencies(sessions: Session[]): AgentEfficiency[] {
  const agentMap = new Map<string, { name: string; productive: number; total: number; count: number }>();

  for (const s of sessions) {
    const dur = (s.end.getTime() - s.start.getTime()) / 1000;
    if (dur <= 0) continue;

    let entry = agentMap.get(s.agentId);
    if (!entry) {
      entry = { name: s.agentName || s.agentId, productive: 0, total: 0, count: 0 };
      agentMap.set(s.agentId, entry);
    }
    entry.total += dur;
    entry.count += 1;
    if (isProductive(s.state)) entry.productive += dur;
  }

  return Array.from(agentMap.entries())
    .map(([agentId, d]) => ({
      agentId,
      agentName: d.name,
      productiveSeconds: d.productive,
      totalSeconds: d.total,
      efficiency: d.total > 0 ? d.productive / d.total : 0,
      sessionCount: d.count,
      avgSessionMinutes: d.count > 0 ? d.total / d.count / 60 : 0,
    }))
    .sort((a, b) => b.efficiency - a.efficiency);
}

export function processAnalytics(sessions: Session[]): AnalyticsData {
  const stateDistributions = computeStateDistributions(sessions);
  const concurrencyCurve = computeConcurrencyCurve(sessions);
  const efficiencies = computeEfficiencies(sessions);

  const uniqueStates = [...new Set(sessions.map(s => s.state))];
  const uniqueAgents = [...new Set(sessions.map(s => s.agentId))];

  return {
    sessions,
    stateDistributions,
    concurrencyCurve,
    efficiencies,
    uniqueStates,
    uniqueAgents,
  };
}
