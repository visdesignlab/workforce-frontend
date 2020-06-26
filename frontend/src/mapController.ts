import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {Sidebar} from './newSidebar';
import {Map} from './Map';

import { ProvVis, EventConfig, Config, ProvVisConfig, ProvVisCreator } from './ProvVis/provvis';


import
{
  initProvenance,
  ProvenanceGraph,
  Provenance,
  ActionFunction,
  SubscriberFunction,
  NodeMetadata,
  NodeID,
  Diff,
  RootNode,
  StateNode,
  ProvenanceNode,
  isStateNode,
  Nodes,
  CurrentNode,
  Artifacts,
  Extra
} from '@visdesignlab/provenance-lib-core';

export interface AppState
{
	year: string;
	mapType: string;
	modelsSelected: string[];
	scaleType: string;
	countiesSelected: string[];
 	professionsSelected: any;
}

const initialState: AppState = {
	year: '2019',
	mapType: 'counties',
	modelsSelected: [],
	scaleType: 'supply_need',
	countiesSelected: ['State of Utah'],
	professionsSelected: {
		'Phys': true,
		'PA': true,
		'NP': true,
		'RN': true,
		'PharmD': true,
		'MA': true,
		'Educ': true,
		'Psych': true,
		'LCSW': true,
		'CMHC': true,
		'MFT': true
	}
}

type EventTypes = "Change Quartet" | "Select Node" | "Hover Node"

/**
 *
 */
class MapController{
	prov: Provenance<AppState, EventTypes, string>;

	serverModels:any;
	originalMap: Map;
	secondMap: Map;
	mapData:string;
	mapType:string;
	comparisonMode: boolean;
	sidebar:Sidebar;
	removedProfessions:Set<string>;
	removedMapSupply:any;
	removedMapDemand:any;
	comparisonType:string;
	modelRemovedComparison:boolean;

	/**
	 *
	 */
	constructor()
	{
		this.prov = initProvenance(initialState);

		this.removedMapSupply = {}
		this.removedMapDemand = {}
		this.removedProfessions = new Set<string>();
		this.serverModels = {};
		this.originalMap = new Map(this, true);
		this.secondMap = new Map(this, false);

		this.sidebar = new Sidebar(this);
		this.mapData = "supply_need";
		this.mapType = 'counties';
		this.comparisonMode = false;
		this.comparisonType="gap";

		this.setupObservers();
	}

