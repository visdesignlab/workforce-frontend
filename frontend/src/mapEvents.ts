import * as d3 from "d3";
import { MapController } from "./mapController";
import { api_request, getCookie } from "./API_utils";
import $ from "jquery";

import axios from "axios";

// declare var $: any;

class MapEvents {
  map: MapController;
  selectAll: boolean;

  constructor(map: MapController) {
    this.map = map;
    this.selectAll = false;
    this.updateYear();
    this.updateType();
    this.changeMapType();

    d3.select("#runModelButton").on("click", () => {

		api_request("whoami").then((response) => {
			if (response.status !== 200) {
				alert("You Must be Logged in to Rerun a Model")
				return;
			}
			else{

	  let bodyFormData = {};

    bodyFormData[
      "model_id"
    ] = this.map.prov.current().getState().firstModelSelected.model_id;
    bodyFormData["model_name"] = "fakeName";
    bodyFormData["description"] = "fakeDesc";
    let removedString = "";
    for (let j in this.map.prov.current().getState().professionsSelected) {
      if (!this.map.prov.current().getState().professionsSelected[j]) {
        removedString += j + ",";
      }
    }

    bodyFormData["removed_professions"] = removedString.slice(
      0,
      removedString.length - 2
    );

    let csrftoken = getCookie("csrftoken") || "";

    console.log(bodyFormData);

    //
    // axios.defaults.headers.common =
    // {
    // 	'X-CSRF-TOKEN': token
    // };

    const formBody = [];
    for (const property in bodyFormData) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(bodyFormData[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    const formBodyString = formBody.join("&");

    let headers = {};
    if (process.env.API_ROOT.includes("http://localhost:8000")) {
      headers = {
        Accept: "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRFToken": csrftoken || "",
        "Access-Control-Allow-Origin": "http://localhost:8080",
        "Access-Control-Allow-Credentials": "true",
      };
    } else {
      headers = {
        Accept: "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRFToken": csrftoken || "",
      };
    }

    fetch(`${process.env.API_ROOT}/rerun-model`, {
      method: "POST",
      credentials: "include",
      headers: headers,
      body: formBodyString,
    })
      .then(function (response) {
        //handle success
        console.log(response);
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });

    // axios({
    //   method: 'post',
    //   url: `${process.env.API_ROOT}/rerun-model`,
    //   data: bodyFormData,
    //   headers: {'Content-Type': 'multipart/form-data', 'Access-Control-Allow-Origin': '*' }
    //   })
    //   .then(function (response) {
    //       //handle success
    //       console.log(response);
    //   })
    //   .catch(function (response) {
    //       //handle error
    //       console.log(response);
    //   });

    alert("Your model is being rerun! This may take some time.");
			}
		});

    });

    d3.selectAll(".plusClass").on("click", function () {
      if (d3.select(this).classed("plusClass")) {
        d3.select(this).classed("minusClass", true);
        d3.select(this).classed("plusClass", false);
      } else {
        d3.select(this).classed("minusClass", false);
        d3.select(this).classed("plusClass", true);
      }
    });
  }

  updateYear(): void {
    d3.select("#year").on("change", () => {
      let year: string = (document.getElementById("year") as HTMLInputElement)
        .value;
      this.map.updateMapYear(year);
    });
  }

  updateType(): void {
    document.getElementById("mapData").addEventListener("change", () => {
      let mapData: string = (document.getElementById(
        "mapData"
      ) as HTMLInputElement).value;
      this.map.updateComparisonType(mapData);
    });
  }

  changeMapType() {
    document.getElementById("mapType").addEventListener("change", () => {
      this.map.updateMapType(
        (document.getElementById("mapType") as HTMLInputElement).value
      );
    });
  }

  changeModelData(): Promise<any> {
    let promise = api_request("models").then((response) => response.json());
    let counter = 0;

    promise = Promise.resolve(promise).then((results: any[]) => {
      console.log(results);
      this.map.serverModels = results;
      for (let mod in results) {
        if (
          results[mod].name
            ? results[mod].name
            : results[mod].model_name == "Original Model"
        ) {
          d3.select("#modelData")
            .append("option")
            .attr("value", mod)
            .attr("selected", "")
            .html(
              results[mod].name ? results[mod].name : results[mod].model_name
            );

          $(".selectpicker").selectpicker("refresh");
          // console.log(($(".selectpicker") as any).selectpicker)
        } else {
          d3.select("#modelData")
            .append("option")
            .attr("value", mod)
            .html(
              results[mod].name ? results[mod].name : results[mod].model_name
            );
          $(".selectpicker").selectpicker("refresh");
          $(".selectpicker").selectpicker({
            maxOptions: 2,
          });

          // console.log(($(".selectpicker") as any).selectpicker)
        }
        counter++;
      }

      document.getElementById("modelData").addEventListener("change", () => {
        this.map.removedProfessions.clear();
        this.map.modelRemovedComparison = false;

        this.map.mapType = (document.getElementById(
          "mapType"
        ) as HTMLInputElement).value;
        let selectedOptions = (document.getElementById(
          "modelData"
        ) as HTMLSelectElement).selectedOptions;

        let newList = [];
        for (let i = 0; i < selectedOptions.length; i++) {
          newList.push(selectedOptions[i].value);
		}
		
		console.log(newList)

        this.map.updateModelsSelected(results[newList[0]], results[newList[1]]);
      });
    });

    return promise;
  }
}
export { MapEvents };
