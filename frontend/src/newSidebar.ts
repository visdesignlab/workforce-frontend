import * as d3 from 'd3';
import {MapController} from './mapController';


class Sidebar {
	countiesSvg: any;
	stateSvg: any;
	professionsSvg: any;
	countiesHeaderSvg: any;
	margin:any;
	map:MapController;
	countiesSortingFunction:any;
	professionsSortingFunction:any;
  cell:any;
  currentYearData:any;
  otherCurrentYearData:any;
  mapData:any;
	countiesAscending: boolean;
	profAscending: boolean;

  constructor(map:MapController) {
    this.cell = {height: 30, width: 150, margin:10}
    this.map = map;
    this.countiesSortingFunction = this.getSortingOptions(0, true);
    this.professionsSortingFunction = this.getSortingOptions(0, true);
		this.countiesAscending = true;
		this.profAscending = true;

    this.countiesSvg = d3.select('#counties').select('svg');

    if (!this.countiesSvg.node()) {
      this.countiesSvg = d3.select('#counties')
        .append('svg')
        .attr('height', 1800)
        .attr("style","width:100%;")
    }

    this.professionsSvg = d3.select('#professions').select('svg');

    if (!this.professionsSvg.node()) {
      this.professionsSvg = d3.select('#professions')
        .append('svg')
        .attr('height', 700)
        .attr("style","width:100%;")
    }
    this.countiesHeaderSvg = d3.select('#countiesHeader').select('svg');

    if (!this.countiesHeaderSvg.node()) {
      this.countiesHeaderSvg = d3.select('#countiesHeader')
        .append('svg')
        .attr('height', 50)
        .attr('width', 510)
    }

		let that = this;

		d3.select("#countiesHeaderRow")
			.selectAll("th")
			.on("click", function() {
				let clicked = (this as HTMLElement).innerHTML;

				if(clicked === "Need")
				{
					that.countiesAscending = !that.countiesAscending;
					that.countiesSortingFunction = that.getSortingOptions(2, that.countiesAscending);
					that.updateCounties();
				}
				else if (clicked === ("County"))
				{
					that.countiesAscending = !that.countiesAscending;
					that.countiesSortingFunction = that.getSortingOptions(0, that.countiesAscending);
					that.updateCounties();
				}
				else if (clicked === "Gap")
				{
					that.countiesAscending = !that.countiesAscending;
					that.countiesSortingFunction = that.getSortingOptions(3, that.countiesAscending);
					that.updateCounties();
				}
				else if (clicked.includes("Supply"))
				{
					that.countiesAscending = !that.countiesAscending;
					that.countiesSortingFunction = that.getSortingOptions(1, that.countiesAscending);
					that.updateCounties();
				}
			})

		d3.select("#profHeaderRow")
			.selectAll("th")
			.on("click", function() {
				let clicked = (this as HTMLElement).innerHTML;

				if(clicked === "Need")
				{
					that.profAscending = !that.profAscending;
					that.professionsSortingFunction = that.getSortingOptions(2, that.profAscending);
					that.updateProfessions();
				}
				else if (clicked === "Profession")
				{
					that.profAscending = !that.profAscending;
					that.professionsSortingFunction = that.getSortingOptions(0, that.profAscending);
					that.updateProfessions();
				}
				else if (clicked === "Gap")
				{
					that.profAscending = !that.profAscending;
					that.professionsSortingFunction = that.getSortingOptions(3, that.profAscending);
					that.updateProfessions();
				}
				else if (clicked.includes("Supply"))
				{
					that.profAscending = !that.profAscending;
					that.professionsSortingFunction = that.getSortingOptions(1, that.profAscending);
					that.updateProfessions();
				}
			})
  }

  destroy()
  {
    this.countiesSvg.selectAll("*").remove();
    this.professionsSvg.selectAll("*").remove();
    this.stateSvg.selectAll("*").remove();
  }

