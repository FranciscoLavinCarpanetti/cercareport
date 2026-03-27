export interface SimulationInput {
  currentStaff: number;
  currentVolume: number;
  currentAHT: number;
  currentWT: number;
  newStaff: number;
  newVolume: number;
  newAHT: number;
  shiftHours?: number;
}

export interface SimulationResult {
  simulatedWT: number;
  occupancy: number;
  wtDelta: number;
  occupancyDelta: number;
  status: 'ok' | 'alert' | 'critical';
}

export function simulateCapacity(input: SimulationInput): SimulationResult {
  const { currentStaff, currentVolume, currentAHT, currentWT, newStaff, newVolume, newAHT, shiftHours = 8 } = input;

  if (currentVolume <= 0 || currentStaff <= 0 || newStaff <= 0) {
    return { simulatedWT: 0, occupancy: 0, wtDelta: 0, occupancyDelta: 0, status: 'ok' };
  }

  const volumeRatio = newVolume / currentVolume;
  const staffRatio = currentStaff / newStaff;
  const ahtRatio = newAHT / (currentAHT || 1);

  const simulatedWT = Math.max(0, Math.round(currentWT * volumeRatio * staffRatio * ahtRatio));

  const capacitySeconds = shiftHours * 3600;
  const currentWorkload = currentVolume * currentAHT;
  const currentCapacity = currentStaff * capacitySeconds;
  const currentOccupancy = currentCapacity > 0 ? (currentWorkload / currentCapacity) * 100 : 0;

  const newWorkload = newVolume * newAHT;
  const newCapacity = newStaff * capacitySeconds;
  const occupancy = Math.min(100, newCapacity > 0 ? (newWorkload / newCapacity) * 100 : 0);

  const wtDelta = currentWT > 0 ? ((simulatedWT - currentWT) / currentWT) * 100 : 0;
  const occupancyDelta = currentOccupancy > 0 ? occupancy - currentOccupancy : 0;

  let status: 'ok' | 'alert' | 'critical' = 'ok';
  if (simulatedWT > 60 || occupancy > 90) status = 'critical';
  else if (simulatedWT > 30 || occupancy > 80) status = 'alert';

  return { simulatedWT, occupancy: Math.round(occupancy * 10) / 10, wtDelta: Math.round(wtDelta * 10) / 10, occupancyDelta: Math.round(occupancyDelta * 10) / 10, status };
}
