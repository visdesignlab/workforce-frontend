import * as d3 from 'd3';
import {MapController} from './mapController';

class ModelComparison
{
  svg:any;
  firstModel:any;
  secondModel:any;
  mapController:MapController;
  supplyMapOne:any;
  demandMapOne:any;
  gapMapOne:any;

  supplyMapTwo:any;
  demandMapTwo:any;
  gapMapTwo:any;
  currentMin:number;

  constructor(mapController:MapController)
  {
    this.mapController = mapController;
    this.svg = d3.select('#comparisonView').append('svg');

    this.supplyMapOne = {};
    this.demandMapOne = {};
    this.gapMapOne = {};

    this.supplyMapTwo = {};
    this.demandMapTwo = {};
    this.gapMapTwo = {};
    this.currentMin = 0;
  }

  drawComparison(firstModel, secondModel, comparisonType)
  {
    this.supplyMapOne = {};
    this.demandMapOne = {};
    this.gapMapOne = {};

    this.supplyMapTwo = {};
    this.demandMapTwo = {};
    this.gapMapTwo = {};

    let yearCounter = 0;
    for(let i in firstModel)
    {
      this.supplyMapOne[i] = {};
      this.demandMapOne[i] = {};
      this.gapMapOne[i] = {};

      yearCounter++;
      for(let j in firstModel[i])
      {

        if(!this.mapController.selectedCounties.has(j) && this.mapController.selectedCounties.size > 0)
        {
          continue;
        }
        if(j == "State of Utah")
        {
          continue;
        }
        for(let k in firstModel[i][j].supply)
        {
          this.supplyMapOne[i][k] = this.supplyMapOne[i][k] ? this.supplyMapOne[i][k] + firstModel[i][j].supply[k] : firstModel[i][j].supply[k]
          this.supplyMapOne[i].total = this.supplyMapOne[i].total ? this.supplyMapOne[i].total + firstModel[i][j].supply[k] : firstModel[i][j].supply[k]

          this.gapMapOne[i][k] = this.gapMapOne[i][k] ? this.gapMapOne[i][k] + firstModel[i][j].supply[k] : firstModel[i][j].supply[k]
          this.gapMapOne[i].total = this.gapMapOne[i].total ? this.gapMapOne[i].total + firstModel[i][j].supply[k] : firstModel[i][j].supply[k]
        }

        for(let k in firstModel[i][j].demand)
        {
          this.demandMapOne[i][k] = this.demandMapOne[i][k] ? this.demandMapOne[i][k] + firstModel[i][j].demand[k] : firstModel[i][j].demand[k]
          this.demandMapOne[i].total = this.demandMapOne[i].total ? this.demandMapOne[i].total + firstModel[i][j].demand[k] : firstModel[i][j].demand[k]

          this.gapMapOne[i][k] = this.gapMapOne[i][k] ? this.gapMapOne[i][k] - firstModel[i][j].demand[k] : firstModel[i][j].demand[k]
          this.gapMapOne[i].total = this.gapMapOne[i].total ? this.gapMapOne[i].total - firstModel[i][j].demand[k] : firstModel[i][j].demand[k]
        }
      }
    }
    console.log(this.supplyMapOne);
    console.log(firstModel);

    for(let i in secondModel)
    {
      this.supplyMapTwo[i] = {};
      this.demandMapTwo[i] = {};
      this.gapMapTwo[i] = {};

      yearCounter++;
      for(let j in secondModel[i])
      {

        if(!this.mapController.selectedCounties.has(j) && this.mapController.selectedCounties.size > 0)
        {
          continue;
        }
        if(j == "State of Utah")
        {
          continue;
        }
        for(let k in secondModel[i][j].supply)
        {
          this.supplyMapTwo[i][k] = this.supplyMapTwo[i][k] ? this.supplyMapTwo[i][k] + secondModel[i][j].supply[k] : secondModel[i][j].supply[k]
          this.supplyMapTwo[i].total = this.supplyMapTwo[i].total ? this.supplyMapTwo[i].total + secondModel[i][j].supply[k] : secondModel[i][j].supply[k]

          this.gapMapTwo[i][k] = this.gapMapTwo[i][k] ? this.gapMapTwo[i][k] + secondModel[i][j].supply[k] : secondModel[i][j].supply[k]
          this.gapMapTwo[i].total = this.gapMapTwo[i].total ? this.gapMapTwo[i].total + secondModel[i][j].supply[k] : secondModel[i][j].supply[k]
        }

        for(let k in secondModel[i][j].demand)
        {
          this.demandMapTwo[i][k] = this.demandMapTwo[i][k] ? this.demandMapTwo[i][k] + secondModel[i][j].demand[k] : secondModel[i][j].demand[k]
          this.demandMapTwo[i].total = this.demandMapTwo[i].total ? this.demandMapTwo[i].total + secondModel[i][j].demand[k] : secondModel[i][j].demand[k]

          this.gapMapTwo[i][k] = this.gapMapTwo[i][k] ? this.gapMapTwo[i][k] - secondModel[i][j].demand[k] : secondModel[i][j].demand[k]
          this.gapMapTwo[i].total = this.gapMapTwo[i].total ? this.gapMapTwo[i].total - secondModel[i][j].demand[k] : secondModel[i][j].demand[k]
        }
      }
    }



    this.svg.selectAll("*").remove();

    let selectedMapOne = undefined;
    let selectedMapTwo = undefined;

    if(comparisonType == "gap")
    {
      selectedMapOne = this.gapMapOne;
      selectedMapTwo = this.gapMapTwo;
    }
    else if(comparisonType == "supply")
    {
      selectedMapOne = this.supplyMapOne;
      selectedMapTwo = this.supplyMapTwo;
    }
    else
    {
      selectedMapOne = this.demandMapOne;
      selectedMapTwo = this.demandMapTwo;
    }

    let dataList1 = []
    let dataList2 = []

    let mapOneKeys = [];
    let mapTwoKeys = [];

    for (let i = 0; i < Object.keys(selectedMapOne).length; i++)
    {
      let c = Object.keys(selectedMapOne);
      mapOneKeys.push(+c[i]);
    }

    for (let i = 0; i < Object.keys(selectedMapTwo).length; i++)
    {
      let c = Object.keys(selectedMapTwo);
      mapTwoKeys.push(+c[i]);
    }

    for (let i in this.mapController.selectedProfessions)
    {
      if(!this.mapController.selectedProfessions[i])
      {
        continue;
      }



      let currObj1 = {"prof":undefined, "dataset":undefined};
      currObj1.prof = i;
      currObj1.dataset = mapOneKeys.map(d => { return {"y": selectedMapOne[d] ? selectedMapOne[d][i] : 0, "year": d} })

      dataList1.push(currObj1);

      let currObj2 = {"prof":undefined, "dataset":undefined};
      currObj2.prof = i;
      currObj2.dataset = mapTwoKeys.map(d => { return {"y": selectedMapTwo[d] ? selectedMapTwo[d][i] : 0, "year": d} })
      dataList2.push(currObj2);
    }


        // 2. Use the margin convention practice
    var margin = {top: 50, right: 700, bottom: 350, left: 100}
      , width = 750 // Use the window's width
      , height = 500; // Use the window's height

    // The number of datapoints
    var n = yearCounter;

    var xScale = d3.scaleLinear()
        .domain([+d3.min(Object.keys(selectedMapOne)), +d3.max(Object.keys(selectedMapOne))]) // input
        .range([0, width]); // output

    // 6. Y scale will use the randomly generate number
    let max = Math.max(
      +d3.max(Object.keys(selectedMapOne), d => selectedMapOne[d].total),
      +d3.max(Object.keys(selectedMapTwo), d => selectedMapTwo[d].total));

    let min = Math.min(
      +d3.min(Object.keys(selectedMapOne), d => selectedMapOne[d].total),
      +d3.min(Object.keys(selectedMapTwo), d => selectedMapTwo[d].total));

    let smallDom;

    let smallMax = undefined;
    let smallMin = undefined;

    for (let i in this.mapController.selectedProfessions)
    {
      if(!this.mapController.selectedProfessions[i])
      {
        continue;
      }
      let localMax = Math.max(+d3.max(Object.keys(selectedMapOne), d => isNaN(+selectedMapOne[d][i]) ? smallMax : +selectedMapOne[d][i]), +d3.max(Object.keys(selectedMapTwo), d => isNaN(+selectedMapTwo[d][i]) ? smallMax : +selectedMapTwo[d][i]));
      let localMin = Math.min(+d3.min(Object.keys(selectedMapOne), d => isNaN(+selectedMapOne[d][i]) ? smallMin : +selectedMapOne[d][i]), +d3.min(Object.keys(selectedMapTwo), d => isNaN(+selectedMapTwo[d][i]) ? smallMin : +selectedMapTwo[d][i]));
      console.log(localMax);
      console.log(localMin)
      if(localMax != NaN && localMax > smallMax || smallMax === undefined)
      {

        smallMax = localMax
      }

      if(localMax != NaN && localMin < smallMin || smallMin === undefined)
      {
        smallMin = localMin
      }
    }
    smallDom = [smallMin, smallMax];
    console.log(smallDom)



    var yScale = d3.scaleLinear()
        .domain(smallDom) // input
        .range([height, 0]); // output

    // 7. d3's line generator
    var line = d3.line()
        .x((d, i) => { return xScale(d.year); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.y); }) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    let lineCreator = (d) =>
    {
      return line(d.dataset);
    }
 // apply smoothing to the line
    // // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
    // var dataset1 = d3.range(2014, 2025).map(d => { return {"y": selectedMapOne[d] ? selectedMapOne[d].total : 0} })
    // var dataset2 = d3.range(2014, 2025).map(d => { return {"y": selectedMapTwo[d] ? selectedMapTwo[d].total : 0} })

