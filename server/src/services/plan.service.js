import { planPrompt } from "../prompts/planPrompt.js";
import { generateJson } from "./gemini.service.js";

/**
 * Build a personalized fitness and nutrition plan based on user profile and daily check-in.
 */
export async function buildPlan(profile, checkIn) {
  const prompt = planPrompt(profile, checkIn);
  const model = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";

  const text = await generateJson(model, prompt);

  // Try to parse JSON safely
  const parsed = safeJsonParse(text);

  // If parsing fails, return raw text as a backup for the demo
  if (!parsed) {
    return {
      summary: "Generated plan (raw)",
      raw: text,
      workouts: [],
      meals: [],
      adjustments: [],
      safetyNotes: ["Response was not valid JSON; showing raw output."],
    };
  }

  return parsed;
}

function safeJsonParse(s) {
  try {
    // Common hack: strip ```json fences if the model adds them
    const cleaned = s.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
