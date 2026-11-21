from flask import Blueprint, request, jsonify
from app.database import get_db_connection

lecturer_bp = Blueprint("lecturer", __name__)


@lecturer_bp.route("/api/assignments", methods=["GET"])
def get_assignments():
    lecturer_id = request.args.get("lecturer_id")
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    if lecturer_id:
        cursor.execute(
            "SELECT id, lecturer_id, title, description, deadline, created_at FROM assignments WHERE lecturer_id = %s ORDER BY created_at DESC",
            (lecturer_id,),
        )
    else:
        cursor.execute(
            "SELECT id, lecturer_id, title, description, deadline, created_at FROM assignments ORDER BY created_at DESC"
        )

    rows = cursor.fetchall()
    db.close()
    return jsonify(rows), 200


@lecturer_bp.route("/api/assignments", methods=["POST"])
def create_assignment():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    deadline = (data.get("deadline") or "").strip()
    lecturer_id = data.get("lecturer_id")

    if not title or not deadline:
        return jsonify({"error": "Title and deadline are required."}), 400

    if len(deadline) == 10:
        deadline = f"{deadline} 23:59:59"

    db = get_db_connection()
    cursor = db.cursor()

    if not lecturer_id:
        cursor.execute("SELECT id FROM users WHERE role = 'lecturer' LIMIT 1")
        row = cursor.fetchone()
        lecturer_id = row[0] if row else None

    if not lecturer_id:
        db.close()
        return jsonify({"error": "No lecturer account found for lecturer_id."}), 400

    cursor.execute(
        "INSERT INTO assignments (lecturer_id, title, description, deadline) VALUES (%s, %s, %s, %s)",
        (lecturer_id, title, description, deadline),
    )
    db.commit()
    new_id = cursor.lastrowid
    db.close()

    return jsonify({
        "assignment": {
            "id": new_id,
            "lecturer_id": lecturer_id,
            "title": title,
            "description": description,
            "deadline": deadline,
        }
    }), 201


@lecturer_bp.route("/api/submissions", methods=["GET"])
def get_submissions():
    db = get_db_connection()
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
    db.close()
    return jsonify(rows), 200