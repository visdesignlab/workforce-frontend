FROM tiangolo/uwsgi-nginx-flask:python3.8

# Install GLPK
RUN apt update && apt install glpk-utils -y

# Copy our code over
COPY ./backend /app
COPY ./frontend /frontend
COPY ./nginx.conf /app/nginx.conf

# Install requirements
RUN pip3 install -r /app/requirements.txt
