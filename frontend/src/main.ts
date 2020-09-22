import { MapController } from './mapController';
import { MapEvents } from './mapEvents'
import { SimpleTableCreator } from './modelInterface/SimpleCreator';
import 'bootstrap';
import 'bootstrap-select';
import * as d3 from 'd3';

const MODELS_URL = `${process.env.API_ROOT}/models`;

d3.select('#visualization').on('click', () => {
  (d3.select('#visualization').node() as HTMLElement).className = 'is-active';
  (d3.select('#modelCreate').node() as HTMLElement).className = '';
  d3.select('#mainPage').style('display', 'block');
  d3.select('#modelPage').style('display', 'none');
});
d3.select('#modelCreate').on('click', () => {
  (d3.select('#visualization').node() as HTMLElement).className = '';
  (d3.select('#modelCreate').node() as HTMLElement).className = 'is-active';
  d3.select('#mainPage').style('display', 'none');
  d3.select('#modelPage').style('display', 'block');
});

let mapController = new MapController();
let myMapEvents:MapEvents = new MapEvents(mapController);
let promise = myMapEvents.changeModelData();

promise.then(()=>{
  mapController.drawMap().then(() => {
    mapController.drawSidebar();
    mapController.prov.done();
  });
});

export function getCookie(name: string) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
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

const csrftoken = getCookie('csrftoken');

// Set headers if necessary
let headers = {}
if (process.env.API_ROOT.includes('http://localhost:5000')) {
  headers = {
    'X-CSRFToken': csrftoken || '',
    "Access-Control-Allow-Origin": 'http://localhost:5000',
    "Access-Control-Allow-Credentials": "true",
  }
}

function logout() {
  fetch(
    `${process.env.API_ROOT}/logout`, 
    {
      method: 'GET',
      credentials: 'include',
      headers: headers,
    }
  )
    .then((response) => {
      if(response.status === 200) {
        d3.select("#login").select("a").attr("href", `${process.env.API_ROOT}/login`).html("Login");
        d3
          .select("#logout")
          .remove();
      } else{
        console.log("failed to logout")
      }
    })
}

fetch(
  `${process.env.API_ROOT}/whoami`,
  {
    method: 'GET',
    credentials: 'include',
    headers: headers,
  }
)
  .then((response) => {
    if(response.status === 200)
    {
      response.text().then((t) => {
        let e = t.substring(14)
        d3.select("#login").select("a").attr("href", null).html("Logged in: " + e);
        d3
          .select("#loginOut")
          .append("li")
          .on("click", () => {
            logout()
          })
          .attr("id", "logout")
          .append("a")
          .html("Logout")
      })
    }
    else{
      d3.select("#login").select("a").html("Login");
    }
  })


fetch(MODELS_URL)
	.then((response) => {
		return response.json();
	})
	.then((myJson) => {
		const rows = Object.values(myJson);
		SimpleTableCreator(document.getElementById('modelPage'), rows);
	})

// Set up undo/redo hotkey to typical buttons
document.onkeydown = function(e){
  var mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

  if(!e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
    mapController.prov.goBackOneStep();
  }
  else if(e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
    mapController.prov.goForwardOneStep();
  }
}
