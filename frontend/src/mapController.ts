import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {Sidebar} from './newSidebar';
import {Map} from './map';
import {ModelComparison} from './modelComparison';

/**
 *
 */
class MapController{

	serverModels:any;
	originalMap: Map;
	secondMap: Map;
	mapData:string;
	mapType:string;
	comparisonMode: boolean;
	selectedProfessions: any;
	yearSelected: string;
	selectedCounties:Set<string>;
	modelsUsed:any[];
	sidebar:Sidebar;
	removedProfessions:Set<string>;
	removedMapSupply:any;
	removedMapDemand:any;
	modelComparison:ModelComparison;
	comparisonType:string;
	modelRemovedComparison:boolean;

	/**
	 *
	 */
	constructor()
	{
		this.removedMapSupply = {}

		this.removedMapDemand = {}
		this.removedProfessions = new Set<string>();
		this.serverModels = {};
		this.originalMap = new Map(this, true);
		this.secondMap = new Map(this, false);

		this.sidebar = new Sidebar(this);
		this.selectedProfessions = {};
		this.modelsUsed = [];
		this.selectedCounties = new Set<string>();
		this.mapData = "supply_need";
		this.mapType = 'counties';
		this.comparisonMode = false;
		this.modelComparison= new ModelComparison(this);
		this.comparisonType="gap";
		this.yearSelected = (document.getElementById('year') as HTMLInputElement).value
	}

	setSideBar(sideBar: Sidebar){
		this.sidebar = sideBar;
	}

	destroy() {
		d3.select("#legendDiv")
			.selectAll("*")
			.remove();
		this.originalMap.destroy();
		this.secondMap.destroy();
		this.sidebar.destroy();

	}

	drawMap(customModel = false, initSidebar = true, otherCurrentYearData = []):Promise<void>{
		let promise;

		promise = this.originalMap.drawMap(this.mapData, this.modelsUsed[0], this.selectedProfessions, this.yearSelected, this.selectedCounties, this.mapType, customModel, initSidebar);
		if(this.comparisonMode)
		{
			promise = promise.then(() => this.secondMap.drawMap(this.mapData, this.modelsUsed[1], this.selectedProfessions, this.yearSelected, this.selectedCounties, this.mapType, customModel, initSidebar));
			// promise = promise.then(() => this.modelComparison.drawComparison(this.originalMap.results, this.secondMap.results, this.comparisonType));
			d3.select("#comparisonView")
				.style("display", "block")
			d3.select("#map")
				.attr("width", 1200)
		}
		else{
			d3.select("#comparisonView")
				.style("display", "none")
			d3.select("#map")
				.attr("width", 600)
			this.secondMap.destroy();
		}

		promise = promise.then(() => this.setAllHighlights());

		return promise;
	}

	drawSidebar()
	{

		this.sidebar.initSideBar(this.selectedProfessions, this.originalMap.currentYearData, this.selectedCounties, this.secondMap.currentYearData);
	}

	/**
	 * this updates the map when the user selects a new type of map
	 * @param mapData this the selection of the new map type
	 */
	updateMapType(mapData:string):void{
		this.mapData = mapData;

		this.originalMap.updateMapType(mapData, 1000);
		if(this.comparisonMode)
		{
			this.secondMap.updateMapType(mapData, 1000);

		}
		this.drawSidebar();
	}


	/**
	 * This handles when the user selects a new year
	 * @param year this is the new year selected by the user
	 */
	updateMapYear(year:string):Promise<any>{

		if(this.removedProfessions.size > 0)
		{
			this.comparisonMode = true;
		}

		let promise = this.originalMap.updateMapYear(year, this.mapData, this.mapType, this.sidebar)
		.then(() => {
			return this.secondMap.updateMapYear(year, this.mapData, this.mapType, this.sidebar);
		})

		return Promise.all([promise]);
	}

