import * as d3 from "d3";
import { Sidebar } from "./newSidebar";
import { Map } from "./Map";

import { EventConfig, ProvVisCreator } from "./ProvVis/provvis";

import {
  CountiesChanged,
  ProfessionsChanged,
  MapTypeChange,
  MapShapeChange,
  YearChanged,
  ModelChanged,
} from "./Icons";

import { initProvenance, Provenance, NodeID } from "@visdesignlab/trrack";

export interface EditedCounties {
  supply: {};
  demand: {};
}

interface Model {
	id:number;
	author:string;
	description:string;
	model_id:string;
	model_name:string;
	model_type:string;
	start_year:number;
	end_year:number;
	step_size:number;
	removed_professions:string[];
	path:string;
	filename:string;
	status:string;
}

export interface AppState {
  year: string;
  mapType: string;
  firstModelSelected:Model;
  secondModelSelected:Model;
  scaleType: string;
  countiesSelected: string[];
  professionsSelected: any;
  editedCounties: EditedCounties;
  historyOpen: boolean;
}

const initialState: AppState = {
  year: "2019",
  mapType: "counties",
  firstModelSelected: {
    id: 2,
    author: "IBM",
    description: "Original model by IBM based on dummy data.",
    model_id: "8bcaed56-89aa-4d24-9d6c-732f2eb35fd7",
    model_name: "Original Model",
    model_type: "ideal_staffing",
    start_year: 2014,
    end_year: 2024,
    step_size: 1,
    removed_professions: [],
    path: "models/8bcaed56-89aa-4d24-9d6c-732f2eb35fd7.json",
    filename: "8bcaed56-89aa-4d24-9d6c-732f2eb35fd7_Workforce_Optimization_Tool_-_Input_Data.xlsx",
    status: "Completed"
  },
  secondModelSelected: undefined,
  scaleType: "supply_need",
  countiesSelected: ["State of Utah"],
  professionsSelected: {
    Phys: true,
    PA: true,
    NP: true,
    RN: true,
    PharmD: true,
    MA: true,
    Educ: true,
    Psych: true,
    LCSW: true,
    CMHC: true,
    MFT: true,
  },
  editedCounties: {
    supply: {},
    demand: {},
  },
  historyOpen: true,
};

//
const eventConfig: EventConfig<EventOptions> = {
  "Counties Changed": {
    backboneGlyph: CountiesChanged({ size: 22 }),
    currentGlyph: CountiesChanged({ size: 22, fill: "#2185d0" }),
    regularGlyph: CountiesChanged({ size: 16 }),
    bundleGlyph: CountiesChanged({ size: 22, fill: "#2185d0" }),
  },
  "Professions Changed": {
    backboneGlyph: ProfessionsChanged({ size: 22 }),
    currentGlyph: ProfessionsChanged({ size: 22, fill: "#2185d0" }),
    regularGlyph: ProfessionsChanged({ size: 16 }),
    bundleGlyph: ProfessionsChanged({ size: 22, fill: "#2185d0" }),
  },
  "Year Changed": {
    backboneGlyph: YearChanged({ size: 22 }),
    currentGlyph: YearChanged({ size: 22, fill: "#2185d0" }),
    regularGlyph: YearChanged({ size: 16 }),
    bundleGlyph: YearChanged({ size: 22, fill: "#2185d0" }),
  },
  "Model Changed": {
    backboneGlyph: ModelChanged({ size: 22 }),
    currentGlyph: ModelChanged({ size: 22, fill: "#2185d0" }),
    regularGlyph: ModelChanged({ size: 16 }),
    bundleGlyph: ModelChanged({ size: 22, fill: "#2185d0" }),
  },
  "MapType Changed": {
    backboneGlyph: MapTypeChange({ size: 22 }),
    currentGlyph: MapTypeChange({ size: 22, fill: "#2185d0" }),
    regularGlyph: MapTypeChange({ size: 16 }),
    bundleGlyph: MapTypeChange({ size: 22, fill: "#2185d0" }),
  },
  "MapShape Changed": {
    backboneGlyph: MapShapeChange({ size: 22 }),
    currentGlyph: MapShapeChange({ size: 22, fill: "#2185d0" }),
    regularGlyph: MapShapeChange({ size: 16 }),
    bundleGlyph: MapShapeChange({ size: 22, fill: "#2185d0" }),
  },
};

