import User from "../models/User.js";
import PlanVersion from "../models/PlanVersion.js";
import { buildPlan } from "../services/plan.service.js";
import { buildProfileFromUser } from "../utils/buildProfileFromUser.js";
import { savePlanVersion } from "../services/planVersion.service.js";

/**
 * Handle generating a personalized plan based on user profile and optional check-in data.
 */
export async function generatePlan(req, res) {
  try {
    const { checkIn } = req.body || {};
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const profile = buildProfileFromUser(user);

    const plan = await buildPlan(profile, checkIn);
    const source = checkIn ? "checkin" : "initial";
    const planVersion = await savePlanVersion({
      user,
      plan,
      source,
      checkInSnapshot: checkIn ?? null,
    });

    return res.json({
      ...plan,
      metadata: {
        planVersionId: planVersion._id,
        planVersion: planVersion.version,
        source: planVersion.source,
        generatedAt: planVersion.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate plan" });
  }
}

/**
 * List historical plan versions for the authenticated user.
 * Supports simple cursor pagination via `beforeVersion`.
 */
export async function listPlanHistory(req, res) {
  try {
    const limitRaw = Number(req.query?.limit ?? 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 10;

    const beforeVersionRaw = req.query?.beforeVersion;
    const beforeVersion = beforeVersionRaw != null ? Number(beforeVersionRaw) : null;

    const filter = { userId: req.userId };
    if (beforeVersion != null && Number.isFinite(beforeVersion)) {
      filter.version = { $lt: beforeVersion };
    }

    const versions = await PlanVersion.find(filter)
      .sort({ version: -1 })
      .limit(limit + 1)
      .select("version source createdAt whyChanged diffFromPrevious plan");

    const hasMore = versions.length > limit;
    const slice = hasMore ? versions.slice(0, limit) : versions;

    const items = slice.map((versionDoc) => {
      const payload = versionDoc.plan?.plan && typeof versionDoc.plan.plan === "object"
        ? versionDoc.plan.plan
        : versionDoc.plan;

      return {
        id: versionDoc._id,
        version: versionDoc.version,
        source: versionDoc.source,
        createdAt: versionDoc.createdAt,
        whyChanged: versionDoc.whyChanged || "",
        changedFields: versionDoc.diffFromPrevious?.changedFields || [],
        preview: {
          workoutTitle: payload?.workout?.title || "",
          nutritionFocus: payload?.nutrition?.focus || "",
          insight: payload?.insight || "",
        },
      };
    });

    const nextCursor = hasMore ? String(slice[slice.length - 1].version) : null;

    return res.json({
      items,
      pageInfo: {
        hasMore,
        nextCursor,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load plan history" });
  }
}