  initSideBar(currentYear, otherCurrentYearData = [])
  {
    this.currentYearData = currentYear;
    this.otherCurrentYearData = otherCurrentYearData;

    this.updateTable();
  }

  updateTable()
  {
    this.updateCounties();
    this.updateProfessions();
  }

  calculateCountiesData(currentYear, otherCurrentYearData, mapData){
    let countiesData = [];
    for (let county in currentYear) {
      let d = currentYear[county];
      let e = otherCurrentYearData[county] || {};
      if (mapData) {
        countiesData.push([county, d.totalSupplyPer100K, d.totalDemandPer100K, d.totalDemandPer100K - d.totalSupplyPer100K,
        e.totalSupplyPer100K, e.totalDemandPer100K, e.totalDemandPer100K - e.totalSupplyPer100K]);
      } else {
        countiesData.push([county, d.totalSupply, d.totalDemand, d.totalDemand - d.totalSupply, e.totalSupply, e.totalDemand, e.totalDemand - e.totalSupply]);
      }
    };

    return countiesData
  }

  getSortingOptions(index, ascending) {
    if (!ascending) {
      const sortingFunction = function(a, b) {
        if(index == 0)
        {
          return d3.descending(a[index], b[index]);
        }
        return d3.ascending(a[index], b[index]);
      }
      return sortingFunction;
    } else {
      const sortingFunction = function(a, b) {
        if(index == 0)
        {
          return d3.ascending(a[index], b[index]);
        }
        return d3.descending(a[index], b[index]);
      }
      return sortingFunction;
    }
  }

  removeSpaces(s) : string{
    return s.replace(/\s/g, '');
  }