type EventOptions =
  | "Counties Changed"
  | "Professions Changed"
  | "Year Changed"
  | "Model Changed"
  | "MapType Changed"
  | "MapShape Changed"
  | "Open History"
  | "Close History";
/**
 *
 */
class MapController {
  prov: Provenance<AppState, EventOptions, string>;

  serverModels: any;
  originalMap: Map;
  secondMap: Map;
  mapData: string;
  mapType: string;
  comparisonMode: boolean;
  sidebar: Sidebar;
  removedProfessions: Set<string>;
  removedMapSupply: any;
  removedMapDemand: any;
  comparisonType: string;
  modelRemovedComparison: boolean;

  /**
   *
   */
  constructor() {
    this.prov = initProvenance(initialState, true);

    this.removedMapSupply = {};
    this.removedMapDemand = {};
    this.removedProfessions = new Set<string>();
    this.serverModels = {};
    this.originalMap = new Map(this, true);
    this.secondMap = new Map(this, false);

    this.sidebar = new Sidebar(this);
    this.mapData = "supply_need";
    this.mapType = "counties";
    this.comparisonMode = false;
    this.comparisonType = "gap";

    this.setupObservers();
  }

  setSideBar(sideBar: Sidebar) {
    this.sidebar = sideBar;
  }

  destroy() {
    d3.select("#legendDiv").selectAll("*").remove();
    this.originalMap.destroy();
    this.secondMap.destroy();
    this.sidebar.destroy();
  }

  drawMap(): Promise<void> {
    let promise;

    promise = this.originalMap.drawMap(
      this.prov.current().getState().firstModelSelected.model_id
    );
    if (this.comparisonMode) {
      promise = promise.then(() =>
        this.secondMap.drawMap(this.prov.current().getState().secondModelSelected.model_id)
      );
      d3.select("#comparisonView").style("display", "block");
      d3.select("#map").attr("width", 1200);
    } else {
      d3.select("#comparisonView").style("display", "none");
      d3.select("#map").attr("width", 600);
      this.secondMap.destroy();
    }

    promise = promise.then(() => {
      this.originalMap.initLineChart();
      if (this.comparisonMode) {
        this.secondMap.initLineChart();
      }
      this.setAllHighlights();
    });

    return promise;
  }

  drawSidebar() {
    this.sidebar.initSideBar(
      this.originalMap.currentYearData,
      this.secondMap.currentYearData
    );
  }

