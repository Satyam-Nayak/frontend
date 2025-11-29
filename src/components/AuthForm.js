import React, { useState } from "react";
import { login, register } from "../api";

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(username, password);
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
          <span className="logo-emoji">🌸</span>
          <span className="logo-title">GlowTasks</span>
        </div>
        <p className="logo-subtitle">
          Cute little planner for your ✨ everyday ✨ life
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
              placeholder="pink_unicorn_07"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

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
              ? "Hold on… 💫"
              : mode === "login"
              ? "Login & glow ✨"
              : "Create my space 💕"}
          </button>
        </form>

        <p className="auth-hint">
          {mode === "login"
            ? "New here? Tap Sign up to start your glow-up."
            : "Already have an account? Tap Login babe 💌"}
        </p>
      </div>
    </div>
  );
}
