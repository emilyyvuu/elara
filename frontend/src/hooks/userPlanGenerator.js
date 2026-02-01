import { useState } from "react";
import { generatePlan } from "../api/planApi";
import { updateProfile } from "../api/profileApi";

export function userPlanGenerator() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(payload) {
    setLoading(true);
    setError("");
    try {
      const profile = payload?.profile || {};
      const checkIn = payload?.checkIn || null;
      await updateProfile(profile);
      const result = await generatePlan(checkIn);
      setData(result);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, run };
}
export default userPlanGenerator;
