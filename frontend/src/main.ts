import {Map} from './Map';
import {MapController} from './mapController';
import {MapEvents} from './mapEvents'
import {Sidebar} from './sidebar'
import 'bootstrap';
import 'bootstrap-select';
import * as d3 from 'd3';

import React from 'react';
import ReactDOM from 'react-dom';
import { SimpleTableCreator } from './modelInterface/SimpleCreator';

d3.select('#visualization').on('click', () => {
  d3.select('#visualization').node().className = 'is-active';
  d3.select('#modelCreate').node().className = '';
  d3.select('#mainPage').style('display', 'block');
  d3.select('#modelPage').style('display', 'none');
});
d3.select('#modelCreate').on('click', () => {
  d3.select('#visualization').node().className = '';
  d3.select('#modelCreate').node().className = 'is-active';
  d3.select('#mainPage').style('display', 'none');
  d3.select('#modelPage').style('display', 'block');
});

let mapController = new MapController();

let myMapEvents:MapEvents = new MapEvents(mapController);

let promise = myMapEvents.changeModelData();

promise.then(()=>{
  mapController.drawMap().then(() => {
    mapController.drawSidebar();
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