  singleMapRows(td, xScale, domainMax)
  {
		let that = this;

    let labels = td.filter((d) => {
       return d.vis == 'text' && d.type !== 'needChangeable' && d.type !== "supplyChangeable";
      })
      .text(function(d){return d.value;});

		let button = td.filter(d => {
			return d.vis == "button";
		})
			.append("button")
			.classed("button", true)
			.classed("editButton", true)
			.classed("is-link", true)
			.classed("is-light", d => !this.map.removedProfessions.has(d.name))
			.classed("is-small", true)
			.on("click", function(d){
				that.changeIncludedProfession(d.name)
			})
			.append("span")
			.attr("class", "icon")
			.append("i")
			.attr("class", "far fa-edit editIcon")

		let allCheckbox = td.filter((d) => {
			 return d.vis == 'allCheck' && d.type == 'selectedCheck';
			})
			.append("input")
			.property("checked", d => {
				return d.value
			})
			.classed("selectedBox", d => d.value)
			.attr("type", "checkbox")
			.attr("id", (d,i) => { return this.removeSpaces(d.name +"_checkBox"); })
			.on("click", d => {
				if(d.type == "selectedCheck")
				{
					this.map.updateSelectedCounty(d.name);
				}
				else if (d.type == "profSelected")
				{
					this.changeProfession(d.name)
				}
				else if(d.type == "profIncluded")
				{
					this.changeProfession(d.name)
				}
			})
			.append("label")
			.attr("for", (d,i) => { return this.removeSpaces(d.name +"_checkBox"); })

    let checkbox = td.filter((d) => {
       return d.vis == 'check';
      })
      .append("input")
      .property("checked", d => {
        return d.value
      })
      // .attr("class", "styled")
      .attr("type", "checkbox")
      .attr("id", (d,i) => { return this.removeSpaces(d.name +"_checkBox"); })
      .on("click", d => {
        if(d.type == "selectedCheck")
        {
          this.map.updateSelectedCounty(d.name)
        }
        else if (d.type == "profSelected")
        {
          this.changeProfession(d.name)
        }
        else if(d.type == "profIncluded")
        {
          this.changeProfession(d.name)
        }
      })
			.append("label")
			.attr("for", (d,i) => { return this.removeSpaces(d.name +"_checkBox"); })

    let barSVGs = td.filter((d) => {
       return d.vis == 'bar';
      })
      .append("svg")
      .attr("width", this.cell.width)
      .attr("height", this.cell.height);

    let axisSvgs = td.filter((d) => {
       return d.vis == 'axis';
      })
      .append("svg")
      .attr("width", this.cell.width)
      .attr("height", this.cell.height)
      .append("g")
      .attr("transform", "translate(" + this.cell.margin + ", " + 20 + ")")
      .call(d3.axisTop(xScale).ticks(4).tickSize(1.5).tickFormat(d3.format(".1s")));

    let barCircleGroups = barSVGs.append("g").attr("transform", "translate(" + this.cell.margin + ", " + 5 + ")");

    let lines = barCircleGroups
      .append("line")
      .attr("x1", function(d){
        return xScale(0);
      })
      .attr("x2", function(d){
        return xScale(domainMax);
      })
      .attr("y1", 10)
      .attr("y2", 10)
      .style("stroke", function(d){
        return "#333333"
      });

    let barRects = barCircleGroups
      .append("rect")
      .attr("x", function(d){
        return xScale(d3.min([d.value[0], d.value[1]]));
      })
      .attr("y", 7)
      .attr("width", function(d) {
        return xScale(d3.max([d.value[0], d.value[1]])) - xScale(d3.min([d.value[0], d.value[1]]));
      })
      .attr("height", 6)
      .attr("class", "goalBar")
      .style("fill", function(d){
        return (d.value[0] - d.value[1]) < 0 ? "#cb181d" : "#034e7b"
      });


    let goalsCircleScored = barCircleGroups
      .append("circle")
      .attr("cx", function(d){
        return xScale(d.value[0]);
      })
      .attr("cy", 10)
      .attr("class", "goalCircle")
      .attr("r", 6)
      .style("fill", function(d){
        return "#034e7b"
      });

    let goalsCircleConceded = barCircleGroups
      .append("circle")
      .attr("cx", function(d){
        return xScale(d.value[1]);
      })
      .attr("cy", 10)
      .attr("class", "goalCircle")
      .attr("r", 6)
      .style("fill", function(d){
        return "#cb181d"
      });
  }

