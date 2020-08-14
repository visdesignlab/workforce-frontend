import {Map} from './Map';
import {MapController} from './mapController';
import {MapEvents} from './mapEvents'
import {Sidebar} from './newSidebar'
import 'bootstrap';
import 'bootstrap-select';
import * as d3 from 'd3';

import * as session from 'express-session'

import React from 'react';
import ReactDOM from 'react-dom';
import { SimpleTableCreator } from './modelInterface/SimpleCreator';

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

const MODELS_URL = '/api/models'; //
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

let server = "http://127.0.0.1:5000/"

fetch(`http://127.0.0.1:5000/api/whoami`, {
            method: 'GET'
        })
        .then((response) => {
          if(response.status === 200)
          {
            d3.select("#login").select("a").html("Logged in: ");
          }
          else{
            d3.select("#login").select("a").html("Login");
          }
          return response.json();
        })
        .catch(error => {
          // console.log(error);
        })

var csrftoken = getCookie('csrftoken');
console.log(csrftoken)

const MODELS_URL = 'http://3.135.81.128/api/models'; //
fetch(MODELS_URL)
	.then((response) => {
		return response.json();
	})
	.then((myJson) => {
		const rows = Object.values(myJson);
    console.log(rows);
		SimpleTableCreator(document.getElementById('modelPage'), rows);
	})

console.log(document.cookie);

// fetch(`http://127.0.0.1:5000/api/login`, {
//         method: 'POST',
//         headers: {
//             'X-CSRFToken': csrftoken || '',
//             "Access-Control-Allow-Origin": 'http://vdl.sci.utah.edu/workforce-frontend/frontend/dist',
//             "Access-Control-Allow-Credentials": "true",
//         },
//         body: `csrfmiddlewaretoken=${csrftoken}&username=${username}&password=${password}`
//     })
//     .then(response => { console.log(response); return response })
//     .then(data => {
//         console.log(data);
//         if (data.redirected) {
//             loggedIn = true;
//         } else {
//             username = ""
//             password = ""
//         }
//     })
//     .catch(error => {
//         console.log(error)
//         // if (error.response.status === 401) setError(error.response.data.message);
//         // else setError("something went wrong")
//     })
//Setting up undo/redo hotkey to typical buttons
document.onkeydown = function(e){
  var mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

  if(!e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
    mapController.prov.goBackOneStep();
  }
  else if(e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
    mapController.prov.goForwardOneStep();
  }
}
