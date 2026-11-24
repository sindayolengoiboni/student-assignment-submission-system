
from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__)

    app.config.from_object("app.config.Config")

    CORS(app)

    # Register authentication routes
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    # Register lecturer routes
    from app.routes.lecturer import lecturer_bp
    app.register_blueprint(lecturer_bp)

    # Register student submission routes
    from app.routes.submissions import submissions_bp
    app.register_blueprint(submissions_bp)

    @app.route("/")
    def home():
        return {
            "message": "Student Assignment Submission System API is running"
        }
    from app.routes.submission_edit import submission_edit_bp
    app.register_blueprint(submission_edit_bp)
    return app
