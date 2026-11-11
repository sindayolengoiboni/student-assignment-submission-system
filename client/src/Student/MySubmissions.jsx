
import { useState } from "react";
import "./Student.css";

export default function SubmitAssignment() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file before submitting.");
      return;
    }

    setMessage(`Successfully submitted: ${file.name}`);
    setFile(null);
    e.target.reset();
  }

  return (
    <div className="student-dashboard">
      <h1>Submit Assignment</h1>
      <p>Upload your completed assignment below.</p>

      <form className="student-content" onSubmit={handleSubmit}>
        <label>Select Assignment</label>
        <select required>
          <option value="">Choose an assignment</option>
          <option value="1">Software Engineering Assignment</option>
          <option value="2">Database Management Coursework</option>
        </select>

        <br /><br />

        <label>Upload Your File</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <br /><br />

        <button type="submit">Submit Assignment</button>

        <p>{message}</p>
      </form>
    </div>
  );
}