  setupObservers() {
    this.prov.addGlobalObserver(() => {
      ProvVisCreator(
        document.getElementById("provDiv")!,
        this.prov,
        (newNode: NodeID) => this.prov.goToNode(newNode),
        false,
        false,
        undefined,
        { eventConfig: eventConfig }
      );
    });

    this.prov.addObserver(["year"], () => {
      let state = this.prov.current().getState();

      let promise = this.originalMap.updateMapYear(state.year).then(() => {
        return this.secondMap.updateMapYear(state.year);
      });

      return Promise.all([promise]);
    });

    this.prov.addObserver(["historyOpen"], () => {
      let state = this.prov.current().getState();

      if (state.historyOpen) {
        d3.select("#provDiv").style("width", "250px");
      } else {
        d3.select("#provDiv").style("width", "0px");
      }
    });

    this.prov.addObserver(["firstModelSelected"], () => {
      if (
        this.comparisonMode &&
        !this.prov.current().getState().secondModelSelected
      ) {
        this.secondMap.destroy();
        d3.select("#runModelButton").style("display", "block");
      } else if (!this.prov.current().getState().firstModelSelected) {
        this.originalMap.destroy();
        return;
      } else {
        console.log("here");
        d3.select("#runModelButton").style("display", "none");
      }
      this.comparisonMode =
        this.prov.current().getState().secondModelSelected !== undefined;
      this.drawMap().then(() => this.drawSidebar());
	});
	
	this.prov.addObserver(["secondModelSelected"], () => {
		if (
			this.comparisonMode &&
			!this.prov.current().getState().secondModelSelected
		) {
			this.secondMap.destroy();
			d3.select("#runModelButton").style("display", "block");
		} else if (!this.prov.current().getState().firstModelSelected) {
			this.originalMap.destroy();
			return;
		} else {
			console.log("here");
			d3.select("#runModelButton").style("display", "none");
		}
		this.comparisonMode =
			this.prov.current().getState().secondModelSelected !== undefined;
		this.drawMap().then(() => this.drawSidebar());
	});

    this.prov.addObserver(["scaleType"], () => {
      this.originalMap.updateMapType(
        this.prov.current().getState().scaleType,
        1000
      );
      if (this.comparisonMode) {
        this.secondMap.updateMapType(
          this.prov.current().getState().scaleType,
          1000
        );
      }
      this.drawSidebar();
    });

    this.prov.addObserver(["mapType"], () => {
      this.drawMap().then(() => this.drawSidebar());
    });

    this.prov.addObserver(["countiesSelected"], () => {
      this.sidebar.highlightAllCounties(
        this.prov.current().getState().countiesSelected
      );
      this.originalMap.highlightAllCounties(
        this.prov.current().getState().countiesSelected
      );
      this.originalMap.initLineChart();

      if (this.comparisonMode) {
        this.secondMap.highlightAllCounties(
          this.prov.current().getState().countiesSelected
        );
        this.secondMap.initLineChart();
      }
      this.setAllHighlights();

      this.sidebar.updateProfessions();
    });

    this.prov.addObserver(["professionsSelected"], () => {
      this.recalcData(this.prov.current().getState().year).then(() => {
        this.drawSidebar();
        this.setAllHighlights();
      });
	});
	
	ProvVisCreator(
    document.getElementById("provDiv")!,
    this.prov,
    (newNode: NodeID) => this.prov.goToNode(newNode),
    false,
    false,
    undefined,
    { eventConfig: eventConfig }
  );
  }

  /**
   * this updates the map when the user selects a new type of map
   * @param mapData this the selection of the new map type
   */
  updateMapType(newMapType: string) {
    let action = this.prov.addAction("Map Shape Changed", (state: AppState) => {
      state.mapType = newMapType;
      return state;
    });

    action.addEventType("MapShape Changed").applyAction();
  }

  editSupply(newMapType: string) {
    let action = this.prov.addAction("Map Type Changed", (state: AppState) => {
      state.mapType = newMapType;
      return state;
    });

    action.applyAction();
  }

  editNeed(newMapType: string) {
    let action = this.prov.addAction("Map Type Changed", (state: AppState) => {
      state.mapType = newMapType;
      return state;
    });

    action.applyAction();
  }

  historyClick() {

	if(this.prov.current().getState().historyOpen)
	{
		let action = this.prov.addAction("Close History", (state: AppState) => {
			state.historyOpen = false;
			return state;
		});

		action.applyAction();
	}
	else{
		let action = this.prov.addAction("Open History", (state: AppState) => {
			state.historyOpen = true;
			return state;
		});

		action.applyAction();
	}
  }

  updateComparisonType(newCompType: string) {
    let action = this.prov.addAction(
      "Comparison Type Changed",
      (state: AppState) => {
        state.scaleType = newCompType;
        return state;
      }
    );

    action.addEventType("MapType Changed").applyAction();
  }