	visCallback(newNode:NodeID)
	{
	  this.prov.goToNode(newNode);

	  //Incase the state doesn't change and the observers arent called, updating the ProvVis here.
	  ProvVisCreator(
	    document.getElementById("provDiv")!,
	    this.prov.graph() as ProvenanceGraph<AppState, EventTypes, string>,
	    (newNode:NodeID) => this.prov.goToNode(newNode));
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

	drawMap():Promise<void>{
		let promise;

		promise = this.originalMap.drawMap(this.prov.current().state.modelsSelected[0]);
		if(this.comparisonMode)
		{
			promise = promise.then(() => this.secondMap.drawMap(this.prov.current().state.modelsSelected[1]));
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

		this.sidebar.initSideBar(this.originalMap.currentYearData, this.secondMap.currentYearData);
	}

	setupObservers()
	{
		this.prov.addObserver(['year'], () => {

			let state = this.prov.current().state;
			console.log(state.year)

			let promise = this.originalMap.updateMapYear(state.year)
			.then(() => {
				return this.secondMap.updateMapYear(state.year);
			})

			ProvVisCreator(
				document.getElementById("provDiv")!,
				this.prov.graph() as ProvenanceGraph<AppState, EventTypes, string>,
				(newNode:NodeID) => this.prov.goToNode(newNode));

			return Promise.all([promise]);
		})

		this.prov.addObserver(['mapType'], () => {

			console.log("updating map type", this.prov.current().state.mapType);

			ProvVisCreator(
		    document.getElementById("provDiv")!,
		    this.prov.graph() as ProvenanceGraph<AppState, EventTypes, string>,
		    (newNode:NodeID) => this.prov.goToNode(newNode));
		})

		this.prov.addObserver(['modelsSelected'], () => {
			if(this.comparisonMode && this.prov.current().state.modelsSelected.length < 2)
			{
				this.secondMap.destroy();
			}
			else if (this.prov.current().state.modelsSelected.length === 0)
			{
				this.originalMap.destroy();
				return;
			}
			this.comparisonMode = this.prov.current().state.modelsSelected.length > 1;
			this.drawMap().then(() => this.drawSidebar());

			ProvVisCreator(
				document.getElementById("provDiv")!,
				this.prov.graph() as ProvenanceGraph<AppState, EventTypes, string>,
				(newNode:NodeID) => this.prov.goToNode(newNode));
		})

		this.prov.addObserver(['scaleType'], () => {
			console.log(this.prov.current().state.scaleType);
			this.originalMap.updateMapType(this.prov.current().state.scaleType, 1000);
			if(this.comparisonMode)
			{
				this.secondMap.updateMapType(this.prov.current().state.scaleType, 1000);
			}
			this.drawSidebar();

			ProvVisCreator(
				document.getElementById("provDiv")!,
				this.prov.graph() as ProvenanceGraph<AppState, EventTypes, string>,
				(newNode:NodeID) => this.prov.goToNode(newNode));
		})

		this.prov.addObserver(['countiesSelected'], () => {
			this.sidebar.highlightAllCounties(this.prov.current().state.countiesSelected)
			this.originalMap.highlightAllCounties(this.prov.current().state.countiesSelected)

			if(this.comparisonMode)
			{
				this.secondMap.highlightAllCounties(this.prov.current().state.countiesSelected)
			}

			this.sidebar.updateProfessions();

			ProvVisCreator(
				document.getElementById("provDiv")!,
				this.prov.graph() as ProvenanceGraph<AppState, EventTypes, string>,
				(newNode:NodeID) => this.prov.goToNode(newNode));
		})

		this.prov.addObserver(['professionsSelected'], () => {
			this.recalcData(this.prov.current().state.year).then(() => {
				this.drawSidebar();
				this.setAllHighlights();
			});

			ProvVisCreator(
				document.getElementById("provDiv")!,
				this.prov.graph() as ProvenanceGraph<AppState, EventTypes, string>,
				(newNode:NodeID) => this.prov.goToNode(newNode));
		})
	}

	/**
	 * this updates the map when the user selects a new type of map
	 * @param mapData this the selection of the new map type
	 */

	 updateMapType(newMapType: string)
	 {
		 this.prov.applyAction("Map Type Changed", (state: AppState) => {
			 state.mapType = newMapType;
			 return state;
		 })
	 }

	 updateComparisonType(newCompType: string)
	 {
		 this.prov.applyAction("Comparison Type Changed", (state: AppState) => {
			 state.scaleType = newCompType;
			 return state;
		 })
	 }

	 updateModelsSelected(newModelsSelected: string[])
	 {
		 this.prov.applyAction("Change Selected Models", (state: AppState) => {
			 state.modelsSelected = newModelsSelected;
			 return state;
		 })
	 }

	// updateMapType(mapData:string):void{
	// 	this.mapData = mapData;
	//
	// 	this.originalMap.updateMapType(mapData, 1000);
	// 	if(this.comparisonMode)
	// 	{
	// 		this.secondMap.updateMapType(mapData, 1000);
	//
	// 	}
	// 	this.drawSidebar();
	// }


	/**
	 * This handles when the user selects a new year
	 * @param year this is the new year selected by the user
	 */
	recalcData(year:string):Promise<any>{

		if(this.removedProfessions.size > 0)
		{
			this.comparisonMode = true;
		}

		let promise = this.originalMap.updateMapYear(year)
		.then(() => {
			return this.secondMap.updateMapYear(year);
		})

		return Promise.all([promise]);
	}

	updateMapYear(newYear: string)
	{
		this.prov.applyAction("Map Year Changed", (state: AppState) => {
			state.year = newYear;
			return state;
		})
	}

	updateSelectedProf(profSelected: string)
	{
		console.log(profSelected)
		this.prov.applyAction("Profession " + profSelected + " Selected", (state: AppState) => {
			state.professionsSelected[profSelected] = !state.professionsSelected[profSelected];
			return state;
		})
	}

	updateSelectedCounty(selectCounty: string)
	{
		this.prov.applyAction("Select " + selectCounty, (state: AppState) => {

			if(selectCounty === 'State of Utah')
			{
				state.countiesSelected = ['State of Utah']
			}
			else if(state.countiesSelected.includes(selectCounty))
			{
				state.countiesSelected.splice(state.countiesSelected.indexOf(selectCounty), 1);
				if(state.countiesSelected.length === 0)
				{
					state.countiesSelected.push("State of Utah");
				}
			}
			else
			{
				if(state.countiesSelected.includes("State of Utah"))
				{
					state.countiesSelected.splice(state.countiesSelected.indexOf("State of Utah"), 1)
				}
				state.countiesSelected.push(selectCounty);
			}

			return state;
		})
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
			this.secondMap.drawMap(this.prov.current().state.modelsSelected[0]);
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
	//
	// highlightPath(name:string) {
	//
	// 	console.log(this.selectedCounties)
	//
	// 	if(!this.selectedCounties.has(name) && this.selectedCounties.has("State of Utah"))
	// 	{
	// 		this.sidebar.currentlySelected.delete("State of Utah")
	// 		this.sidebar.currentlySelected.add(name)
	//
	// 	}
	//
	// 	else if(this.selectedCounties.has(name) && this.selectedCounties.size == 1)
	// 	{
	// 		this.sidebar.currentlySelected = new Set<string>();
	// 		this.sidebar.currentlySelected.add("State of Utah");
	// 	}
	//
	// 	if(this.selectedCounties.has(name))
	// 	{
	// 		this.unHighlightPath(name);
	// 		this.setAllHighlights();
	//
	// 		return;
	// 	}
	//
	// 	this.selectedCounties.add(name);
	// 	this.originalMap.highlightPath(name);
	// 	if(this.comparisonMode)
	// 	{
	// 		this.secondMap.highlightPath(name);
	// 	}
	// 	this.setAllHighlights();
	//
	// 	if(this.comparisonMode)
	// 	{
	// 		// this.modelComparison.drawComparison(this.originalMap.results, this.secondMap.results, this.comparisonType);
	// 	}
	//
	// 	this.sidebar.highlightBar(name);
	// }
	//
	// unHighlightPath(name:string) {
	// 	this.selectedCounties.delete(name);
	// 	this.originalMap.unHighlightPath(name);
	// 	if(this.comparisonMode)
	// 	{
	// 		this.secondMap.unHighlightPath(name);
	// 	}
	// 	this.setAllHighlights();
	//
	// 	this.sidebar.unHighlightBar(name);
	// }

	setAllHighlights(){

		for(let prof in this.prov.current().state.professionsSelected)
		{
			if(this.prov.current().state.professionsSelected[prof])
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

	removeSpaces(s) : string{
		return s.replace(/\s/g, '');
	}

}
export{MapController};
