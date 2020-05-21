import os
import tempfile
import pytest
from main import app


@pytest.fixture
def client():
  app.config['TESTING'] = True

  with app.test_client() as client:
    yield client


def test_no_param_routes(client):
    response = client.get('/api')
    assert response.status_code is 200

