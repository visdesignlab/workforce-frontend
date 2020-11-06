import * as d3 from "d3";
import { Sidebar } from "./newSidebar";
import { Map } from "./Map";

import { EventConfig, ProvVisCreator } from "@visdesignlab/trrack-vis";

import {
  CountiesChanged,
  ProfessionsChanged,
  MapTypeChange,
  MapShapeChange,
  YearChanged,
  ModelChanged,
} from "./Icons";

import { initProvenance, Provenance, NodeID, createAction } from "@visdesignlab/trrack";
import { api_request } from "./API_utils";
import { create } from "d3";

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
	shared_with:string[]
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
	status: "Completed",
	shared_with:[]
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
  firstModelSelected: number;
  secondModelSelected: number;

  /**
   *
   */
  constructor() {
    this.prov = initProvenance<AppState, EventOptions, string>(initialState);

    this.firstModelSelected = 2;
    this.secondModelSelected = -1;
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
      this.prov.getState(this.prov.current).firstModelSelected.model_id
    );
    if (this.comparisonMode) {
      promise = promise.then(() =>
        this.secondMap.drawMap(
          this.prov.getState(this.prov.current).secondModelSelected.model_id
        )
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
    this.prov.addObserver(
      (state) => state.year,
      () => {
        let state = this.prov.getState(this.prov.current);

        let promise = this.originalMap.updateMapYear(state.year).then(() => {
          return this.secondMap.updateMapYear(state.year);
        });

        return Promise.all([promise]);
      }
    );

    this.prov.addObserver(
      (state) => state.firstModelSelected,
      (state) => {
        console.log("hereeeee", state.firstModelSelected);

        if(this.firstModelSelected === state.firstModelSelected.id)
        {
          return;
        }
        else{
          this.firstModelSelected = state.firstModelSelected.id
        }

        api_request("whoami").then((response) => {
          response.text().then((t) => {
            if (
              t ===
              this.prov.getState(this.prov.current).firstModelSelected.author
            ) {
              d3.select("#modelShareContent").selectAll("p").remove();
              d3.select("#modelShareContent")
                .selectAll("p")
                .data(
                  this.prov.getState(this.prov.current).firstModelSelected
                    .shared_with
                )
                .enter()
                .append("p")
                .html((d) => d);
            }
          });
        });

        this.comparisonMode =
          this.prov.getState(this.prov.current).secondModelSelected !==
          undefined;

        if (!this.prov.getState(this.prov.current).secondModelSelected) {
          this.secondMap.destroy();
          console.log("flexing");
          d3.select("#runModelButtonDiv").style("display", "flex");
          d3.select("#deleteModelButton").style("display", "flex");
          d3.select("#hiddenShareButton").style("display", "flex");
        } else if (!this.prov.getState(this.prov.current).firstModelSelected) {
          this.originalMap.destroy();
          return;
        } else {
          console.log("here");
          d3.select("#runModelButtonDiv").style("display", "none");
          d3.select("#deleteModelButton").style("display", "none");
          d3.select("#hiddenShareButton").style("display", "none");
        }

        this.drawMap().then(() => 
        {
          this.drawSidebar(); 
          this.originalMap.highlightAllCounties(
            this.prov.getState(this.prov.current).countiesSelected
          );

          if(state.secondModelSelected)
          {
            this.secondMap.highlightAllCounties(
              this.prov.getState(this.prov.current).countiesSelected
            );
          }
        });
      }
    );

    this.prov.addObserver(
      (state) => state.secondModelSelected,
      (state) => {

        console.log(state.secondModelSelected)
        console.log(this.secondModelSelected)

        if (state.secondModelSelected && this.secondModelSelected === state.secondModelSelected.id) {
          console.log("returning")
          return;
        }
        else{
          if(state.secondModelSelected === undefined)
          {
            this.secondModelSelected = -1;
          }
          else{
            this.secondModelSelected = state.secondModelSelected.id;
          }
        }
        console.log("continuing")
        this.comparisonMode =
          this.prov.getState(this.prov.current).secondModelSelected !==
          undefined;
        if (!this.prov.getState(this.prov.current).secondModelSelected) {
          this.secondMap.destroy();
          d3.select("#runModelButtonDiv").style("display", "flex");
          d3.select("#deleteModelButton").style("display", "flex");
          d3.select("#hiddenShareButton").style("display", "flex");
        } else if (!this.prov.getState(this.prov.current).firstModelSelected) {
          this.originalMap.destroy();
          return;
        } else {
          d3.select("#runModelButtonDiv").style("display", "none");
          d3.select("#deleteModelButton").style("display", "none");
          d3.select("#hiddenShareButton").style("display", "none");
        }

        this.drawMap().then(() => {
          this.drawSidebar();
          this.originalMap.highlightAllCounties(
            this.prov.getState(this.prov.current).countiesSelected
          );

          if (state.secondModelSelected) {
            this.secondMap.highlightAllCounties(
              this.prov.getState(this.prov.current).countiesSelected
            );
          }
        });
      }
    );

    this.prov.addObserver(
      (state) => state.scaleType,
      () => {
        this.originalMap.updateMapType(
          this.prov.getState(this.prov.current).scaleType,
          1000
        );
        if (this.comparisonMode) {
          this.secondMap.updateMapType(
            this.prov.getState(this.prov.current).scaleType,
            1000
          );
        }
        this.drawSidebar();
      }
    );

    this.prov.addObserver(
      (state) => state.mapType,
      () => {

        this.drawMap().then(() => this.drawSidebar());
      }
    );

    this.prov.addObserver(
      (state) => state.countiesSelected,
      () => {
        this.sidebar.highlightAllCounties(
          this.prov.getState(this.prov.current).countiesSelected
        );
        this.originalMap.highlightAllCounties(
          this.prov.getState(this.prov.current).countiesSelected
        );
        this.originalMap.initLineChart();

        if (this.comparisonMode) {
          this.secondMap.highlightAllCounties(
            this.prov.getState(this.prov.current).countiesSelected
          );
          this.secondMap.initLineChart();
        }
        this.setAllHighlights();

        this.sidebar.updateProfessions();
      }
    );

    this.prov.addObserver(
      (state) => state.professionsSelected,
      () => {
        this.recalcData(this.prov.getState(this.prov.current).year).then(() => {
          this.drawSidebar();
          this.setAllHighlights();
        });
      }
    );

    d3.select("#modelShareContent")
      .selectAll("p")
      .data(
        this.prov.getState(this.prov.current).firstModelSelected.shared_with
      )
      .enter()
      .append("p")
      .html((d) => d);

    ProvVisCreator(
      document.getElementById("provDiv")!,
      this.prov,
      (newNode: NodeID) => this.prov.goToNode(newNode),
      true,
      true,
      this.prov.root.id,
      { eventConfig: eventConfig }
    );
  }

  /**
   * this updates the map when the user selects a new type of map
   * @param mapData this the selection of the new map type
   */
  updateMapType(newMapType: string) {
    let action = createAction<AppState, any, EventOptions>(
      (state: AppState) => {
        state.countiesSelected = ["State of Utah"]
        state.mapType = newMapType;
      }
    );

    action.setEventType("MapShape Changed").setLabel("Map Shape Changed");

    this.prov.apply(action());
  }

  editSupply(newMapType: string) {
    let action = createAction<AppState, any, EventOptions>(
      (state: AppState) => {
        state.mapType = newMapType;
      }
    );

    action.setLabel("Map Type Changed");

    this.prov.apply(action());
  }

  editNeed(newMapType: string) {
    let action = createAction<AppState, any, EventOptions>(
      (state: AppState) => {
        state.mapType = newMapType;
      }
    );

    action.setLabel("Map Type Changed");

    this.prov.apply(action());
  }

  historyClick() {
      if (d3.select("#provDiv").style("width") === "0px") {
        d3.select("#provDiv").style("width", "300px");
        d3.select("#historyButton").html("Hide History");
      } else {
        d3.select("#provDiv").style("width", "0px");
        d3.select("#historyButton").html("Show History");
      }
  }

  updateComparisonType(newCompType: string) {
    let action = createAction<AppState, any, EventOptions>(
      (state: AppState) => {
        state.scaleType = newCompType;
      }
    );

    action.setLabel("Comparison Type Changed").setEventType("MapType Changed");

    this.prov.apply(action());
  }

  updateModelsSelected(firstModelSelected: Model, secondModelSelected: Model) {
    let action = createAction<AppState, any, EventOptions>(
      (state: AppState) => {
        console.log("UPDATING MODELS SELECTED");
        state.firstModelSelected = firstModelSelected;
        state.secondModelSelected = secondModelSelected;
      }
    );

    action.setLabel("Change Selected Models").setEventType("Model Changed");

    this.prov.apply(action());
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
    let action = createAction<AppState, any, EventOptions>(
      (state: AppState) => {
        state.year = newYear;
      }
    );

    action.setLabel("Map Year Changed").setEventType("Year Changed");

    this.prov.apply(action());
  }

  updateSelectedProf(profSelected: string) {
    let label = "";
    if (
      this.prov.getState(this.prov.current).professionsSelected[profSelected]
    ) {
      label = "Profession " + profSelected + " De-Selected";
    } else {
      label = "Profession " + profSelected + " Selected";
    }

    let action = createAction<AppState, any, EventOptions>(
      (state: AppState) => {
        state.professionsSelected[profSelected] = !state.professionsSelected[
          profSelected
        ];
      }
    );

    action.setLabel(label).setEventType("Professions Changed");

    this.prov.apply(action());
  }

  updateSelectedCounty(selectCounty: string) {
    let label = "";
    if (
      this.prov
        .getState(this.prov.current)
        .countiesSelected.includes(selectCounty)
    ) {
      label = "County " + selectCounty + " De-Selected";
    } else {
      label = "County " + selectCounty + " Selected";
    }

    let action = createAction<AppState, any, EventOptions>(
      (state: AppState) => {
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
      }
    );

    action.setLabel(label).setEventType("Counties Changed");

    this.prov.apply(action());
  }

  createDuplicateMap() {
    if (!this.modelRemovedComparison) {
      d3.select("#comparisonView").style("display", "block");
      d3.select("#map").attr("width", 1200);

      this.modelRemovedComparison = true;
      this.comparisonMode = true;
      this.secondMap.drawMap(
        this.prov.getState(this.prov.current).firstModelSelected.model_id
      );
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
    for (let prof in this.prov.getState(this.prov.current)
      .professionsSelected) {
      if (this.prov.getState(this.prov.current).professionsSelected[prof]) {
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
