from workforceAPI.settings import MEDIA_ROOT, MODELS_ROOT
from workforceAPI.model_files.results import run_model_for_range
from workforceAPI.model_files.process_results import process_results
from glob import glob
import pandas as pd
import pickle

def run_model(path, model_id, metadata):
  df = pd.read_excel(path, sheet_name=None)
  for key in df.keys():
    df[key].to_csv(MEDIA_ROOT / f"{model_id}_{key}.csv")
  
  add_model_to_pkl(model_id, metadata)

  try:
    run_model_for_range(
      model_id,
      metadata["model_type"], 
      metadata["start_year"], 
      metadata["end_year"], 
      metadata["step_size"], 
      metadata["removed_professions"]
    )
    process_results(MODELS_ROOT / f"{model_id}.json")
  except Exception as e:
    update_model_status(model_id, "Failed")
    return False, e

  update_model_status(model_id, "Completed")
  return True, None

def add_model_to_pkl(model_id, metadata):
  models = open_models()

  models[model_id] = metadata
  models.get(model_id)["status"] = "Running"

  with open(MODELS_ROOT / "models.pkl", 'wb') as f:
    models = pickle.dump(models, f)

def update_model_status(model_id, status):
  models = open_models()

  models.get(model_id)["status"] = status

  if status == "Completed":
    models.get(model_id)["path"] = f"models/{model_id}.json"

  with open(MODELS_ROOT / "models.pkl", 'wb') as f:
    models = pickle.dump(models, f)

def clean_up(model_id):
  # Unlink (delete) files that match the model ID, except the xlsx
  [p.unlink() for p in MEDIA_ROOT.glob(f"{model_id}_*.csv")]

def open_models():
  with open(MODELS_ROOT / "models.pkl", 'rb') as f:
    models = pickle.load(f)
  
  return models

def get_model(model_id):
  models = open_models()