  doubleMapRows(td, xScale, domainMax)
  {
		let that = this;
    let labels = td.filter((d) => {
       return d.vis == 'text' && ((d.type !== "supplyChangeable" && d.type !== "needChangeable") || !this.map.removedProfessions.has(d.name));
      })
      .text(function(d){
				if(d.value == "State of Utah")
				{
					return d.value;
				}
				return isNaN(d.value) ? "--" : d.value;

			});

		let inputLabels = td.filter((d) => {
			 return d.vis == 'text' && (d.type === 'needChangeable' || d.type === "supplyChangeable") && this.map.removedProfessions.has(d.name);
			})
			.append('input')
			.classed("input", true)
			.classed("my-size", true)
			.attr("type", "text")
			.attr('value', d => d.value)
			.on("change", function(d){
				if(d.type === "needChangeable")
				{
					that.map.removedMapDemand[d.name] = d3.select(this).node().value;
				}
				else{
					that.map.removedMapSupply[d.name] = d3.select(this).node().value;
				}
			})

		let doubleLabels = td.filter((d) => {
			 return d.vis == 'textDouble';
			})
			.attr("rowspan", 2)
			.text(function(d){return d.value});

		let circlesSvg = td.filter((d) => {
       return d.vis == 'svg';
      })
      .append("svg")
			.attr("width", 10)
			.attr("height", this.cell.height)

		circlesSvg.append("circle")
			.attr("cx", 5)
			.attr("cy", 15)
			.style("fill", d => d.value ? "#1B9E77" : "#7570B3")
			.attr("r", 5)
			.on("mouseover", () => {
				d3.select("#modelNameTooltip").transition().duration(200).style("opacity", .9);
				d3.select("#modelNameTooltip").html("<h5>" + this.map.serverModels[this.map.prov.getState(this.map.prov.current).firstModelSelected.model_id].name + "</h5>")
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
			})
			.on("mouseout", () => {
				d3.select("#modelNameTooltip").transition().duration(200).style("opacity", 0);
			});

		let button = td.filter(d => {
			return d.vis == "button";
		})
			.attr("rowspan", 2)
			.append("button")
			.classed("button", true)
			.classed("editButton", true)
			.classed("is-small", true)
			.classed("is-link", true)
			.classed("is-light", d => !this.map.removedProfessions.has(d.name))
			.on("click", function(d){
				that.changeProfession(d.name)
			})
			.append("span")
			.attr("class", "icon is-small")
			.append("i")
			.attr("class", "far fa-edit editIcon")

		let allCheckbox = td.filter((d) => {
			 return d.vis == 'allCheck' && d.type == 'selectedCheck';
			})
			.append("input")
			.property("checked", d => {
				return d.value
			})
			.classed("selectedBox", d => d.value)
			.attr("type", "checkbox")
			.attr("id", (d,i) => { return this.removeSpaces(d.name +"_checkBox"); })
			.on("click", d => {
				if(d.type == "selectedCheck")
				{
					this.map.updateSelectedCounty(d.name);
				}
				else if (d.type == "profSelected")
				{
					this.changeProfession(d.name)
				}
				else if(d.type == "profIncluded")
				{
					this.changeProfession(d.name)
				}
			})
			.append("label")
			.attr("for", (d,i) => { return this.removeSpaces(d.name +"_checkBox"); })


    let checkbox = td.filter((d) => {
       return d.vis == 'check';
      })
      .attr("rowspan", 2)
      .append("input")
      .property("checked", d => {
        return d.value
      })
      .attr("class", "styled")
      .attr("type", "checkbox")
      .attr("id", (d,i) => { return this.removeSpaces(d.name +"_checkBox"); })
      .on("click", d => {
        if(d.type == "selectedCheck")
        {
          this.map.updateSelectedCounty(d.name)
        }
        else if (d.type == "profSelected")
        {
          this.changeProfession(d.name)
        }
				else if(d.type == "profIncluded")
				{
					this.changeProfession(d.name)
				}
      })

    let barSVGs = td.filter((d) => {
       return d.vis == 'bar';
      })
      .append("svg")
      .attr("width", this.cell.width)
      .attr("height", this.cell.height);

    let axisSvgs = td.filter((d) => {
       return d.vis == 'axis';
      })
      .append("svg")
      .attr("width", this.cell.width)
      .attr("height", this.cell.height)
      .append("g")
      .attr("transform", "translate(" + this.cell.margin + ", " + 20 + ")")
      .call(d3.axisTop(xScale).ticks(4).tickSize(1.5).tickFormat(d3.format(".1s")));

    let barCircleGroups = barSVGs.append("g").attr("transform", "translate(" + this.cell.margin + ", " + 5 + ")");

    let lines = barCircleGroups
      .append("line")
      .attr("x1", function(d){
        return xScale(0);
      })
      .attr("x2", function(d){
        return xScale(domainMax);
      })
      .attr("y1", 10)
      .attr("y2", 10)
      .style("stroke", function(d){
        return "#333333"
      });

    let barRects = barCircleGroups
      .append("rect")
      .attr("x", function(d){
        return xScale(d3.min([d.value[0], d.value[1]]));
      })
      .attr("y", 7)
      .attr("width", function(d) {
        return xScale(d3.max([d.value[0], d.value[1]])) - xScale(d3.min([d.value[0], d.value[1]]));
      })
      .attr("height", 6)
      .attr("class", "goalBar")
      .style("fill", function(d){
        return (d.value[0] - d.value[1]) < 0 ? "#cb181d" : "#034e7b"
      });

    let goalsCircleScored = barCircleGroups
      .append("circle")
      .attr("cx", function(d){
        return xScale(d.value[0]);
      })
      .attr("cy", 10)
      .attr("class", "goalCircle")
      .attr("r", 6)
      .style("fill", function(d){
        return "#034e7b"
      });

    let goalsCircleConceded = barCircleGroups
      .append("circle")
      .attr("cx", function(d){
        return xScale(d.value[1]);
      })
      .attr("cy", 10)
      .attr("class", "goalCircle")
      .attr("r", 6)
      .style("fill", function(d){
        return "#cb181d"
      });
  }

