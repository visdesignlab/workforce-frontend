import {Map} from './Map';
import {MapEvents} from './MapEvents'
import {SidebarEvents} from './SidebarEvents'
import 'bootstrap';
import 'bootstrap-select';
let myMap: Map = new Map();
let myMapEvents:MapEvents = new MapEvents(myMap);
let mySidebarEvents:SidebarEvents = new SidebarEvents(myMap.sidebar);
