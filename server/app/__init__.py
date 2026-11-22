from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    app.config.from_object("app.config.Config")

    CORS(app)

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)
    from app.routes.lecturer import lecturer_bp
    app.register_blueprint(lecturer_bp)

    @app.route("/")
    def home():
        return {"message": "Student Assignment Submission System API is running"}

    from app.routes.submissions import submissions_bp
    app.register_blueprint(submissions_bp)

    return app
