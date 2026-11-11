
import { useState } from "react";
import StudentDashboard from "./StudentDashboard";
import AvailableAssignments from "./AvailableAssignments";
import SubmitAssignment from "./SubmitAssignment";
import MySubmissions from "./MySubmissions";
import "./Student.css";

export default function StudentPortal() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div>
      <nav className="student-nav">
        <button onClick={() => setActivePage("dashboard")}>
          Dashboard
        </button>

        <button onClick={() => setActivePage("assignments")}>
          Assignments
        </button>

        <button onClick={() => setActivePage("submit")}>
          Submit Work
        </button>

        <button onClick={() => setActivePage("submissions")}>
          My Submissions
        </button>
      </nav>

      {activePage === "dashboard" && <StudentDashboard />}
      {activePage === "assignments" && <AvailableAssignments />}
      {activePage === "submit" && <SubmitAssignment />}
      {activePage === "submissions" && <MySubmissions />}
    </div>
  );
}
