const API = "http://localhost:5000";

async function req(url, method, data, username) {
  const res = await fetch(API + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(username ? { "x-user": username } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  // Read raw text first
  const text = await res.text();
  let json;

  // Try to parse JSON safely
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    // Response is not valid JSON (maybe HTML like <!DOCTYPE html>…)
    if (!res.ok) {
      throw { message: "Server returned an invalid response" };
    } else {
      return {};
    }
  }

  // If HTTP error, throw parsed JSON (which should have .message)
  if (!res.ok) {
    throw json;
  }

  return json;
}

// ===== Auth =====
export const register = (u, e, p) =>
  req("/api/auth/register", "POST", { username: u, email: e, password: p });

export const verifySignupOtp = (email, otp) =>
  req("/api/auth/verify-otp", "POST", { email, otp });

export const resendSignupOtp = (email) =>
  req("/api/auth/resend-verify", "POST", { email });

export const login = (identifier, password) =>
  req("/api/auth/login", "POST", { identifier, password });

export const sendForgotOtp = (email) =>
  req("/api/auth/forgot", "POST", { email });

export const resetPassword = (email, otp, newPassword) =>
  req("/api/auth/reset", "POST", { email, otp, newPassword });

export const getProfile = (u) => req("/api/auth/me", "GET", null, u);

export const updateProfile = (u, body) =>
  req("/api/auth/me", "PUT", body, u);

// ===== Tasks =====
export const getTasks = (u) => req("/api/tasks", "GET", null, u);

export const addTask = (u, t) => req("/api/tasks", "POST", t, u);

export const updateTask = (u, id, t) =>
  req(`/api/tasks/${id}`, "PUT", t, u);

export const toggleTask = (u, id) =>
  req(`/api/tasks/${id}/toggle`, "PUT", {}, u);

export const deleteTask = (u, id) =>
  req(`/api/tasks/${id}`, "DELETE", null, u);

// ===== Trash =====
export const getTrash = (u) => req("/api/trash", "GET", null, u);

export const restoreFromTrash = (u, ids) =>
  req("/api/trash/restore", "POST", { ids }, u);