  changeProfession(profName)
  {
		this.map.updateSelectedProf(profName);
  }

  updateCounties()
  {
    d3.select("#countiesTable").select("tbody").selectAll('.notState').remove();
    d3.select("#countiesTable").attr("class", this.map.comparisonMode ? "doubleShade svgTable" : "singleShade svgTable")

    let countiesData = this.calculateCountiesData(this.currentYearData, this.otherCurrentYearData, false);

    let stateData = countiesData.filter(d => {
      return d[0].includes("State of");
    })[0];

    countiesData = countiesData.filter(d => {
			return !d[0].includes("State of");
		})

    let domainMax = undefined;

    let mapData = (<HTMLInputElement>document.getElementById('mapData')).value;
    this.mapData = mapData

    let temp = this.currentYearData[stateData[0]];
    delete this.currentYearData[stateData[0]];

    if (mapData.includes('100')) {
      domainMax = d3.max(Object.keys(this.currentYearData), d => Math.max(this.currentYearData[d]['totalSupplyPer100K'], this.currentYearData[d]['totalDemandPer100K']));
    } else {

			if(this.map.comparisonMode)
			{
				domainMax = d3.max([
					d3.max(Object.keys(this.currentYearData), d => Math.max(this.currentYearData[d]['totalSupply'], this.currentYearData[d]['totalDemand'])),
					d3.max(Object.keys(this.otherCurrentYearData), d => Math.max(this.otherCurrentYearData[d]['totalSupply'], this.otherCurrentYearData[d]['totalDemand']))]);
			}
			else{
				domainMax =	d3.max(Object.keys(this.currentYearData), d => Math.max(this.currentYearData[d]['totalSupply'], this.currentYearData[d]['totalDemand']));
			}
    }

    this.currentYearData[stateData[0]] = temp;

    var xScale = d3.scaleLinear()
      .domain([0, domainMax])
      .range([0, this.cell.width - this.cell.margin * 2]);

    let check = {
      type: "selectedCheck",
      vis: "allCheck",
      value: this.map.prov
        .getState(this.map.prov.current)
        .countiesSelected.includes(stateData[0]),
      name: stateData[0],
    };
    let name = {type:"name", vis:"text", value:stateData[0]}
    let supply = {type:"supply", vis:"text", value:stateData[1]}
    let need = {type:"need", vis:"text", value:stateData[2]}
    let gap = {type:"axis", vis:"axis", value:[stateData[1], stateData[2]]}
		let fakeSpot = {type:"name", vis:"text", value:''}

		let check2 = {
      type: "selectedCheck",
      vis: "allCheck",
      value: this.map.prov
        .getState(this.map.prov.current)
        .countiesSelected.includes(stateData[0]),
      name: stateData[0],
    };
		let name2 = {type:"name", vis:"text", value:stateData[0]}
		let supply2 = {type:"supply", vis:"text", value:stateData[4]}
		let need2 = {type:"need", vis:"text", value:stateData[5]}
		let gap2 = {type:"axis", vis:"axis", value:[stateData[4], stateData[5]]}

		d3.select("#utahRow").selectAll("td").remove();

    let stateRow = d3.select("#utahRow").selectAll("td")
      .data([check, name, supply, need, gap, fakeSpot])
      .enter()
      .append("td");

		let stateRow2 = d3.select("#utahSecondRow").selectAll("td")
			.data([name2, supply2, need2, gap2, fakeSpot])
			.enter()
			.append("td");

		if(!this.map.comparisonMode)
		{
			this.singleMapRows(stateRow, xScale, domainMax)
		}
		else
		{
			this.doubleMapRows(stateRow2, xScale, domainMax)
			this.doubleMapRows(stateRow, xScale, domainMax)
		}

    let doubleCountyData = []

    if(this.map.comparisonMode)
    {
      for(let i = 0; i < countiesData.length; i++)
      {
        doubleCountyData.push(countiesData[i]);
        doubleCountyData.push(countiesData[i]);

      }
    }

    let tr = d3.select("#countiesTable").select("tbody")
      .selectAll("tr .notState")
      .data(this.map.comparisonMode ? doubleCountyData.sort(this.countiesSortingFunction) : countiesData.sort(this.countiesSortingFunction))
      .enter()
      .append("tr")
      .classed("notState", true)

    let td = tr.selectAll("td").data((d, i) => {

      if(this.map.comparisonMode)
      {
        if(i % 2 == 0)
        {
          let check = {
            type: "selectedCheck",
            vis: "check",
            value: this.map.prov
              .getState(this.map.prov.current)
              .countiesSelected.includes(d[0]),
            name: d[0],
          };
          let name = {type:"name", vis:"textDouble", value:d[0]}
					// let circle = {type:"circle", vis:"svg", value:true}
          let supply = {type:"supply", vis:"text", value:Math.round(d[1])}
          let need = {type:"need", vis:"text", value:Math.round(d[2])}
          let gap = {type:"gap", vis:"bar", value:[Math.round(d[1]), Math.round(d[2])]}

          return [check, name, supply, need, gap, fakeSpot];
        }
        else{
					// let circle = {type:"circle", vis:"svg", value:false}
          let supply = {type:"supply", vis:"text", value:Math.round(d[4])}
          let need = {type:"need", vis:"text", value:Math.round(d[5])}
          let gap = {type:"gap", vis:"bar", value:[Math.round(d[4]), Math.round(d[5])]}

          return [supply, need, gap, fakeSpot];
        }
      }
      else
      {
        let check = {
          type: "selectedCheck",
          vis: "check",
          value: this.map.prov
            .getState(this.map.prov.current)
            .countiesSelected.includes(d[0]),
          name: d[0],
        };
        let name = {type:"name", vis:"text", value:d[0]}
        let supply = {type:"supply", vis:"text", value:Math.round(d[1])}
        let need = {type:"need", vis:"text", value:Math.round(d[2])}
        let gap = {type:"gap", vis:"bar", value:[Math.round(d[1]), Math.round(d[2])]}

        return [check, name, supply, need, gap, fakeSpot];
      }
    }).enter().append("td");

    if(this.map.comparisonMode)
    {
      this.doubleMapRows(td, xScale, domainMax);
    }
    else{
      this.singleMapRows(td, xScale, domainMax);
    }
  }

