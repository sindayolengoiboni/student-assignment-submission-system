
import os
import uuid
from datetime import datetime

from flask import (
    Blueprint,
    current_app,
    jsonify,
    request,
    send_from_directory
)
from mysql.connector import errors
from werkzeug.utils import secure_filename

from app.database import get_db_connection


submissions_bp = Blueprint("submissions", __name__, url_prefix="/api")

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def allowed_file(filename):
    """Check whether the file has an allowed extension."""
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def display_name(stored_name):
    """Remove the unique prefix from the stored filename."""
    if len(stored_name) > 33 and stored_name[32] == "_":
        return stored_name[33:]
    return stored_name


def get_upload_directory():
    """Return the directory where submitted files are stored."""
    return os.path.abspath(
        os.path.join(current_app.root_path, "..", "uploads")
    )


@submissions_bp.route("/submissions", methods=["POST"])
def submit_assignment():
    """Allow a student to upload and submit an assignment."""

    assignment_id = request.form.get("assignment_id")
    student_id = request.form.get("student_id")
    file = request.files.get("file")

    if not assignment_id or not student_id:
        return jsonify({
            "error": "assignment_id and student_id are required."
        }), 400

    if file is None or file.filename == "":
        return jsonify({
            "error": "Please select a file before submitting."
        }), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": "Only PDF, DOC and DOCX files are allowed."
        }), 400

    if request.content_length and request.content_length > MAX_FILE_SIZE:
        return jsonify({
            "error": "File is too large (maximum 10 MB)."
        }), 413

    original_name = secure_filename(file.filename)

    if not original_name:
        return jsonify({"error": "Invalid file name."}), 400

    connection = get_db_connection()
    saved_path = None

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT deadline FROM assignments WHERE id = %s",
            (assignment_id,)
        )
        assignment = cursor.fetchone()

        if assignment is None:
            return jsonify({"error": "Assignment not found."}), 404

        status = (
            "Late"
            if datetime.now() > assignment["deadline"]
            else "Submitted"
        )

        stored_name = f"{uuid.uuid4().hex}_{original_name}"

        upload_dir = get_upload_directory()
        os.makedirs(upload_dir, exist_ok=True)

        saved_path = os.path.join(upload_dir, stored_name)
        file.save(saved_path)

        try:
            cursor.execute(
                """
                INSERT INTO submissions
                (assignment_id, student_id, file_path, status)
                VALUES (%s, %s, %s, %s)
                """,
                (assignment_id, student_id, stored_name, status)
            )

            connection.commit()
            new_id = cursor.lastrowid

        except errors.IntegrityError as err:
            if saved_path and os.path.exists(saved_path):
                os.remove(saved_path)

            if err.errno == 1062:
                return jsonify({
                    "error": "You have already submitted this assignment."
                }), 409

            return jsonify({
                "error": "Student or assignment does not exist."
            }), 400

        return jsonify({
            "id": new_id,
            "message": f"Successfully submitted: {original_name}",
            "status": status
        }), 201

    finally:
        connection.close()


@submissions_bp.route("/student/submissions", methods=["GET"])
def list_student_submissions():
    """Get actual submissions belonging to one student."""

    student_id = request.args.get("student_id")

    if not student_id:
        return jsonify({"error": "student_id is required."}), 400

    connection = get_db_connection()

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                s.id,
                s.assignment_id,
                a.title,
                s.file_path,
                s.submission_date,
                s.status
            FROM submissions s
            JOIN assignments a
                ON a.id = s.assignment_id
            WHERE s.student_id = %s
            ORDER BY s.submission_date DESC
            """,
            (student_id,)
        )

        rows = cursor.fetchall()

        results = [
            {
                "id": row["id"],
                "assignment_id": row["assignment_id"],
                "title": row["title"],
                "file_name": display_name(
                    os.path.basename(row["file_path"] or "")
                ),
                "submitted_on": (
                    row["submission_date"].isoformat()
                    if row["submission_date"] else None
                ),
                "status": row["status"]
            }
            for row in rows
        ]

        return jsonify(results), 200

    finally:
        connection.close()


@submissions_bp.route("/student/assignments", methods=["GET"])
def student_assignments():
    """Get available assignments and their submission status."""

    student_id = request.args.get("student_id")

    if not student_id:
        return jsonify({"error": "student_id is required."}), 400

    connection = get_db_connection()

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                a.id,
                a.title,
                a.description,
                a.deadline,
                a.assignment_file_name,
                a.assignment_file_path,
                s.status AS submission_status
            FROM assignments a
            LEFT JOIN submissions s
                ON s.assignment_id = a.id
                AND s.student_id = %s
            ORDER BY a.deadline ASC
            """,
            (student_id,)
        )

        rows = cursor.fetchall()

        results = [
            {
                "id": row["id"],
                "title": row["title"],
                "description": row["description"],
                "deadline": (
                    row["deadline"].isoformat()
                    if row["deadline"] else None
                ),
                "submission_status": (
                    row["submission_status"] or "Not submitted"
                ),
                "assignment_file_name": row["assignment_file_name"],
                "file_url": (
                    f"/api/assignments/{row['id']}/file"
                    if row["assignment_file_path"] else None
                ),
                "download_url": (
                    f"/api/assignments/{row['id']}/file?download=1"
                    if row["assignment_file_path"] else None
                )
            }
            for row in rows
        ]

        return jsonify(results), 200

    finally:
        connection.close()


@submissions_bp.route(
    "/lecturer/submissions/<int:submission_id>/file",
    methods=["GET"]
)
def view_submission_file(submission_id):
    """Allow the lecturer to view or download a submitted assignment."""

    connection = get_db_connection()

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT file_path
            FROM submissions
            WHERE id = %s
            """,
            (submission_id,)
        )

        submission = cursor.fetchone()

        if not submission or not submission["file_path"]:
            return jsonify({
                "error": "Submission file not found."
            }), 404

        stored_name = os.path.basename(submission["file_path"])
        upload_dir = get_upload_directory()

        file_path = os.path.join(upload_dir, stored_name)

        if not os.path.isfile(file_path):
            return jsonify({
                "error": "Uploaded file does not exist."
            }), 404

        download = request.args.get("download") == "1"
        original_name = display_name(stored_name)

        return send_from_directory(
            upload_dir,
            stored_name,
            as_attachment=download,
            download_name=original_name
        )

    finally:
        connection.close()
