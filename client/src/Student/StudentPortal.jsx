
import { useState } from "react";
import StudentDashboard from "./StudentDashboard";
import AvailableAssignments from "./AvailableAssignments";
import SubmitAssignment from "./SubmitAssignment";
import MySubmissions from "./MySubmissions";
import "./Student.css";

export default function StudentPortal() {
  const [activePage, setActivePage] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "assignments", label: "Available Assignments", icon: "▤" },
    { id: "submit", label: "Submit Work", icon: "↑" },
    { id: "submissions", label: "My Submissions", icon: "◷" },
  ];

  const pages = {
    dashboard: <StudentDashboard />,
    assignments: <AvailableAssignments />,
    submit: <SubmitAssignment />,
    submissions: <MySubmissions />,
  };

  return (
    <div className="portal-layout">
      <aside className="student-sidebar">
        <div className="portal-brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>Student Portal</h2>
            <span>Learning Dashboard</span>
          </div>
        </div>

        <p className="nav-heading">MENU</p>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={activePage === item.id ? "active" : ""}
              onClick={() => setActivePage(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>Student Account</span>
          <p>Assignment Management</p>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <div>
            <span>STUDENT WORKSPACE</span>
            <h3>My Learning Space</h3>
          </div>
          <div className="student-avatar">S</div>
        </header>

        {pages[activePage]}
      </main>
    </div>
  );
}

