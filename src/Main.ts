import {Map} from './Map';
import {MapEvents} from './MapEvents'
import 'bootstrap';
import 'bootstrap-select';
let myMap: Map = new Map();
myMap.drawMap();
let myMapEvents:MapEvents = new MapEvents(myMap);
let otherMap: Map = new Map();
otherMap.map = myMap;
let otherMapEvents:MapEvents = new MapEvents(otherMap, 1);
otherMap.otherCurrentYearData = myMap.currentYearData;
