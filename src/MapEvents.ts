import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {Map} from './Map'
class MapEvents{
	map: Map;
	constructor(map:Map){
		//based on map data choose color scale.
		//append svg
		this.map = map;
		this.updateYear();
		this.updateType();

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

		//update type of map
		})
	}

}
export{MapEvents}