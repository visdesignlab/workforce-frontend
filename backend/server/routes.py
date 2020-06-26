import os
import pickle
import json
import uuid
from flask import request, jsonify
from werkzeug.utils import secure_filename

from server import app
from server.route_utils import allowed_file, add_model_metadata, run_model, get_model_from_id


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
    # Generate a unique ID for the model
    model_id = str(uuid.uuid4())

    # Save the file to the uploads folder
    filename = secure_filename(f"{model_id}_{file.filename}")
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(path)

    # Add filename and model_id to metadata
    metadata["filename"] = filename
    metadata["model_id"] = model_id

    # Add our model to the model metadata objects
    add_model_metadata(metadata)

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

@app.route("/api/rerun-model", methods=["POST"])
def rerun_model():
    model_id = request.form.get("model_id", None)
    author = request.form.get("author", None)
    model_name = request.form.get("model_name", None)
    description = request.form.get("description", None)
    model_type = request.form.get("model_type", None)
    start_year = request.form.get("start_year", None)
    end_year = request.form.get("end_year", None)
    step_size = request.form.get("step_size", None)
    removed_professions = request.form.get("removed_professions", "").split(",")

    # Check required param
    if not model_id:
      return "model_id is missing from the request", 400

    new_model_id = str(uuid.uuid4())

    # Get the old model metadata for the path and update everything else
    metadata = get_model_from_id(model_id)
    metadata["model_id"] = new_model_id
    del metadata["status"]

    # Update optional params if they've changed
    metadata["author"] = author if author else metadata["author"]
    metadata["model_name"] = model_name if model_name else metadata["model_name"]
    metadata["description"] = description if description else metadata["description"]
    metadata["model_type"] = model_type if model_type else metadata["model_type"]
    metadata["start_year"] = start_year if start_year else metadata["start_year"]
    metadata["end_year"] = end_year if end_year else metadata["end_year"]
    metadata["step_size"] = step_size if step_size else metadata["step_size"]
    metadata["removed_professions"] = removed_professions if removed_professions != [""] else metadata["removed_professions"]

    # Add the model data to the models.pkl
    add_model_metadata(metadata)

    # Get the old file path
    path = os.path.join(app.config["UPLOAD_FOLDER"], metadata["filename"])

    # Run the model (assigns Completed or Failed to model metadata)
    success, error = run_model(path, new_model_id, metadata)

    if success:
      return "File successfully uploaded", 201
    else:
      return str(error), 500
