import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { getProfile } from "../api/profileApi";
import { isProfileComplete } from "../utils/profileCompletion";
import "../styles/auth.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(form);
      const { user } = await getProfile();
      navigate(isProfileComplete(user) ? "/dashboard" : "/onboard");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-kicker">Welcome back</p>
          <h1 className="auth-title">Log in to Violet</h1>
          <p className="auth-subtitle">
            Pick up where you left off with your cycle-aware plan.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="login-email">
            Email address
          </label>
          <input
            className="auth-input"
            id="login-email"
            name="email"
            type="email"
            placeholder="you@violet.com"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />

          <label className="auth-label" htmlFor="login-password">
            Password
          </label>
          <input
            className="auth-input"
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button
            className="btn primary auth-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="auth-footer">
          <span>New here?</span>
          <Link className="auth-link" to="/register">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
