// Interval-based Erlang C staffing engine

export interface IntervalData {
  hour: string;    // "HH:mm"
  calls: number;
}

export interface StaffingParams {
  aht: number;          // seconds
  slaTarget: number;    // % (e.g. 80)
  timeTarget: number;   // seconds (e.g. 30)
  shrinkage: number;    // % (e.g. 20)
  intervalMinutes: number; // typically 60
}

export interface IntervalResult {
  hour: string;
  calls: number;
  erlangs: number;
  staffRequired: number;
  sla: number;
  occupancy: number;
  pw: number;
}

export interface StaffingResult {
  intervals: IntervalResult[];
  peakStaff: number;
  peakHour: string;
  avgStaff: number;
  weightedSLA: number;
  totalCalls: number;
  avgOccupancy: number;
}

// Memoized factorial with BigInt-like approach for large N
const factorialCache = new Map<number, number>();
function factorial(n: number): number {
  if (n <= 1) return 1;
  if (factorialCache.has(n)) return factorialCache.get(n)!;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  factorialCache.set(n, result);
  return result;
}

// Erlang C probability using log-space to avoid overflow
function erlangCPw(agents: number, erlangs: number): number {
  if (agents <= 0 || erlangs <= 0) return 0;
  if (agents <= erlangs) return 1;

  const N = Math.floor(agents);
  const A = erlangs;

  // Use log-space for numerical stability
  // log(A^N / N!) = N*ln(A) - ln(N!)
  const logNumerator = N * Math.log(A) - logFactorial(N) + Math.log(N / (N - A));

  let logDenomSum = -Infinity; // log of sum of terms
  for (let k = 0; k < N; k++) {
    const logTerm = k * Math.log(A) - logFactorial(k);
    logDenomSum = logSumExp(logDenomSum, logTerm);
  }
  logDenomSum = logSumExp(logDenomSum, logNumerator);

  const pw = Math.exp(logNumerator - logDenomSum);
  return Math.min(1, Math.max(0, pw));
}

const logFactorialCache = new Map<number, number>();
function logFactorial(n: number): number {
  if (n <= 1) return 0;
  if (logFactorialCache.has(n)) return logFactorialCache.get(n)!;
  let result = 0;
  for (let i = 2; i <= n; i++) result += Math.log(i);
  logFactorialCache.set(n, result);
  return result;
}

function logSumExp(a: number, b: number): number {
  if (a === -Infinity) return b;
  if (b === -Infinity) return a;
  const max = Math.max(a, b);
  return max + Math.log(Math.exp(a - max) + Math.exp(b - max));
}

function calculateSLA(agents: number, erlangs: number, aht: number, timeTarget: number): number {
  if (agents <= erlangs) return 0;
  const pw = erlangCPw(agents, erlangs);
  const sla = 1 - pw * Math.exp(-(agents - erlangs) * (timeTarget / aht));
  return Math.min(1, Math.max(0, sla));
}

function calculateOccupancy(erlangs: number, agents: number): number {
  if (agents <= 0) return 0;
  return Math.min(100, (erlangs / agents) * 100);
}

/**
 * For a single interval, find the minimum agents needed to meet SLA target.
 * Uses binary search + iteration with a max cap.
 */
function findMinAgents(
  erlangs: number,
  aht: number,
  slaTarget: number,  // as fraction 0-1
  timeTarget: number,
  maxAgents: number = 500
): { agents: number; sla: number; pw: number } {
  if (erlangs <= 0) return { agents: 0, sla: 1, pw: 0 };

  const minAgents = Math.ceil(erlangs) + 1;

  // Binary search
  let lo = minAgents;
  let hi = Math.max(minAgents, maxAgents);

  // Quick check: if even maxAgents can't meet SLA, return maxAgents
  const slaAtMax = calculateSLA(hi, erlangs, aht, timeTarget);
  if (slaAtMax < slaTarget) {
    return { agents: hi, sla: Math.round(slaAtMax * 1000) / 10, pw: erlangCPw(hi, erlangs) };
  }

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const sla = calculateSLA(mid, erlangs, aht, timeTarget);
    if (sla >= slaTarget) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  const finalSla = calculateSLA(lo, erlangs, aht, timeTarget);
  const finalPw = erlangCPw(lo, erlangs);
  return { agents: lo, sla: Math.round(finalSla * 1000) / 10, pw: finalPw };
}

export function calculateIntervalStaffing(
  intervals: IntervalData[],
  params: StaffingParams
): StaffingResult {
  const { aht, slaTarget, timeTarget, shrinkage, intervalMinutes } = params;
  const slaFraction = slaTarget / 100;
  const shrinkageFactor = 1 - shrinkage / 100;
  const intervalSeconds = intervalMinutes * 60;

  const results: IntervalResult[] = intervals.map(({ hour, calls }) => {
    if (calls <= 0 || aht <= 0) {
      return { hour, calls, erlangs: 0, staffRequired: 0, sla: 100, occupancy: 0, pw: 0 };
    }

    const erlangs = (calls * aht) / intervalSeconds;
    const { agents: rawAgents, sla, pw } = findMinAgents(erlangs, aht, slaFraction, timeTarget);

    // Adjust for shrinkage
    const staffRequired = shrinkageFactor > 0 ? Math.ceil(rawAgents / shrinkageFactor) : 0;
    const occupancy = calculateOccupancy(erlangs, rawAgents);

    return { hour, calls, erlangs: Math.round(erlangs * 100) / 100, staffRequired, sla, occupancy: Math.round(occupancy * 10) / 10, pw };
  });

  const totalCalls = results.reduce((s, r) => s + r.calls, 0);
  const intervalsWithCalls = results.filter(r => r.calls > 0);
  const peakInterval = results.reduce((max, r) => r.staffRequired > max.staffRequired ? r : max, results[0]);

  const weightedSLA = totalCalls > 0
    ? Math.round(results.reduce((s, r) => s + r.sla * r.calls, 0) / totalCalls * 10) / 10
    : 0;

  const avgStaff = intervalsWithCalls.length > 0
    ? Math.round(intervalsWithCalls.reduce((s, r) => s + r.staffRequired, 0) / intervalsWithCalls.length * 10) / 10
    : 0;

  const avgOccupancy = intervalsWithCalls.length > 0
    ? Math.round(intervalsWithCalls.reduce((s, r) => s + r.occupancy, 0) / intervalsWithCalls.length * 10) / 10
    : 0;

  return {
    intervals: results,
    peakStaff: peakInterval?.staffRequired ?? 0,
    peakHour: peakInterval?.hour ?? '',
    avgStaff,
    weightedSLA,
    totalCalls,
    avgOccupancy,
  };
}

/**
 * Generate default 24h intervals with uniform distribution from daily volume
 */
export function generateDefaultIntervals(dailyVolume: number, startHour = 0, endHour = 24): IntervalData[] {
  const hours = endHour - startHour;
  const perHour = Math.round(dailyVolume / hours);
  const intervals: IntervalData[] = [];
  for (let h = startHour; h < endHour; h++) {
    intervals.push({
      hour: `${String(h).padStart(2, '0')}:00`,
      calls: perHour,
    });
  }
  return intervals;
}
