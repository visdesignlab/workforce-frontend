import os
import pickle
import json
from flask import request, jsonify
from werkzeug.utils import secure_filename

from server import app
from server.route_utils import allowed_file, add_model_metadata, run_model


@app.route("/api")
def root():
  return "Healthcare Workforce API"


@app.route("/api/file-upload", methods=["POST"])
def upload_file():
  form_metadata = request.form.get("metadata", None)

  # Check that the post request has metadata
  if form_metadata:
    metadata = json.loads(form_metadata)
  else:
    return "Metadata is missing from request", 400

  # Check that the required parameters are in the metadata
  REQUIRED_FIELDS = ["model_name", "author", "description", "model_type", "start_year", "end_year", "step_size", "removed_professions"]
  req_param_exists = [x in metadata for x in REQUIRED_FIELDS]
  if not all(req_param_exists):
    return f"Metadata does not contain all required parameters: {REQUIRED_FIELDS}", 400

  # Check that the post request has a file
  if "file" in request.files:
    file = request.files["file"]
  else:
    return "File is missing from request", 400

  # Check that the post request file has a name
  if file.filename == "":
    return "Filename is missing", 400

  # Check if the file has the right extension
  if allowed_file(file.filename, app.config["ALLOWED_EXTENSIONS"]):
    # Add our model to the model metadata objects
    model_id = add_model_metadata(metadata)
    
    # Save the file to the uploads folder
    filename = secure_filename(f"{model_id}_file.filename")
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(path)

    # Run the model (assigns Completed or Failed to model metadata)
    success, error = run_model(path, model_id, metadata)

    if success:
      return "File successfully uploaded", 201
    else:
      return str(error), 500

  # Else, if not allowed file type
  else:
    return "Allowed file types are txt, csv, xlsx", 400


@app.route("/api/models", methods=["GET"])
def get_models():
  # Read in the model metadata
  with open(os.path.join(app.root_path, "models.pkl"), "rb") as f:
    metadata = pickle.load(f)

  return jsonify(metadata)
