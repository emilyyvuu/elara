import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAnalyticsSummary } from "../api/analyticsApi";
import { getProfile } from "../api/profileApi";
import LogoutButton from "../components/LogoutButton";
import "../styles/appPages.css";

function formatMetric(value, fallback = "-") {
  if (value == null || Number.isNaN(value)) return fallback;
  return String(value);
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        await getProfile();
      } catch {
        navigate("/login");
        return;
      }

      try {
        const summary = await getAnalyticsSummary(range);
        if (!mounted) return;
        setData(summary);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [navigate, range]);

  const summary = data?.summary || {};
  const symptoms = Array.isArray(data?.topSymptomsInRange) ? data.topSymptomsInRange : [];

  return (
    <div className="page-container scrollable-page">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Progress Analytics</h1>
          <div className="dashboard-actions">
            <Link className="btn primary" to="/dashboard">
              Dashboard
            </Link>
            <Link className="btn primary" to="/history">
              Plan History
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="dashboard-tile analytics-filter-tile">
          <label htmlFor="analytics-range">Time range</label>
          <select
            id="analytics-range"
            value={range}
            onChange={(event) => setRange(event.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {loading ? <p>Loading analytics...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        {!loading && !error ? (
          <>
            <div className="analytics-grid">
              <div className="dashboard-tile analytics-card">
                <h3>Check-ins (range)</h3>
                <p className="analytics-value">{formatMetric(summary.checkInsInRange, "0")}</p>
              </div>
              <div className="dashboard-tile analytics-card">
                <h3>Current streak</h3>
                <p className="analytics-value">
                  {formatMetric(summary.currentStreakDays, "0")} day(s)
                </p>
              </div>
              <div className="dashboard-tile analytics-card">
                <h3>Average energy</h3>
                <p className="analytics-value">{formatMetric(summary.avgEnergyInRange)}</p>
              </div>
              <div className="dashboard-tile analytics-card">
                <h3>Average mood</h3>
                <p className="analytics-value">{formatMetric(summary.avgMoodInRange)}</p>
              </div>
              <div className="dashboard-tile analytics-card">
                <h3>Plan updates (range)</h3>
                <p className="analytics-value">{formatMetric(summary.planUpdatesInRange, "0")}</p>
              </div>
              <div className="dashboard-tile analytics-card">
                <h3>Total check-ins</h3>
                <p className="analytics-value">{formatMetric(summary.totalCheckIns, "0")}</p>
              </div>
            </div>

            <div className="dashboard-tile analytics-symptoms">
              <h3>Most reported symptoms</h3>
              {symptoms.length === 0 ? (
                <p>No symptom reports in this time range.</p>
              ) : (
                <ul>
                  {symptoms.map((item) => (
                    <li key={item.symptom}>
                      {item.symptom}: {item.count}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
