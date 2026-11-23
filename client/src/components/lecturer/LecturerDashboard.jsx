
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

        if (!res.ok) {
          throw new Error('Could not load assignments.');
        }

        const data = await res.json();

        if (isMounted && Array.isArray(data)) {
          setAssignments(data);
          setStatusNote('');
        }
      } catch (error) {
        if (isMounted) {
          setStatusNote(error.message);
        }
      }
    }

    loadAssignments();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleAddAssignment = async (formData) => {
    formData.append('lecturer_id', user?.id ?? '');

    const res = await fetch(`${API}/api/assignments`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to publish assignment.');
    }

    setAssignments((prev) => [
      data.assignment,
      ...prev,
    ]);

    setStatusNote('Assignment saved successfully.');
  };

  return (
    <div className="lecturer-dashboard">
      <h1 className="dashboard-header">Lecturer Dashboard</h1>

      <CreateAssignmentForm onAddAssignment={handleAddAssignment} />

      <div className="submissions-container">
        <h2>Created Assignments ({assignments.length})</h2>

        {statusNote && (
          <p className="assignment-desc">{statusNote}</p>
        )}

        {assignments.length === 0 ? (
          <p>No assignments created yet.</p>
        ) : (
          <div className="submissions-list">
            {assignments.map((item) => (
              <div key={item.id} className="submission-item">
                <strong>{item.title}</strong>
                <p>
                  Due: {item.deadline
                    ? new Date(item.deadline).toLocaleDateString()
                    : 'Not specified'}
                </p>

                {item.description && (
                  <p className="assignment-desc">{item.description}</p>
                )}

                {item.assignment_file_name && (
                  <p>
                    Attached file: {item.assignment_file_name}
                    {' | '}
                    <a
                      href={`${API}${item.file_url}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                    {' | '}
                    <a href={`${API}${item.download_url}`}>
                      Download
                    </a>
                  </p>
                )}
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
