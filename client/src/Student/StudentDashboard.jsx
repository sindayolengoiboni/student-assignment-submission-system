
import { useEffect, useState } from "react";
import "./Student.css";

const API = "http://127.0.0.1:5000";

export default function StudentDashboard({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!user?.id) {
        setError("Student information is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const [assignmentResponse, submissionResponse] =
          await Promise.all([
            fetch(
              `${API}/api/student/assignments?student_id=${user.id}`
            ),
            fetch(
              `${API}/api/student/submissions?student_id=${user.id}`
            )
          ]);

        const assignmentData = await assignmentResponse.json();
        const submissionData = await submissionResponse.json();

        if (!assignmentResponse.ok) {
          throw new Error(
            assignmentData.error || "Could not load assignments."
          );
        }

        if (!submissionResponse.ok) {
          throw new Error(
            submissionData.error || "Could not load submissions."
          );
        }

        if (isMounted) {
          setAssignments(assignmentData);
          setSubmissions(submissionData);
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

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const totalAssignments = assignments.length;

  const submittedCount = assignments.filter(
    (assignment) =>
      assignment.submission_status !== "Not submitted"
  ).length;

  const pendingCount = totalAssignments - submittedCount;

  const recentSubmissions = submissions.slice(0, 3);

  return (
    <div className="student-dashboard">
      <header className="student-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>
            Welcome, {user?.full_name || "Student"}!
            Manage your assignments here.
          </p>
        </div>
      </header>

      {loading && <p>Loading dashboard...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <>
          <section className="student-overview">
            <div className="student-card">
              <h3>Available Assignments</h3>
              <p>{totalAssignments}</p>
            </div>

            <div className="student-card">
              <h3>Submitted</h3>
              <p>{submittedCount}</p>
            </div>

            <div className="student-card">
              <h3>Pending</h3>
              <p>{pendingCount}</p>
            </div>
          </section>

          <section className="student-content">
            <h2>Recent Submissions</h2>

            {recentSubmissions.length === 0 ? (
              <p>You have not submitted any assignments yet.</p>
            ) : (
              recentSubmissions.map((submission) => (
                <div className="student-card" key={submission.id}>
                  <h3>{submission.title}</h3>
                  <p>File: {submission.file_name}</p>
                  <p>Status: {submission.status}</p>
                  <p>
                    Submitted on:{" "}
                    {submission.submitted_on
                      ? new Date(
                          submission.submitted_on
                        ).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
