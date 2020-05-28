import os
from server import app

if __name__ == "__main__":
  # Set some config
  app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, 'uploads')
  app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
  app.config["ALLOWED_EXTENSIONS"] = set(["txt", "csv", "xlsx"])

  # Run the app
  app.run(
    host = os.getenv("FLASK_HOST", "0.0.0.0"), 
    port = os.getenv("FLASK_PORT", "80"),
    debug = os.getenv("FLASK_DEBUG", False),
  )

