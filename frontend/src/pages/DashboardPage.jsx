import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api/profileApi";
import { submitCheckIn } from "../api/checkinApi";
import { isProfileComplete } from "../utils/profileCompletion";
import PlanResults from "../components/PlanResults";
import "../styles/appPages.css";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkIn, setCheckIn] = useState({ energy: 3, mood: 3, symptomsText: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { user } = await getProfile();
        if (!mounted) return;
        if (!isProfileComplete(user)) {
          navigate("/onboard");
          return;
        }
        setProfile(user);
        setPlan(user.currentPlan || null);
      } catch (err) {
        navigate("/login");
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const update = (key, value) => setCheckIn((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const symptoms = checkIn.symptomsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const result = await submitCheckIn({
        energy: Number(checkIn.energy),
        mood: Number(checkIn.mood),
        symptoms,
      });
      setPlan(result.plan || null);
    } catch (err) {
      setError(err?.message || "Failed to submit check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome{profile?.firstName ? `, ${profile.firstName}` : ""}. How do you feel today?
        </p>

        <div className="card-grid">
          <div className="content-card">
            <h3>Daily check-in</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Energy (1-5)</label>
                <select
                  value={checkIn.energy}
                  onChange={(e) => update("energy", e.target.value)}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Mood (1-5)</label>
                <select
                  value={checkIn.mood}
                  onChange={(e) => update("mood", e.target.value)}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Symptoms (comma separated)</label>
                <input
                  value={checkIn.symptomsText}
                  onChange={(e) => update("symptomsText", e.target.value)}
                />
              </div>
              {error ? <p style={{ color: "#b42318" }}>{error}</p> : null}
              <div className="form-actions">
                <button className="btn primary" type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update plan"}
                </button>
              </div>
            </form>
          </div>

          <div className="content-card">
            <h3>Your plan</h3>
            {plan ? <PlanResults plan={plan} /> : <p>No plan yet. Submit a check-in.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