	highlightAllCounties(selectedCounties: string[])
	{
		for(let j of selectedCounties)
		{
			d3.select(`#${this.removeSpaces(j)}_checkBox`)
				.classed("selectedBox", true)
				.property('checked', true);

			d3.selectAll('.selectedBox').filter(d => {
				return !selectedCounties.includes((d as any).name)
			})
				.classed("selectedBox", false)
				.property('checked', false);
		}
	}

	changeIncludedProfession(id: string)
	{
		if(this.map.removedProfessions.has(id))
		{
			this.map.removedProfessions.delete(id);
		}
		else{
			this.map.removedProfessions.add(id);
		}

		this.map
      .recalcData(this.map.prov.getState(this.map.prov.current).year)
      .then(() => this.updateTable());

	}

  updateProfessions()
  {
    d3.select("#professionsTable").select("tbody").selectAll('.notState').remove();
    d3.select("#professionsTable").attr("class", this.map.comparisonMode ? "doubleShade svgTable" : "singleShade svgTable")

    let profData = this.getProfessionsData(this.currentYearData, this.otherCurrentYearData, this.mapData);
    let doubleProfData = [];

    let allProfData = ["All", 0, 0, 0, 0, 0, 0];

    for(let k in profData)
    {
      for (let j = 1; j < 7; j++)
      {
        allProfData[j] += profData[k][j];
      }
    }

    for(let i = 0; i < profData.length; i++)
    {
      doubleProfData.push(profData[i]);
      doubleProfData.push(profData[i]);
    }

    let profScale = d3.scaleLinear()
    		.domain([0, d3.max(profData, (d) => d3.max([d[1], d[2], d[4], d[5]]))])
    		.range([0, this.cell.width - this.cell.margin * 2 ])

    let check1 = {
      type: "profSelectedCheck",
      vis: "allCheck",
      value: this.map.prov
        .getState(this.map.prov.current)
        .countiesSelected.includes(allProfData[0] as string),
      name: allProfData[0],
    };
    let check2 = {
      type: "infoCheck",
      vis: "allCheck",
      value: this.map.prov
        .getState(this.map.prov.current)
        .countiesSelected.includes(allProfData[0] as string),
      name: allProfData[0],
    };

    let name = {type:"name", vis:"text", value:allProfData[0]}
    let supply = {type:"supply", vis:"text", value:allProfData[1]}
    let need = {type:"need", vis:"text", value:allProfData[2]}
    let gap = {type:"axis", vis:"axis", value:[allProfData[1], allProfData[2]]}

		d3.select("#allProfRow").selectAll("td").remove()

    let allProfRow = d3.select("#allProfRow").selectAll("td")
      .data((this.map.comparisonMode && !this.map.modelRemovedComparison) ? [check1, name, supply, need, gap] : [check1, name, supply, need, gap, check2])
      .enter()
      .append("td");

    this.singleMapRows(allProfRow, profScale, d3.max(profData, (d) => d3.max([d[1], d[2], d[4], d[5]])))

    let profTr = d3.select("#professionsTable").select("tbody")
      .selectAll("tr .notState")
      .data(this.map.comparisonMode ? doubleProfData.sort(this.professionsSortingFunction) : profData.sort(this.professionsSortingFunction))
      .enter()
      .append("tr")
      .classed("notState", true)
      // .on("mouseover", this.tree.updateTree)
      // .on("mouseout", this.tree.clearTree);

    let profTd = profTr.selectAll("td").data((d, i) => {
      if(this.map.comparisonMode)
      {
        if(i % 2 == 0)
        {
          let check1 = {
            type: "profSelected",
            vis: "check",
            value: this.map.prov.getState(this.map.prov.current)
              .professionsSelected[d[0]],
            name: d[0],
          };
          let check2 = {type:"profIncluded", vis:"button", value:!this.map.removedProfessions.has(d[0]), name:d[0]}
          let name = {type:"name", vis:"textDouble", value:d[0]}
          let supply = {type:"supply", vis:"text", value:Math.round(d[1])}
          let need = {type:"need", vis:"text", value:Math.round(d[2])}
          let gap = {type:"gap", vis:"bar", value:[Math.round(d[1]), Math.round(d[2])]}

					if(this.map.modelRemovedComparison)
					{
						return [check1, name, supply, need, gap, check2];
					}
					else{
						return [check1, name, supply, need, gap];
					}
        }

        let supply = {type:"supplyChangeable", vis:"text", value:Math.round(d[4]), name:d[0]}
        let need = {type:"needChangeable", vis:"text", value:Math.round(d[5]), name:d[0]}
        let gap = {type:"gap", vis:"bar", value:[Math.round(d[4]), Math.round(d[5])]}
        return [supply, need, gap];
      }
      else{
        let check1 = {
          type: "profSelected",
          vis: "check",
          value: this.map.prov.getState(this.map.prov.current)
            .professionsSelected[d[0]],
          name: d[0],
        };
        let check2 = {type:"profIncluded", vis:"button", value:!this.map.removedProfessions.has(d[0]), name:d[0]}
        let name = {type:"name", vis:"text", value:d[0]}
        let supply = {type:"supply", vis:"text", value:Math.round(d[1])}
        let need = {type:"need", vis:"text", value:Math.round(d[2])}
        let gap = {type:"gap", vis:"bar", value:[Math.round(d[1]), Math.round(d[2])]}
        return [check1, name, supply, need, gap, check2];
      }
    }).enter().append("td");


    if(this.map.comparisonMode)
    {
      this.doubleMapRows(profTd, profScale, d3.max(profData, (d) => d3.max([d[1], d[2], d[4], d[5]])));
    }
    else{
      this.singleMapRows(profTd, profScale, d3.max(profData, (d) => d3.max([d[1], d[2], d[4], d[5]])));
    }
  }

