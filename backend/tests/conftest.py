
import os
import sys
import tempfile
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# 1. Give the app a secret key (it raises on startup without one).
os.environ.setdefault("SECRET_KEY", "test-only-secret-key")

# 2. Point the app at a throwaway database file so tests never touch
#    your real recipes.db. (Requires the one-line change in database.py.)
_fd, _tmp_db_path = tempfile.mkstemp(suffix=".db")
os.close(_fd)          # we only want the path; SQLite opens its own handle
os.environ["DATABASE_PATH"] = _tmp_db_path

import database          # noqa: E402  (import after env is set, on purpose)
from app import app as flask_app   # noqa: E402


@pytest.fixture()
def app():
    database.init_db()               # build a clean schema in the temp DB
    flask_app.config.update(TESTING=True)
    yield flask_app


@pytest.fixture()
def client(app):
    return app.test_client()