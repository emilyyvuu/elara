import AuthButtons from "../components/AuthButtons";
import "../styles/landing.css";

export default function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1 className="landing-title">Name</h1>
        <p className="landing-tagline">
          Cycle-aware fitness & nutrition
        </p>

        <AuthButtons />

      </div>
    </div>
  );
}
