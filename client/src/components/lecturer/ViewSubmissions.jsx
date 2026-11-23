
import React, { useEffect, useState } from "react";

const API = "http://127.0.0.1:5000";

const ViewSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const res = await fetch(`${API}/api/lecturer/submissions`);

        if (!res.ok) {
          throw new Error("Unable to load student submissions.");
        }

        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadSubmissions();
  }, []);

  if (loading) {
    return <p>Loading student submissions...</p>;
  }

  return (
    <div className="submissions-container">
      <h2>Student Submissions</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!error && submissions.length === 0 && (
        <p>No student submissions yet.</p>
      )}

      <div className="submissions-list">
        {submissions.map((sub) => (
          <div key={sub.id} className="submission-item">

            <strong>{sub.studentName}</strong>

            {" - "}

            {sub.assignment}

            <br />

            <small>
              Status: {sub.status} | Submitted on:{" "}
              {sub.date
                ? new Date(sub.date).toLocaleDateString()
                : "N/A"}
            </small>

            {sub.file_url && (
              <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>

                <a
                  href={`${API}${sub.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    padding: "8px 14px",
                    borderRadius: "5px",
                    textDecoration: "none"
                  }}
                >
                  View Submission
                </a>

                <a
                  href={`${API}${sub.file_url}?download=1`}
                  style={{
                    backgroundColor: "#16a34a",
                    color: "white",
                    padding: "8px 14px",
                    borderRadius: "5px",
                    textDecoration: "none"
                  }}
                >
                  Download
                </a>

              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewSubmissions;
