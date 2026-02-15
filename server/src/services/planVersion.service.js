import PlanVersion from "../models/PlanVersion.js";
import { buildProfileFromUser } from "../utils/buildProfileFromUser.js";
import { buildPlanDiff } from "./planDiff.service.js";
import { buildWhyChanged } from "./whyChanged.service.js";

const MAX_RETRIES = 3;

/**
 * Create and persist the next plan version for a user.
 * Retries on version collisions to handle concurrent writes safely.
 */
export async function savePlanVersion({
  user,
  plan,
  source,
  checkInSnapshot = null,
}) {
  const userId = user?._id;
  if (!userId) {
    throw new Error("savePlanVersion requires a user with an _id");
  }

  if (!plan || typeof plan !== "object") {
    throw new Error("savePlanVersion requires a plan object");
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const latest = await PlanVersion.findOne({ userId })
      .sort({ version: -1 })
      .select("version plan checkInSnapshot");
    const nextVersion = (latest?.version ?? 0) + 1;
    const diffFromPrevious = latest?.plan ? buildPlanDiff(latest.plan, plan) : null;
    const whyChanged = buildWhyChanged({
      source,
      diff: diffFromPrevious,
      previousCheckInSnapshot: latest?.checkInSnapshot ?? null,
      currentCheckInSnapshot: checkInSnapshot,
    });

    try {
      const planVersion = await PlanVersion.create({
        userId,
        version: nextVersion,
        source,
        plan,
        checkInSnapshot,
        profileSnapshot: buildProfileFromUser(user),
        diffFromPrevious,
        whyChanged,
      });

      user.currentPlan = plan;
      user.currentPlanVersionId = planVersion._id;
      await user.save();

      return planVersion;
    } catch (err) {
      // Duplicate key means another request got the same version number first.
      if (err?.code === 11000 && attempt < MAX_RETRIES - 1) {
        continue;
      }
      throw err;
    }
  }

  throw new Error("Failed to create a unique plan version");
}
