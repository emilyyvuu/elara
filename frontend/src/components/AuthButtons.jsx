import { useNavigate } from "react-router-dom";

export default function AuthButtons() {
  const navigate = useNavigate();

  return (
    <div className="auth-buttons">
      <button
        className="btn primary"
        onClick={() => navigate("/login")}
      >
        Login
      </button>

      <button
        className="btn secondary"
        onClick={() => navigate("/register")}
      >
        Register
      </button>
    </div>
  );
}
