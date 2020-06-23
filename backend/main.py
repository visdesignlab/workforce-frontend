import os
from server import app

if __name__ == "__main__":
  # Run the app
  app.run(
    host = os.getenv("FLASK_HOST", "0.0.0.0"), 
    port = os.getenv("FLASK_PORT", "80"),
    debug = os.getenv("FLASK_DEBUG", False),
  )

