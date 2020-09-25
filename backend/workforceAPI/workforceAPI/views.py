from django.core.files.storage import default_storage
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from pathlib import Path
from uuid import uuid1
import pickle
import json

from workforceAPI import settings
from workforceAPI.model_files.model_utils import run_model

from django.views.decorators.csrf import csrf_exempt # TODO: Remove

REQUIRED_METADATA_FIELDS = ["model_name", "author", "description", "model_type", "start_year", "end_year", "step_size", "removed_professions"]



def root(request):
  return HttpResponse("Healthcare Workforce API")

@login_required
def models(request):
  models_path = settings.MODELS_ROOT / 'models.pkl'

  with open(models_path, "rb") as f:
    metadata = pickle.load(f)

  return JsonResponse(metadata)

@login_required
def get_model(request, model_id):
  model_path = settings.MODELS_ROOT / model_id

  with open(model_path, 'r') as json_file:
    model = json.load(json_file)

  return JsonResponse(model)

@csrf_exempt
# @login_required
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
    file_path = settings.MEDIA_ROOT / file_name

    # Run the model
    success, error = run_model(file_path, model_id, metadata)

    if success:
      return HttpResponse("File successfully uploaded", status=201)
    else:
      return HttpResponse(str(error), status=500)
  else:
    return HttpResponseNotAllowed(["POST"], "Method Not Allowed")

@login_required
def rerun_model(request):
  if request.method == 'POST':
    pass
  else:
    return HttpResponseNotAllowed(["POST"], "Method Not Allowed")
