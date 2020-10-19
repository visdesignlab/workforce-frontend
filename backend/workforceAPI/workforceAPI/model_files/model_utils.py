from workforceAPI.settings import MEDIA_ROOT, MODELS_ROOT
from workforceAPI.models import WorkforceModel
from workforceAPI.model_files.results import run_model_for_range
from workforceAPI.model_files.process_results import process_results
import pandas as pd
import traceback

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
    traceback.print_exc()
    return False, e

  update_model_status(model_id, "Completed")
  return True, None

def add_model_to_db(model_id, metadata):
  metadata["status"] = "Running"
  new_model = WorkforceModel(**metadata)
  new_model.save()

def update_model_status(model_id, status):
  model_to_update = WorkforceModel.objects.filter(model_id=model_id)
  model_to_update.update(status=status)

  if status == "Completed":
    model_to_update.update(path=f"models/{model_id}.json")

def clean_up(model_id):
  # Unlink (delete) files that match <model_id>.csv
  [p.unlink() for p in MEDIA_ROOT.glob(f"{model_id}_*.csv")]
