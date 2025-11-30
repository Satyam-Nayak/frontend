import React, { useEffect, useState } from "react";
import "./App.css";
import AuthForm from "./components/AuthForm";
import TaskDashboard from "./components/TaskDashboard";

function App() {
  const [username, setUsername] = useState(
    localStorage.getItem("tm_username") || ""
  );

  const [theme, setTheme] = useState(
    localStorage.getItem("tm_theme") || "light"
  );

  // Apply theme on body
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("tm_theme", theme);
  }, [theme]);

  function handleLogin(name) {
    setUsername(name);
  }

  function handleLogout() {
    setUsername("");
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <div className="app-bg">
      <div className="app-glass">
        {username ? (
          <TaskDashboard
            username={username}
            onLogout={handleLogout}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        ) : (
          <AuthForm onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
}

export default App;
