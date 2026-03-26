export interface StaffingInput {
  volume: number;
  aht: number;
  slaTarget: number;
  timeTarget: number;
  occupancyTarget: number;
  shrinkage: number;
  currentStaff: number;
  shiftHours: number;
}

export interface StaffingResult {
  staffRequired: number;
  gap: number;
  gapType: 'deficit' | 'excess' | 'balanced';
  occupancyEstimated: number;
  erlangSLA: number;
  // Breakdown for debug/display
  workloadSeconds: number;
  workloadHours: number;
  productiveHoursPerAgent: number;
  staffBase: number;
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
  const { volume, aht, occupancyTarget, shrinkage, currentStaff, shiftHours } = input;

  const emptyResult: StaffingResult = {
    staffRequired: 0, gap: 0, gapType: 'balanced',
    occupancyEstimated: 0, erlangSLA: 100,
    workloadSeconds: 0, workloadHours: 0, productiveHoursPerAgent: 0, staffBase: 0,
  };

  if (volume <= 0 || aht <= 0 || shiftHours <= 0) return emptyResult;

  // Step 1: Total daily workload in seconds
  const workloadSeconds = volume * aht;

  // Step 2: Convert to hours
  const workloadHours = workloadSeconds / 3600;

  // Step 3: Productive hours per agent per day
  const occupancyFraction = occupancyTarget / 100;
  const productiveHoursPerAgent = shiftHours * occupancyFraction;

  if (productiveHoursPerAgent <= 0) return emptyResult;

  // Step 4: Base staff
  const staffBase = workloadHours / productiveHoursPerAgent;

  // Step 5: Adjust for shrinkage
  const shrinkageFraction = shrinkage / 100;
  const shrinkageFactor = 1 - shrinkageFraction;
  const staffRequired = shrinkageFactor > 0 ? Math.ceil(staffBase / shrinkageFactor) : 0;

  // Gap
  const gap = currentStaff - staffRequired;
  const gapType: 'deficit' | 'excess' | 'balanced' = gap < 0 ? 'deficit' : gap > 0 ? 'excess' : 'balanced';

  // Occupancy estimated with the calculated staff
  const totalAvailableHours = staffRequired * shrinkageFactor * shiftHours;
  const occupancyEstimated = totalAvailableHours > 0
    ? Math.min(100, Math.round((workloadHours / totalAvailableHours) * 1000) / 10)
    : 0;

  // Erlang C SLA (hourly model: peak hour approximation)
  // Distribute volume across shift hours for peak-hour Erlang calculation
  const hourlyVolume = volume / shiftHours;
  const trafficIntensity = (hourlyVolume * aht) / 3600;
  const agentsPerHour = Math.floor(staffRequired * shrinkageFactor);
  const pw = erlangC(agentsPerHour, trafficIntensity);
  const erlangSLA = agentsPerHour > trafficIntensity
    ? Math.min(100, Math.round((1 - pw * Math.exp(-(agentsPerHour - trafficIntensity) * (input.timeTarget / aht))) * 1000) / 10)
    : 0;

  return {
    staffRequired,
    gap: Math.abs(gap),
    gapType,
    occupancyEstimated,
    erlangSLA: Math.max(0, erlangSLA),
    workloadSeconds,
    workloadHours: Math.round(workloadHours * 10) / 10,
    productiveHoursPerAgent: Math.round(productiveHoursPerAgent * 10) / 10,
    staffBase: Math.round(staffBase * 10) / 10,
  };
}
