import * as d3 from 'd3';
import {MapController} from './mapController';


class Sidebar {
	countiesSvg: any;
	stateSvg: any;
	professionsSvg: any;
	selectedProfessions: any;
	countiesHeaderSvg: any;
	margin:any;
	lastSelected:string;
	countiesAscending:boolean;
	professionsLastSelected:string;
	professionsAscending:boolean;
	map:MapController;
	countiesSortingFunction:any;
	professionsSortingFunction:any;
	currentlySelected:Set<string>;
  cell:any;
  currentYearData:any;
  otherCurrentYearData:any;
  mapData:any;

  constructor(map:MapController) {
    this.cell = {height: 30, width: 150, margin:10}
    this.map = map;
    this.selectedProfessions = {};
    this.currentlySelected = new Set<string>();
    this.lastSelected = "County";
    this.countiesAscending = true;
    this.professionsLastSelected = "Profession";
    this.professionsAscending = true;
    // this.countiesSortingFunction = this.getSortingOptions(0, true);
    // this.professionsSortingFunction = this.getSortingOptions(0, true);


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
  }

  destroy()
  {
    this.countiesSvg.selectAll("*").remove();
    this.professionsSvg.selectAll("*").remove();
    this.stateSvg.selectAll("*").remove();
  }

  initSideBar(selectedProfessions, currentYear, selectedCounties:Set<string>, otherCurrentYearData = [])
  {

    this.currentYearData = currentYear;
    this.otherCurrentYearData = otherCurrentYearData;

    if(selectedCounties.size == 0)
    {
      this.currentlySelected = new Set<string>();
      this.currentlySelected.add("State of Utah");
    }
    else{
      this.currentlySelected = new Set<string>(selectedCounties);
    }

    this.selectedProfessions = selectedProfessions;
    console.log(selectedProfessions)
    //
    // console.log(countiesData)
    this.updateTable(selectedProfessions, currentYear, selectedCounties, otherCurrentYearData);
  }

