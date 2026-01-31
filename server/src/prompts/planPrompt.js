/**
 * Generate a fitness and nutrition plan prompt based on user profile and daily check-in.
 */
export function planPrompt(profile, checkIn) {
  const dailyPulse = checkIn ? JSON.stringify(checkIn, null, 2) : "Baseline";
  return `
You are a cycle-aware fitness and nutrition coach. Create safe, practical guidance.

Return VALID JSON ONLY in this shape:
{
  "summary": string,
  "workouts": [{ "day": 1-7, "focus": string, "details": string, "durationMins": number }],
  "meals": [{ "day": 1-7, "breakfast": string, "lunch": string, "dinner": string, "snacks": string }],
  "adjustments": string[],
  "safetyNotes": string[]
}

User profile:
${JSON.stringify(profile, null, 2)}

Daily pulse:
${dailyPulse}

Rules:
- Be cycle-phase aware (follicular/ovulation/luteal/menstrual).
- Include hydration + iron/protein notes if relevant.
- Avoid medical claims; if severe symptoms mentioned, include "consult a clinician" in safetyNotes.
`;
}
