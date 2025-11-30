const API = "http://localhost:5000";

async function req(url, method, data, username) {
  return fetch(API + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(username ? { "x-user": username } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then(async (r) => {
    if (!r.ok) throw await r.json();
    return r.json();
  });
}

export const register = (u, e, p) =>
  req("/api/auth/register", "POST", { username: u, email: e, password: p });

export const login = (u, p) =>
  req("/api/auth/login", "POST", { username: u, password: p });

export const getProfile = (u) => req("/api/auth/me", "GET", null, u);

export const getTasks = (u) => req("/api/tasks", "GET", null, u);
export const addTask = (u, t) => req("/api/tasks", "POST", t, u);
export const updateTask = (u, id, t) =>
  req(`/api/tasks/${id}`, "PUT", t, u);
export const toggleTask = (u, id) =>
  req(`/api/tasks/${id}/toggle`, "PUT", {}, u);
export const deleteTask = (u, id) =>
  req(`/api/tasks/${id}`, "DELETE", null, u);

// Trash
export const getTrash = (u) => req("/api/trash", "GET", null, u);
export const restoreFromTrash = (u, ids) =>
  req("/api/trash/restore", "POST", { ids }, u);
