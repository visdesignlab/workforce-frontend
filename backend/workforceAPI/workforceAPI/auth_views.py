from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import redirect
from authlib.integrations.django_client import OAuth
from uuid import uuid1
import os


oauth = OAuth()

oauth.register(
    'UtahID',
    server_metadata_url='https://login.dts.utah.gov/sso/oauth2/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email'}
)


def login(request):
    redirect_uri = request.build_absolute_uri('/api/authorize')
    return oauth.UtahID.authorize_redirect(request, redirect_uri)

def logout(request):
    user = User.objects.filter(username=request.user.username).first()
    auth_logout(request)
    
    if user:
        user.delete()

    return HttpResponse('Logged Out')

def authorize(request):
    # Get the user info
    token = oauth.UtahID.authorize_access_token(request)
    userinfo = oauth.UtahID.parse_id_token(request, token)

    if not userinfo:
        return HttpResponse('Authentication Failed, no userinfo', status=400)

    # Check if user exists
    user = User.objects.filter(username=userinfo.get('sub')).first()

    # Create a user if they don't exist
    if not user:
        # Create a new user with the user info 
        User.objects.create_user(
            username=userinfo.get('sub'),
            email=userinfo.get('email'),
            password=userinfo.get('email')
        )
    
    authenticated_user = authenticate(
        request,
        username=userinfo.get('sub'),
        password=userinfo.get('email')
    )

    if authenticated_user is not None:
        auth_login(request, authenticated_user)
    else:
        return HttpResponse('Authentication Failed, didn\'t authenticate', status=400)

    return redirect(os.getenv('LOGIN_REDIRECT'))


def whoami(request):
    if request.user.is_authenticated:
        return HttpResponse(request.user.email)
    else:
        return HttpResponse('Unauthorized', status=401)