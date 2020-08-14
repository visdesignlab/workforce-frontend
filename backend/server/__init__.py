import os
from flask import Flask
from flask_cors import CORS


def get_allowed_origins():
    """Read in comma-separated list of allowed origins from environment."""
    allowed_origins = os.getenv("ALLOWED_ORIGINS", default=None)
    if allowed_origins is None:
        return []

    return [s.strip() for s in allowed_origins.split(",")]


app = Flask(__name__, static_folder = "static", static_url_path = "/api/")
app.secret_key = os.getenv("FLASK_SECRET_KEY")

# Set some config
app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, 'uploads')
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
app.config["ALLOWED_EXTENSIONS"] = set(["txt", "csv", "xlsx"])


allowed_origins = get_allowed_origins()
CORS(app, origins=allowed_origins, supports_credentials=True)

import server.routes
import server.auth_routes
