import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../api/profileApi";
import "../styles/appPages.css";

const steps = ["Basic stats", "Goals & environment", "Bio-toggle"];

export default function OnboardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleFinish = async () => {
    setLoading(true);
    setError("");

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
      navigate("/plan-loading");
    } catch (err) {
      setError(err?.message || "Failed to finish onboarding");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (step < steps.length - 1) {
      handleNext();
    } else {
      handleFinish();
    }
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h1 className="page-title">Onboarding</h1>
        <p className="page-subtitle">
          Step {step + 1} of {steps.length}: {steps[step]}
        </p>

        <form className="form-grid" onSubmit={(event) => event.preventDefault()} onKeyDown={handleKeyDown}>
          {step === 0 ? (
            <>
              <div className="form-row">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="form-row">
                <label htmlFor="height">Height (optional)</label>
                <input
                  id="height"
                  type="number"
                  value={form.height}
                  onChange={(e) => update("height", e.target.value)}
                />
              </div>
              <div className="form-row">
                <label htmlFor="weight">Weight (optional)</label>
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
              <button className="btn primary" type="button" onClick={handleFinish} disabled={loading}>
                {loading ? "Saving..." : "Finish onboarding"}
              </button>
            )}
          </div>
          {error ? <p className="form-error">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
