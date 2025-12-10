import React, { useEffect, useState } from "react";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
  getTrash,
  restoreFromTrash,
  getProfile,
} from "../api";

export default function TaskDashboard({ username, onLogout, theme, onToggleTheme }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [dragId, setDragId] = useState(null);

  const [view, setView] = useState("board"); // "board" | "settings" | "trash"
  const [profile, setProfile] = useState(null);

  const [trash, setTrash] = useState([]);
  const [selectedTrashIds, setSelectedTrashIds] = useState([]);

  const [menuOpen, setMenuOpen] = useState(false);

  async function loadTasks() {
    try {
      const data = await getTasks(username);
      setTasks(data);
    } catch (e) {
      setError(e.message || "Could not load tasks");
    }
  }

  async function loadProfile() {
    try {
      const info = await getProfile(username);
      setProfile(info);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTrashData() {
    try {
      const list = await getTrash(username);
      setTrash(list);
      setSelectedTrashIds([]);
    } catch (e) {
      setError(e.message || "Could not load trash");
    }
  }

  useEffect(() => {
    loadTasks();
    loadProfile();
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

  // Drag & Drop
  function handleDragStart(id) {
    setDragId(id);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(targetId) {
    if (!dragId || dragId === targetId) return;

    setTasks((prev) => {
      const list = [...prev];
      const fromIndex = list.findIndex((t) => t.id === dragId);
      const toIndex = list.findIndex((t) => t.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;

      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return list;
    });

    setDragId(null);
  }

  // Profile menu actions
  async function openTrashView() {
    setView("trash");
    await loadTrashData();
    setMenuOpen(false);
  }

  function openSettingsView() {
    setView("settings");
    setMenuOpen(false);
  }

  function openBoardView() {
    setView("board");
    setMenuOpen(false);
  }

  function toggleTrashSelect(id) {
    setSelectedTrashIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleRestoreSelected() {
    if (selectedTrashIds.length === 0) return;
    try {
      await restoreFromTrash(username, selectedTrashIds);
      await loadTasks();
      await loadTrashData();
      setError("");
    } catch (e) {
      setError(e.message || "Could not restore");
    }
  }

  function logoutNow() {
    localStorage.removeItem("tm_username");
    onLogout();
  }

  return (
    <div className="page dashboard-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-left">
          <p className="navbar-greeting">Hey {username} 👋</p>
          <p className="navbar-subtitle">
            Plan, organize, and win your day 🌟
          </p>
        </div>

        <div className="navbar-right">
          {/* Home / Your Space button */}
          <button
            type="button"
            className={"btn home-btn" + (view === "board" ? " active" : "")}
            onClick={openBoardView}
          >
            <span className="home-icon">🏠</span>
            <span>Your Space</span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            className="btn theme-btn"
            onClick={onToggleTheme}
          >
            {theme === "light" ? "🌙 Dark" : "🌞 Light"}
          </button>

          {/* Profile avatar + menu */}
          <div className="profile-wrapper">
            <button
              type="button"
              className="profile-avatar"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {username.charAt(0).toUpperCase()}
            </button>
            {menuOpen && (
              <div className="profile-menu">
                <button type="button" onClick={openSettingsView}>
                  😄Profile
                </button>
                <button type="button" onClick={openTrashView}>
                  🗑️Trash
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={logoutNow}
                >
                  🚪Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Main board view */}
        {view === "board" && (
          <>
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
              <h3 className="section-title">Add a new task 🎯</h3>
              <form className="add-form" onSubmit={handleAdd}>
                <input
                  className="input"
                  type="text"
                  placeholder="Example: Project work, workout, call a friend…"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="input textarea"
                  placeholder="Optional details: time, mood, notes…"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                <button className="btn primary-btn" type="submit">
                  Add to my day ✨
                </button>
              </form>
              {error && <div className="badge error-badge">⚠ {error}</div>}
            </section>

            {/* Tasks board */}
            <section className="tasks-section">
              <div className="tasks-header">
                <h3 className="section-title">Today’s board 🧩</h3>
                <div className="filter-chips">
                  <button
                    type="button"
                    className={filter === "all" ? "chip chip-active" : "chip"}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={filter === "todo" ? "chip chip-active" : "chip"}
                    onClick={() => setFilter("todo")}
                  >
                    To do
                  </button>
                  <button
                    type="button"
                    className={filter === "done" ? "chip chip-active" : "chip"}
                    onClick={() => setFilter("done")}
                  >
                    Done
                  </button>
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <p className="empty-text">
                  No tasks yet – add something and start your streak 🔥
                </p>
              ) : (
                <div className="tasks-list">
                  {filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      className={
                        "task-card " +
                        (t.completed ? "task-done" : "task-todo")
                      }
                      draggable
                      onDragStart={() => handleDragStart(t.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(t.id)}
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
          </>
        )}

        {/* Settings view */}
        {view === "settings" && (
          <section className="card settings-card">
            <h3 className="section-title">Profile</h3>
            {profile ? (
              <div className="settings-body">
                <p>
                  <span className="settings-label">Username:</span>{" "}
                  {profile.username}
                </p>
                <p>
                  <span className="settings-label">Email:</span>{" "}
                  {profile.email}
                </p>
                <p>
                  <span className="settings-label">Using since:</span>{" "}
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            ) : (
              <p className="empty-text">Loading profile…</p>
            )}
          </section>
        )}

        {/* Trash view */}
        {view === "trash" && (
          <section className="card trash-card">
            <div className="trash-header">
              <h3 className="section-title">Trash 🗑</h3>
              <button
                className="btn small"
                type="button"
                onClick={handleRestoreSelected}
                disabled={selectedTrashIds.length === 0}
              >
                Restore selected
              </button>
            </div>
            <p className="trash-info">
              Deleted tasks stay here for 2 days before permanent delete.
            </p>
            {trash.length === 0 ? (
              <p className="empty-text">Trash is empty.</p>
            ) : (
              <div className="tasks-list">
                {trash.map((t) => (
                  <div key={t.id} className="task-card trash-task">
                    <div className="trash-select">
                      <input
                        type="checkbox"
                        checked={selectedTrashIds.includes(t.id)}
                        onChange={() => toggleTrashSelect(t.id)}
                      />
                      <span className="trash-title">
                        {t.title || "(no title)"}
                      </span>
                    </div>
                    {t.description && (
                      <p className="trash-desc">{t.description}</p>
                    )}
                    <div className="task-footer">
                      <span className="task-date">
                        Deleted: {new Date(t.deletedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
