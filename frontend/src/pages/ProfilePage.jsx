import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../api/profileApi";
import { generatePlan } from "../api/planApi";
import "../styles/appPages.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    height: "",
    weight: "",
    goalsText: "",
    dietaryNeedsText: "",
    equipment: "None",
    cycleTracking: false,
    lastPeriodDate: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { user } = await getProfile();
        if (!mounted) return;
        setForm({
          fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          height: user.height ?? "",
          weight: user.weight ?? "",
          goalsText: Array.isArray(user.goals) ? user.goals.join(", ") : "",
          dietaryNeedsText: Array.isArray(user.dietaryNeeds)
            ? user.dietaryNeeds.join(", ")
            : "",
          equipment: user.equipment || "None",
          cycleTracking: user.cycleTracking || false,
          lastPeriodDate: user.cycleDetails?.lastPeriodDate
            ? String(user.cycleDetails.lastPeriodDate).slice(0, 10)
            : "",
        });
      } catch (err) {
        navigate("/login");
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const [firstName, ...rest] = form.fullName.trim().split(/\s+/);
    const lastName = rest.join(" ");
    const goals = form.goalsText.split(",").map((g) => g.trim()).filter(Boolean);
    const dietaryNeeds = form.dietaryNeedsText
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    const payload = {
      firstName: firstName || "",
      lastName,
      height: form.height ? Number(form.height) : null,
      weight: form.weight ? Number(form.weight) : null,
      goals,
      dietaryNeeds,
      equipment: form.equipment,
      cycleTracking: form.cycleTracking,
      cycleDetails: form.cycleTracking
        ? { lastPeriodDate: form.lastPeriodDate || null }
        : null,
    };

    try {
      await updateProfile(payload);
      await generatePlan(null);
      setStatus("Profile updated. Plan refreshed.");
    } catch (err) {
      setStatus(err?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Update your baseline settings.</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="height">Height (cm)</label>
            <input
              id="height"
              type="number"
              value={form.height}
              onChange={(e) => update("height", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              id="weight"
              type="number"
              value={form.weight}
              onChange={(e) => update("weight", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="goalsText">Fitness goals</label>
            <input
              id="goalsText"
              value={form.goalsText}
              onChange={(e) => update("goalsText", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="dietaryNeedsText">Dietary needs</label>
            <input
              id="dietaryNeedsText"
              value={form.dietaryNeedsText}
              onChange={(e) => update("dietaryNeedsText", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="equipment">Gym access</label>
            <select
              id="equipment"
              value={form.equipment}
              onChange={(e) => update("equipment", e.target.value)}
            >
              <option value="None">None</option>
              <option value="Home">Home</option>
              <option value="Gym">Gym</option>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="cycleTracking">Cycle sync</label>
            <select
              id="cycleTracking"
              value={form.cycleTracking ? "yes" : "no"}
              onChange={(e) => update("cycleTracking", e.target.value === "yes")}
            >
              <option value="no">Not now</option>
              <option value="yes">Sync my plan</option>
            </select>
          </div>
          {form.cycleTracking ? (
            <div className="form-row">
              <label htmlFor="lastPeriodDate">Last period start date</label>
              <input
                id="lastPeriodDate"
                type="date"
                value={form.lastPeriodDate}
                onChange={(e) => update("lastPeriodDate", e.target.value)}
              />
            </div>
          ) : null}
          {status ? <p>{status}</p> : null}
          <div className="form-actions">
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
