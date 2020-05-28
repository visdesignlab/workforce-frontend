FROM tiangolo/uwsgi-nginx-flask:python3.8

COPY ./backend /app
# COPY ./deploy/nginx.conf /app/nginx.conf

COPY ./backend/requirements.txt /app/
RUN pip3 install -r /app/requirements.txt
