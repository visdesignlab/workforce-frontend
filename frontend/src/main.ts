import {Map} from './Map';
import {MapController} from './mapController';
import {MapEvents} from './mapEvents'
import {Sidebar} from './newSidebar'
import 'bootstrap';
import 'bootstrap-select';
import * as d3 from 'd3';

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
    console.log("done");
    mapController.prov.done();
  });
});

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
