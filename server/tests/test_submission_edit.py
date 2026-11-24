import io

import pytest
from flask import Flask

from app.routes.submission_edit import submission_edit_bp


@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(submission_edit_bp)
    return app.test_client()


def test_edit_requires_student_id(client):
    response = client.put("/api/submissions/1", data={})
    assert response.status_code == 400


def test_edit_requires_a_file(client):
    response = client.put("/api/submissions/1", data={"student_id": "1"})
    assert response.status_code == 400


def test_edit_rejects_wrong_file_type(client):
    response = client.put(
        "/api/submissions/1",
        data={"student_id": "1", "file": (io.BytesIO(b"hello"), "virus.exe")},
        content_type="multipart/form-data",
    )
    assert response.status_code == 400