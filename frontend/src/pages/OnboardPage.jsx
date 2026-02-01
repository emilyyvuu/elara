import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../api/profileApi";
import { generatePlan } from "../api/planApi";
import "../styles/appPages.css";

const steps = ["Basic stats", "Goals & environment", "Bio-toggle"];

export default function OnboardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    height: "",
    weight: "",
    heightFeet: "",
    heightInches: "",
    goalsText: "",
    dietaryNeedsText: "",
    equipment: "None",
    cycleTracking: false,
    lastPeriodDate: "",
  });
  const [unitSystem, setUnitSystem] = useState("metric");

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

  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleFinish = async (event) => {
    event.preventDefault();
    setLoading(true);

    const goals = form.goalsText.split(",").map((g) => g.trim()).filter(Boolean);
    const dietaryNeeds = form.dietaryNeedsText
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    const heightValue = form.height ? Number(form.height) : null;
    const weightValue = form.weight ? Number(form.weight) : null;
    const imperialHeightInches =
      (Number(form.heightFeet) || 0) * 12 + (Number(form.heightInches) || 0);
    const height = unitSystem === "imperial"
      ? imperialHeightInches
        ? Number((imperialHeightInches * 2.54).toFixed(1))
        : null
      : heightValue;
    const weight = unitSystem === "imperial" && weightValue != null
      ? Number((weightValue / 2.20462).toFixed(1))
      : weightValue;

    const payload = {
      height,
      weight,
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
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h1 className="page-title">Onboarding</h1>
        <p className="page-subtitle">
          Step {step + 1} of {steps.length}: {steps[step]}
        </p>
        <form className="form-grid" onSubmit={handleFinish}>
          {step === 0 ? (
            <>
              <div className="form-row">
                <label className="label-row">
                  Height ({unitSystem === "metric" ? "cm" : "ft / in"}) (optional)
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
                <label htmlFor="weight">
                  Weight ({unitSystem === "metric" ? "kg" : "lb"}) (optional)
                </label>
                <input
                  id="weight"
                  type="number"
                  value={form.weight}
                  onChange={(e) => update("weight", e.target.value)}
                />
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="form-row">
                <label htmlFor="goalsText">Fitness goals (comma separated)</label>
                <input
                  id="goalsText"
                  value={form.goalsText}
                  onChange={(e) => update("goalsText", e.target.value)}
                  placeholder="Strength, fat loss"
                />
              </div>
              <div className="form-row">
                <label htmlFor="dietaryNeedsText">Dietary needs (comma separated)</label>
                <input
                  id="dietaryNeedsText"
                  value={form.dietaryNeedsText}
                  onChange={(e) => update("dietaryNeedsText", e.target.value)}
                  placeholder="High-protein, dairy-free"
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
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="form-row">
                <label htmlFor="cycleTracking">Sync with menstrual cycle?</label>
                <select
                  id="cycleTracking"
                  value={form.cycleTracking ? "yes" : "no"}
                  onChange={(e) => update("cycleTracking", e.target.value === "yes")}
                >
                  <option value="no">Not now</option>
                  <option value="yes">Yes, sync my plan</option>
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
            </>
          ) : null}

          <div className="form-actions">
            {step > 0 ? (
              <button className="btn secondary" type="button" onClick={handleBack}>
                Back
              </button>
            ) : null}
            {step < steps.length - 1 ? (
              <button className="btn primary" type="button" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Finish onboarding"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
