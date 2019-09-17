import {Map} from './Map';
import {MapEvents} from './MapEvents'
import * as d3 from 'd3';
import 'bootstrap';
import 'bootstrap-select';
let myMap: Map = new Map();
let myMapEvents:MapEvents = new MapEvents(myMap);