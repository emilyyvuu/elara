import { apiFetch } from "./client";

export function generatePlan(checkIn, source) {
  const payload = {};
  if (checkIn !== undefined) {
    payload.checkIn = checkIn;
  }
  if (source) {
    payload.source = source;
  }

  return apiFetch("/api/plan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPlanHistory({ limit = 10, beforeVersion } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (beforeVersion != null) {
    params.set("beforeVersion", String(beforeVersion));
  }

  return apiFetch(`/api/plans/history?${params.toString()}`);
}

export function getPlanVersionById(id) {
  return apiFetch(`/api/plans/${id}`);
}