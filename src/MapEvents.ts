import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {Map} from './Map'
class MapEvents{
	map: Map;
	selectAll : boolean;
	id: number;
	constructor(map:Map, id = 0){
		this.map = map;
		this.id = id;
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
			//update year of map
			})

	}

	updateType():void{
		document.getElementById("mapData").addEventListener('change',()=>{
			let mapData:string = (document.getElementById('mapData') as HTMLInputElement).value;
			if(this.id == 0)
			{
				this.map.updateMapType(mapData)
			}
			else if(this.map.useSecondMap)
			{
				this.map.updateMapType(mapData);
			}
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
			this.map.mapType = (document.getElementById('mapType') as HTMLInputElement).value;
			this.map.drawMap();
		})
	}

	changeModelData() {
		document.getElementById("modelData").addEventListener('change',()=>{
			this.map.mapType = (document.getElementById('mapType') as HTMLInputElement).value;
			let selectedOptions = (document.getElementById('modelData')as HTMLSelectElement).selectedOptions;

			console.log(selectedOptions);
			if (selectedOptions[this.id]) {
				if (selectedOptions.length == 1) {
					this.map.useSecondMap = false;
					this.map.map.useSecondMap = false;
					this.map.map = null;
					console.log(this.map.currentYearData)
					this.map.otherCurrentYearData = {};
				}
				else{
					this.map.useSecondMap = true;
				}
				this.map.modelData = selectedOptions[this.id].value;
				this.map.drawMap();
			} else {
				this.map.destroy();
				this.map.linechart.destroy();
			}
		})
	}

	runCustomModel() {
		d3.select("#runModel").on('click',()=>{
			this.map.drawMap(true);
		})
	}

}
export{MapEvents}