  updateModelsSelected(firstModelSelected:Model, secondModelSelected:Model) {
	  console.log(firstModelSelected);
	  console.log(secondModelSelected)
    let action = this.prov.addAction(
      "Change Selected Models",
      (state: AppState) => {
		state.firstModelSelected = firstModelSelected;
		state.secondModelSelected = secondModelSelected;

        return state;
      }
    );

    action.addEventType("Model Changed").applyAction();
  }

  /**
   * This handles when the user selects a new year
   * @param year this is the new year selected by the user
   */
  recalcData(year: string): Promise<any> {
    if (this.removedProfessions.size > 0) {
      this.comparisonMode = true;
    }

    let promise = this.originalMap.updateMapYear(year).then(() => {
      return this.secondMap.updateMapYear(year);
    });

    return Promise.all([promise]);
  }

  updateMapYear(newYear: string) {
    let action = this.prov.addAction("Map Year Changed", (state: AppState) => {
      state.year = newYear;
      return state;
    });

    action.addEventType("Year Changed").applyAction();
  }

  updateSelectedProf(profSelected: string) {
    let label = "";
    if (this.prov.current().getState().professionsSelected[profSelected]) {
      label = "Profession " + profSelected + " De-Selected";
    } else {
      label = "Profession " + profSelected + " Selected";
    }

    let action = this.prov.addAction(label, (state: AppState) => {
      state.professionsSelected[profSelected] = !state.professionsSelected[
        profSelected
      ];
      return state;
    });

    action.addEventType("Professions Changed").applyAction();
  }

  updateSelectedCounty(selectCounty: string) {
    let label = "";
    if (
      this.prov.current().getState().countiesSelected.includes(selectCounty)
    ) {
      label = "County " + selectCounty + " De-Selected";
    } else {
      label = "County " + selectCounty + " Selected";
    }

    let action = this.prov.addAction(label, (state: AppState) => {
      if (selectCounty === "State of Utah") {
        state.countiesSelected = ["State of Utah"];
      } else if (state.countiesSelected.includes(selectCounty)) {
        state.countiesSelected.splice(
          state.countiesSelected.indexOf(selectCounty),
          1
        );
        if (state.countiesSelected.length === 0) {
          state.countiesSelected.push("State of Utah");
        }
      } else {
        if (state.countiesSelected.includes("State of Utah")) {
          state.countiesSelected.splice(
            state.countiesSelected.indexOf("State of Utah"),
            1
          );
        }
        state.countiesSelected.push(selectCounty);
      }

      return state;
    });

    action.addEventType("Counties Changed").applyAction();
  }

  createDuplicateMap() {
    if (!this.modelRemovedComparison) {
      d3.select("#comparisonView").style("display", "block");
      d3.select("#map").attr("width", 1200);

      this.modelRemovedComparison = true;
      this.comparisonMode = true;
      this.secondMap.drawMap(this.prov.current().getState().firstModelSelected.model_id);
    }
  }

  removeDuplicateMap() {
    if (this.modelRemovedComparison) {
      d3.select("#comparisonView").style("display", "none");
      d3.select("#map").attr("width", 600);
      this.modelRemovedComparison = false;
      this.comparisonMode = false;
      this.secondMap.destroy();
    }
  }

  mouseOut() {
    d3.select("#tooltip").transition().duration(500).style("opacity", 0);
  }

  setAllHighlights() {
    for (let prof in this.prov.current().getState().professionsSelected) {
      if (this.prov.current().getState().professionsSelected[prof]) {
        this.highlightProfession(prof);
      } else {
        this.unHighlightProfession(prof);
      }
    }
  }

  highlightProfession(name: string) {
    d3.selectAll(`.${name}rect`).classed("highlightProfRect", true);
  }

  unHighlightProfession(name: string) {
    d3.selectAll(`.${name}rect`).classed("highlightProfRect", false);
  }
}
export { MapController };
