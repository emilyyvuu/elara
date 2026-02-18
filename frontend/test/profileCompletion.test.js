import test from "node:test";
import assert from "node:assert/strict";
import { isProfileComplete } from "../src/utils/profileCompletion.js";

test("isProfileComplete returns true for complete non-cycle profile", () => {
  const user = {
    firstName: "Emily",
    goals: ["strength"],
    equipment: "Home",
    cycleTracking: false,
  };

  assert.equal(isProfileComplete(user), true);
});

test("isProfileComplete returns false when cycle tracking is missing required details", () => {
  const user = {
    firstName: "Emily",
    goals: ["strength"],
    equipment: "Gym",
    cycleTracking: true,
    cycleDetails: { avgCycleLength: 28 },
  };

  assert.equal(isProfileComplete(user), false);
});

test("isProfileComplete returns false when goals are missing", () => {
  const user = {
    firstName: "Emily",
    goals: [],
    equipment: "None",
    cycleTracking: false,
  };

  assert.equal(isProfileComplete(user), false);
});
