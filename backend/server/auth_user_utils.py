import flask
import os
import requests
import server.db as db
from dataclasses import dataclass
from datetime import datetime, timedelta
from authlib.integrations.flask_client import OAuth
from server import app
from uuid import uuid4
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())


def utahid_oauth2_info():
    """Return UtahID's spec for their OAuth endpoints."""
    resp = requests.get("https://login.dts.utah.gov/sso/oauth2/.well-known/openid-configuration")
    info = resp.json()
    return info


def check_session(func):
    def wrapper():
        token = flask.session.get("token", None)
        query_result = token_to_user(token, expires=False)

        # If token, query_result
        if token and query_result:
            # If token expired in the last 6 hours, refresh it
            if not query_result.expires < datetime.utcnow() - timedelta(hours=6):
                refresh_or_create_session(token)
            else:
                return 'Unauthorized. Log in or re-log', 401
            
            return func()

        else:
            return 'Unauthorized. Log in or re-log', 401

    wrapper.__name__ = func.__name__
    return wrapper


def refresh_or_create_session(old_token, email = None):
    # Args can't both be None
    if old_token is None and email is None:
        raise TypeError("email and token must be supplied.")

    # See if there is a token for the email if one isn't passed in
    if (not old_token) and email:
        old_token = email_to_token(email)

    old_session = token_to_user(old_token) or {}

    # Delete old session associated with the token
    if datetime.utcnow() >= old_session.get("expires", datetime(year=2020, month=1, day=1)):
        old_email = delete_session(old_token)
        flask.session["token"] = None

        # Generate new token and session
        new_token = uuid4().hex
        flask.session["token"] = new_token

        new_session = db.Session(
            email = old_email or email,
            token = new_token,
            generated = datetime.utcnow(),
            expires = datetime.utcnow() + timedelta(hours = 6),
        )

        db.session.add(new_session)
        db.session.commit()
    elif not old_token:
        new_token = uuid4().hex
        flask.session["token"] = new_token

        new_session = db.Session(
            email = old_email or email,
            token = new_token,
            generated = datetime.utcnow(),
            expires = datetime.utcnow() + timedelta(hours = 6),
        )

        db.session.add(new_session)
        db.session.commit()


def delete_session(token):
    session_to_delete = token_to_user(token)
    
    # If old session in db, remove
    if session_to_delete:
        db.session.delete(session_to_delete)
        db.session.commit()
        return session_to_delete.email
    
    return None


def token_to_user(token, expires=False):
    if expires:
        return db.session \
            .query(db.Session) \
            .filter_by(token = token) \
            .filter(db.Session.expires >= datetime.utcnow()) \
            .one_or_none()
    else:
        return db.session \
            .query(db.Session) \
            .filter_by(token = token) \
            .one_or_none()

def email_to_token(email):
    session = db.session \
        .query(db.Session) \
        .filter_by(email = email) \
        .one_or_none()
    
    if session:
        return session.token
    else:
        return None


# Define some variables we'll need
info = utahid_oauth2_info()
oauth = OAuth(app)
oauth.register(
    name = "utahid",
    client_id = os.getenv("UTAHID_ID"),
    client_secret = os.getenv("UTAHID_SECRET"),
    access_token_url = info["token_endpoint"],
    authorize_url = info["authorization_endpoint"],
    api_base_url = "https://login.dts.utah.gov/sso/oauth2/",
    client_kwargs = {"scope": "openid email"},
)
