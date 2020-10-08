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
# On a fresh ubuntu 20.04 system
sudo apt install curl
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install docker-ce pipenv python3.7 python3.7-dev mysql-server libmysqlclient-dev
sudo usermod -aG docker ubuntu

# Re-login

cd ~
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
git clone https://github.com/visdesignlab/workforce-frontend.git
cd workforce-frontend

# Assemble necessary frontend resources
cd frontend
npm install
npm run build
cd ..

# Assemble necessary backend resources
mkdir /home/ubuntu/workforce-db-data/
cd backend
pipenv install
cd ..

docker stop workforce-mysql
docker rm workforce-mysql

# Replace these vars when doing production work look at .env.prod
docker run \
  --name workforce-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_USER=workforceuser \
  -e MYSQL_PASSWORD=password \
  -e MYSQL_DATABASE=workforcewebapp \
  -v /home/ubuntu/workforce-db-data/:/var/lib/mysql \
  -d \
  -p 3306:3306 \
  mysql:5

pipenv run migrate
sudo systemctl enable /home/ubuntu/workforce-frontend/api.service

cd ..

# Set up nginx (requires the SSL certs from backend)
cp backend/nginx.conf /etc/nginx/nginx.conf
```

