export function getCookie(name: string) {
    var cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split('; ');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}

export function api_request(route: string): Promise<any> {
    const csrftoken = getCookie('csrftoken');

    // Set headers if necessary
    let headers = {}
    if (process.env.API_ROOT.includes('http://localhost:8000')) {
        headers = {
            'X-CSRFToken': csrftoken || '',
            "Access-Control-Allow-Origin": 'http://localhost:8000',
            "Access-Control-Allow-Credentials": "true",
        }
    }

    return fetch(
        `${process.env.API_ROOT}/${route}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: headers,
        }
      )
}
