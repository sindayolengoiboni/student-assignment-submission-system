
import { useEffect, useState } from "react";
import "./Student.css";

const API = "http://127.0.0.1:5000";

export default function SubmitAssignment({
  user,
  selectedAssignmentId,
}) {
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState(
    selectedAssignmentId ? String(selectedAssignmentId) : ""
  );
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedAssignmentId) {
      setAssignmentId(String(selectedAssignmentId));
    }
  }, [selectedAssignmentId]);

  useEffect(() => {
    let isMounted = true;

    async function loadAssignments() {
      try {
        if (!user?.id) {
          throw new Error("Student information is missing. Please log in again.");
        }

        const response = await fetch(
          `${API}/api/student/assignments?student_id=${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load assignments.");
        }

        if (isMounted) {
          setAssignments(data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAssignments();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!user?.id) {
      setMessage("Please log in again.");
      return;
    }

    if (!assignmentId || !file) {
      setMessage("Please select an assignment and a file.");
      return;
    }

    const formData = new FormData();
    formData.append("assignment_id", assignmentId);
    formData.append("student_id", user.id);
    formData.append("file", file);

    try {
      setSubmitting(true);

      const response = await fetch(`${API}/api/submissions`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      setMessage(data.message || "Assignment submitted successfully.");
      setFile(null);
      e.target.reset();

      // Remove the submitted assignment from the available options.
      setAssignments((previous) =>
        previous.map((assignment) =>
          String(assignment.id) === assignmentId
            ? {
                ...assignment,
                submission_status: data.status || "Submitted",
              }
            : assignment
        )
      );

    } catch (error) {
      setMessage(error.message || "Unable to submit assignment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="student-dashboard">
      <h1>Submit Assignment</h1>
      <p>Upload your completed assignment below.</p>

      <form className="student-content" onSubmit={handleSubmit}>
        <label>Select Assignment</label>

        <select
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          required
          disabled={loading}
        >
          <option value="">
            {loading ? "Loading assignments..." : "Choose an assignment"}
          </option>

          {assignments
            .filter(
              (assignment) =>
                assignment.submission_status === "Not submitted"
            )
            .map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
        </select>

        <br /><br />

        <label>Upload Your File</label>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0] || null)}
          required
        />

        <p>Accepted formats: PDF, DOC and DOCX. Maximum size: 10 MB.</p>

        <br />

        <button type="submit" disabled={submitting || loading}>
          {submitting ? "Submitting..." : "Submit Assignment"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
