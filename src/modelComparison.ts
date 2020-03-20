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

    for(let i in secondModel)
    {
      this.supplyMapTwo[i] = {};
      this.demandMapTwo[i] = {};
      this.gapMapTwo[i] = {};

      yearCounter++;
      for(let j in secondModel[i])
      {

        for(let k in secondModel[i][j].supply)
        {
          console.log(k)
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

    console.log(this.gapMapTwo);

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

        // 2. Use the margin convention practice
    var margin = {top: 50, right: 200, bottom: 350, left: 100}
      , width = 750 // Use the window's width
      , height = 500; // Use the window's height

    // The number of datapoints
    var n = yearCounter;

    var xScale = d3.scaleLinear()
        .domain([d3.min(Object.keys(selectedMapOne)), d3.max(Object.keys(selectedMapOne))]) // input
        .range([0, width]); // output

    // 6. Y scale will use the randomly generate number
    let max = Math.max(
      d3.max(Object.keys(selectedMapOne), d => selectedMapOne[d].total),
      d3.max(Object.keys(selectedMapTwo), d => selectedMapTwo[d].total));

    let min = Math.min(
      d3.min(Object.keys(selectedMapOne), d => selectedMapOne[d].total),
      d3.min(Object.keys(selectedMapTwo), d => selectedMapTwo[d].total));

    let dom;
    if(max < 0)
    {
      dom = [min / 2, 0]
    }
    else{
      dom = [0, max / 2]
    }

    var yScale = d3.scaleLinear()
        .domain(dom) // input
        .range([height, 0]); // output

    // 7. d3's line generator
    var line = d3.area()
        .x(function(d, i) { return xScale(i + 2014); }) // set the x values for the line generator
        .y0(function(d) { return yScale(d.y); }) // set the y values for the line generator
        .y1(function(d) { return yScale(0); }) // set the y values for the line generator

    // // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
    var dataset1 = d3.range(2014, 2025).map(d => { return {"y": selectedMapOne[d] ? selectedMapOne[d].total / 2 : 0} })
    var dataset2 = d3.range(2014, 2025).map(d => { return {"y": selectedMapTwo[d] ? selectedMapTwo[d].total / 2 : 0} })

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
        .call(g => g.select(".domain").remove()); // Create an axis component with d3.axisBottom

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale))
        .call(g => g.select(".domain").remove())
; // Create an axis component with d3.axisLeft

    if(d3.min(Object.keys(selectedMapOne), d => selectedMapOne[d].total) >
          d3.min(Object.keys(selectedMapTwo), d => selectedMapTwo[d].total) && d3.max(Object.keys(selectedMapTwo), d => selectedMapTwo[d].total) < 0)
    {
        svg.append("path")
            .datum(dataset2) // 10. Binds data to the line
            .attr("class", "secondModelCompare") // Assign a class for styling
            .attr("d", line) // 11. Calls the line generator

        svg.append("path")
            .datum(dataset1) // 10. Binds data to the line
            .attr("class", "firstModelCompare") // Assign a class for styling
            .attr("d", line) // 11. Calls the line generator

    }
    else if (d3.max(Object.keys(selectedMapOne), d => selectedMapOne[d].total) <
          d3.max(Object.keys(selectedMapTwo), d => selectedMapTwo[d].total) && d3.min(Object.keys(selectedMapTwo), d => selectedMapTwo[d].total) > 0)
    {
      svg.append("path")
          .datum(dataset2) // 10. Binds data to the line
          .attr("class", "secondModelCompare") // Assign a class for styling
          .attr("d", line) // 11. Calls the line generator


      svg.append("path")
          .datum(dataset1) // 10. Binds data to the line
          .attr("class", "firstModelCompare") // Assign a class for styling
          .attr("d", line) // 11. Calls the line generator

    }
    else{
        svg.append("path")
            .datum(dataset1) // 10. Binds data to the line
            .attr("class", "firstModelCompare") // Assign a class for styling
            .attr("d", line) // 11. Calls the line generator

        svg.append("path")
            .datum(dataset2) // 10. Binds data to the line
            .attr("class", "secondModelCompare") // Assign a class for styling
            .attr("d", line) // 11. Calls the line generator


    }


    svg.append("text")
      .text("Total")
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "middle")
      .attr("x", 375)
      .attr("y", -20)

    // // 12. Appends a circle for each datapoint
    // svg.selectAll(".dot1")
    //     .data(dataset1)
    //   .enter().append("circle") // Uses the enter().append() method
    //     .attr("class", "dot1") // Assign a class for styling
    //     .attr("cx", function(d, i) { return xScale(i + 2014) })
    //     .attr("cy", function(d) { return yScale(d.y) })
    //     .attr("r", 3)
    //       .on("mouseover", function(a, b, c) {
    //   			console.log(a)
    //         // this.attr('class', 'focus')
    // 		});
    //
    // svg.selectAll(".dot2")
    //     .data(dataset2)
    //   .enter().append("circle") // Uses the enter().append() method
    //     .attr("class", "dot2") // Assign a class for styling
    //     .attr("cx", function(d, i) { return xScale(i + 2014) })
    //     .attr("cy", function(d) { return yScale(d.y) })
    //     .attr("r", 3)
    //       .on("mouseover", function(a, b, c) {
    //   			console.log(a)
    //         // this.attr('class', 'focus')
    // 		});

    var legend = svg.selectAll(".legend")
     .data(["#1B9E77", "#7570B3"]).enter()
     .append("g")
     .attr("class","legend")
     .attr("transform", "translate(" + (width +50) + "," + 0+ ")");

    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", function(d, i) { return 20 * i; })
      .attr("r", 5)
      .style("fill", function(d, i) {
       return d;
     });

     legend.append("text")
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "left")
      .attr("x", 20)
      .attr("y", function(d, i) { return 20 * i; })
      .text((d, i) => {return this.mapController.serverModels[this.mapController.modelsUsed[i]].name});


    let smallDom;

    let smallMax = Math.max(
      d3.max(Object.keys(selectedMapOne), d => selectedMapOne[d]["CMHC"]),
      d3.max(Object.keys(selectedMapTwo), d => selectedMapTwo[d]["CMHC"]),
      d3.max(Object.keys(selectedMapOne), d => selectedMapOne[d]["Phys"]),
      d3.max(Object.keys(selectedMapTwo), d => selectedMapTwo[d]["Phys"]),
      d3.max(Object.keys(selectedMapOne), d => selectedMapOne[d]["Educ"]),
      d3.max(Object.keys(selectedMapTwo), d => selectedMapTwo[d]["Educ"]));

    let smallMin = Math.min(
      d3.min(Object.keys(selectedMapOne), d => selectedMapOne[d]["CMHC"]),
      d3.min(Object.keys(selectedMapTwo), d => selectedMapTwo[d]["CMHC"]),
      d3.min(Object.keys(selectedMapOne), d => selectedMapOne[d]["Phys"]),
      d3.min(Object.keys(selectedMapTwo), d => selectedMapTwo[d]["Phys"]),
      d3.min(Object.keys(selectedMapOne), d => selectedMapOne[d]["Educ"]),
      d3.min(Object.keys(selectedMapTwo), d => selectedMapTwo[d]["Educ"]));


    if(smallMax < 0)
    {
      smallDom = [smallMin/ 2, 0]
    }
    else if (smallMin > 0){
      smallDom = [0, smallMax / 2]
    }
    else{
      smallDom=[smallMin / 2, smallMax / 2]
    }

    console.log(smallDom)

    this.drawSmallScale(selectedMapOne, selectedMapTwo, "CMHC", margin.left, height + 125, smallDom)
    this.drawSmallScale(selectedMapOne, selectedMapTwo, "Phys", margin.left + 300, height + 125, smallDom)
    this.drawSmallScale(selectedMapOne, selectedMapTwo, "Educ", margin.left + 600, height + 125, smallDom)

  }

  drawSmallScale(selectedMapOne, selectedMapTwo, subSelected, x, y, dom)
  {
    // 2. Use the margin convention practice
    var margin = {top: 50, right: 50, bottom: 50, left: 100}
      , width = 200 // Use the window's width
      , height = 200; // Use the window's height

    // The number of datapoints
    var n = 11;

    // 5. X scale will use the index of our data
    var xScale = d3.scaleLinear()
        .domain([d3.min(Object.keys(selectedMapOne)), d3.max(Object.keys(selectedMapOne))]) // input
        .range([0, width]); // output

    var yScale = d3.scaleLinear()
        .domain(dom) // input
        .range([height, 0]); // output

    // 7. d3's line generator
    var line = d3.area()
        .x(function(d, i) { return xScale(i + 2014); }) // set the x values for the line generator
        .y0(function(d) { return yScale(d.y); }) // set the y values for the line generator
        .y1(function(d) { return yScale(0); }) // set the y values for the line generator

    // // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
    var dataset1 = d3.range(2014, 2025).map(d => { return {"y": selectedMapOne[d] ? selectedMapOne[d][subSelected] / 2 : 0} })
    var dataset2 = d3.range(2014, 2025).map(d => { return {"y": selectedMapTwo[d] ? selectedMapTwo[d][subSelected] / 2 : 0} })

    console.log(dataset2);

    // 1. Add the SVG to the page and employ #2
    var svg = this.svg
      .append("g")
        .attr("transform", "translate(" + x + "," + y + ")");

    // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis smallaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.format("d")))
        .call(g => g.select(".domain").remove())
; // Create an axis component with d3.axisBottom

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale).ticks(4))
        .call(g => g.select(".domain").remove())
