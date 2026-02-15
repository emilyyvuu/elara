import { computeCycleDay, computeCyclePhase } from "./cycle.js";

/**
 * Build a user profile object from the user document.
 */
export function buildProfileFromUser(user) {
  const cycleDay = user.cycleTracking ? computeCycleDay(user.cycleDetails) : null;
  const cyclePhase = user.cycleTracking ? computeCyclePhase(user.cycleDetails) : null;
  const cycleLength = Number(user?.cycleDetails?.avgCycleLength) || null;
  const bioContext = user.cycleTracking
    ? cycleDay && cyclePhase && cycleLength
      ? `${cyclePhase} phase (Day ${cycleDay} of ${cycleLength}-day cycle)`
      : "Cycle tracking enabled, but phase data is incomplete"
    : "General Focus";

  return {
    height: user.height ?? null,
    weight: user.weight ?? null,
    goals: user.goals || [],
    dietaryNeeds: user.dietaryNeeds || [],
    equipment: user.equipment || "None",
    cycleTracking: user.cycleTracking || false,
    cycleDetails: user.cycleDetails || null,
    cycleDay,
    cyclePhase,
    bioContext,
  };
}
