import {Map} from './Map';
import {MapEvents} from './MapEvents'
import * as d3 from 'd3';
import 'bootstrap';

let myMap: Map = new Map("supply_need");
let myMapEvents:MapEvents = new MapEvents(myMap);

