import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProfile, updateProfile } from "../api/profileApi";
import { generatePlan } from "../api/planApi";
import LogoutButton from "../components/LogoutButton";
import "../styles/appPages.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [unitSystem, setUnitSystem] = useState("metric");
  const [form, setForm] = useState({
    fullName: "",
    height: "",
    weight: "",
    heightFeet: "",
    heightInches: "",
    goalsText: "",
    dietaryNeedsText: "",
    equipment: "None",
    cycleTracking: false,
    lastPeriodDate: "",
    avgCycleLength: "28",
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
          avgCycleLength: user.cycleDetails?.avgCycleLength
            ? String(user.cycleDetails.avgCycleLength)
            : "28",
          heightFeet: "",
          heightInches: "",
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

  const toggleUnits = () => {
    setForm((prev) => {
      if (unitSystem === "metric") {
        const totalInches = prev.height ? Number(prev.height) / 2.54 : 0;
        const feet = Math.floor(totalInches / 12);
        const inches = totalInches ? (totalInches % 12).toFixed(1) : "";
        const weightLb = prev.weight ? (Number(prev.weight) * 2.20462).toFixed(1) : "";
        return {
          ...prev,
          heightFeet: totalInches ? String(feet) : "",
          heightInches: inches,
          weight: weightLb,
        };
      }

      const feet = Number(prev.heightFeet) || 0;
      const inches = Number(prev.heightInches) || 0;
      const heightCm = feet || inches ? ((feet * 12 + inches) * 2.54).toFixed(1) : "";
      const weightKg = prev.weight ? (Number(prev.weight) / 2.20462).toFixed(1) : "";
      return { ...prev, height: heightCm, weight: weightKg };
    });

    setUnitSystem((prev) => (prev === "metric" ? "imperial" : "metric"));
  };

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
    const weightValue = form.weight ? Number(form.weight) : null;
    const imperialHeightInches =
      (Number(form.heightFeet) || 0) * 12 + (Number(form.heightInches) || 0);
    const avgCycleLength = form.avgCycleLength ? Number(form.avgCycleLength) : null;

    if (form.cycleTracking) {
      if (!form.lastPeriodDate) {
        setLoading(false);
        setStatus("Please add your last period start date to keep cycle sync enabled.");
        return;
      }
      if (!avgCycleLength || avgCycleLength < 15 || avgCycleLength > 45) {
        setLoading(false);
        setStatus("Average cycle length should be a number between 15 and 45 days.");
        return;
      }
    }

    const payload = {
      firstName: firstName || "",
      lastName,
      height: unitSystem === "imperial"
        ? imperialHeightInches
          ? Number((imperialHeightInches * 2.54).toFixed(1))
          : null
        : form.height
          ? Number(form.height)
          : null,
      weight: unitSystem === "imperial" && weightValue != null
        ? Number((weightValue / 2.20462).toFixed(1))
        : weightValue,
      goals,
      dietaryNeeds,
      equipment: form.equipment,
      cycleTracking: form.cycleTracking,
      cycleDetails: form.cycleTracking
        ? {
          lastPeriodDate: form.lastPeriodDate || null,
          avgCycleLength,
        }
        : null,
    };

    try {
      await updateProfile(payload);
      await generatePlan(null, "profile_update");
      setStatus("Profile updated. Plan refreshed.");
    } catch (err) {
      setStatus(err?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container scrollable-page">
      <div className="page-card scrollable-card">
        <div className="page-top-actions">
          <Link className="btn primary" to="/dashboard">
            Dashboard
          </Link>
          <LogoutButton />
        </div>
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
            <label className="label-row">
              Height ({unitSystem === "metric" ? "cm" : "ft / in"})
              <span className="toggle-switch">
                <span>cm/kg</span>
                <input
                  type="checkbox"
                  checked={unitSystem === "imperial"}
                  onChange={toggleUnits}
                />
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
                <span>ft/lb</span>
              </span>
            </label>
            {unitSystem === "metric" ? (
              <input
                id="height"
                type="number"
                value={form.height}
                onChange={(e) => update("height", e.target.value)}
              />
            ) : (
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <input
                  id="heightFeet"
                  type="number"
                  placeholder="ft"
                  value={form.heightFeet}
                  onChange={(e) => update("heightFeet", e.target.value)}
                />
                <input
                  id="heightInches"
                  type="number"
                  placeholder="in"
                  value={form.heightInches}
                  onChange={(e) => update("heightInches", e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="form-row">
            <label htmlFor="weight">Weight ({unitSystem === "metric" ? "kg" : "lb"})</label>
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
            <>
              <div className="form-row">
                <label htmlFor="lastPeriodDate">Last period start date</label>
                <input
                  id="lastPeriodDate"
                  type="date"
                  value={form.lastPeriodDate}
                  onChange={(e) => update("lastPeriodDate", e.target.value)}
                />
              </div>
              <div className="form-row">
                <label htmlFor="avgCycleLength">Average cycle length (days)</label>
                <input
                  id="avgCycleLength"
                  type="number"
                  min="15"
                  max="45"
                  value={form.avgCycleLength}
                  onChange={(e) => update("avgCycleLength", e.target.value)}
                />
              </div>
            </>
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
