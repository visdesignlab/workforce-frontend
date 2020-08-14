import os
from flask import Flask
from flask_cors import CORS
import route_utils as utils


app = Flask(__name__, static_folder = "static", static_url_path = "/api/")
app.secret_key = os.getenv("FLASK_SECRET_KEY")

# Set some config
app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, 'uploads')
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
app.config["ALLOWED_EXTENSIONS"] = set(["txt", "csv", "xlsx"])


allowed_origins = utils.get_allowed_origins()
CORS(app, origins=allowed_origins, supports_credentials=True)

import server.routes
import server.auth_routes
