import {Map} from './map';
import {MapController} from './mapController';
import {MapEvents} from './mapEvents'
import {Sidebar} from './sidebar'
import 'bootstrap';
import 'bootstrap-select';

let mapController = new MapController();

let myMapEvents:MapEvents = new MapEvents(mapController);

let promise = myMapEvents.changeModelData();

promise.then(()=>{
  mapController.drawMap().then(() => {
    mapController.drawSidebar();
  });
});
