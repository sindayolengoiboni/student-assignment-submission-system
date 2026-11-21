import "./Student.css";

// Mock data for now. Later this will come from the backend (GET /submissions).
const submissions = [
  {
    id: 1,
    title: "Software Engineering Assignment",
    fileName: "se-assignment.pdf",
    submittedOn: "15 November 2026",
    status: "Submitted",
  },
  {
    id: 2,
    title: "Database Management Coursework",
    fileName: "dbms-coursework.docx",
    submittedOn: "18 November 2026",
    status: "Graded",
  },
];

export default function MySubmissions() {
  return (
    <div className="student-dashboard">
      <h1>My Submissions</h1>
      <p>Track the work you have submitted and its status.</p>

      <div className="student-content">
        {submissions.length === 0 ? (
          <p>You have not submitted any assignments yet.</p>
        ) : (
          submissions.map((sub) => (
            <div className="student-card" key={sub.id}>
              <h3>{sub.title}</h3>
              <p>File: {sub.fileName}</p>
              <p>Submitted on: {sub.submittedOn}</p>
              <p>Status: {sub.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
