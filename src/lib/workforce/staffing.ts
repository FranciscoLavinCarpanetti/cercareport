export interface StaffingInput {
  volume: number;
  aht: number;
  slaTarget: number;
  timeTarget: number;
  occupancyTarget: number;
  shrinkage: number;
  currentStaff: number;
}

export interface StaffingResult {
  staffRequired: number;
  gap: number;
  gapType: 'deficit' | 'excess' | 'balanced';
  occupancyEstimated: number;
  erlangSLA: number;
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function erlangC(agents: number, trafficIntensity: number): number {
  if (agents <= 0 || trafficIntensity <= 0) return 0;
  if (agents <= trafficIntensity) return 1;

  const m = Math.floor(agents);
  const a = trafficIntensity;

  const numerator = (Math.pow(a, m) / factorial(m)) * (m / (m - a));
  let denominator = 0;
  for (let k = 0; k < m; k++) {
    denominator += Math.pow(a, k) / factorial(k);
  }
  denominator += numerator;

  return Math.min(1, Math.max(0, numerator / denominator));
}

export function calculateStaffing(input: StaffingInput): StaffingResult {
  const { volume, aht, occupancyTarget, shrinkage, currentStaff, slaTarget, timeTarget } = input;

  if (volume <= 0 || aht <= 0) {
    return { staffRequired: 0, gap: 0, gapType: 'balanced', occupancyEstimated: 0, erlangSLA: 100 };
  }

  const workload = volume * aht;
  const capacity = 3600 * (occupancyTarget / 100);
  const rawStaff = capacity > 0 ? workload / capacity : 0;
  const shrinkageFactor = 1 - shrinkage / 100;
  let staffRequired = shrinkageFactor > 0 ? Math.ceil(rawStaff / shrinkageFactor) : 0;

  // Erlang C refinement: increase staff until SLA target is met
  const trafficIntensity = workload / 3600;
  let bestStaff = Math.max(staffRequired, Math.ceil(trafficIntensity) + 1);
  for (let s = bestStaff; s < bestStaff + 200; s++) {
    const pw = erlangC(s, trafficIntensity);
    const sla = (1 - pw * Math.exp(-(s - trafficIntensity) * (timeTarget / aht))) * 100;
    if (sla >= slaTarget) {
      bestStaff = s;
      break;
    }
  }

  const finalStaff = Math.max(staffRequired, Math.ceil(bestStaff / (shrinkageFactor || 1)));
  staffRequired = finalStaff;

  const gap = currentStaff - staffRequired;
  const gapType: 'deficit' | 'excess' | 'balanced' = gap < 0 ? 'deficit' : gap > 0 ? 'excess' : 'balanced';

  const actualCapacity = staffRequired * shrinkageFactor * 3600;
  const occupancyEstimated = actualCapacity > 0 ? Math.min(100, Math.round((workload / actualCapacity) * 1000) / 10) : 0;

  const pwFinal = erlangC(Math.floor(staffRequired * shrinkageFactor), trafficIntensity);
  const erlangSLA = Math.min(100, Math.round((1 - pwFinal * Math.exp(-(staffRequired * shrinkageFactor - trafficIntensity) * (timeTarget / aht))) * 1000) / 10);

  return { staffRequired, gap: Math.abs(gap), gapType, occupancyEstimated, erlangSLA: Math.max(0, erlangSLA) };
}
