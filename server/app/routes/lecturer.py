
import os
import uuid

from flask import (
    Blueprint,
    current_app,
    jsonify,
    request,
    send_from_directory
)
from werkzeug.utils import secure_filename

from app.database import get_db_connection


lecturer_bp = Blueprint("lecturer", __name__)

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def display_name(stored_name):
    if len(stored_name) > 33 and stored_name[32] == "_":
        return stored_name[33:]
    return stored_name


def get_assignment_upload_directory():
    """Store lecturer instruction files separately from student submissions."""
    return os.path.abspath(
        os.path.join(
            current_app.root_path,
            "..",
            "uploads",
            "assignment_files"
        )
    )


@lecturer_bp.route("/api/assignments", methods=["GET"])
@lecturer_bp.route("/api/lecturer/assignments", methods=["GET"])
def get_assignments():
    """Get assignments created by lecturers."""

    lecturer_id = request.args.get("lecturer_id")
    db = get_db_connection()

    try:
        cursor = db.cursor(dictionary=True)

        query = """
            SELECT
                id,
                lecturer_id,
                title,
                description,
                deadline,
                assignment_file_name,
                created_at
            FROM assignments
        """

        if lecturer_id:
            query += " WHERE lecturer_id = %s"
            cursor.execute(
                query + " ORDER BY created_at DESC",
                (lecturer_id,)
            )
        else:
            cursor.execute(query + " ORDER BY created_at DESC")

        rows = cursor.fetchall()

        results = []

        for row in rows:
            results.append({
                "id": row["id"],
                "lecturer_id": row["lecturer_id"],
                "title": row["title"],
                "description": row["description"],
                "deadline": (
                    row["deadline"].isoformat()
                    if row["deadline"] else None
                ),
                "assignment_file_name": row["assignment_file_name"],
                "file_url": (
                    f"/api/assignments/{row['id']}/file"
                    if row["assignment_file_name"] else None
                ),
                "download_url": (
                    f"/api/assignments/{row['id']}/file?download=1"
                    if row["assignment_file_name"] else None
                )
            })

        return jsonify(results), 200

    finally:
        db.close()


@lecturer_bp.route("/api/assignments", methods=["POST"])
def create_assignment():
    """Create an assignment and optionally upload its instruction file."""

    title = (request.form.get("title") or "").strip()
    description = (request.form.get("description") or "").strip()
    deadline = (request.form.get("deadline") or "").strip()
    lecturer_id = request.form.get("lecturer_id")
    file = request.files.get("file")

    if not title or not deadline:
        return jsonify({
            "error": "Title and deadline are required."
        }), 400

    if len(deadline) == 10:
        deadline = f"{deadline} 23:59:59"

    original_name = None
    stored_name = None
    saved_path = None

    if file and file.filename:
        if not allowed_file(file.filename):
            return jsonify({
                "error": "Only PDF, DOC and DOCX files are allowed."
            }), 400

        if request.content_length and request.content_length > MAX_FILE_SIZE:
            return jsonify({
                "error": "File is too large. Maximum size is 10 MB."
            }), 413

        original_name = secure_filename(file.filename)

        if not original_name:
            return jsonify({"error": "Invalid file name."}), 400

        stored_name = f"{uuid.uuid4().hex}_{original_name}"

        upload_dir = get_assignment_upload_directory()
        os.makedirs(upload_dir, exist_ok=True)

        saved_path = os.path.join(upload_dir, stored_name)
        file.save(saved_path)

    db = get_db_connection()

    try:
        cursor = db.cursor()

        if not lecturer_id:
            cursor.execute(
                "SELECT id FROM users WHERE role = 'lecturer' LIMIT 1"
            )
            row = cursor.fetchone()
            lecturer_id = row[0] if row else None

        if not lecturer_id:
            if saved_path and os.path.exists(saved_path):
                os.remove(saved_path)

            return jsonify({
                "error": "No lecturer account found for lecturer_id."
            }), 400

        cursor.execute(
            """
            INSERT INTO assignments (
                lecturer_id,
                title,
                description,
                deadline,
                assignment_file_path,
                assignment_file_name
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                lecturer_id,
                title,
                description,
                deadline,
                stored_name,
                original_name
            )
        )

        db.commit()
        new_id = cursor.lastrowid

        return jsonify({
            "message": "Assignment created successfully.",
            "assignment": {
                "id": new_id,
                "lecturer_id": lecturer_id,
                "title": title,
                "description": description,
                "deadline": deadline,
                "assignment_file_name": original_name,
                "file_url": (
                    f"/api/assignments/{new_id}/file"
                    if stored_name else None
                ),
                "download_url": (
                    f"/api/assignments/{new_id}/file?download=1"
                    if stored_name else None
                )
            }
        }), 201

    except Exception:
        db.rollback()

        if saved_path and os.path.exists(saved_path):
            os.remove(saved_path)

        raise

    finally:
        db.close()


@lecturer_bp.route(
    "/api/assignments/<int:assignment_id>/file",
    methods=["GET"]
)
def view_assignment_file(assignment_id):
    """Allow students to view or download a lecturer's instruction file."""

    db = get_db_connection()

    try:
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT assignment_file_path, assignment_file_name
            FROM assignments
            WHERE id = %s
            """,
            (assignment_id,)
        )

        assignment = cursor.fetchone()

        if not assignment or not assignment["assignment_file_path"]:
            return jsonify({
                "error": "Assignment file not found."
            }), 404

        stored_name = os.path.basename(
            assignment["assignment_file_path"]
        )

        upload_dir = get_assignment_upload_directory()
        file_path = os.path.join(upload_dir, stored_name)

        if not os.path.isfile(file_path):
            return jsonify({
                "error": "The assignment file does not exist on the server."
            }), 404

        download = request.args.get("download") == "1"

        return send_from_directory(
            upload_dir,
            stored_name,
            as_attachment=download,
            download_name=assignment["assignment_file_name"] or stored_name
        )

    finally:
        db.close()


@lecturer_bp.route("/api/lecturer/submissions", methods=["GET"])
def get_submissions():
    """Get student submissions with links to their uploaded files."""

    db = get_db_connection()

    try:
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                s.id,
                u.full_name AS studentName,
                a.title AS assignment,
                s.status,
                s.submission_date AS date,
                s.file_path
            FROM submissions s
            JOIN users u ON s.student_id = u.id
            JOIN assignments a ON s.assignment_id = a.id
            ORDER BY s.submission_date DESC
            """
        )

        rows = cursor.fetchall()
        results = []

        for row in rows:
            stored_name = os.path.basename(row["file_path"] or "")

            results.append({
                "id": row["id"],
                "studentName": row["studentName"],
                "assignment": row["assignment"],
                "status": row["status"],
                "date": (
                    row["date"].isoformat()
                    if row["date"] else None
                ),
                "file_name": display_name(stored_name),
                "file_url": (
                    f"/api/lecturer/submissions/{row['id']}/file"
                    if stored_name else None
                )
            })

        return jsonify(results), 200

    finally:
        db.close()
