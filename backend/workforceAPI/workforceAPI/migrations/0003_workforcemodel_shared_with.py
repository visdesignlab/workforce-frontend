# Generated by Django 3.1.1 on 2020-10-23 03:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workforceAPI', '0002_workforcemodel_is_public'),
    ]

    operations = [
        migrations.AddField(
            model_name='workforcemodel',
            name='shared_with',
            field=models.JSONField(default=str),
        ),
    ]
