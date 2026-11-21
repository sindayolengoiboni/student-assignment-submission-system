import io

import pytest
from flask import Flask

from app.routes.submissions import display_name, submissions_bp


@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(submissions_bp)
    return app.test_client()


def test_submit_requires_ids(client):
    response = client.post("/api/submissions", data={})
    assert response.status_code == 400


def test_submit_requires_a_file(client):
    response = client.post(
        "/api/submissions",
        data={"assignment_id": "1", "student_id": "1"},
    )
    assert response.status_code == 400


def test_submit_rejects_wrong_file_type(client):
    response = client.post(
        "/api/submissions",
        data={
            "assignment_id": "1",
            "student_id": "1",
            "file": (io.BytesIO(b"hello"), "virus.exe"),
        },
        content_type="multipart/form-data",
    )
    assert response.status_code == 400


def test_list_requires_student_id(client):
    response = client.get("/api/submissions")
    assert response.status_code == 400


def test_student_assignments_requires_student_id(client):
    response = client.get("/api/student/assignments")
    assert response.status_code == 400


def test_display_name_removes_the_unique_prefix():
    assert display_name("a" * 32 + "_report.pdf") == "report.pdf"
    assert display_name("report.pdf") == "report.pdf"