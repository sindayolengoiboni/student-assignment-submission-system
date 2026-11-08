import React, { useState } from 'react';

const CreateAssignmentForm = ({ onAddAssignment }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !deadline) return alert("Title and deadline are required!");
    
    const newAssignment = { id: Date.now(), title, description, deadline };
    onAddAssignment(newAssignment);
    setTitle(''); setDescription(''); setDeadline('');
    alert("Assignment Created Successfully!");
  };

  return (
    <div className="form-container">
      <h2>Create New Assignment</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Assignment Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., SCM Assignment 2" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about the task..." rows="4" />
        </div>
        <div className="form-group">
          <label>Deadline</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <button type="submit" className="submit-btn">Publish Assignment</button>
      </form>
    </div>
  );
};

export default CreateAssignmentForm;