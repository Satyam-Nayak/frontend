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

  // helper to give different shapes
  function getShapeClass(index) {
    const shapes = ["shape-pill", "shape-tag", "shape-bubble", "shape-notch"];
    return shapes[index % shapes.length];
  }

  return (
    <div className="page dashboard-page">
      {/* 🔹 Sticky Navbar at top */}
      <header className="navbar">
        <div className="navbar-left">
          <p className="navbar-greeting">Hey {username}💖</p>
          <p className="navbar-subtitle">
            Let’s slay your to-do list today ✨
          </p>
        </div>
        <button
          className="btn ghost-btn navbar-logout"
          onClick={() => {
            localStorage.removeItem("tm_username");
            onLogout();
          }}
        >
          Logout 🚪
        </button>
      </header>

      <div className="dashboard-content">
        {/* Stats */}
        <section className="stats-row">
          <div className="stat-card stat-pink">
            <span className="stat-label">Total tasks</span>
            <span className="stat-value">{tasks.length} 📚</span>
          </div>
          <div className="stat-card stat-purple">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{completed} ✅</span>
          </div>
          <div className="stat-card stat-blue">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pending} ⏳</span>
          </div>
        </section>

        {/* Add task */}
        <section className="add-card card">
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

        {/* Tasks */}
        <section className="tasks-section">
          <div className="tasks-header">
            <h3 className="section-title">Today’s vibes 💫</h3>
            <div className="filter-chips">
              <button
                type="button"
                className={
                  filter === "all" ? "chip chip-active" : "chip"
                }
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={
                  filter === "todo" ? "chip chip-active" : "chip"
                }
                onClick={() => setFilter("todo")}
              >
                To do
              </button>
              <button
                type="button"
                className={
                  filter === "done" ? "chip chip-active" : "chip"
                }
                onClick={() => setFilter("done")}
              >
                Done
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <p className="empty-text">
              No tasks here yet… add something to get started 💕
            </p>
          ) : (
            <div className="tasks-list">
              {filteredTasks.map((t, index) => {
                const shapeClass = getShapeClass(index);
                return (
                  <div
                    key={t.id}
                    className={
                      "task-card card " +
                      (t.completed ? "task-done" : "task-todo") +
                      " " +
                      shapeClass
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
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
