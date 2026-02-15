/**
 * Compute the current day in the user's menstrual cycle.
 */
export function computeCycleDay(cycleDetails) {
  if (!cycleDetails?.lastPeriodDate || !cycleDetails?.avgCycleLength) return null;
  const last = new Date(cycleDetails.lastPeriodDate);
  if (Number.isNaN(last.getTime())) return null;
  const len = Number(cycleDetails.avgCycleLength);
  if (!Number.isFinite(len) || len <= 0) return null;

  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  if (diffMs < 0) return null;

  const day = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  const normalized = ((day - 1) % len) + 1;
  return normalized;
}

/**
 * Estimate cycle phase using cycle day and average cycle length.
 */
export function computeCyclePhase(cycleDetails) {
  const cycleDay = computeCycleDay(cycleDetails);
  if (!cycleDay) return null;

  const len = Number(cycleDetails?.avgCycleLength);
  if (!Number.isFinite(len) || len <= 0) return null;

  const menstrualEnd = Math.min(5, len);
  const ovulationDay = Math.max(1, Math.min(len, len - 14));
  const ovulationStart = Math.max(menstrualEnd + 1, ovulationDay - 1);
  const ovulationEnd = Math.min(len, ovulationDay + 1);

  if (cycleDay <= menstrualEnd) return "Menstrual";
  if (cycleDay < ovulationStart) return "Follicular";
  if (cycleDay <= ovulationEnd) return "Ovulatory";
  return "Luteal";
}
