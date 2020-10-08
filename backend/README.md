# Healthcare Workforce API Server

An API server for the Healthcare Workforce Needs application.

## Table of Contents

1. [Development Environment Quick Start](#development-environment-quick-start)
1. [Deploying In Production](#deploying-in-production)
1. [Route Documentation](#route-documentation)
1. [Testing](#testing)

## Development Environment Quick Start

This project uses `pipenv` for python package version management, so make sure you have that installed. If you need instructions for setting it up, check [here](https://pipenv.pypa.io/en/latest/install/#installing-pipenv). Once  `pipenv` is installed, you can set up a virtual environment and install all python dependencies with `pipenv install`.

There is one final dependency that you'll need to run the application, GLPK. On mac, you can install this package with `brew install glpk`, but on other OSes it might be a little more tricky. Start [here](https://www.gnu.org/software/glpk/) if you're looking for installation instructions.

Now, copy the .env.default to .env using `cp .env.default .env`.

Now run MySQL through docker using:
```
docker stop workforce-mysql
docker rm workforce-mysql

docker run \
  --name workforce-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_USER=workforceuser \
  -e MYSQL_PASSWORD=password \
  -e MYSQL_DATABASE=workforcewebapp \
  -d \
  -p 3306:3306 \
  mysql:5
```

Once `pipenv` is set up and the .env file is set correctly, run `pipenv run serve` to run a local development server at http://localhost:8000/.

## Deploying In Production

See [top level README](../README.md).

## Route Documentation 

There are several routes set up for accessing the model data. Here are the names, allowed methods, parameters, and descriptions:

- Name: `/api`
  - Allowed Methods: `GET`
  - Parameters: `None`
  - Description: Base API endpoint. Returns text and a 200 to verify everything is working. Doesn't return data.
  - Example:
    ```
    curl 'localhost:8000/api'
    ```

- Name:`/api/file-upload`
  - Allowed Methods: `POST`
  - Parameters:
      - `metadata`: a json serializable object containing the following required fields:  
          `model_name`: Model name, used in visualization. 
          `description`  
          `model_type`: One of: "ideal_staffing", "ideal_staffing_current", or "service_allocation".  
          `start_year`: Currently, one of: 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024.  
          `end_year`: Currently, one of: 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024.  
          `step_size`: The step size for the model in years.  
          `removed_professions`: List of removed professions or [].
      - `file`: The data file that the model will use to compute supply and needs.
  - Description:
  - Return: Either "File uploaded successfully" and 201 if the upload succeeded, a 400 with a reason (usually missing parameters or file), or 500 for a model issue.
  - Example (must be run from the project root directory):
    ```
    curl \
      -X POST \
      -F 'metadata={"model_name": "new_model", "description": "a model", "model_type": "ideal_staffing", "start_year": 2019, "end_year": 2020, "step_size": 1, "removed_professions": []}' \
      -F 'file=@workforceAPI/workforceAPI/test_data/Workforce_Optimization_Tool_-_Input_Data.xlsx' \
      'localhost:8000/api/file-upload'
    ```

- Name: `/api/models`
  - Allowed Methods: `GET`
  - Parameters: `None`
  - Description: Loads all stored model metadata.
  - Return: JSON object, array of objects of model metadata.
  - Example:
    ```
    curl 'localhost:8000/api/models'
    ```

- Name:`/api/rerun-model`
  - Allowed Methods: `POST`
  - Parameters:
      - Required:  
           `model_id`: A model id for the model that will be re-run.  
           `model_name`: Model name, used in visualization.  
           `description`  
      - Optional:  
          `model_type`: One of: "ideal_staffing", "ideal_staffing_current", or "service_allocation".  
          `start_year`: Currently, one of: 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024.  
          `end_year`: Currently, one of: 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024.  
          `step_size`: The step size for the model in years.  
          `removed_professions`: Comma separated list of professions to remove.
  - Description:
  - Return: Either "File uploaded successfully" and 201 if the model runs successfully. 400 for a bad request (missing model_id) or 500 for a failure in running the model.
  - Example:
    ```
    curl \
      -X POST \
      -F 'model_id=8bcaed56-89aa-4d24-9d6c-732f2eb35fd7' \
      -F 'removed_professions=NP' \
      -F 'model_name=updated model original remove NP' \
      -F 'description=test_update, remove NP' \
      'localhost:8000/api/rerun-model'
    ```

## Testing

We supply tests for all of the endpoints we provide using coverage.py. If you are updating the code and want to maintain the same functionality, our tests should help you do that. You can run the tests with `pipenv run test`.
