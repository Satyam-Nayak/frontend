import React, { useState } from "react";
import { login, register } from "../api";

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await register(username, email, password);
      }

      const res = await login(username, password);
      localStorage.setItem("tm_username", res.username);
      onLogin(res.username);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="card auth-card neon-border">
        <div className="logo-text">
          <span className="logo-emoji">🚀</span>
          <span className="logo-title">TaskFlow</span>
        </div>
        <p className="logo-subtitle">
          A colorful space to plan your day – for everyone 🌈
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "tab active" : "tab"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "tab active" : "tab"}
            onClick={() => setMode("register")}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="input-label">
            Username
            <input
              className="input"
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          {mode === "register" && (
            <label className="input-label">
              Email
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          )}

          <label className="input-label">
            Password
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="badge error-badge">⚠ {error}</div>}

          <button className="btn primary-btn" type="submit" disabled={loading}>
            {loading
              ? "Just a moment… ⏳"
              : mode === "login"
              ? "Login & start planning ✅"
              : "Create my account 🚀"}
          </button>
        </form>

        <p className="auth-hint">
          {mode === "login"
            ? "New here? Switch to Sign up to create your account."
            : "Already have an account? Switch back to Login."}
        </p>
      </div>
    </div>
  );
}
