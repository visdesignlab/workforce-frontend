from django.core.files.storage import default_storage
from django.contrib.auth.decorators import login_required
from django.forms.models import model_to_dict
from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from pathlib import Path
from uuid import uuid1
import pickle
import json

from workforceAPI import settings
from workforceAPI.model_files.model_utils import run_model, clean_up, delete_all_model_files
from workforceAPI.models import WorkforceModel

REQUIRED_METADATA_FIELDS = ["model_name", "author", "description", "model_type", "start_year", "end_year", "step_size", "removed_professions"]



def root(request):
  return HttpResponse("Healthcare Workforce API")

@login_required
def models(request):
  models = list(WorkforceModel.objects.all().values())

  return JsonResponse(models, safe = False)

@login_required
def delete_model(request):
  model_id = request.GET.get("model_id")

  if not model_id:
    return HttpResponse("model_id is missing from request", status=400)

  # If count is zero, the model doesn't exist
  model = WorkforceModel.objects.filter(model_id=model_id)
  if not model.count():
    return HttpResponse("Model not found", status=404)

  # Now, if model doens't exist, user is not the owner of the model
  user_email = User.objects.get(username = request.user.username).email
  model = model.filter(author=user_email).first()
  if not model:
    return HttpResponse("User is not the owner of the model", status=400)

  delete_all_model_files(model)
  model.delete()

  return HttpResponse("Model deleted", status=200)

@login_required
def get_model(request, model_id):
  model_path = settings.MODELS_ROOT / model_id

  with open(model_path, 'r') as json_file:
    model = json.load(json_file)

  return JsonResponse(model)

@login_required
def file_upload(request):
  if request.method == 'POST':
    # Check that file exists and is properly formatted
    file = request.FILES.get("file")

    if not file:
      return HttpResponse("File missing from upload", status=400)

    if not Path(file.name).suffix == '.xlsx':
      return HttpResponse("File must be .xlsx", status=400)

    # Check that metadata exists and is properly formatted
    metadata = request.POST.get("metadata")

    if metadata:
      metadata = json.loads(metadata)
      metadata["author"] = request.user.username
    else:
      return HttpResponse("Metadata is missing from request", status=400)

    req_param_exists = [x in metadata for x in REQUIRED_METADATA_FIELDS]
    if not all(req_param_exists):
      return HttpResponse(f"Metadata does not contain all required parameters: {REQUIRED_METADATA_FIELDS}", status=400)

    # Generate unique identifier
    model_id = str(uuid1())

    # Save the file
    file_name = f"{model_id}_{file.name}"
    default_storage.save(file_name, file)
    metadata["filename"] = file_name
    file_path = settings.MEDIA_ROOT / file_name

    # Run the model
    success, error = run_model(file_path, model_id, metadata)
    clean_up(model_id)

    if success:
      return HttpResponse("File successfully uploaded", status=201)
    else:
      return HttpResponse(str(error), status=500)
  else:
    return HttpResponseNotAllowed(["POST"], "Method Not Allowed")

@login_required
def rerun_model(request):
  if request.method == 'POST':
    # Required params
    model_id = request.POST.get("model_id")
    model_name = request.POST.get("model_name")
    description = request.POST.get("description")

    # Optional params
    removed_professions = request.POST.get("removed_professions")

    if not (model_id and model_name and description):
      return HttpResponse("You must supply model_id, model_name, and description", status=400)

    old_model = WorkforceModel.objects.filter(model_id=model_id).first()

    if not old_model:
      return HttpResponse("Model not found", status=404)

    # Update model
    metadata = model_to_dict(old_model)
    metadata["author"] = request.user.username
    metadata["model_name"] = model_name
    metadata["description"] = description
    metadata["model_type"] = request.POST.get("model_type") or metadata.get("model_type")
    metadata["start_year"] = request.POST.get("start_year") or metadata.get("start_year")
    metadata["end_year"] = request.POST.get("end_year") or metadata.get("end_year")
    metadata["step_size"] = request.POST.get("step_size") or metadata.get("step_size")
    metadata["removed_professions"] = list(set(removed_professions.split(",") + metadata.get("removed_professions"))) if removed_professions else metadata.get("removed_professions")
    del metadata["path"]
    del metadata["status"]
    del metadata["id"]
    del metadata["model_id"]

    # Get the old file path and check the file exists still
    file_path = settings.MEDIA_ROOT / metadata.get("filename")
    if not file_path.is_file():
      return HttpResponse("Original model file not found. Contact an admin", status=500)

    # Generate new model_id and run model
    new_model_id = str(uuid1())
    success, error = run_model(file_path, new_model_id, metadata)
    clean_up(new_model_id)

    if success:
      return HttpResponse("File successfully uploaded", status=201)
    else:
      print(error)
      return HttpResponse(str(error), status=500)
  else:
    return HttpResponseNotAllowed(["POST"], "Method Not Allowed")
