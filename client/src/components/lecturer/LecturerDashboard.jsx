import React, { useEffect, useState } from 'react';
import CreateAssignmentForm from './CreateAssignmentForm';
import ViewSubmissions from './ViewSubmissions';
import './Lecturer.css';

const API = 'http://127.0.0.1:5000';

const LecturerDashboard = ({ user }) => {
  const [assignments, setAssignments] = useState([]);
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAssignments() {
      try {
        const query = user?.id ? `?lecturer_id=${user.id}` : '';
        const res = await fetch(`${API}/api/assignments${query}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setAssignments(data);
          setStatusNote('');
        }
      } catch {
        // Backend assignments route not added yet; keep local assignments
      }
    }

    loadAssignments();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleAddAssignment = async (newAssignment) => {
    try {
      const res = await fetch(`${API}/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAssignment,
          lecturer_id: user?.id ?? null,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setAssignments((prev) => [...prev, saved.assignment || saved || newAssignment]);
        setStatusNote('Saved to database.');
        return;
      }
    } catch {
      // Fall back to local state until backend route is live
    }

    setAssignments((prev) => [...prev, newAssignment]);
    setStatusNote('Showing locally (backend /api/assignments not connected yet).');
  };

  return (
    <div className="lecturer-dashboard">
      <h1 className="dashboard-header">Lecturer Dashboard</h1>
      <CreateAssignmentForm onAddAssignment={handleAddAssignment} />

      <div className="submissions-container">
        <h2>Created Assignments ({assignments.length})</h2>
        {statusNote && <p className="assignment-desc">{statusNote}</p>}
        {assignments.length === 0 ? (
          <p>No assignments created yet.</p>
        ) : (
          <div className="submissions-list">
            {assignments.map((item) => (
              <div key={item.id} className="submission-item">
                <strong>{item.title}</strong> — <small>Due: {item.deadline}</small>
                {item.description && <p className="assignment-desc">{item.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <ViewSubmissions />
    </div>
  );
};

export default LecturerDashboard;