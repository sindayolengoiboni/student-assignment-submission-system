import React, { useEffect, useState } from 'react';

const API = 'http://127.0.0.1:5000';

const fallbackSubmissions = [
  { id: 1, studentName: "John Doe", assignment: "SCM Assignment 1", status: "Submitted", date: "2026-10-15" },
  { id: 2, studentName: "Jane Smith", assignment: "SCM Assignment 1", status: "Graded", date: "2026-10-14" }
];

const ViewSubmissions = () => {
  const [submissions, setSubmissions] = useState(fallbackSubmissions);

  useEffect(() => {
    let isMounted = true;

    async function loadSubmissions() {
      try {
        const res = await fetch(`${API}/api/submissions`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setSubmissions(data);
        }
      } catch {
        // Keep fallbackSubmissions until /api/submissions is added
      }
    }

    loadSubmissions();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="submissions-container">
      <h2>Student Submissions</h2>
      {submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <div className="submissions-list">
          {submissions.map((sub) => (
            <div key={sub.id} className="submission-item">
              <strong>{sub.studentName || sub.student_name}</strong> - {sub.assignment || sub.assignment_title} <br />
              <small>Status: {sub.status} | Submitted on: {sub.date || sub.submission_date}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewSubmissions;