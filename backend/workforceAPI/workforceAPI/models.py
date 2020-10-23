from django.db import models

class WorkforceModel(models.Model):

    class ModelTypes(models.TextChoices):
        ideal_staffing = "ideal_staffing"
        ideal_staffing_current = "ideal_staffing_current"
        service_allocation = "service_allocation"

    class Status(models.TextChoices):
        Failed = "Failed"
        Running = "Running"
        Completed = "Completed"

    author = models.EmailField()
    description = models.TextField()
    model_id = models.CharField(max_length=36)
    model_name = models.CharField(max_length=256)
    model_type = models.CharField(max_length=22, choices=ModelTypes.choices)
    start_year = models.IntegerField()
    end_year = models.IntegerField()
    step_size = models.IntegerField()
    removed_professions = models.JSONField()
    path = models.CharField(max_length=512)
    filename = models.CharField(max_length=512)
    status = models.CharField(max_length=9, choices=Status.choices)
