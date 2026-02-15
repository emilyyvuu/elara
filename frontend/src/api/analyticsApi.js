import { apiFetch } from "./client";

export function getAnalyticsSummary(range = "30d") {
  const params = new URLSearchParams();
  params.set("range", String(range));
  return apiFetch(`/api/analytics/summary?${params.toString()}`);
}
