
import "./Student.css";

export default function StudentDashboard() {
  return (
    <div className="student-dashboard">
      <header className="student-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome! Manage your assignments here.</p>
        </div>
      </header>

      <section className="student-overview">
        <div className="student-card">
          <h3>Available Assignments</h3>
          <p>0</p>
        </div>

        <div className="student-card">
          <h3>Submitted</h3>
          <p>0</p>
        </div>

        <div className="student-card">
          <h3>Pending</h3>
          <p>0</p>
        </div>
      </section>

      <section className="student-content">
        <h2>My Assignments</h2>
        <p>Your available assignments will appear here.</p>
      </section>
    </div>
  );
}
