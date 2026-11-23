
import React, { useState } from 'react';

const CreateAssignmentForm = ({ onAddAssignment }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !deadline) {
      alert('Title and deadline are required!');
      return;
    }

    if (file) {
      const allowedExtensions = ['pdf', 'doc', 'docx'];
      const extension = file.name.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(extension)) {
        alert('Only PDF, DOC and DOCX files are allowed.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('The file must not be larger than 10 MB.');
        return;
      }
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('deadline', deadline);

    if (file) {
      formData.append('file', file);
    }

    setSaving(true);

    try {
      await onAddAssignment(formData);

      setTitle('');
      setDescription('');
      setDeadline('');
      setFile(null);

      e.target.reset();
    } catch (error) {
      alert(error.message || 'Unable to create assignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create New Assignment</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Assignment Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., SCM Assignment 2"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details about the task..."
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Assignment Instructions File (Optional)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
          <small>Accepted formats: PDF, DOC, DOCX. Maximum size: 10 MB.</small>

          {file && <p>Selected file: {file.name}</p>}
        </div>

        <button type="submit" className="submit-btn" disabled={saving}>
          {saving ? 'Publishing...' : 'Publish Assignment'}
        </button>
      </form>
    </div>
  );
};

export default CreateAssignmentForm;