    // 1. Add the SVG to the page and employ #2
    var svg = this.svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale))

    // if(d3.min(Object.keys(selectedMapOne), d => selectedMapOne[d].total) >
    //       d3.min(Object.keys(selectedMapTwo), d => selectedMapTwo[d].total) && d3.max(Object.keys(selectedMapTwo), d => selectedMapTwo[d].total) < 0)
    // {
    this.currentMin = +d3.min(Object.keys(selectedMapOne))

    svg.selectAll("path .firstModelCompare")
      .data(dataList1)
      .enter()
      .append("path")
      .attr("class", "firstModelCompare") // Assign a class for styling
      .attr("d", d => {

        return lineCreator(d);
      })

    this.currentMin = +d3.min(Object.keys(selectedMapTwo))

    svg.selectAll("path .secondModelCompare")
      .data(dataList2)
      .enter()
      .append("path")
      .attr("class", "secondModelCompare") // Assign a class for styling
      .attr("d", d => {
        console.log(Object.keys(d))
        if(d.dataset[0].y === undefined)
        {
          return "";
        }
        return lineCreator(d);
      })
    for (let j in this.mapController.selectedProfessions)
    {
      if(!this.mapController.selectedProfessions[j])
      {
        continue;
      }
      var dataset1 = mapOneKeys.map(d => { return {"y": selectedMapOne[d] ? selectedMapOne[d][j] : 0, "year": d} })
      var dataset2 = mapTwoKeys.map(d => { return {"y": selectedMapTwo[d] ? selectedMapTwo[d][j] : 0, "year": d} })

      let f = d3.format(".1f")
      svg.selectAll(".dot1" + j)
        .data(dataset1)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot1") // Assign a class for styling
        .attr("cx", function(d, i) { return xScale(d.year) })
        .attr("cy", function(d) { return yScale(d.y) })
        .attr("r", d => d.y === undefined ? 0 : 3)
        .on("mouseover", function(d, i) {
          d3.select("#comparisonTooltip").transition().duration(200).style("opacity", .9);
          d3.select("#comparisonTooltip").html("<h3>" + j + "</h3><h4>" + (i + +d3.min(Object.keys(selectedMapOne))) + "</h4><h4>" + f(d.y) + "</h4>" )
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select("#comparisonTooltip").transition().duration(200).style("opacity", 0);
        });

      svg.selectAll(".dot2" + j)
        .data(dataset2)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot2") // Assign a class for styling
        .attr("cx", function(d, i) { return xScale(d.year) })
        .attr("cy", function(d) { return yScale(d.y) })
        .attr("r", d => d.y === undefined ? 0 : 3)
        .on("mouseover", function(d, i) {
            d3.select("#comparisonTooltip").transition().duration(200).style("opacity", .9);
            d3.select("#comparisonTooltip").html("<h3>" + j + "</h3><h4>" + d.year + "</h4><h4>" + f(d.y) + "</h4>" )
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select("#comparisonTooltip").transition().duration(200).style("opacity", 0);
        });
    }

    svg.append("text")
      .text("Total")
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "middle")
      .attr("x", 375)
      .attr("y", -20)

    var legend = svg.selectAll(".legend")
     .data(["#1B9E77", "#7570B3"]).enter()
     .append("g")
     .attr("class","legend")
     .attr("transform", "translate(" + (width +50) + "," + 0+ ")");

    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", function(d, i) { return 30 * i; })
      .attr("r", 5)
      .style("fill", function(d, i) {
       return d;
      });

    legend.append("text")
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "left")
      .attr("x", 20)
      .attr("y", function(d, i) { return 30 * i; })
      .text((d, i) => {return this.mapController.serverModels[this.mapController.modelsUsed[i]].name});


    console.log(legend.node().getBoundingClientRect().width)
    legend.append("rect")
     .attr("x", -10)
     .attr("y", function(d, i) { return 30 * i - 12; })
     .attr("rx", 10)
     .attr("ry", 10)
     .attr("height", 24)
     .attr("width", function(d) {
       console.log(d3.select(this))
       return d3.select(this).node().previousElementSibling.textLength.baseVal.value + 40
     })
     .style("fill", "lightgrey")
     .style("cursor", "pointer")
     .style("opacity", 0)
     .attr("id", (d, i) => i == 0 ? "firstModelCompareRect" : "secondModelCompareRect" )
     .on("click", (d, i) =>
     {
       let modelSelected = i == 0 ? ".firstModelCompare" : ".secondModelCompare"
       let otherModel = i == 1 ? ".firstModelCompare" : ".secondModelCompare"

       let dotSelected = i == 0 ? ".dot1" : ".dot2"
       let otherDotSelected = i == 1 ? ".dot1" : ".dot2"

       let rectSelected = i == 0 ? "#firstModelCompareRect" : "#secondModelCompareRect"
       let otherRectSelected = i == 1 ? "#firstModelCompareRect" : "#secondModelCompareRect"

       if(d3.select(modelSelected).style("opacity") == 0)
       {
         d3.selectAll(modelSelected)
          .transition(1000)
          .style("opacity", 1)

        d3.selectAll(otherModel)
         .transition(1000)
         .style("opacity", 0)

        d3.selectAll(dotSelected)
          .transition(1000)
          .attr("r", 3)

        d3.selectAll(otherDotSelected)
         .transition(1000)
         .attr("r", 0)

         d3.select(otherRectSelected)
           .transition(1000)
           .style("opacity", 0)

         d3.select(rectSelected)
          .transition(1000)
          .style("opacity", .3)
       }
       else if(d3.select(otherModel).style("opacity") == 0)
       {
         d3.selectAll(otherModel)
          .transition(1000)
          .style("opacity", 1)

        d3.selectAll(otherDotSelected)
         .transition(1000)
         .attr("r", 3)

         d3.select(rectSelected)
          .transition(1000)
          .style("opacity", 0)
       }
       else{
         d3.selectAll(otherModel)
          .transition(1000)
          .style("opacity", 0)
          d3.selectAll(otherDotSelected)
           .transition(1000)
           .attr("r", 0)

           d3.select(rectSelected)
            .transition(1000)
            .style("opacity", .3)
       }
     })


  }
}

export{ModelComparison};
