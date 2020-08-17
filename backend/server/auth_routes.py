from datetime import datetime, timedelta
from server import app
import server.auth_user_utils as utils
import server.db as db
import flask
import json
import os
import requests

@app.route("/api/login", methods=["GET"])
def login():
    current_token = flask.session.get("token")
    query_results =  utils.token_to_user(current_token, expires=True)

    if query_results:
        return "Already logged in", 200
    else:
        redirect_uri = flask.url_for('authorize', _external=True)
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
        headers = {'Authorization': f'Bearer {token.get("access_token")}'}
    ).content.decode('utf8')
    email_resp = json.loads(email_resp_json)

    user_email = email_resp.get("email")

    if user_email:
        session_token = utils.refresh_or_create_session(None, email = user_email)
    else:
        return "Something wrong with auth, try login again", 400

    return flask.redirect('/api/whoami')


@app.route("/api/whoami")
@utils.check_session
def whoami():
    user = utils.token_to_user(flask.session.get("token"))
    return f"Logged in as: {user.email}"


@app.route("/api/logout")
def logout():    
    utils.delete_session(flask.session.get("token"))
    flask.session["token"] = None
    return "Logged out"

