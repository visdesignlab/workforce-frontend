import { MapController } from './mapController';
import { MapEvents } from './mapEvents'
import { SimpleTableCreator } from './modelInterface/SimpleCreator';
import 'bootstrap';
import 'bootstrap-select';
import * as d3 from 'd3';
import { api_request } from './API_utils'

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

		// alert('The current model is based on dummy data.');
  });
});


function logout() {
  api_request('logout')
    .then((response) => {
      if(response.status === 200) {
        d3.select("#login").select("a").attr("href", `${process.env.API_ROOT}/login`).html("Login");
        d3
          .select("#logout")
          .remove();
      } else{
        console.log("failed to logout")
      }
    })
}

api_request('whoami')
      .then((response) => {
        if(response.status === 200)
        {
          response.text().then((t) => {
            d3.select("#login").select("a").attr("href", null).html(`Logged in: ${t}`);
            d3
              .select("#loginOut")
              .append("li")
              .on("click", () => {
                logout()
              })
              .attr("id", "logout")
              .append("a")
              .html("Logout")
          })
        }
        else{
          d3.select("#login").select("a").attr("href", `${process.env.API_ROOT}/login`).html("Login");
        }
      })


api_request('models')
  .then((response) => {
    return response.json();
  })
  .then((myJson) => {
    const rows = Object.values(myJson);
    SimpleTableCreator(document.getElementById('modelPage'), rows);
  })

// Set up undo/redo hotkey to typical buttons
document.onkeydown = function(e){
  var mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

  if(!e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
    mapController.prov.goBackOneStep();
  }
  else if(e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
    mapController.prov.goForwardOneStep();
  }
}