  getProfessionsData(currentYear, otherCurrentYearData, mapData)
  {
      let tempSelectedList = this.map.prov.getState(this.map.prov.current)
        .countiesSelected;

      var professions = Object.keys(currentYear[tempSelectedList[0]]['supply']);
      var population = currentYear[tempSelectedList[0]]['population'];
      var stats = {};

      for (let prof of professions) {
        stats[prof] = {totalDemandPer100K:0,totalSupplyPer100K:0,totalSupply: 0, totalDemand: 0,
          otherTotalDemandPer100K:0,otherTotalSupplyPer100K:0,otherTotalSupply: 0, otherTotalDemand: 0};
      }

      const f = d3.format('.0f');
      for (let prof of professions) {
        for(let i = 0; i < tempSelectedList.length; i++)
        {
          stats[prof].totalSupply += currentYear[tempSelectedList[i]]['supply'][prof];
          stats[prof].totalDemand += currentYear[tempSelectedList[i]]['demand'][prof];
          stats[prof].totalSupplyPer100K = Number(f(stats[prof].totalSupply / population * 100000));
          stats[prof].totalDemandPer100K = Number(f(stats[prof].totalDemand / population * 100000));
          if (this.map.comparisonMode) {
            stats[prof].otherTotalSupply += otherCurrentYearData[tempSelectedList[i]]['supply'][prof];
            stats[prof].otherTotalDemand += otherCurrentYearData[tempSelectedList[i]]['demand'][prof];
            stats[prof].otherTotalSupplyPer100K = Number(f(stats[prof].otherTotalSupply / population * 100000));
            stats[prof].otherTotalDemandPer100K = Number(f(stats[prof].otherTotalDemand / population * 100000));
          }
        }
      }

    var data = Object.keys(stats).map(d => {
      if (mapData.includes('100')) {
        return [stats[d].totalSupplyPer100K, stats[d].totalDemandPer100K, stats[d].totalDemandPer100K - stats[d].totalSupplyPer100K,
        stats[d].otherTotalSupplyPer100K, stats[d].otherTotalDemandPer100K, stats[d].otherTotalDemandPer100K - stats[d].otherTotalSupplyPer100K];
      } else {
        return [stats[d].totalSupply, stats[d].totalDemand, stats[d].totalDemand- stats[d].totalSupply, stats[d].otherTotalSupply, stats[d].otherTotalDemand, stats[d].otherTotalDemand- stats[d].otherTotalSupply];
      }
    });

    var professionsData = [];

    for (let i in data) {
        professionsData.push([professions[i], ...data[i]]);
    }

    return professionsData;
  }
}

export { Sidebar };
