
import "./Student.css";

const assignments = [
  {
    id: 1,
    title: "Software Engineering Assignment",
    course: "Software Engineering",
    deadline: "20 November 2026",
    status: "Open",
  },
  {
    id: 2,
    title: "Database Management Coursework",
    course: "Database Systems",
    deadline: "22 November 2026",
    status: "Open",
  },
];

export default function AvailableAssignments() {
  return (
    <div className="student-dashboard">
      <h1>Available Assignments</h1>
      <p>View assignments provided by your lecturers.</p>

      <div className="student-content">
        {assignments.map((assignment) => (
          <div className="student-card" key={assignment.id}>
            <h3>{assignment.title}</h3>
            <p>Course: {assignment.course}</p>
            <p>Deadline: {assignment.deadline}</p>
            <p>Status: {assignment.status}</p>
            <button>View Assignment</button>
          </div>
        ))}
      </div>
    </div>
  );
}
