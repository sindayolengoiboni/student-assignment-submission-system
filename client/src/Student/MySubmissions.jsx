
import { useEffect, useState } from "react";
import "./Student.css";

const API = "http://127.0.0.1:5000";

export default function MySubmissions({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSubmissions() {
      if (!user?.id) {
        setError("Student information is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API}/api/student/submissions?student_id=${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load submissions.");
        }

        if (isMounted) {
          setSubmissions(data);
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

    loadSubmissions();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <div className="student-dashboard">
      <h1>My Submissions</h1>
      <p>Track the work you have submitted and its status.</p>

      <div className="student-content">

        {loading && <p>Loading your submissions...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && submissions.length === 0 && (
          <p>You have not submitted any assignments yet.</p>
        )}

        {!loading && !error && submissions.map((sub) => (
          <div className="student-card" key={sub.id}>
            <h3>{sub.title}</h3>

            <p>File: {sub.file_name}</p>

            <p>
              Submitted on:{" "}
              {sub.submitted_on
                ? new Date(sub.submitted_on).toLocaleString()
                : "Not available"}
            </p>

            <p>Status: {sub.status}</p>
          </div>
        ))}

      </div>
    </div>
  );
}
