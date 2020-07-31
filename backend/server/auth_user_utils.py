import flask
import os
import requests
import server.db as db
from dataclasses import dataclass
from datetime import datetime
from authlib.integrations.flask_client import OAuth
from server import app


def utahid_oauth2_info():
    """Return UtahID's spec for their OAuth endpoints."""
    resp = requests.get("https://login.dts.utah.gov/sso/oauth2/.well-known/openid-configuration")
    info = resp.json()
    return info



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


def check_session(func):
    def wrapper():
        browser_session = flask.session
        query_results = db.session.query(db.Session).filter_by(token = browser_session["token"])

        if (browser_session["token"] and 
            query_results.count() > 0 and 
            query_results.one().expires > datetime.utcnow()
        ):
            return func()
        else:
            return 'Unauthorized', 401

    wrapper.__name__ = func.__name__
    return wrapper
