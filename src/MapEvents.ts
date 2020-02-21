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
		this.selectAllClicked();
		this.changeMapType();
		this.changeModelData();
		this.runCustomModel();
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

	selectAllClicked():void{
		d3.select("#selectAll").on('click',()=>{

			if(this.selectAll){
				d3.select("#selectAll").transition().text('Unselect All');
				Object.keys(this.map.selectedProfessions).forEach(profession => {
					this.map.selectedProfessions[profession] = true;
				d3.select("#" + profession)
					.select('rect')
					.attr('fill', '#cccccc');

				})
				this.selectAll = false;

			}


			else{
				d3.select("#selectAll").transition().text('Select All');

				Object.keys(this.map.selectedProfessions).forEach(profession => {
						this.map.selectedProfessions[profession] = false;
						d3.selectAll("#" + profession)
							.select('rect')
							.attr('fill', '#ffffff');

					})
				this.selectAll = true;

			}
				this.map.updateSelections(this.map.selectedProfessions)
			})}

	changeMapType() {
		document.getElementById("mapType").addEventListener('change',()=>{
			this.map.selectedCounties = new Set<string>();
			this.map.mapType = (document.getElementById('mapType') as HTMLInputElement).value;
			this.map.drawMap().then(() => this.map.drawSidebar());
		})
	}

	changeModelData() {
		document.getElementById("modelData").addEventListener('change',()=>{
			this.map.mapType = (document.getElementById('mapType') as HTMLInputElement).value;
			let selectedOptions = (document.getElementById('modelData')as HTMLSelectElement).selectedOptions;
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
				this.map.modelsUsed.push(selectedOptions[i].value)
			}
			this.map.drawMap().then(() => this.map.drawSidebar());
		})
	}

	runCustomModel() {
		d3.select("#runModel").on('click',()=>{
			this.map.drawMap(true);
		})
	}

}
export{MapEvents}
