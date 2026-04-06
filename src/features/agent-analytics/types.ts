export interface Session {
  agentId: string;
  agentName?: string;
  start: Date;
  end: Date;
  state: string;
}

export interface AgentStateDistribution {
  agentId: string;
  agentName: string;
  states: Record<string, number>; // state -> total seconds
  totalSeconds: number;
}

export interface ConcurrencyPoint {
  time: Date;
  timeLabel: string;
  count: number;
}

export interface AgentEfficiency {
  agentId: string;
  agentName: string;
  productiveSeconds: number;
  totalSeconds: number;
  efficiency: number; // 0-1
  sessionCount: number;
  avgSessionMinutes: number;
}

export type AnalyticsData = {
  sessions: Session[];
  stateDistributions: AgentStateDistribution[];
  concurrencyCurve: ConcurrencyPoint[];
  efficiencies: AgentEfficiency[];
  uniqueStates: string[];
  uniqueAgents: string[];
};
