import { apiFetch } from "./client";

export function updateProfile(payload) {
  return apiFetch("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getProfile() {
  return apiFetch("/api/profile");
}
