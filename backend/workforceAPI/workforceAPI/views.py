from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from workforceAPI import settings
import pickle
import json


def root(request):
  return HttpResponse("Healthcare Workforce API")

@login_required
def models(request):
  models_path = settings.STATIC_ROOT / 'models.pkl'

  with open(models_path, "rb") as f:
    metadata = pickle.load(f)

  return JsonResponse(metadata)

@login_required
def get_model(request, model_id):
  model_path = settings.STATIC_ROOT / 'models' / model_id

  with open(model_path, 'r') as json_file:
    model = json.load(json_file)

  return JsonResponse(model)
