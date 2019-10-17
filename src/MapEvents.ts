import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {Map} from './Map'
class MapEvents{
	map: Map;
	selectAll : boolean;
	constructor(map:Map){
		this.map = map;
		this.selectAll=false;
		this.updateYear();
		this.updateType();
		this.selectAllClicked();
		this.changeMapType();
		this.changeModelData();
	}
	
	updateYear():void{
		d3.select("#year").on('change',()=>{
			let year:string = (document.getElementById('year') as HTMLInputElement).value;
			this.map.updateMapYear(year)
			//update year of map
			})

	}

	updateType():void{
		d3.select("#mapData").on('change',()=>{
			let mapData:string = (document.getElementById('mapData') as HTMLInputElement).value;
			this.map.updateMapType(mapData)
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
		d3.select("#mapType").on('change',()=>{
			this.map.mapType = (document.getElementById('mapType') as HTMLInputElement).value;
			this.map.drawMap();
		})
	}

	changeModelData() {
		d3.select("#modelData").on('change',()=>{
			this.map.mapType = (document.getElementById('mapType') as HTMLInputElement).value;
			this.map.modelData = (document.getElementById('modelData') as HTMLInputElement).value;
			this.map.drawMap();
		})
	}

}
export{MapEvents}
