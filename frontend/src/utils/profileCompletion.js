export function isProfileComplete(user) {
  if (!user) return false;
  const hasName = Boolean((user.firstName || "").trim() || (user.lastName || "").trim());
  const hasGoals = Array.isArray(user.goals) && user.goals.length > 0;
  const hasEquipment = Boolean(user.equipment);
  const cycleOk = user.cycleTracking
    ? Boolean(user.cycleDetails?.lastPeriodDate)
    : true;
  return hasName && hasGoals && hasEquipment && cycleOk;
}
