import os
import uuid
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request
from mysql.connector import errors
from werkzeug.utils import secure_filename

from app.database import get_db_connection

submissions_bp = Blueprint("submissions", __name__, url_prefix="/api")

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def allowed_file(filename):
    """Accept only the file types the student form allows."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def display_name(stored_name):
    """Files are stored as '<32 hex chars>_<original name>'; show the original."""
    if len(stored_name) > 33 and stored_name[32] == "_":
        return stored_name[33:]
    return stored_name


@submissions_bp.route("/submissions", methods=["POST"])
def submit_assignment():
    """A student submits a file for an assignment."""
    assignment_id = request.form.get("assignment_id")
    student_id = request.form.get("student_id")
    file = request.files.get("file")

    if not assignment_id or not student_id:
        return jsonify({"error": "assignment_id and student_id are required."}), 400

    if file is None or file.filename == "":
        return jsonify({"error": "Please select a file before submitting."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF, DOC and DOCX files are allowed."}), 400

    if request.content_length and request.content_length > MAX_FILE_SIZE:
        return jsonify({"error": "File is too large (maximum 10 MB)."}), 413

    original_name = secure_filename(file.filename)
    if not original_name:
        return jsonify({"error": "Invalid file name."}), 400

    connection = get_db_connection()
    saved_path = None
    try:
        cursor = connection.cursor(dictionary=True)

        # The assignment must exist, and its deadline decides Submitted vs Late.
        cursor.execute("SELECT deadline FROM assignments WHERE id = %s", (assignment_id,))
        assignment = cursor.fetchone()
        if assignment is None:
            return jsonify({"error": "Assignment not found."}), 404

        status = "Late" if datetime.now() > assignment["deadline"] else "Submitted"

        # Unique stored name so two students can both upload "report.pdf".
        stored_name = f"{uuid.uuid4().hex}_{original_name}"
        upload_dir = os.path.join(current_app.root_path, "..", "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        saved_path = os.path.join(upload_dir, stored_name)
        file.save(saved_path)

        try:
            cursor.execute(
                "INSERT INTO submissions (assignment_id, student_id, file_path, status) "
                "VALUES (%s, %s, %s, %s)",
                (assignment_id, student_id, stored_name, status),
            )
            connection.commit()
        except errors.IntegrityError as err:
            os.remove(saved_path)  # don't keep a file with no database record
            if err.errno == 1062:  # UNIQUE (assignment_id, student_id)
                return jsonify({"error": "You have already submitted this assignment."}), 409
            return jsonify({"error": "Student or assignment does not exist."}), 400

        new_id = cursor.lastrowid
    finally:
        connection.close()

    return jsonify(
        {
            "id": new_id,
            "message": f"Successfully submitted: {original_name}",
            "status": status,
        }
    ), 201


@submissions_bp.route("/submissions", methods=["GET"])
def list_submissions():
    """List one student's submissions with their status (newest first)."""
    student_id = request.args.get("student_id")
    if not student_id:
        return jsonify({"error": "student_id is required."}), 400

    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT s.id, s.assignment_id, a.title, s.file_path, "
            "s.submission_date, s.status "
            "FROM submissions s JOIN assignments a ON a.id = s.assignment_id "
            "WHERE s.student_id = %s ORDER BY s.submission_date DESC",
            (student_id,),
        )
        rows = cursor.fetchall()
    finally:
        connection.close()

    results = [
        {
            "id": row["id"],
            "assignment_id": row["assignment_id"],
            "title": row["title"],
            "file_name": display_name(row["file_path"] or ""),
            "submitted_on": row["submission_date"].isoformat(),
            "status": row["status"],
        }
        for row in rows
    ]
    return jsonify(results), 200


@submissions_bp.route("/student/assignments", methods=["GET"])
def student_assignments():
    """Assignments a student can see, with whether they have submitted yet."""
    student_id = request.args.get("student_id")
    if not student_id:
        return jsonify({"error": "student_id is required."}), 400

    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT a.id, a.title, a.description, a.deadline, "
            "s.status AS submission_status "
            "FROM assignments a "
            "LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = %s "
            "ORDER BY a.deadline ASC",
            (student_id,),
        )
        rows = cursor.fetchall()
    finally:
        connection.close()

    results = [
        {
            "id": row["id"],
            "title": row["title"],
            "description": row["description"],
            "deadline": row["deadline"].isoformat(),
            "submission_status": row["submission_status"] or "Not submitted",
        }
        for row in rows
    ]
    return jsonify(results), 200
