function numericOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function describeChangedAreas(diff) {
  const changed = Array.isArray(diff?.changedFields) ? diff.changedFields : [];
  const areas = [];

  if (changed.some((field) => field.startsWith("workout"))) {
    areas.push("workout recommendations");
  }
  if (changed.some((field) => field.startsWith("nutrition"))) {
    areas.push("meal recommendations");
  }
  if (changed.some((field) => field === "insight")) {
    areas.push("daily insight");
  }

  if (areas.length === 0) return "";
  if (areas.length === 1) return `We updated your ${areas[0]}.`;
  if (areas.length === 2) return `We updated your ${areas[0]} and ${areas[1]}.`;
  return `We updated your ${areas[0]}, ${areas[1]}, and ${areas[2]}.`;
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

  if (source === "initial") {
    summaryParts.push("Initial generated plan from baseline profile data.");
  } else if (source === "profile_update") {
    summaryParts.push("Your plan was refreshed after profile updates.");
  } else if (source === "checkin") {
    summaryParts.push("Your plan was refreshed from your daily check-in.");
  }

  const checkInReason = describeCheckInChanges(previousCheckInSnapshot, currentCheckInSnapshot);
  if (checkInReason) {
    summaryParts.push(checkInReason);
  }

  const changedAreaMessage = describeChangedAreas(diff);
  if (changedAreaMessage) {
    summaryParts.push(changedAreaMessage);
  } else if (source !== "initial") {
    summaryParts.push("Your plan stayed close to the previous version.");
  }

  return summaryParts.join(" ").trim();
}
