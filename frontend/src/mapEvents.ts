import * as d3 from 'd3';
import {MapController} from './mapController'
import { api_request } from './API_utils'

import axios from 'axios'

class MapEvents{
	map: MapController;
	selectAll : boolean;

	constructor(map:MapController){
		this.map = map;
		this.selectAll=false;
		this.updateYear();
		this.updateType();
		this.changeMapType();

		d3.select("#runModelButton")
			.on('click', () => {

				let bodyFormData = new FormData();

				bodyFormData.set('model_id', this.map.prov.current().getState().modelsSelected[0]);

				let removedString = "";
				for(let j in this.map.prov.current().getState().professionsSelected)
				{
					if(!this.map.prov.current().getState().professionsSelected[j])
					{
						removedString += j + ','
					}
				}

				bodyFormData.set('removed_professions', removedString.slice(0, removedString.length - 2));

				axios({
			    method: 'post',
			    url: `${process.env.API_ROOT}/rerun-model`,
			    data: bodyFormData,
			    headers: {'Content-Type': 'multipart/form-data', 'Access-Control-Allow-Origin': '*' }
			    })
			    .then(function (response) {
			        //handle success
			        console.log(response);
			    })
			    .catch(function (response) {
			        //handle error
			        console.log(response);
			    });

				alert("Your model is being rerun! This may take some time.")
			})

		d3.selectAll(".plusClass")
			.on("click", function(){
				if(d3.select(this).classed("plusClass"))
				{
					d3.select(this).classed("minusClass", true)
					d3.select(this).classed("plusClass", false)
				}
				else{
					d3.select(this).classed("minusClass", false)
					d3.select(this).classed("plusClass", true)
				}
			})
	}

	updateYear():void{
		d3.select("#year").on('change',()=>{
			let year:string = (document.getElementById('year') as HTMLInputElement).value;
			this.map.updateMapYear(year)
			})
	}

	updateType():void{
		document.getElementById("mapData").addEventListener('change',()=>{
			let mapData:string = (document.getElementById('mapData') as HTMLInputElement).value;
			this.map.updateComparisonType(mapData);
		})
	}

	changeMapType() {
		document.getElementById("mapType").addEventListener('change',()=>{
			this.map.updateMapType((document.getElementById('mapType') as HTMLInputElement).value);
		})
	}

	changeModelData():Promise<any> {
		let promise = api_request('models').then(response => response.json())
		let counter = 0;

		promise = promise.then((results: any[])=> {
			this.map.serverModels = results;
			for(let mod in results)
			{
				if(counter == 0)
				{
					d3.select('#modelData')
						.append('option')
						.attr("value", mod)
						.attr("selected", "")
						.html(results[mod].name ? results[mod].name : results[mod].model_name)
				}
				else
				{
					d3.select('#modelData')
						.append('option')
						.attr("value", mod)
						.html(results[mod].name ? results[mod].name : results[mod].model_name)
				}
				counter++;

			}
		})

		document.getElementById("modelData").addEventListener('change',()=>{
			this.map.removedProfessions.clear();
			this.map.modelRemovedComparison = false;

			this.map.mapType = (document.getElementById('mapType') as HTMLInputElement).value;
			let selectedOptions = (document.getElementById('modelData')as HTMLSelectElement).selectedOptions;

			let newList = []
			for(let i= 0; i < selectedOptions.length; i++)
			{
				newList.push(selectedOptions[i].value)
			}

			this.map.updateModelsSelected(newList);
		})
		return promise;
	}
}
export{MapEvents}
