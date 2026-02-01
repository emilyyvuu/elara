import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/authApi";
import { getProfile } from "../api/profileApi";
import { isProfileComplete } from "../utils/profileCompletion";
import "../styles/auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await signup(form);
      const { user } = await getProfile();
      navigate(isProfileComplete(user) ? "/dashboard" : "/onboard");
    } catch (err) {
      setError(err?.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-kicker">Start your plan</p>
          <h1 className="auth-title">Create your Violet account</h1>
          <p className="auth-subtitle">
            Get personalized training, meals, and insights in minutes.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="register-name">
            Full name
          </label>
          <input
            className="auth-input"
            id="register-name"
            name="name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
          />

          <label className="auth-label" htmlFor="register-email">
            Email address
          </label>
          <input
            className="auth-input"
            id="register-email"
            name="email"
            type="email"
            placeholder="you@violet.com"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />

          <label className="auth-label" htmlFor="register-password">
            Create password
          </label>
          <input
            className="auth-input"
            id="register-password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button
            className="btn primary auth-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link className="auth-link" to="/login">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
