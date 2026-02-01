export default function PlanResults({ plan }) {
  if (!plan) return null;

  const payload = plan.plan || plan;

  if (payload.raw) {
    return (
      <div style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
        <h3>Raw output</h3>
        <pre>{payload.raw}</pre>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
      <div>
        <h3>Workout</h3>
        <p><b>{payload.workout?.title}</b></p>
        <ul>
          {payload.workout?.exercises?.map((exercise, index) => (
            <li key={`${exercise}-${index}`}>{exercise}</li>
          ))}
        </ul>
        {payload.workout?.whyToday ? (
          <p><i>{payload.workout.whyToday}</i></p>
        ) : null}
      </div>

      <div>
        <h3>Nutrition</h3>
        <p><b>{payload.nutrition?.focus}</b></p>
        <ul>
          <li>Breakfast: {payload.nutrition?.meals?.breakfast}</li>
          <li>Lunch: {payload.nutrition?.meals?.lunch}</li>
          <li>Dinner: {payload.nutrition?.meals?.dinner}</li>
        </ul>
      </div>

      <div>
        <h3>Insight</h3>
        <p>{payload.insight}</p>
      </div>
    </div>
  );
}
