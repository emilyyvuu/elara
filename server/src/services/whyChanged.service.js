function numericOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function describeCheckInChanges(previousCheckIn, currentCheckIn) {
  if (!currentCheckIn || typeof currentCheckIn !== "object") return null;
  if (!previousCheckIn || typeof previousCheckIn !== "object") {
    return "This version reflects your latest check-in inputs.";
  }

  const reasons = [];

  const prevEnergy = numericOrNull(previousCheckIn.energy);
  const currEnergy = numericOrNull(currentCheckIn.energy);
  if (prevEnergy != null && currEnergy != null && prevEnergy !== currEnergy) {
    const direction = currEnergy > prevEnergy ? "increased" : "decreased";
    reasons.push(`Energy ${direction} (${prevEnergy} to ${currEnergy}).`);
  }

  const prevMood = numericOrNull(previousCheckIn.mood);
  const currMood = numericOrNull(currentCheckIn.mood);
  if (prevMood != null && currMood != null && prevMood !== currMood) {
    const direction = currMood > prevMood ? "improved" : "dropped";
    reasons.push(`Mood ${direction} (${prevMood} to ${currMood}).`);
  }

  const prevSymptoms = Array.isArray(previousCheckIn.symptoms) ? previousCheckIn.symptoms : [];
  const currSymptoms = Array.isArray(currentCheckIn.symptoms) ? currentCheckIn.symptoms : [];
  const addedSymptoms = currSymptoms.filter((symptom) => !prevSymptoms.includes(symptom));
  if (addedSymptoms.length) {
    reasons.push(`New symptoms reported: ${addedSymptoms.slice(0, 3).join(", ")}.`);
  }

  if (!reasons.length) return null;
  return reasons.join(" ");
}

/**
 * Build a deterministic explanation for how and why a plan version changed.
 */
export function buildWhyChanged({
  source,
  diff,
  previousCheckInSnapshot,
  currentCheckInSnapshot,
}) {
  const summaryParts = [];
  const changedCount = Array.isArray(diff?.changedFields) ? diff.changedFields.length : 0;

  if (source === "initial") {
    summaryParts.push("Initial generated plan from baseline profile data.");
  } else if (source === "profile_update") {
    summaryParts.push("Plan refreshed after profile settings changed.");
  } else if (source === "checkin") {
    summaryParts.push("Plan refreshed from check-in data.");
  }

  const checkInReason = describeCheckInChanges(previousCheckInSnapshot, currentCheckInSnapshot);
  if (checkInReason) {
    summaryParts.push(checkInReason);
  }

  if (changedCount === 0) {
    summaryParts.push("No major structural plan changes were detected.");
  } else {
    summaryParts.push(`${changedCount} plan field(s) changed from the previous version.`);
  }

  return summaryParts.join(" ").trim();
}
