import CheckIn from "../models/CheckIn.js";
import PlanVersion from "../models/PlanVersion.js";

const RANGE_MAP = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function getUtcDayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getRangeStart(rangeDays, date = new Date()) {
  const dayStart = getUtcDayStart(date);
  dayStart.setUTCDate(dayStart.getUTCDate() - (rangeDays - 1));
  return dayStart;
}

function parseRangeDays(value) {
  if (typeof value !== "string") return RANGE_MAP["30d"];
  if (RANGE_MAP[value]) return RANGE_MAP[value];
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return RANGE_MAP["30d"];
  return Math.min(Math.max(Math.floor(parsed), 1), 365);
}

function checkInDate(checkIn) {
  return checkIn?.checkInDate || checkIn?.createdAt || null;
}

function isoDayKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
}

function averageNumeric(items, field) {
  const values = items
    .map((item) => item?.[field])
    .filter((value) => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

function computeCurrentStreakDays(checkIns) {
  const dayKeysDesc = [...new Set(checkIns.map((item) => isoDayKey(checkInDate(item))).filter(Boolean))]
    .sort((a, b) => (a > b ? -1 : 1));
  if (!dayKeysDesc.length) return 0;

  let streak = 1;
  let prevDate = new Date(`${dayKeysDesc[0]}T00:00:00.000Z`);

  for (let i = 1; i < dayKeysDesc.length; i += 1) {
    const currDate = new Date(`${dayKeysDesc[i]}T00:00:00.000Z`);
    const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays !== 1) break;
    streak += 1;
    prevDate = currDate;
  }

  return streak;
}

function topSymptoms(checkIns, limit = 5) {
  const counts = new Map();

  for (const checkIn of checkIns) {
    const symptoms = Array.isArray(checkIn?.symptoms) ? checkIn.symptoms : [];
    for (const symptomRaw of symptoms) {
      if (typeof symptomRaw !== "string") continue;
      const symptom = symptomRaw.trim().toLowerCase();
      if (!symptom) continue;
      counts.set(symptom, (counts.get(symptom) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([symptom, count]) => ({ symptom, count }));
}

/**
 * Return analytics summary metrics for the authenticated user.
 */
export async function getAnalyticsSummary(req, res) {
  try {
    const rangeDays = parseRangeDays(req.query?.range);
    const rangeLabel = typeof req.query?.range === "string" ? req.query.range : `${rangeDays}d`;
    const rangeStart = getRangeStart(rangeDays);
    const sevenDayStart = getRangeStart(7);

    const checkIns = await CheckIn.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("energy mood symptoms checkInDate createdAt")
      .lean();

    const checkInsInRange = checkIns.filter((item) => {
      const date = checkInDate(item);
      return date && new Date(date) >= rangeStart;
    });

    const checkInsLast7 = checkIns.filter((item) => {
      const date = checkInDate(item);
      return date && new Date(date) >= sevenDayStart;
    });

    const planUpdatesInRange = await PlanVersion.countDocuments({
      userId: req.userId,
      createdAt: { $gte: rangeStart },
    });

    return res.json({
      range: {
        label: rangeLabel,
        days: rangeDays,
        startsAt: rangeStart,
      },
      summary: {
        totalCheckIns: checkIns.length,
        checkInsInRange: checkInsInRange.length,
        currentStreakDays: computeCurrentStreakDays(checkIns),
        planUpdatesInRange,
        avgEnergyInRange: averageNumeric(checkInsInRange, "energy"),
        avgMoodInRange: averageNumeric(checkInsInRange, "mood"),
        avgEnergyLast7d: averageNumeric(checkInsLast7, "energy"),
        avgMoodLast7d: averageNumeric(checkInsLast7, "mood"),
      },
      topSymptomsInRange: topSymptoms(checkInsInRange, 5),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load analytics summary" });
  }
}
