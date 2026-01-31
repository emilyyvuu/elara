import User from "../models/User.js";
import { buildPlan } from "../services/plan.service.js";

export async function generatePlan(req, res) {
  try {
    const { checkIn } = req.body || {};
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const profile = {
      height: user.height ?? null,
      weight: user.weight ?? null,
      goals: user.goals || [],
      equipment: user.equipment || "None",
      cycleTracking: user.cycleTracking || false,
      cycleDetails: user.cycleDetails || null,
    };

    const plan = await buildPlan(profile, checkIn);
    user.currentPlan = plan;
    await user.save();

    return res.json(plan);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate plan" });
  }
}
