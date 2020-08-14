from datetime import datetime, timedelta
from server import app
import server.auth_user_utils as utils
import server.db as db
import flask
import json
import os
import requests

@app.route("/api/login", methods=["GET", "POST"])
def login():
    browser_session = flask.session
    query_results = db.session.query(db.Session).filter_by(token = browser_session.get("token", None)).one_or_none()
    redirect_uri = flask.url_for('authorize', _external=True)

    if query_results:
        return "Already logged in", 200
    else:
        return utils.oauth.utahid.authorize_redirect(redirect_uri)


@app.route('/api/authorize')
def authorize():
    auth_code = flask.request.args["code"]
    redirect_uri = flask.url_for('authorize', _external=True)

    token_json = requests.post(
        utils.info["token_endpoint"],
        data = {
            "grant_type": "authorization_code",
            "code": auth_code,
            "redirect_uri": redirect_uri,
            "client_id": os.getenv("UTAHID_ID"),
            "client_secret": os.getenv("UTAHID_SECRET"),
        }
    ).content.decode('utf8')
    token = json.loads(token_json)

    email_resp_json = requests.get(
        utils.info["userinfo_endpoint"],
        headers = {'Authorization': f'Bearer {token["access_token"]}'}
    ).content.decode('utf8')
    email_resp = json.loads(email_resp_json)

    session_token = utils.refresh_or_create_session(None, email = email_resp["email"])

    return flask.redirect('/api/whoami')


@app.route("/api/whoami")
@utils.check_session
def whoami():
    session = db.session.query(db.Session).filter_by(token=flask.session["token"]).one()
    return f"Logged in as: {session.email}"


@app.route("/api/logout")
def logout():    
    utils.delete_session(flask.session.get("token"))
    flask.session["token"] = None
    return "Logged out"