	updateSelections(selectedProfessions:any){
		this.updateMapYear(this.yearSelected).then(() => {
			this.drawSidebar();
			this.setAllHighlights();
			if(this.comparisonMode)
			{
				// this.modelComparison.drawComparison(this.originalMap.results, this.secondMap.results, this.comparisonType);
			}
		});
	}

	createDuplicateMap()
	{
		if(!this.modelRemovedComparison)
		{
			d3.select("#comparisonView")
				.style("display", "block")
			d3.select("#map")
				.attr("width", 1200)

			this.modelRemovedComparison = true;
			this.comparisonMode = true;
			this.secondMap.drawMap(this.mapData, this.modelsUsed[0], this.selectedProfessions, this.yearSelected, this.selectedCounties, this.mapType, false, true);
		}
	}

	removeDuplicateMap()
	{
		if(this.modelRemovedComparison)
		{
			d3.select("#comparisonView")
				.style("display", "none")
			d3.select("#map")
				.attr("width", 600)
			this.modelRemovedComparison = false;
			this.comparisonMode = false;
			this.secondMap.destroy();
		}
	}

	mouseOut(){
		d3.select("#tooltip").transition().duration(500).style("opacity", 0);
	}

	highlightPath(name:string) {

		console.log(this.selectedCounties)

		if(!this.selectedCounties.has(name) && this.selectedCounties.has("State of Utah"))
		{
			this.sidebar.currentlySelected.delete("State of Utah")
			this.sidebar.currentlySelected.add(name)

		}

		else if(this.selectedCounties.has(name) && this.selectedCounties.size == 1)
		{
			this.sidebar.currentlySelected = new Set<string>();
			this.sidebar.currentlySelected.add("State of Utah");
		}

		if(this.selectedCounties.has(name))
		{
			this.unHighlightPath(name);
			this.setAllHighlights();

			return;
		}

		this.selectedCounties.add(name);
		this.originalMap.highlightPath(name);
		if(this.comparisonMode)
		{
			this.secondMap.highlightPath(name);
		}
		this.setAllHighlights();

		if(this.comparisonMode)
		{
			// this.modelComparison.drawComparison(this.originalMap.results, this.secondMap.results, this.comparisonType);
		}

		this.sidebar.highlightBar(name);
	}

	unHighlightPath(name:string) {
		this.selectedCounties.delete(name);
		this.originalMap.unHighlightPath(name);
		if(this.comparisonMode)
		{
			this.secondMap.unHighlightPath(name);
		}
		this.setAllHighlights();

		this.sidebar.unHighlightBar(name);
	}

	setAllHighlights(){

		for(let prof in this.selectedProfessions)
		{
			if(this.selectedProfessions[prof])
			{
				this.highlightProfession(prof);
			}
			else{
				this.unHighlightProfession(prof);
			}
		}
	}

	highlightProfession(name:string){
		d3.selectAll(`.${name}rect`)
			.classed('highlightProfRect', true)
	}

	unHighlightProfession(name:string)
	{
		d3.selectAll(`.${name}rect`)
			.classed('highlightProfRect', false)
	}

	profClicked(name:string)
	{
		if(this.selectedProfessions[name])
		{
			this.selectedProfessions[name] = false;
			this.unHighlightProfession(name);
			this.drawSidebar();
		}
		else{
			this.selectedProfessions[name] = true;
			this.highlightProfession(name);
			this.drawSidebar();
		}

		if(this.comparisonMode)
		{
			// this.modelComparison.drawComparison(this.originalMap.results, this.secondMap.results, this.comparisonType);
		}

		this.updateSelections(this.selectedProfessions);
	}

	removeSpaces(s) : string{
		return s.replace(/\s/g, '');
	}

	changeComparisonType(s)
	{
		this.comparisonType = s;
		if(this.comparisonMode)
		{
			// this.modelComparison.drawComparison(this.originalMap.results, this.secondMap.results, this.comparisonType);

		}
	}
}
export{MapController};
