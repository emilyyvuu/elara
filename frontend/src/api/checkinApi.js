import { apiFetch } from "./client";

export function submitCheckIn(checkIn) {
  return apiFetch("/api/checkin", {
    method: "POST",
    body: JSON.stringify({ checkIn }),
  });
}