; // Create an axis component with d3.axisLeft

    svg.append("text")
      .text(subSelected)
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "middle")
      .attr("x", 100)
      .attr("y", -20)


    if(d3.min(Object.keys(selectedMapOne), d => selectedMapOne[d][subSelected]) >
          d3.min(Object.keys(selectedMapTwo), d => selectedMapTwo[d][subSelected]) && d3.max(Object.keys(selectedMapTwo), d => selectedMapTwo[d][subSelected]) < 0)
    {
        svg.append("path")
            .datum(dataset2) // 10. Binds data to the line
            .attr("class", "secondModelCompare") // Assign a class for styling
            .attr("d", line); // 11. Calls the line generator

        svg.append("path")
            .datum(dataset1) // 10. Binds data to the line
            .attr("class", "firstModelCompare") // Assign a class for styling
            .attr("d", line) // 11. Calls the line generator

    }
    else if (d3.max(Object.keys(selectedMapOne), d => selectedMapOne[d][subSelected]) <
          d3.max(Object.keys(selectedMapTwo), d => selectedMapTwo[d][subSelected]) && d3.min(Object.keys(selectedMapTwo), d => selectedMapTwo[d][subSelected]) > 0)
    {
      svg.append("path")
          .datum(dataset2) // 10. Binds data to the line
          .attr("class", "secondModelCompare") // Assign a class for styling
          .attr("d", line); // 11. Calls the line generator

      svg.append("path")
          .datum(dataset1) // 10. Binds data to the line
          .attr("class", "firstModelCompare") // Assign a class for styling
          .attr("d", line) // 11. Calls the line generator

    }
    else{
        svg.append("path")
            .datum(dataset1) // 10. Binds data to the line
            .attr("class", "firstModelCompare") // Assign a class for styling
            .attr("d", line); // 11. Calls the line generator
        svg.append("path")
            .datum(dataset2) // 10. Binds data to the line
            .attr("class", "secondModelCompare") // Assign a class for styling
            .attr("d", line) // 11. Calls the line generator


    }


    // 12. Appends a circle for each datapoint
    // svg.selectAll(".dot1")
    //     .data(dataset1)
    //   .enter().append("circle") // Uses the enter().append() method
    //     .attr("class", "dot1") // Assign a class for styling
    //     .attr("cx", function(d, i) { return xScale(i + 2014) })
    //     .attr("cy", function(d) { return yScale(d.y) })
    //     .attr("r", 2)
    //       .on("mouseover", function(a, b, c) {
    //         console.log(a)
    //         // this.attr('class', 'focus')
    //     });
    //
    // svg.selectAll(".dot2")
    //     .data(dataset2)
    //   .enter().append("circle") // Uses the enter().append() method
    //     .attr("class", "dot2") // Assign a class for styling
    //     .attr("cx", function(d, i) { return xScale(i + 2014) })
    //     .attr("cy", function(d) { return yScale(d.y) })
    //     .attr("r", 2)
    //       .on("mouseover", function(a, b, c) {
    //         console.log(a)
    //         // this.attr('class', 'focus')
    //     });
  }
}

export{ModelComparison};
