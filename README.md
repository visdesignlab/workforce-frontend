# Workforce Project API And Frontend

## Description
The purpose of this project is to model the healthcare workforce trends in Utah by profession. The model also outputs the supply/need for each county in Utah.

## Documentation For Frontend And Backend

1. [Frontend](/frontend/README.md)
1. [Backend](/backend/README.md)

## Deploying The Whole Application In Production

We use a combination of docker mysql, django, react, and nginx to serve this app. The front end components are simplest so let's start there. They are built to static files and served using nginx. The backend is made using django (for easier database integrations) and is served through nginx via a `proxy_pass`. The backend also communicates with a mysql instance (that we chose to run through docker) and comes with the necessary migrations to get everything up and running. The one piece of admin to do, is to create a user that can access the instance.

To build and run everything, do the following (NOTE: this expects a user called ubuntu, if your user is different, modify most instances of ubuntu to that user, just not the docker install steps):

```
# On a fresh ubuntu 18.04 system
sudo apt install curl
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install docker-ce python3-pip python3.7 python3.7-dev mysql-server libmysqlclient-dev glpk-utils
sudo usermod -aG docker ubuntu

pip3 install --user pipenv
sudo systemctl disable --now mysql

# Re-login

cd
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

# Create your file .env file in the backend folder, fields to include are in the .env.default file

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

# Set up mysql here to use the above settings
# This would include creating the user specified above (the database should be automatically created)

pipenv run migrate
sudo systemctl enable --now /home/ubuntu/workforce-frontend/api.service

# This will run the deploy script inside of `Pipfile`. If you need to change the user, you'll have to update the config there, too
# The `Pipfile` would also be the place to add logging output to the deploy script.

cd ..

# Set up nginx (requires the SSL certs from backend)
cp backend/nginx.conf /etc/nginx/nginx.conf
```

