import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {MapController} from './MapController'
class MapEvents{
	map: MapController;
	selectAll : boolean;

	constructor(map:MapController){
		this.map = map;
		this.selectAll=false;
		this.updateYear();
		this.updateType();
		this.changeMapType();
		this.changeComparisonType();

		d3.selectAll(".plusClass")
			.on("click", function(){
				console.log("clicked", this);
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
			this.map.updateMapType(mapData);
		})
	}

	changeMapType() {
		document.getElementById("mapType").addEventListener('change',()=>{
			this.map.selectedCounties = new Set<string>();
			this.map.mapType = (document.getElementById('mapType') as HTMLInputElement).value;
			this.map.drawMap().then(() => this.map.drawSidebar());
		})
	}

	changeComparisonType() {
		document.getElementById("supplyDemandGap").addEventListener('change',()=>{
			this.map.changeComparisonType((document.getElementById('supplyDemandGap') as HTMLInputElement).value);
		})
	}

	changeModelData():Promise<void> {

		const serverUrl = 'http://3.20.123.182/';

		let promise = d3.json(serverUrl+"models");

		let counter = 0;

		promise = promise.then((results)=> {
			this.map.serverModels = results;
			for(let mod in results)
			{

				if(counter == 0)
				{
					this.map.modelsUsed = [mod];
					d3.select('#modelData')
						.append('option')
						.attr("value", mod)
						.attr("selected", "")
						.html(results[mod].name)
				}
				else
				{
					d3.select('#modelData')
						.append('option')
						.attr("value", mod)
						.html(results[mod].name)
				}
				counter++;

			}
		})


		document.getElementById("modelData").addEventListener('change',()=>{
			this.map.mapType = (document.getElementById('mapType') as HTMLInputElement).value;
			let selectedOptions = (document.getElementById('modelData')as HTMLSelectElement).selectedOptions;

			console.log((document.getElementById('modelData')as HTMLSelectElement).options);
			let ele = (document.getElementById('modelData')as HTMLSelectElement)

			if(selectedOptions.length > 2)
			{
				counter = 0;
				for(let i; i < ele.options.length; i++)
				{
					if(ele.options[i].selected)
					{
						counter++;
						if(counter > 2)
						{
							ele.options[i].selected = false;
						}
					}
				}
			}

			if(selectedOptions.length == 0)
			{
				this.map.selectedCounties = new Set<string>();
				this.map.selectedProfessions = {};
				this.map.destroy();
				return;
			}
			else if (selectedOptions.length == 1) {
				this.map.comparisonMode = false;
			}
			else{
				this.map.comparisonMode = true;
			}

			this.map.modelsUsed = [];
			for(let i= 0; i < selectedOptions.length; i++)
			{
				if(this.map.modelsUsed.length > 2)
				{
					selectedOptions[i].selected = false;
					continue;
					// this.map.modelsUsed.shift();
				}
				this.map.modelsUsed.push(selectedOptions[i].value)

			}
			this.map.drawMap().then(() => this.map.drawSidebar());
		})

		return promise;
	}
}
export{MapEvents}
