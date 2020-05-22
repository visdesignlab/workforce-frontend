import pandas as pd
import pickle
import uuid

from process_results import process_results
from results import run_model_for_range


def allowed_file(filename, ALLOWED_EXTENSIONS):
  return "." in filename and filename.split(".")[-1].lower() in ALLOWED_EXTENSIONS


def add_model_metadata(metadata):
  # Reformat the metadata and add status
  new_model = {
    "name": metadata["model_name"], 
    "author": metadata["author"], 
    "description": metadata["description"], 
    "status": "Running"
  }

  # Generate a unique ID for the model
  model_id = str(uuid.uuid4())

  # Read in the current model objects
  with open("models.pkl", "rb") as f:
    models = pickle.load(f)

  # Write the new model to the pkl file
  with open("models.pkl", "wb") as f:
    models[model_id] = new_model
    pickle.dump(models, f)

  return model_id


def update_model_status(model_id, status):
  # Load in the models
  with open("models.pkl", "rb") as f:
    models = pickle.load(f)

  # Update the currently running model with status passed in
  models[model_id]["status"] = status
  models[model_id]["path"] = f"models/{model_id}.json"
  with open("models.pkl", "wb") as f:
    pickle.dump(models, f)


def run_model(path, model_id, metadata):
  df = pd.read_excel(path, sheet_name=None)
  for key in df.keys():
    df[key].to_csv(f"./data/data_input_component_csv/{key}.csv")
  
  try:
    run_model_for_range(
      metadata["model_type"], 
      metadata["start_year"], 
      metadata["end_year"], 
      metadata["step_size"], 
      metadata["removed_professions"]
    )
    process_results(f"static/models/{model_id}.json")
  except Exception as e:
    update_model_status(model_id, "Failed")
    return False, e

  update_model_status(model_id, "Completed")
  return True, None
