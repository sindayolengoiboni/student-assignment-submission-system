from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.database import get_db_connection

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    role = data.get("role", "student")

    if not full_name or not email or len(password) < 6:
        return jsonify({"error": "Name, email and a password of 6+ characters are required."}), 400

    # Admins are not allowed to sign themselves up
    if role not in ("student", "lecturer"):
        return jsonify({"error": "Role must be student or lecturer."}), 400

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        db.close()
        return jsonify({"error": "That email is already registered."}), 409

    cursor.execute(
        "INSERT INTO users (full_name, email, password, role) VALUES (%s, %s, %s, %s)",
        (full_name, email, generate_password_hash(password), role),
    )
    db.commit()
    db.close()
    return jsonify({"message": "Account created."}), 201


@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, full_name, email, password, role FROM users WHERE email = %s",
        (email,),
    )
    user = cursor.fetchone()
    db.close()

    if user is None or not check_password_hash(user["password"], password):
        return jsonify({"error": "Wrong email or password."}), 401

    return jsonify({
        "id": user["id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "role": user["role"],
    }), 200