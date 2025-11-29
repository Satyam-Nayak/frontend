import React, { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import TaskDashboard from "./components/TaskDashboard";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("tm_username");
    if (saved) setUser(saved);
  }, []);

  return (
    <div className="app-bg">
      <div className="app-glass">
        {user ? (
          <TaskDashboard username={user} onLogout={() => setUser(null)} />
        ) : (
          <AuthForm onLogin={setUser} />
        )}
      </div>
    </div>
  );
}
