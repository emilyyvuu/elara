import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProfile } from "../api/profileApi";
import { submitCheckIn } from "../api/checkinApi";
import { isProfileComplete } from "../utils/profileCompletion";
import LogoutButton from "../components/LogoutButton";
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


  const activePlan = plan?.plan || plan;
  const welcomeName = profile?.firstName || profile?.lastName || "there";

  return (
    <div className="page-container scrollable-page">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome, {welcomeName}!</h1>
          <div className="dashboard-actions">
            <Link className="btn primary" to="/history">
              Plan History
            </Link>
            <Link className="btn primary" to="/profile">
              Profile
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-tile card-large workout-tile">
            <h3>Workout Plan</h3>
            {activePlan ? (
              <>
                <p><b>{activePlan.workout?.title}</b></p>
                <ul>
                  {activePlan.workout?.exercises?.map((exercise, index) => (
                    <li key={`${exercise}-${index}`}>{exercise}</li>
                  ))}
                </ul>
                {activePlan.workout?.whyToday ? <p>{activePlan.workout.whyToday}</p> : null}
              </>
            ) : (
              <p>No plan yet. Submit a check-in.</p>
            )}
          </div>

          <div className="dashboard-tile card-large nutrition-tile">
            <h3>Nutrition Plan</h3>
            {activePlan ? (
              <>
                <p><b>{activePlan.nutrition?.focus}</b></p>
                <ul>
                  <li>Breakfast: {activePlan.nutrition?.meals?.breakfast}</li>
                  <li>Lunch: {activePlan.nutrition?.meals?.lunch}</li>
                  <li>Dinner: {activePlan.nutrition?.meals?.dinner}</li>
                </ul>
              </>
            ) : (
              <p>No plan yet. Submit a check-in.</p>
            )}
          </div>

          <div className="dashboard-tile card-small checkin-tile">
            <h3>Daily check-in</h3>
            <form className="form-grid dashboard-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Energy</label>
                <div className="range-row">
                  <span className="range-label">Low</span>
                  <input
                    className="range-input"
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={checkIn.energy}
                    onChange={(e) => update("energy", e.target.value)}
                  />
                  <span className="range-label">High</span>
                </div>
              </div>
              <div className="form-row">
                <label>Mood</label>
                <div className="range-row">
                  <span className="range-label">Low</span>
                  <input
                    className="range-input"
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={checkIn.mood}
                    onChange={(e) => update("mood", e.target.value)}
                  />
                  <span className="range-label">High</span>
                </div>
              </div>
              <div className="form-row">
                <label>Symptoms (comma separated)</label>
                <input
                  value={checkIn.symptomsText}
                  onChange={(e) => update("symptomsText", e.target.value)}
                />
              </div>
              {error ? <p className="form-error">{error}</p> : null}
              <div className="form-actions">
                <button className="btn primary" type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update plan"}
                </button>
              </div>
            </form>
          </div>

          <div className="dashboard-tile card-small insight-tile">
            <h3>Insight</h3>
            {activePlan?.insight ? <p>{activePlan.insight}</p> : <p>Awaiting your plan.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
