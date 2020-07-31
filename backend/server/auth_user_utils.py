import flask
import os
import requests
import server.db as db
from dataclasses import dataclass
from datetime import datetime, timedelta
from authlib.integrations.flask_client import OAuth
from server import app
from uuid import uuid4


def utahid_oauth2_info():
    """Return UtahID's spec for their OAuth endpoints."""
    resp = requests.get("https://login.dts.utah.gov/sso/oauth2/.well-known/openid-configuration")
    info = resp.json()
    return info


def check_session(func):
    def wrapper():
        token = flask.session.get("token", None)
        query_results = db.session.query(db.Session).filter_by(token = token)

        # If token, query_results, and token is less than 1 day old
        if token and query_results.count() > 0 and query_results.one().expires > datetime.utcnow() - timedelta(days = 1) :
            # If token was made in the last day, but has expired, refresh it
            if not query_results.one().expires > datetime.utcnow():
                refresh_or_create_session(token)
            
            return func()

        else:
            return 'Unauthorized. Log in or re-log', 401

    wrapper.__name__ = func.__name__
    return wrapper


def refresh_or_create_session(old_token, email = None):
    # Delete old session associated with the token
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


def delete_session(token):
    session_to_delete = db.session.query(db.Session).filter_by(token = token).one_or_none()
    
    # If old session in db, remove
    if session_to_delete:
        db.session.delete(session_to_delete)
        db.session.commit()
        return session_to_delete.email
    
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
