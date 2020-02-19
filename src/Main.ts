import {Map} from './map';
import {MapController} from './mapController';
import {MapEvents} from './mapEvents'
import {Sidebar} from './sidebar'
import 'bootstrap';
import 'bootstrap-select';

let mapController = new MapController();

let myMapEvents:MapEvents = new MapEvents(mapController);

console.log("in main");
mapController.drawMap().then(() => {
  mapController.drawSidebar();
});
