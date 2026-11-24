import os
import uuid
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from app.database import get_db_connection
from app.routes.submissions import MAX_FILE_SIZE, allowed_file

submission_edit_bp = Blueprint("submission_edit", __name__, url_prefix="/api")


@submission_edit_bp.route("/submissions/<int:submission_id>", methods=["PUT"])
def edit_submission(submission_id):
    """Change request: a student replaces their submitted file before the deadline."""
    student_id = request.form.get("student_id")
    file = request.files.get("file")

    if not student_id:
        return jsonify({"error": "student_id is required."}), 400

    if file is None or file.filename == "":
        return jsonify({"error": "Please select a file before saving your changes."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF, DOC and DOCX files are allowed."}), 400

    if request.content_length and request.content_length > MAX_FILE_SIZE:
        return jsonify({"error": "File is too large (maximum 10 MB)."}), 413

    original_name = secure_filename(file.filename)
    if not original_name:
        return jsonify({"error": "Invalid file name."}), 400

    upload_dir = os.path.join(current_app.root_path, "..", "uploads")

    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT s.student_id, s.file_path, a.deadline "
            "FROM submissions s JOIN assignments a ON a.id = s.assignment_id "
            "WHERE s.id = %s",
            (submission_id,),
        )
        submission = cursor.fetchone()

        if submission is None:
            return jsonify({"error": "Submission not found."}), 404

        # Only the student who made the submission may change it.
        if str(submission["student_id"]) != str(student_id):
            return jsonify({"error": "You can only edit your own submission."}), 403

        # The change request: editing is allowed only before the deadline.
        if datetime.now() > submission["deadline"]:
            return jsonify(
                {"error": "The deadline has passed, so this submission can no longer be edited."}
            ), 403

        stored_name = f"{uuid.uuid4().hex}_{original_name}"
        os.makedirs(upload_dir, exist_ok=True)
        new_path = os.path.join(upload_dir, stored_name)
        file.save(new_path)

        try:
            cursor.execute(
                "UPDATE submissions SET file_path = %s, submission_date = NOW() WHERE id = %s",
                (stored_name, submission_id),
            )
            connection.commit()
        except Exception:
            os.remove(new_path)  # don't keep a file with no database record
            raise
    finally:
        connection.close()

    # The database now points at the new file, so the old one can go.
    old_file = submission["file_path"]
    if old_file:
        try:
            os.remove(os.path.join(upload_dir, old_file))
        except OSError:
            pass

    return jsonify(
        {
            "id": submission_id,
            "message": f"Submission updated: {original_name}",
            "status": "Submitted",
        }
    ), 200