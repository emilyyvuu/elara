import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generatePlan } from "../api/planApi";
import "../styles/appPages.css";

export default function PlanLoadingPage() {
  const navigate = useNavigate();
  const hasRun = useRef(false);
  const [dots, setDots] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 550);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function run() {
      try {
        await generatePlan();
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setError(err?.message || "Failed to generate plan");
      }
    }

    run();
  }, [navigate]);

  return (
    <div className="page-container">
      <div className="loading-shell">
        <div className="loading-content">
          <h1 className="page-title">{"Loading" + ".".repeat(dots)}</h1>
          {error ? <p className="form-error">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
