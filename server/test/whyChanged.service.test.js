import test from "node:test";
import assert from "node:assert/strict";
import { buildWhyChanged } from "../src/services/whyChanged.service.js";

test("buildWhyChanged explains initial plans", () => {
  const message = buildWhyChanged({
    source: "initial",
    diff: { changedFields: [] },
    previousCheckInSnapshot: null,
    currentCheckInSnapshot: null,
  });

  assert.match(message, /Initial generated plan/i);
});

test("buildWhyChanged includes check-in and changed-area context", () => {
  const message = buildWhyChanged({
    source: "checkin",
    diff: { changedFields: ["workout.title", "nutrition.focus"] },
    previousCheckInSnapshot: { energy: 2, mood: 2, symptoms: [] },
    currentCheckInSnapshot: { energy: 4, mood: 3, symptoms: ["cramps"] },
  });

  assert.match(message, /daily check-in/i);
  assert.match(message, /Energy increased/i);
  assert.match(message, /workout recommendations/i);
  assert.match(message, /meal recommendations/i);
});
