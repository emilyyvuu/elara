import { computeCycleDay } from "./cycle.js";

/**
 * Build a user profile object from the user document.
 */
export function buildProfileFromUser(user) {
  const cycleDay = user.cycleTracking ? computeCycleDay(user.cycleDetails) : null;
  const bioContext = user.cycleTracking
    ? cycleDay
      ? `Day ${cycleDay} of Cycle`
      : "Cycle Tracking Enabled"
    : "General Focus";

  return {
    height: user.height ?? null,
    weight: user.weight ?? null,
    goals: user.goals || [],
    dietaryNeeds: user.dietaryNeeds || [],
    equipment: user.equipment || "None",
    cycleTracking: user.cycleTracking || false,
    cycleDetails: user.cycleDetails || null,
    bioContext,
  };
}
