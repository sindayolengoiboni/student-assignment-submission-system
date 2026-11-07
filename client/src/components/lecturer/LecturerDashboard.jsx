import React, { useState } from 'react';
import CreateAssignmentForm from './CreateAssignmentForm';
import ViewSubmissions from './ViewSubmissions';
import './Lecturer.css';

const LecturerDashboard = () => {
  const [assignments, setAssignments] = useState([]);

  const handleAddAssignment = (newAssignment) => {
    setAssignments([...assignments, newAssignment]);
  };

  return (
    <div className="lecturer-dashboard">
      <h1 className="dashboard-header">Lecturer Dashboard</h1>
      <CreateAssignmentForm onAddAssignment={handleAddAssignment} />
      <ViewSubmissions />
    </div>
  );
};

export default LecturerDashboard;