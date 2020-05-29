import os
from flask import Flask
from flask_cors import CORS


app = Flask(__name__, static_folder = "static", static_url_path = "/api/")

# Set some config
app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, 'uploads')
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
app.config["ALLOWED_EXTENSIONS"] = set(["txt", "csv", "xlsx"])

CORS(app)

import server.routes
