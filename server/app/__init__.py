from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    app.config.from_object("app.config.Config")

    CORS(app)

    @app.route("/")
    def home():
        return {"message": "Student Assignment Submission System API is running"}

    return app
