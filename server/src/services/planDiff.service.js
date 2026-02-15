function normalizePlan(plan) {
  return plan?.plan && typeof plan.plan === "object" ? plan.plan : plan;
}

function toArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function toStringOrEmpty(value) {
  return typeof value === "string" ? value : "";
}

function diffScalar(changes, changedFields, path, fromValue, toValue) {
  if (fromValue === toValue) return;
  changes[path] = { from: fromValue, to: toValue };
  changedFields.push(path);
}

/**
 * Build a structured diff between two generated plans.
 */
export function buildPlanDiff(previousPlanRaw, currentPlanRaw) {
  const previousPlan = normalizePlan(previousPlanRaw) || {};
  const currentPlan = normalizePlan(currentPlanRaw) || {};

  const changedFields = [];
  const changes = {};

  diffScalar(
    changes,
    changedFields,
    "workout.title",
    toStringOrEmpty(previousPlan?.workout?.title),
    toStringOrEmpty(currentPlan?.workout?.title)
  );
  diffScalar(
    changes,
    changedFields,
    "workout.whyToday",
    toStringOrEmpty(previousPlan?.workout?.whyToday),
    toStringOrEmpty(currentPlan?.workout?.whyToday)
  );
  diffScalar(
    changes,
    changedFields,
    "nutrition.focus",
    toStringOrEmpty(previousPlan?.nutrition?.focus),
    toStringOrEmpty(currentPlan?.nutrition?.focus)
  );
  diffScalar(
    changes,
    changedFields,
    "insight",
    toStringOrEmpty(previousPlan?.insight),
    toStringOrEmpty(currentPlan?.insight)
  );

  const prevExercises = toArray(previousPlan?.workout?.exercises);
  const currExercises = toArray(currentPlan?.workout?.exercises);
  const addedExercises = currExercises.filter((exercise) => !prevExercises.includes(exercise));
  const removedExercises = prevExercises.filter((exercise) => !currExercises.includes(exercise));
  if (addedExercises.length || removedExercises.length) {
    changes["workout.exercises"] = { added: addedExercises, removed: removedExercises };
    changedFields.push("workout.exercises");
  }

  const mealKeys = ["breakfast", "lunch", "dinner"];
  for (const mealKey of mealKeys) {
    diffScalar(
      changes,
      changedFields,
      `nutrition.meals.${mealKey}`,
      toStringOrEmpty(previousPlan?.nutrition?.meals?.[mealKey]),
      toStringOrEmpty(currentPlan?.nutrition?.meals?.[mealKey])
    );
  }

  return {
    changedFields,
    changes,
  };
}
