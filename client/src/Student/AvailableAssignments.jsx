
import { useEffect, useState } from "react";
import "./Student.css";

const API = "http://127.0.0.1:5000";

export default function AvailableAssignments({ user, onSelectAssignment }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAssignments() {
      if (!user?.id) {
        setError("Student information is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API}/api/student/assignments?student_id=${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load assignments.");
        }

        if (isMounted) {
          setAssignments(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAssignments();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <div className="student-dashboard">
      <h1>Available Assignments</h1>
      <p>View assignments provided by your lecturers.</p>

      <div className="student-content">
        {loading && <p>Loading assignments...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && assignments.length === 0 && (
          <p>No assignments are currently available.</p>
        )}

        {!loading &&
          !error &&
          assignments.map((assignment) => (
            <div className="student-card" key={assignment.id}>
              <h3>{assignment.title}</h3>

              <p>
                Description:{" "}
                {assignment.description || "No description provided"}
              </p>

              <p>
                Deadline:{" "}
                {assignment.deadline
                  ? new Date(assignment.deadline).toLocaleString()
                  : "Not specified"}
              </p>

              <p>Status: {assignment.submission_status}</p>

              {assignment.assignment_file_name && (
                <div className="assignment-file">
                  <p>
                    <strong>Assignment Instructions:</strong>{" "}
                    {assignment.assignment_file_name}
                  </p>

                  <a
                    href={`${API}${assignment.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Assignment File
                  </a>

                  {" | "}

                  <a href={`${API}${assignment.download_url}`}>
                    Download Assignment File
                  </a>
                </div>
              )}

              {!assignment.assignment_file_name && (
                <p>No instruction file attached.</p>
              )}

              {assignment.submission_status === "Not submitted" ? (
                <button
                  type="button"
                  onClick={() => onSelectAssignment?.(assignment.id)}
                >
                  Select Assignment
                </button>
              ) : (
                <button type="button" disabled>
                  Already Submitted
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
