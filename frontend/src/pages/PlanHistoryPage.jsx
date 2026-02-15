import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPlanHistory, getPlanVersionById } from "../api/planApi";
import { getProfile } from "../api/profileApi";
import LogoutButton from "../components/LogoutButton";
import "../styles/appPages.css";

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function sourceLabel(source) {
  if (source === "checkin") return "After daily check-in";
  if (source === "profile_update") return "After profile update";
  return "Initial generated plan";
}

function changedAreasFromPaths(paths) {
  const fields = Array.isArray(paths) ? paths : [];
  const areas = [];

  if (fields.some((field) => field.startsWith("workout"))) {
    areas.push("Workout recommendations");
  }
  if (fields.some((field) => field.startsWith("nutrition"))) {
    areas.push("Meal recommendations");
  }
  if (fields.some((field) => field === "insight")) {
    areas.push("Daily insight message");
  }

  return areas;
}

export default function PlanHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const selectedSummary = useMemo(
    () => history.find((item) => item.id === selectedId) || null,
    [history, selectedId]
  );

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        await getProfile();
      } catch {
        navigate("/login");
        return;
      }

      try {
        const data = await getPlanHistory({ limit: 12 });
        if (!mounted) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setHistory(items);
        setHasMore(Boolean(data?.pageInfo?.hasMore));
        setNextCursor(data?.pageInfo?.nextCursor ?? null);

        if (items.length > 0) {
          setSelectedId(items[0].id);
          await loadDetail(items[0].id, mounted);
        }
      } catch (err) {
        if (!mounted) return;
        setHistoryError(err?.message || "Failed to load plan history");
      } finally {
        if (mounted) setLoadingHistory(false);
      }
    }

    async function loadDetail(id, isMounted = true) {
      setLoadingDetail(true);
      setDetailError("");
      try {
        const data = await getPlanVersionById(id);
        if (!isMounted) return;
        setSelectedVersion(data);
      } catch (err) {
        if (!isMounted) return;
        setDetailError(err?.message || "Failed to load plan details");
      } finally {
        if (isMounted) setLoadingDetail(false);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  async function handleSelect(id) {
    setSelectedId(id);
    setLoadingDetail(true);
    setDetailError("");

    try {
      const data = await getPlanVersionById(id);
      setSelectedVersion(data);
    } catch (err) {
      setDetailError(err?.message || "Failed to load plan details");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleLoadMore() {
    if (!hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    setHistoryError("");

    try {
      const data = await getPlanHistory({ limit: 12, beforeVersion: nextCursor });
      const items = Array.isArray(data?.items) ? data.items : [];
      setHistory((prev) => [...prev, ...items]);
      setHasMore(Boolean(data?.pageInfo?.hasMore));
      setNextCursor(data?.pageInfo?.nextCursor ?? null);
    } catch (err) {
      setHistoryError(err?.message || "Failed to load more history");
    } finally {
      setLoadingMore(false);
    }
  }

  const currentPlan = selectedVersion?.plan || null;
  const changedAreas = changedAreasFromPaths(selectedVersion?.diffFromPrevious?.changedFields);

  return (
    <div className="page-container scrollable-page">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Plan History</h1>
          <div className="dashboard-actions">
            <Link className="btn primary" to="/dashboard">
              Dashboard
            </Link>
            <Link className="btn primary" to="/profile">
              Profile
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="history-layout">
          <section className="dashboard-tile history-list-panel">
            <h3>Past Plans</h3>
            {loadingHistory ? <p>Loading history...</p> : null}
            {historyError ? <p className="form-error">{historyError}</p> : null}
            {!loadingHistory && !historyError && history.length === 0 ? (
              <p>No history yet. Submit a daily check-in to create your first saved version.</p>
            ) : null}

            {history.length > 0 ? (
              <ul className="history-list">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`history-item ${item.id === selectedId ? "active" : ""}`}
                      onClick={() => handleSelect(item.id)}
                    >
                      <span className="history-item-title">
                        {sourceLabel(item.source)}
                      </span>
                      <span className="history-item-date">{formatDateTime(item.createdAt)}</span>
                      {item.preview?.workoutTitle ? (
                        <span className="history-item-preview">{item.preview.workoutTitle}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {hasMore ? (
              <button
                type="button"
                className="btn primary"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            ) : null}
          </section>

          <section className="dashboard-tile history-detail-panel">
            <h3>Selected Plan</h3>
            {!selectedSummary && !loadingHistory ? (
              <p>Select a plan from the list to view details.</p>
            ) : null}
            {loadingDetail ? <p>Loading selected plan...</p> : null}
            {detailError ? <p className="form-error">{detailError}</p> : null}

            {selectedSummary && !loadingDetail && !detailError ? (
              <div className="history-detail-content">
                <p>
                  <b>{sourceLabel(selectedSummary.source)}</b> on{" "}
                  {formatDateTime(selectedSummary.createdAt)}
                </p>
                {selectedVersion?.whyChanged ? (
                  <div>
                    <h4>Why this changed</h4>
                    <p>{selectedVersion.whyChanged}</p>
                  </div>
                ) : null}

                {changedAreas.length > 0 ? (
                  <div>
                    <h4>Updated areas</h4>
                    <ul>
                      {changedAreas.map((area) => (
                        <li key={area}>{area}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {selectedVersion?.checkInSnapshot ? (
                  <div>
                    <h4>Check-in snapshot</h4>
                    <p>
                      Energy: {selectedVersion.checkInSnapshot.energy ?? "N/A"} | Mood:{" "}
                      {selectedVersion.checkInSnapshot.mood ?? "N/A"}
                    </p>
                    {Array.isArray(selectedVersion.checkInSnapshot.symptoms) &&
                    selectedVersion.checkInSnapshot.symptoms.length > 0 ? (
                      <p>
                        Symptoms: {selectedVersion.checkInSnapshot.symptoms.join(", ")}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {currentPlan ? (
                  <div>
                    <h4>Workout</h4>
                    <p><b>{currentPlan.workout?.title || "No workout title"}</b></p>
                    <ul>
                      {(currentPlan.workout?.exercises || []).map((exercise, index) => (
                        <li key={`${exercise}-${index}`}>{exercise}</li>
                      ))}
                    </ul>
                    {currentPlan.workout?.whyToday ? <p>{currentPlan.workout.whyToday}</p> : null}

                    <h4>Nutrition</h4>
                    <p><b>{currentPlan.nutrition?.focus || "No nutrition focus"}</b></p>
                    <ul>
                      <li>Breakfast: {currentPlan.nutrition?.meals?.breakfast || "N/A"}</li>
                      <li>Lunch: {currentPlan.nutrition?.meals?.lunch || "N/A"}</li>
                      <li>Dinner: {currentPlan.nutrition?.meals?.dinner || "N/A"}</li>
                    </ul>

                    <h4>Insight</h4>
                    <p>{currentPlan.insight || "No insight available."}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
