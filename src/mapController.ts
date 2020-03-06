import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {Sidebar} from './sidebar';
import {Map} from './map';
import {ModelComparison} from './modelComparison';

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
	selectedCounties:Set<string>;
	modelsUsed:any[];
	sidebar:Sidebar;
	modelComparison:ModelComparison;
	comparisonType:string;

	/**
	 *
	 */
	constructor()
	{
		this.originalMap = new Map(this, true);
		this.secondMap = new Map(this, false);
		this.sidebar = new Sidebar(this);
		this.selectedProfessions = {};
		this.modelsUsed = ['model1'];
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
			promise = promise.then(() => this.modelComparison.drawComparison(this.originalMap.results, this.secondMap.results, this.comparisonType));

		}
		else{
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
	updateMapYear(year:string):Promise<void>{
		let promise = this.originalMap.updateMapYear(year, this.mapData, this.mapType, this.sidebar);
		if(this.comparisonMode)
		{
			promise = promise.then(() => this.secondMap.updateMapYear(year, this.mapData, this.mapType, this.sidebar));
		}
		return promise;
	}

	updateSelections(selectedProfessions:any){
		this.updateMapYear(this.yearSelected).then(() => {
			this.drawSidebar();
			this.setAllHighlights();

		});
	}

	mouseOut(){
		d3.select("#tooltip").transition().duration(500).style("opacity", 0);
	}

	highlightPath(name:string) {

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

		this.drawSidebar();
	}

	unHighlightPath(name:string) {
		this.selectedCounties.delete(name);
		this.originalMap.unHighlightPath(name);
		if(this.comparisonMode)
		{
			this.secondMap.unHighlightPath(name);
		}
		this.setAllHighlights();


		this.drawSidebar();
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

		this.updateSelections(this.selectedProfessions);
	}

	removeSpaces(s) : string{
		return s.replace(/\s/g, '');
	}

	changeComparisonType(s)
	{
		this.comparisonType = s;
		this.modelComparison.drawComparison(this.originalMap.results, this.secondMap.results, this.comparisonType);
	}
}
export{MapController};
