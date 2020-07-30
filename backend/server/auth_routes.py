from server import app
import server.auth_utils as utils
import flask
import flask_login

@app.route('/api/login', methods=['GET', 'POST'])
def login():
    if flask.request.method == 'GET':
        return '''
               <form action='login' method='POST'>
                <input type='text' name='email' id='email' placeholder='email'/>
                <input type='password' name='password' id='password' placeholder='password'/>
                <input type='submit' name='submit'/>
               </form>
               '''

    email = flask.request.form['email']
    if flask.request.form['password'] == utils.users[email]['password']:
        user = utils.User()
        user.id = email
        flask_login.login_user(user)
        return flask.redirect(flask.url_for('protected'))

    return 'Bad login'


@app.route('/api/protected')
@flask_login.login_required
def protected():
    return 'Logged in as: ' + flask_login.current_user.id


@app.route('/api/logout')
def logout():
    flask_login.logout_user()
    return 'Logged out'

@utils.login_manager.unauthorized_handler
def unauthorized_handler():
    return 'Unauthorized'
