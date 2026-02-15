import mongoose from "mongoose";
import User from "../models/User.js";
import PlanVersion from "../models/PlanVersion.js";
import CheckIn from "../models/CheckIn.js";
import { buildPlan } from "../services/plan.service.js";
import { buildProfileFromUser } from "../utils/buildProfileFromUser.js";
import { savePlanVersion } from "../services/planVersion.service.js";

function getUtcDayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getNextUtcDayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
}

/**
 * Handle generating a personalized plan based on user profile and optional check-in data.
 */
export async function generatePlan(req, res) {
  try {
    const { checkIn, source: requestedSource } = req.body || {};
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const profile = buildProfileFromUser(user);
    let effectiveCheckIn = checkIn ?? null;

    if (!effectiveCheckIn) {
      const dayStart = getUtcDayStart();
      const nextDayStart = getNextUtcDayStart();
      const latestTodayCheckIn = await CheckIn.findOne({
        userId: user._id,
        $or: [
          { checkInDate: { $gte: dayStart, $lt: nextDayStart } },
          { createdAt: { $gte: dayStart, $lt: nextDayStart } },
        ],
      })
        .sort({ createdAt: -1 })
        .select("energy mood symptoms");

      if (latestTodayCheckIn) {
        effectiveCheckIn = {
          energy: latestTodayCheckIn.energy ?? null,
          mood: latestTodayCheckIn.mood ?? null,
          symptoms: Array.isArray(latestTodayCheckIn.symptoms)
            ? latestTodayCheckIn.symptoms
            : [],
        };
      }
    }

    const plan = await buildPlan(profile, effectiveCheckIn);
    const allowedSources = new Set(["initial", "checkin", "profile_update"]);
    const source = allowedSources.has(requestedSource)
      ? requestedSource
      : effectiveCheckIn
        ? "checkin"
        : "initial";
    const planVersion = await savePlanVersion({
      user,
      plan,
      source,
      checkInSnapshot: effectiveCheckIn,
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

/**
 * Fetch a single historical plan version owned by the authenticated user.
 */
export async function getPlanVersionById(req, res) {
  try {
    const { id } = req.params || {};
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid plan version id" });
    }

    const versionDoc = await PlanVersion.findOne({ _id: id, userId: req.userId });
    if (!versionDoc) {
      return res.status(404).json({ error: "Plan version not found" });
    }

    const payload = versionDoc.plan?.plan && typeof versionDoc.plan.plan === "object"
      ? versionDoc.plan.plan
      : versionDoc.plan;

    return res.json({
      id: versionDoc._id,
      version: versionDoc.version,
      source: versionDoc.source,
      createdAt: versionDoc.createdAt,
      whyChanged: versionDoc.whyChanged || "",
      diffFromPrevious: versionDoc.diffFromPrevious || null,
      checkInSnapshot: versionDoc.checkInSnapshot || null,
      profileSnapshot: versionDoc.profileSnapshot || null,
      plan: payload || {},
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load plan version" });
  }
}
