import React from 'react';

const ViewSubmissions = () => {
  const mockSubmissions = [
    { id: 1, studentName: "John Doe", assignment: "SCM Assignment 1", status: "Submitted", date: "2026-10-15" },
    { id: 2, studentName: "Jane Smith", assignment: "SCM Assignment 1", status: "Graded", date: "2026-10-14" }
  ];

  return (
    <div className="submissions-container">
      <h2>Student Submissions</h2>
      {mockSubmissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <div className="submissions-list">
          {mockSubmissions.map((sub) => (
            <div key={sub.id} className="submission-item">
              <strong>{sub.studentName}</strong> - {sub.assignment} <br/>
              <small>Status: {sub.status} | Submitted on: {sub.date}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewSubmissions;