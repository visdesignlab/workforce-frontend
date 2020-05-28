# Workforce Project API And Frontend

## Documentation For Frontend And Backend
---

1. [Frontend](/frontend/README.md)
1. [Backend](/backend/README.md)

## Deploying The Whole Application In Production
---

We use docker to deploy in production. The specific container that we extend is [here](https://github.com/tiangolo/uwsgi-nginx-flask-docker).

To build and run the containers, do the following:

```
cd backend
pipenv install
pipenv run pip freeze > requirements.txt
cd ..
docker build --no-cache -t workforce .
docker stop workforce_container
docker rm workforce_container
docker run --name workforce_container -p 80:80 workforce
```

To debug the running container run:

```
docker exec -it workforce_container bash
```