import React, { useState } from "react";
import {
  login,
  register,
  verifySignupOtp,
  sendForgotOtp,
  resetPassword,
} from "../api";

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register | verify | forgot | reset

  const [identifier, setIdentifier] = useState(""); // username or email for login
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingUsername, setPendingUsername] = useState("");

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError("");
    setInfo("");
    setOtp("");
    if (next === "login") {
      setPassword("");
    }
    if (next === "register") {
      setPassword("");
    }
  }

  // ===== Handlers =====
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await login(identifier, password);
      localStorage.setItem("tm_username", res.username);
      onLogin(res.username);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await register(username, email, password);
      setPendingEmail(email);
      setPendingUsername(username);
      setInfo("We sent an OTP to your email. Please enter it to verify.");
      setMode("verify");
    } catch (err) {
      setError(err.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await verifySignupOtp(pendingEmail, otp);
      setInfo("Email verified! Logging you in...");
      const res = await login(pendingEmail, password); // user can login with email
      localStorage.setItem("tm_username", res.username);
      onLogin(res.username);
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await sendForgotOtp(email);
      setPendingEmail(email);
      setInfo("If this email exists, an OTP has been sent.");
      setMode("reset");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await resetPassword(pendingEmail, otp, newPassword);
      setInfo("Password reset successful. Logging you in...");
      const res = await login(pendingEmail, newPassword);
      localStorage.setItem("tm_username", res.username);
      onLogin(res.username);
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  // Which tab is "active" visually
  const loginTabActive = mode === "login" || mode === "forgot" || mode === "reset";
  const registerTabActive = mode === "register" || mode === "verify";

  return (
    <div className="page auth-page">
      <div className="card auth-card neon-border">
        <div className="logo-text">
          <span className="logo-emoji">📝</span>
          <span className="logo-title">GlowTasks</span>
        </div>
        <p className="logo-subtitle">
          Plan your day, your way – for every Gen Z & beyond ✨
        </p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={loginTabActive ? "tab active" : "tab"}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={registerTabActive ? "tab active" : "tab"}
            onClick={() => switchMode("register")}
          >
            Sign up
          </button>
        </div>

        {/* Forms by mode */}
        {mode === "login" && (
          <form className="auth-form" onSubmit={handleLogin}>
            <label className="input-label">
              Username or Email
              <input
                className="input"
                type="text"
                placeholder="yourname or you@mail.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 4,
                marginBottom: 4,
              }}
            >
              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#6366f1",
                  fontSize: 12,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
                onClick={() => switchMode("forgot")}
              >
                Forgot password?
              </button>
            </div>

            {error && <div className="badge error-badge">⚠ {error}</div>}
            {info && (
              <div className="badge" style={{ background: "#e0f2fe", color: "#075985" }}>
                ℹ {info}
              </div>
            )}

            <button className="btn primary-btn" type="submit" disabled={loading}>
              {loading ? "Logging in…" : "Login & start planning ✨"}
            </button>
          </form>
        )}

        {mode === "register" && (
          <form className="auth-form" onSubmit={handleRegister}>
            <label className="input-label">
              Username
              <input
                className="input"
                type="text"
                placeholder="cool_user123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

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
            {info && (
              <div className="badge" style={{ background: "#e0f2fe", color: "#075985" }}>
                ℹ {info}
              </div>
            )}

            <button className="btn primary-btn" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Sign up & get OTP 💌"}
            </button>
          </form>
        )}

        {mode === "verify" && (
          <form className="auth-form" onSubmit={handleVerify}>
            <p className="auth-hint">
              We’ve sent a 6-digit code to <b>{pendingEmail || email}</b>.
            </p>

            <label className="input-label">
              Enter OTP
              <input
                className="input"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </label>

            {error && <div className="badge error-badge">⚠ {error}</div>}
            {info && (
              <div className="badge" style={{ background: "#e0f2fe", color: "#075985" }}>
                ℹ {info}
              </div>
            )}

            <button className="btn primary-btn" type="submit" disabled={loading}>
              {loading ? "Verifying…" : "Verify & continue 🌟"}
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form className="auth-form" onSubmit={handleForgot}>
            <p className="auth-hint">
              Enter your registered email to reset your password.
            </p>

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

            {error && <div className="badge error-badge">⚠ {error}</div>}
            {info && (
              <div className="badge" style={{ background: "#e0f2fe", color: "#075985" }}>
                ℹ {info}
              </div>
            )}

            <button className="btn primary-btn" type="submit" disabled={loading}>
              {loading ? "Sending OTP…" : "Send reset OTP 💌"}
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form className="auth-form" onSubmit={handleReset}>
            <p className="auth-hint">
              We sent an OTP to <b>{pendingEmail}</b>. Enter it and choose a new password.
            </p>

            <label className="input-label">
              OTP
              <input
                className="input"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </label>

            <label className="input-label">
              New password
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>

            {error && <div className="badge error-badge">⚠ {error}</div>}
            {info && (
              <div className="badge" style={{ background: "#e0f2fe", color: "#075985" }}>
                ℹ {info}
              </div>
            )}

            <button className="btn primary-btn" type="submit" disabled={loading}>
              {loading ? "Updating…" : "Reset password & login 🔐"}
            </button>
          </form>
        )}

        {/* Bottom hint */}
        {mode === "login" && (
          <p className="auth-hint">
            New here? Tap <b>Sign up</b> to create your space.
          </p>
        )}
        {mode === "register" && (
          <p className="auth-hint">
            Already have an account? Tap <b>Login</b> to come back.
          </p>
        )}
      </div>
    </div>
  );
}
