import test from "node:test";
import assert from "node:assert/strict";
import { buildPlanDiff } from "../src/services/planDiff.service.js";

test("buildPlanDiff captures scalar and list changes", () => {
  const previousPlan = {
    workout: { title: "Easy day", exercises: ["Walk", "Stretch"] },
    nutrition: {
      focus: "Balanced",
      meals: { breakfast: "Oats", lunch: "Salad", dinner: "Fish" },
    },
    insight: "Stay consistent.",
  };

  const currentPlan = {
    workout: { title: "Strength day", exercises: ["Squats", "Stretch"] },
    nutrition: {
      focus: "High protein",
      meals: { breakfast: "Eggs", lunch: "Chicken bowl", dinner: "Fish" },
    },
    insight: "Recovery supports performance.",
  };

  const diff = buildPlanDiff(previousPlan, currentPlan);

  assert.ok(diff.changedFields.includes("workout.title"));
  assert.ok(diff.changedFields.includes("workout.exercises"));
  assert.ok(diff.changedFields.includes("nutrition.focus"));
  assert.ok(diff.changedFields.includes("nutrition.meals.breakfast"));
  assert.ok(diff.changedFields.includes("insight"));
});

test("buildPlanDiff returns no changed fields for identical plans", () => {
  const plan = {
    workout: { title: "Baseline", exercises: ["Walk"] },
    nutrition: { focus: "Balanced", meals: { breakfast: "Oats", lunch: "Rice", dinner: "Soup" } },
    insight: "Hydrate.",
  };

  const diff = buildPlanDiff(plan, plan);
  assert.deepEqual(diff.changedFields, []);
  assert.deepEqual(diff.changes, {});
});
