import React, { useEffect, useState } from "react";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
} from "../api";

export default function TaskDashboard({ username, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await getTasks(username);
      setTasks(data);
    } catch (e) {
      setError(e.message || "Could not load tasks");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const t = await addTask(username, { title, description: desc });
      setTasks((prev) => [...prev, t]);
      setTitle("");
      setDesc("");
      setError("");
    } catch (e) {
      setError(e.message || "Could not add task");
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await toggleTask(username, id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      setError(e.message || "Could not update");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTask(username, id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e.message || "Could not delete");
    }
  }

  async function handleUpdate(id, field, value) {
    try {
      const updated = await updateTask(username, id, { [field]: value });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      setError(e.message || "Could not edit");
    }
  }

  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.length - completed;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "done") return t.completed;
    if (filter === "todo") return !t.completed;
    return true;
  });

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="welcome-text">Hey {username} 💖</p>
          <h2 className="dashboard-title">Let’s slay your to-do list today ✨</h2>
        </div>
        <button
          className="btn ghost-btn"
          onClick={() => {
            localStorage.removeItem("tm_username");
            onLogout();
          }}
        >
          Logout 🚪
        </button>
      </header>

      <section className="stats-row">
        <div className="stat-card stat-pink">
          <span className="stat-label">Total tasks</span>
          <span className="stat-value">
            {tasks.length} <span className="stat-emoji">📚</span>
          </span>
        </div>
        <div className="stat-card stat-purple">
          <span className="stat-label">Completed</span>
          <span className="stat-value">
            {completed} <span className="stat-emoji">✅</span>
          </span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-label">Pending</span>
          <span className="stat-value">
            {pending} <span className="stat-emoji">⏳</span>
          </span>
        </div>
      </section>

      <section className="add-card card neon-border">
        <h3 className="section-title">Add a cute little task 🌈</h3>
        <form className="add-form" onSubmit={handleAdd}>
          <input
            className="input"
            type="text"
            placeholder="Ex: Study React, skincare routine, gym, notes…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="input textarea"
            placeholder="Optional note… like time, mood, or reminder 💌"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button className="btn primary-btn" type="submit">
            Add to my day ✨
          </button>
        </form>
        {error && <div className="badge error-badge">⚠ {error}</div>}
      </section>

      <section className="tasks-section">
        <div className="tasks-header">
          <h3 className="section-title">Today’s vibes 💫</h3>
          <div className="filter-chips">
            <button
              type="button"
              className={
                filter === "all" ? "chip chip-active chip-all" : "chip chip-all"
              }
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={
                filter === "todo"
                  ? "chip chip-active chip-todo"
                  : "chip chip-todo"
              }
              onClick={() => setFilter("todo")}
            >
              To do
            </button>
            <button
              type="button"
              className={
                filter === "done"
                  ? "chip chip-active chip-done"
                  : "chip chip-done"
              }
              onClick={() => setFilter("done")}
            >
              Done
            </button>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <p className="empty-text">
            No tasks here yet… add something cute to get started 💕
          </p>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className={
                  "task-card card " + (t.completed ? "task-done" : "task-todo")
                }
              >
                <div className="task-main">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => handleToggle(t.id)}
                    className="task-checkbox"
                  />
                  <input
                    className={
                      "task-title-input " +
                      (t.completed ? "task-title-done" : "")
                    }
                    value={t.title}
                    onChange={(e) =>
                      handleUpdate(t.id, "title", e.target.value)
                    }
                  />
                </div>
                <textarea
                  className="task-desc-input"
                  value={t.description || ""}
                  placeholder="Write a small note…"
                  onChange={(e) =>
                    handleUpdate(t.id, "description", e.target.value)
                  }
                />
                <div className="task-footer">
                  <span className="task-date">
                    Created: {new Date(t.createdAt).toLocaleString()}
                  </span>
                  <button
                    className="btn small danger-btn"
                    onClick={() => handleDelete(t.id)}
                  >
                    Delete 🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
