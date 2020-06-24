import os
import pandas as pd
import pickle
import uuid

from server import app
from server.process_results import process_results
from server.results import run_model_for_range


def allowed_file(filename, ALLOWED_EXTENSIONS):
  return "." in filename and filename.split(".")[-1].lower() in ALLOWED_EXTENSIONS


def add_model_metadata(metadata):
  # Reformat the metadata and add status
  new_model = {
    "name": metadata["model_name"], 
    "author": metadata["author"], 
    "description": metadata["description"], 
    "filename": metadata["filename"],
    "status": "Running"
  }

  # Read in the current model objects and write the new model metadata to it
  with open(os.path.join(app.root_path, "models.pkl"), "wb") as f:
    models = pickle.load(f)
    models[metadata["model_id"]] = new_model
    pickle.dump(models, f)


def update_model_status(model_id, status):
  with open(os.path.join(app.root_path, "models.pkl"), "wb") as f:
    # Load in the models
    models = pickle.load(f)

    # Update the currently running model with status passed in
    models[model_id]["status"] = status

    # If success, note the path to the model
    models[model_id]["path"] = f"models/{model_id}.json" if status == "Completed" else "NA"
    
    # Write out the results
    pickle.dump(models, f)


def run_model(path, model_id, metadata):
  df = pd.read_excel(path, sheet_name=None)
  for key in df.keys():
    df[key].to_csv(os.path.join(app.root_path, f"data/data_input_component_csv/{model_id}_{key}.csv"))
  
  try:
    run_model_for_range(
      model_id,
      metadata["model_type"], 
      metadata["start_year"], 
      metadata["end_year"], 
      metadata["step_size"], 
      metadata["removed_professions"]
    )
    process_results(os.path.join(app.root_path, f"static/models/{model_id}.json"))
  except Exception as e:
    update_model_status(model_id, "Failed")
    return False, e

  update_model_status(model_id, "Completed")
  return True, None

def get_model_from_id(model_id):
  with open(os.path.join(app.root_path, "models.pkl"), "rb") as f:
    models = pickle.load(f)

  return models[model_id]
