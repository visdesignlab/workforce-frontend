import {Map} from './Map';
import {MapEvents} from './MapEvents'
import {Sidebar} from './sidebar'


import 'bootstrap';
import 'bootstrap-select';
let myMap: Map = new Map(true);
myMap.drawMap();
let myMapEvents:MapEvents = new MapEvents(myMap);
let otherMap: Map = new Map(false);
let sideBar = new Sidebar(myMap);
myMap.setSideBar(sideBar);
otherMap.setSideBar(sideBar);
otherMap.map = myMap;
myMap.map = otherMap;
let otherMapEvents:MapEvents = new MapEvents(otherMap, 1);
otherMap.otherCurrentYearData = myMap.currentYearData;
