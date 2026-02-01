import { useState } from "react";
import { defaultProfile } from "../utils/defaults";

export default function ProfileForm({ onSubmit, loading }) {
  const [profile, setProfile] = useState(defaultProfile);

  function update(key, value) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const goals = profile.goalsText
      .split(",")
      .map((goal) => goal.trim())
      .filter(Boolean);
    const symptoms = profile.symptomsText
      .split(",")
      .map((symptom) => symptom.trim())
      .filter(Boolean);

    const height = profile.height ? Number(profile.height) : null;
    const weight = profile.weight ? Number(profile.weight) : null;
    const avgCycleLength = profile.avgCycleLength ? Number(profile.avgCycleLength) : null;

    const cycleDetails = profile.cycleTracking
      ? {
          lastPeriodDate: profile.lastPeriodDate || null,
          avgCycleLength,
        }
      : null;

    onSubmit({
      profile: {
        height,
        weight,
        goals,
        equipment: profile.equipment,
        cycleTracking: profile.cycleTracking,
        cycleDetails,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <label>
        Goals (comma separated)
        <input
          value={profile.goalsText}
          onChange={(e) => update("goalsText", e.target.value)}
        />
      </label>

      <label>
        Height (cm)
        <input
          type="number"
          value={profile.height}
          onChange={(e) => update("height", e.target.value)}
        />
      </label>

      <label>
        Weight (kg)
        <input
          type="number"
          value={profile.weight}
          onChange={(e) => update("weight", e.target.value)}
        />
      </label>

      <label>
        Equipment access
        <select
          value={profile.equipment}
          onChange={(e) => update("equipment", e.target.value)}
        >
          <option value="None">None</option>
          <option value="Home">Home</option>
          <option value="Gym">Gym</option>
        </select>
      </label>

      <label>
        Cycle tracking
        <select
          value={profile.cycleTracking ? "yes" : "no"}
          onChange={(e) => update("cycleTracking", e.target.value === "yes")}
        >
          <option value="no">Not tracking</option>
          <option value="yes">Tracking</option>
        </select>
      </label>

      {profile.cycleTracking ? (
        <>
          <label>
            Last period start date
            <input
              type="date"
              value={profile.lastPeriodDate}
              onChange={(e) => update("lastPeriodDate", e.target.value)}
            />
          </label>

          <label>
            Average cycle length (days)
            <input
              type="number"
              value={profile.avgCycleLength}
              onChange={(e) => update("avgCycleLength", e.target.value)}
            />
          </label>
        </>
      ) : null}

      {/* <label>
        Energy today (1-5)
        <select
          value={profile.energy}
          onChange={(e) => update("energy", e.target.value)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        Mood today (1-5)
        <select
          value={profile.mood}
          onChange={(e) => update("mood", e.target.value)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        Symptoms (comma separated)
        <input
          value={profile.symptomsText}
          onChange={(e) => update("symptomsText", e.target.value)}
        />
      </label> */}

      <button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate Plan"}
      </button>
    </form>
  );
}
