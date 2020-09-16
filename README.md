# Workforce Project API And Frontend

## Description
The purpose of this project is to model the healthcare workforce trends in Utah by profession. The model also outputs the supply/need for each county in Utah.

## Documentation For Frontend And Backend

1. [Frontend](/frontend/README.md)
1. [Backend](/backend/README.md)

## Deploying The Whole Application In Production

We use docker to deploy in production. The specific container that we extend is 
[here](https://github.com/tiangolo/uwsgi-nginx-flask-docker) and the tag is `python3.8`.
The container is set up to use uwsgi and nginx to host a flask app and has been extended
to also serve the static frontend.

To build and run the containers, do the following:

```
# On a fresh ubuntu system
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose
sudo usermod -aG docker ubuntu

cd ~
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
git clone https://github.com/visdesignlab/workforce-frontend.git
cd workforce-frontend

# Assemble necessary backend resources
cd backend
pipenv install
pipenv run pip freeze > requirements.txt
cd ..

# Assemble necessary frontend resources
cd frontend
npm install
npm run build
cd ..

# Build the docker container and start it (If on a new system and you get a permissions error, log out and in)
sudo chmod -R ubuntu:docker ~/workforce-frontend
docker-compose up -d --build
docker exec -it workforcefrontend_db_1 bash
- mysql -u root -p
- # pass = initial
- # run the commands in setup.prod.sql in the terminal
# verify deploy is working
```

The container redirects the nginx error logs to stderr and stdout, not to a file, so you 
can attach to the container to debug. However, if you want to poke around the file system
you can use the following command:

```
docker exec -it workforcefrontend_web_1 bash
docker exec -it workforcefrontend_db_1 bash
```