  updateTable(electedProfessions, currentYear, selectedCounties:Set<string>, otherCurrentYearData = [])
  {
    this.updateCounties();

    //NOW ADDING THE PROFESSIONS TABLE

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

  highlightRect(id) {
    if(id == "State of Utah")
    {
      this.currentlySelected.forEach(id => {
        if(id == "State of Utah")
          return;
        this.map.unHighlightPath(id);
      })

      this.currentlySelected = new Set<string>().add("State of Utah");
      return;
    }

    if(this.currentlySelected.has(id))
    {
      this.currentlySelected.delete(id);
      this.map.unHighlightPath(id);

      if(this.currentlySelected.size == 0)
      {
        this.currentlySelected = new Set<string>().add("State of Utah");
      }
      return;
    }

    this.currentlySelected.add(id);
    this.map.highlightPath(id);
  }

  highlightBar(id){
    id = this.removeSpaces(id);

    console.log(id)

    this.updateProfessions();

    d3.select(`#${id}_checkBox`)
      .property('checked', true);
  }

  unHighlightBar(id){
    id = this.removeSpaces(id);

    this.updateProfessions();

    //
    d3.select(`#${id}_checkBox`)
      .property('checked', false);
  }

  removeSpaces(s) : string{
    return s.replace(/\s/g, '');
  }

  singleMapRows(td, xScale, domainMax)
  {
    let labels = td.filter((d) => {
       return d.vis == 'text';
      })
      .text(function(d){return d.value;});

    let checkbox = td.filter((d) => {
       return d.vis == 'check';
      })
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
          this.highlightRect(d.name)
        }
        else if (d.type == "profSelected")
        {
          this.changeProfession(d.name)
        }
        else if(d.type == "profIncluded")
        {
          this.changeIncludedProfession(d.name)
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


  doubleMapRows(td, xScale, domainMax)
  {
    let labels = td.filter((d) => {
       return d.vis == 'text';
      })
      .text(function(d){return d.value;});

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
          this.highlightRect(d.name)
        }
        else if (d.type == "profSelected")
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
    // let allFlag = true;
    //
    // for(let j of this.selectedProfessions)
    // {
    //   if(!j)
    //   {
    //     allFlag = false;
    //   }
    // }

    if(false)
    {
      console.log(this.selectedProfessions)

      for( let k in this.selectedProfessions)
      {
        console.log(k)
        this.selectedProfessions[k] = false;
      }

      this.selectedProfessions[profName] = true;

      this.map.updateSelections(this.selectedProfessions);
    }
    else if (!this.selectedProfessions.hasOwnProperty(profName)
        || this.selectedProfessions[profName]) {

          this.selectedProfessions[profName] = false;
          this.map.updateSelections(this.selectedProfessions);

    }
    else {
      this.selectedProfessions[profName] = true;
      this.map.updateSelections(this.selectedProfessions);
    }
  }

  updateCounties()
  {

    d3.select("#countiesTable").select("tbody").selectAll('tr .notState').remove();
    d3.select("#countiesTable").attr("class", this.map.comparisonMode ? "doubleShade" : "singleShade")

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
      domainMax = d3.max(Object.keys(this.currentYearData), d => Math.max(this.currentYearData[d]['totalSupply'], this.currentYearData[d]['totalDemand']));
    }

    this.currentYearData[stateData[0]] = temp;

    var xScale = d3.scaleLinear()
      .domain([0, domainMax])
      .range([0, this.cell.width - this.cell.margin * 2]);



    let check = {type:"selectedCheck", vis:"allCheck", value:this.currentlySelected.has(stateData[0]), name:stateData[0]}
    let name = {type:"name", vis:"text", value:stateData[0]}
    let supply = {type:"supply", vis:"text", value:stateData[1]}
    let need = {type:"need", vis:"text", value:stateData[2]}
    let gap = {type:"axis", vis:"axis", value:[stateData[1], stateData[2]]}

    let stateRow = d3.select("#utahRow").selectAll("td")
      .data([check, name, supply, need, gap])
      .enter()
      .append("td");

    this.singleMapRows(stateRow, xScale, domainMax)

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
      .data(this.map.comparisonMode ? doubleCountyData : countiesData)
      .enter()
      .append("tr")
      .classed("notState", true)
      // .on("mouseover", this.tree.updateTree)
      // .on("mouseout", this.tree.clearTree);

    let td = tr.selectAll("td").data((d, i) => {

      if(this.map.comparisonMode)
      {
        if(i % 2 == 0)
        {
          let check = {type:"selectedCheck", vis:"check", value:this.currentlySelected.has(d[0]), name:d[0]}
          let name = {type:"name", vis:"text", value:d[0]}
          let supply = {type:"supply", vis:"text", value:Math.round(d[1])}
          let need = {type:"need", vis:"text", value:Math.round(d[2])}
          let gap = {type:"gap", vis:"bar", value:[Math.round(d[1]), Math.round(d[2])]}

          return [check, name, supply, need, gap];
        }
        else{
          let name = {type:"name", vis:"text", value:d[0]}
          let supply = {type:"supply", vis:"text", value:Math.round(d[4])}
          let need = {type:"need", vis:"text", value:Math.round(d[5])}
          let gap = {type:"gap", vis:"bar", value:[Math.round(d[4]), Math.round(d[5])]}

          return [name, supply, need, gap];
        }
      }
      else
      {
        let check = {type:"selectedCheck", vis:"check", value:this.currentlySelected.has(d[0]), name:d[0]}
        let name = {type:"name", vis:"text", value:d[0]}
        let supply = {type:"supply", vis:"text", value:Math.round(d[1])}
        let need = {type:"need", vis:"text", value:Math.round(d[2])}
        let gap = {type:"gap", vis:"bar", value:[Math.round(d[1]), Math.round(d[2])]}

        return [check, name, supply, need, gap];
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

  updateProfessions()
  {
    d3.select("#professionsTable").select("tbody").selectAll('tr').remove();
    d3.select("#professionsTable").attr("class", this.map.comparisonMode ? "doubleShade" : "singleShade")


    if(this.currentlySelected.size > 1 && this.currentlySelected.has("State of Utah"))
    {
      this.currentlySelected.delete("State of Utah")
    }

    if(this.currentlySelected.size == 0)
    {
      this.currentlySelected.add("State of Utah")
    }

    console.log(this.currentYearData);
    let profData = this.getProfessionsData(this.currentYearData, this.otherCurrentYearData, this.mapData);
    let doubleProfData = [];

    for(let i = 0; i < profData.length; i++)
    {
      doubleProfData.push(profData[i]);
      doubleProfData.push(profData[i]);
    }

    console.log(profData)

    let profScale = d3.scaleLinear()
    		.domain([0, d3.max(profData, (d) => d3.max([d[1], d[2]]))])
    		.range([0, this.cell.width - this.cell.margin * 2 ])

    let profTr = d3.select("#professionsTable").select("tbody")
      .selectAll("tr .notState")
      .data(this.map.comparisonMode ? doubleProfData : profData)
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
          let check1 = {type:"profSelected", vis:"check", value:this.selectedProfessions[d[0]], name:d[0]}
          let check2 = {type:"profIncluded", vis:"check", value:!this.map.removedProfessions.has(d[0]), name:d[0]}
          let name = {type:"name", vis:"text", value:d[0]}
          let supply = {type:"supply", vis:"text", value:Math.round(d[1])}
          let need = {type:"need", vis:"text", value:Math.round(d[2])}
          let gap = {type:"gap", vis:"bar", value:[Math.round(d[1]), Math.round(d[2])]}
          return [check1, check2, name, supply, need, gap];
        }
        let name = {type:"name", vis:"text", value:d[0]}
        let supply = {type:"supply", vis:"text", value:Math.round(d[4])}
        let need = {type:"need", vis:"text", value:Math.round(d[5])}
        let gap = {type:"gap", vis:"bar", value:[Math.round(d[4]), Math.round(d[5])]}
        return [name, supply, need, gap];
      }
      else{
        let check1 = {type:"profSelected", vis:"check", value:this.selectedProfessions[d[0]], name:d[0]}
        let check2 = {type:"profIncluded", vis:"check", value:!this.map.removedProfessions.has(d[0]), name:d[0]}
        let name = {type:"name", vis:"text", value:d[0]}
        let supply = {type:"supply", vis:"text", value:Math.round(d[1])}
        let need = {type:"need", vis:"text", value:Math.round(d[2])}
        let gap = {type:"gap", vis:"bar", value:[Math.round(d[1]), Math.round(d[2])]}
        return [check1, check2, name, supply, need, gap];
      }
    }).enter().append("td");

    console.log(profTd)

    if(this.map.comparisonMode)
    {
      this.doubleMapRows(profTd, profScale, d3.max(profData, (d) => d3.max([d[1], d[2]])));
    }
    else{
      this.singleMapRows(profTd, profScale, d3.max(profData, (d) => d3.max([d[1], d[2]])));
    }
  }

  changeIncludedProfession(id:string)
  {
    if(this.map.removedProfessions.has(id))
    {
      this.map.removedProfessions.delete(id);
    }
    else{
      this.map.removedProfessions.add(id)
    }

    this.map.updateSelections(this.selectedProfessions);
  }

  getProfessionsData(currentYear, otherCurrentYearData, mapData)
  {
      let tempSelectedList = Array.from(this.currentlySelected);
      console.log(tempSelectedList)

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
