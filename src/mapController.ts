import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {Sidebar} from './sidebar';
import {Map} from './map';

/**
 *
 */
class MapController{
	originalMap: Map;
	secondMap: Map;
	mapData:string;
	mapType:string;
	comparisonMode: boolean;
	selectedProfessions: any;
	yearSelected: string;
	selectedCounty:string;
	modelsUsed:any[];
	sidebar:Sidebar;

	/**
	 *
	 */
	constructor()
	{
		this.originalMap = new Map(this);
		this.secondMap = new Map(this);
		this.sidebar = new Sidebar(this);
		this.selectedProfessions = {};
		this.modelsUsed = ['model1'];
		this.selectedCounty = 'State of Utah'
		this.mapData = "supply_need";
		this.mapType = 'counties';
		this.comparisonMode = false;
		this.yearSelected = (document.getElementById('year') as HTMLInputElement).value
	}

	setSideBar(sideBar: Sidebar){
		this.sidebar = sideBar;
	}

	destroy() {
		this.originalMap.destroy();
		this.secondMap.destroy();
		this.sidebar.destroy();
	}

	drawMap(customModel = false, initSidebar = true, otherCurrentYearData = []):Promise<void>{

		let promise;
		promise = this.originalMap.drawMap(this.mapData, this.modelsUsed[0], this.selectedProfessions, this.yearSelected, this.selectedCounty, this.mapType, customModel, initSidebar);

		console.log(this.originalMap);
		if(this.comparisonMode)
		{
			promise = promise.then(() => this.secondMap.drawMap(this.mapData, this.modelsUsed[1], this.selectedProfessions, this.yearSelected, this.selectedCounty, this.mapType, customModel, initSidebar));
		}
		else{
			this.secondMap.destroy();
		}

		return promise;
	}

	drawSidebar()
	{
		console.log(this.selectedCounty);
		this.sidebar.initSideBar(this.selectedProfessions, this.originalMap.currentYearData, this.selectedCounty, this.secondMap.currentYearData);
	}

	/**
	 * this updates the map when the user selects a new type of map
	 * @param mapData this the selection of the new map type
	 */
	updateMapType(mapData:string):void{
		this.mapData = mapData;

		this.originalMap.updateMapType(mapData, 1000);
		this.secondMap.updateMapType(mapData, 1000);
		this.drawSidebar();
	}

	/**
	 * This handles when the user selects a new year
	 * @param year this is the new year selected by the user
	 */
	updateMapYear(year:string):Promise<void>{
		let promise = this.originalMap.updateMapYear(year, this.mapData, this.mapType, this.sidebar);
		if(this.comparisonMode)
		{
			promise.then(() => this.secondMap.updateMapYear(year, this.mapData, this.mapType, this.sidebar));
		}
		return promise;
	}

	updateSelections(selectedProfessions:any){
		this.updateMapYear(this.yearSelected).then(() => {this.drawSidebar()});
	}

	mouseOut(){
		d3.select("#tooltip").transition().duration(500).style("opacity", 0);
	}

	highlightPath(name:string) {
		this.selectedCounty = name;
		this.originalMap.highlightPath(name);
		if(this.comparisonMode)
		{
			this.secondMap.highlightPath(name);
		}

		this.drawSidebar();
		this.sidebar.highlightBar(name);
	}
}
export{MapController};
