import AuthButtons from "../components/AuthButtons";
import "../styles/landing.css";

export default function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1 className="landing-title">Elara</h1>
        <p className="landing-tagline">
          Women-first fitness and nutrition, adaptable to every body and rhythm.
        </p>

        <AuthButtons />

      </div>
    </div>
  );
}
