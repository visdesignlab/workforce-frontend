import * as d3 from 'd3';
import * as fc from 'd3fc';

import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {Sidebar} from './sidebar';
import {Linechart} from './linechart'
import {MapController} from './mapController'

/**
 *
 */
class Map{
	svg:any;
	modelData:string;
	supplyScore:any;
	results: any;
	currentYearData : any;
	linechart:Linechart;
	controller:MapController
	firstMap:boolean;

	/**
	 *
	 */
	constructor(controller, firstMap)
	{
		this.firstMap = firstMap;
		this.controller = controller;
		this.linechart = new Linechart(controller)
		this.currentYearData = {};
		this.supplyScore = {};
		this.svg = d3.select("#map")
			.append('g')
			.attr('transform', `translate(${this.firstMap ? 0 : 600},0)`);
	}

	destroy() {
		this.svg.selectAll('*').remove();
		this.linechart.destroy();
	}

	/**
	 * initial drawing of map.
	 */
	drawMap(mapData:any, modelUsed: any, selectedProfessions: any, yearSelected:string, selectedCounties:Set<string>, mapType:string, customModel = false, initSidebar = true):Promise<void>{
			// d3.select('#spinner')
			// 	.classed('d-flex', true)

		this.modelData = modelUsed;
		const map = mapType;
		console.log(this.modelData);
		const modelFile = this.controller.serverModels[this.modelData].path;
		const serverUrl = 'http://3.20.123.182/';

		// const option = (document.getElementById('customModel') as HTMLInputElement).value;

		let promise;
		// if (!customModel) {
		promise = d3.json(`${serverUrl}/${modelFile}`);
		// }
		// else {


		promise = promise.then((results)=> {
			console.log(results);
			// if (!customModel) {
				results = results[map];
				this.results = results;
			// } else {
			// 	this.results[yearSelected][selectedCounties[0]].demand = results.result.demand['w_0.1'] || results.result.demand;
			// }

			this.svg.selectAll('*').remove();
			this.svg.append('line')
			.attr('stroke', 'black')
			.attr('stroke-width', 1)
			.attr('x1', 600)
			.attr('x2', 600)
			.attr('y1', 10)
			.attr('y2', 600);

			if(this.controller.comparisonMode)
			{
				this.svg.append("circle")
					.style("fill", this.firstMap ? "#1B9E77" : "#7570B3")
					.attr("r", 20)
					.attr("cx", 520)
					.attr("cy", 40)
			}

			this.svg.append('text')
				.text(this.controller.serverModels[this.modelData].name)
				.attr("x", 500)
				.attr("y", 90)
				.attr('alignment-baseline', 'middle')
				.style('font-size', '24px')
				.classed("goodFont", true)

			this.svg.append('text')
				.text("\uf059")
				.attr("x", 500)
				.attr("y", 120)
				.attr('alignment-baseline', 'middle')
				.style('font-size', '24px')
				.classed("fontAwesome", true)
				.on("mouseover", () => {
					d3.select("#descriptionTooltip").transition().duration(200).style("opacity", .9);
					d3.select("#descriptionTooltip").html("<h2>" + this.controller.serverModels[this.modelData].description + "</h2>")
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");
				})
				.on("mouseout", () => {
					d3.select("#descriptionTooltip").transition().duration(200).style("opacity", 0);

				})

			this.currentYearData = this.results[yearSelected]
			d3.select('#spinner')
				.classed('d-flex', false)
				.style('display', 'none');
			var professions = Object.keys(this.currentYearData['State of Utah']['supply']);
				for(let profession in professions){
				}
				for (let county in this.currentYearData) {
					let totalSupply = 0;
					let totalDemand = 0;
					for (let profession of professions) {
						if(selectedProfessions[profession] == undefined){
							selectedProfessions[profession] = true;
						}
						if (selectedProfessions[profession] == true) {
							totalSupply += this.currentYearData[county]['supply'][profession];
							totalDemand += this.currentYearData[county]['demand'][profession];
						}
					}
						let population = this.currentYearData[county].population;
						this.currentYearData[county]['totalSupply'] = totalSupply;
						this.currentYearData[county]['totalDemand'] = totalDemand;
						this.currentYearData[county]['totalSupplyPer100K'] = totalSupply / population * 100000;
						this.currentYearData[county]['totalDemandPer100K'] = totalDemand / population * 100000;
						this.supplyScore[county] = (totalSupply / totalDemand) / 2;
				}

				var linear = d3.scaleOrdinal()
					.domain(['Undersupplied', 'Balanced', 'Oversupplied'])
					.range([d3.interpolateRdBu(0), d3.interpolateRdBu(0.5), d3.interpolateRdBu(1)]);


				// var legendLinear = legendColor()
				// 	.shapeWidth(115)
				// 	.labelFormat(d3.format(".0f"))
				// 	.orient('horizontal')
				// 	.scale(linear);

				this.svg.append("g")
					.attr("class", "legendLinear")
					.attr("transform", "translate(20,20)");
				// this.svg.select(".legendLinear")
				// 	.call(legendLinear);
				function getSupplyPer100k(county) {
					return county['totalSupply'] / county['population'] * 100000;
				};
				function getDemandPer100k(county) {
					return county['totalDemand'] / county['population'] * 100000;
				};
				let colorScale = (d)=>{
					let county = d.properties.NAME;
					return d3.interpolateRdBu(this.supplyScore[county]);
				}
				let that:any = this
				d3.json("../data/UT-49-utah-counties.json").then((us)=> {
					var topojsonFeatures = topojson.feature(us, us.objects[map]);
					var mapCenter = d3.geoCentroid(topojsonFeatures);
					var projection = d3.geoAlbersUsa()
						.scale(200)
						.translate(300,300);
					projection = d3.geoMercator().scale(4000).translate([400/2, 600/2])
					projection.center(mapCenter);
					var path = d3.geoPath(projection);

					this.svg.append("g")
						.attr("class", "counties")
						.attr("transform", "translate(20,40)")
						.selectAll("path")
						.data(topojson.feature(us, us.objects[map]).features)
						.enter().append("path")
						.attr("d", path)
						.attr('fill', colorScale)
						.attr('stroke', 'black')
						.on('click', d => this.controller.highlightPath(d.properties.NAME))
						.on("mouseover", (d)=>{
							var f = d3.format(".2f");
							const supplyDemandRatio = f(2 *this.supplyScore[d.properties.NAME]);
							const population = this.currentYearData[d.properties.NAME]['population'];
							const supplyPer100k = d3.format('.0f')(
							this.currentYearData[d.properties.NAME]['totalSupply'] / population * 100000);
							const demandPer100k = d3.format('.0f')(
								this.currentYearData[d.properties.NAME]['totalDemand'] / population * 100000);
							var toolTip = "<h4>"+d.properties.NAME+"</h4><table>"+
							"<tr><td>Supply/Need:</td><td>"+(supplyDemandRatio)+"</td></tr>"+
							"<tr><td>Population:</td><td>"+(population)+"</td></tr>"+
							"<tr><td>Supply/100K:</td><td>"+(supplyPer100k)+"</td></tr>"+
							"<tr><td>Need/100K:</td><td>"+(demandPer100k)+"</td></tr>"+
							"</table>";

								d3.select("#tooltip").transition().duration(200).style("opacity", .9);
								d3.select("#tooltip").html(toolTip)
									.style("left", (d3.event.pageX) + "px")
									.style("top", (d3.event.pageY - 28) + "px");
									})
							.on("mouseout", this.mouseOut);

					this.svg.append("path")
						.attr("class", "county-borders")
						.attr("transform", "translate(20,40)")
						.attr("d", path(topojson.mesh(us, us.objects[map], function(a, b) { return a !== b; })));

					this.updateMapType(mapData, 0);
				});
				this.linechart.initLineChart(this.results, Array.from(this.controller.selectedCounties));

		});
		return promise;
	}
	/**
	 *
	 * @param mapData current map type that is selected
	 * @param currentYearData current results data
	 */
	getLinear(mapData,currentYearData){
		if (mapData == 'supply_need') {
			return d3.scaleOrdinal()
				.domain(['Undersupplied', 'Balanced', 'Oversupplied'])
				.range([d3.interpolateRdBu(0), d3.interpolateRdBu(0.5), d3.interpolateRdBu(1)]);
		} else if (mapData == 'supply_need_per_100K') {
			return d3.scaleOrdinal()
				.domain(['Undersupplied', 'Balanced', 'Oversupplied'])
				.range([d3.interpolatePuOr(1), d3.interpolatePuOr(0.5), d3.interpolatePuOr(0)]);
		} else if (mapData == 'supply_per_100k') {
			let max = d3.max(Object.keys(currentYearData).map( d =>
				currentYearData[d]['totalSupply'] / currentYearData[d]['population'] * 100000
			));

			return d3.scaleLinear()
				.domain([0, max])
				.range([d3.interpolateBlues(0), d3.interpolateBlues(1)]);
		} else if (mapData == 'demand_per_100k') {
			let max = d3.max(Object.keys(currentYearData), d => {
				return currentYearData[d]['totalDemand'] / currentYearData[d]['population'] * 100000;
			});

			return d3.scaleLinear()
				.domain([0, max])
				.range([d3.interpolateOranges(0), d3.interpolateOranges(1)]);
		} else {
			return d3.scaleLinear()
				.domain([1000, 1000000])
				.range([d3.interpolateGreens(0), d3.interpolateGreens(1)]);
		}
	}
	/**
	 *
	 * @param d the current county
	 * @param that reference to this class calling the function
	 * @param mapData current map type that is selected
	 */
	myColorScale(d,that,mapData){
		let county = d.properties.NAME;
		if (mapData == 'supply_need') {
			return d3.interpolateRdBu(that.supplyScore[county]);
		} else if (mapData == 'supply_need_per_100K') {
			return d3.interpolatePuOr(1 - that.supplyScore[county]);
		} else if (mapData == 'supply') {


			let max = d3.max(Object.keys(that.currentYearData).map( d =>
			{
				if(d == "State of Utah")
				{
					return 0
				}
				return that.currentYearData[d]['totalSupply']
			}));

			const scale = d3.scaleLinear()
				.domain([0, max])
				.range([0, 1]);

			return d3.interpolatePurples(scale(that.currentYearData[county]['totalSupply']));
		} else if (mapData == 'demand') {

			let max = d3.max(Object.keys(that.currentYearData), d => {
				if(d == "State of Utah")
				{
					return 0;
				}
				return that.currentYearData[d]['totalDemand']
			})

			const scale = d3.scaleLinear()
				.domain([0, max])
				.range([0, 1]);

			return d3.interpolateOranges(scale(that.currentYearData[county]['totalDemand']));
		}else{

			let max = d3.max(Object.keys(that.currentYearData), d => {
				if(d == "State of Utah")
				{
					return 0;
				}
				return that.currentYearData[d]['population']
			})

			const scale = d3.scaleLinear()
				.domain([0, max])
				.range([0, 1]);

			return d3.interpolateGreens(scale(that.currentYearData[county]['population']));
		}
	};

	/**
	 * this updates the map when the user selects a new type of map
	 * @param mapData this the selection of the new map type
	 */
	updateMapType(mapData:string, duration:number):void{
		let that:any = this;
		let colorScale:any = this.myColorScale;
		let linear:any = this.getLinear(mapData, this.currentYearData)

		console.log(this.supplyScore);
		console.log(this.currentYearData);
		let max;

		if(this.firstMap)
		{
			switch(mapData)
			{
				case 'supply_need':
					this.continuous(
						"#legendDiv",
						d3.scaleSequential(d3.interpolateRdBu).domain([0, 2]),
						 "Supply/Need",
						 [0, 2]
					 );
					break;
				case 'supply_need_per_100K':
					this.continuous(
						"#legendDiv",
						d3.scaleSequential(d3.interpolatePuOr).domain([0, 1]),
						 "Supply/Need Per 100k",
						 [0, 1]
					 );
					break;
				case 'population':

				max = d3.max(Object.keys(that.currentYearData).map( d => {
						return d === "State of Utah" ? 0 : this.currentYearData[d]['population']
				}));

					this.continuous(
						"#legendDiv",
						d3.scaleSequential(d3.interpolateGreens).domain([0, max]),
						 "Population",
						 [0, max]
					 );
					break;
				case 'demand':

					max = d3.max(Object.keys(this.currentYearData), d => {
						return d === "State of Utah" ? 0 : this.currentYearData[d]['totalDemand']
					})

					this.continuous(
						"#legendDiv",
						d3.scaleSequential(d3.interpolateOranges).domain([0, max]),
						 "Need",
						 [0, max]
					 );
					break;
				case 'supply':


					max = d3.max(Object.keys(that.currentYearData).map( d =>{
						return d === "State of Utah" ? 0 : this.currentYearData[d]['totalSupply']
					}));

					this.continuous(
						"#legendDiv",
						d3.scaleSequential(d3.interpolatePurples).domain([0, max]),
						 "Supply",
						 [0, max]
					 );
					break;
			}
		}

		this.svg.select('g.counties').selectAll('path').each(function(d){
			d3.select(this).transition().duration(duration).attr('fill',colorScale(d,that,mapData));
		});
	}
	/**
	 * This handles when the user selects a new year
	 * @param year this is the new year selected by the user
	 */
	updateMapYear(year:string, mapData:string, mapType:string, sidebar:any):Promise<void>{

		const map = mapType;
		const modelFile = this.controller.serverModels[this.modelData].path;;
		let promise = d3.json(`http://3.20.123.182/${modelFile}`).then((results)=> {
			results = results[map];
			this.currentYearData = results[year]
				var professions = Object.keys(this.currentYearData['State of Utah']['supply']);
				for (let county in this.currentYearData) {
					let totalSupply = 0;
					let totalDemand = 0;
					for (let profession of professions) {
						if (!sidebar.selectedProfessions.hasOwnProperty(profession)
							|| sidebar.selectedProfessions[profession]) {
							totalSupply += this.currentYearData[county]['supply'][profession];
							totalDemand += this.currentYearData[county]['demand'][profession];
						}
					}
						let population = this.currentYearData[county].population;
						this.currentYearData[county]['totalSupply'] = totalSupply;
						this.currentYearData[county]['totalDemand'] = totalDemand;
						this.currentYearData[county]['totalSupplyPer100K'] = totalSupply / population * 100000;
						this.currentYearData[county]['totalDemandPer100K'] = totalDemand / population * 100000;
						this.supplyScore[county] = ((totalSupply / totalDemand) / 2) || 0.5;
				}
				this.updateMapType(mapData, 1000);
		});
		return promise;
	}

	mouseOut(){
		d3.select("#tooltip").transition().duration(500).style("opacity", 0);
	}

	highlightPath(name:string) {
		// d3.selectAll('path').classed('selected', false);
		this.linechart.initLineChart(this.results, Array.from(this.controller.selectedCounties));
		// should be moved it id-based paths
		d3.selectAll('svg .counties').selectAll('path')
			.filter(d => d.properties.NAME == name)
			.classed('selected', true);
	}

	unHighlightPath(name:string) {
		// d3.selectAll('path').classed('selected', false);
		this.linechart.initLineChart(this.results, Array.from(this.controller.selectedCounties));

		// this.linechart.initLineChart(this.results, name);
		// should be moved it id-based paths
		d3.selectAll('svg .counties').selectAll('path')
			.filter(d => d.properties.NAME == name)
			.classed('selected', false);
	}

	removeSpaces(s) : string{
		return s.replace(/\s/g, '');
	}

	//function found here : http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9f

	continuous(selector_id, colorscale, label, domain) {

	  var legendheight = 400,
	      legendwidth = 80,
	      margin = {top: 10, right: 60, bottom: 10, left: 2};

		d3.select(selector_id)
			.select("h2")
			.style("position", "absolute")
			.style("left", "32px")
			.html(label)

	  var canvas = d3.select(selector_id)
	    .style("height", legendwidth + "px")
	    .style("width", legendheight + "px")
	    .style("position", "absolute")
	    .append("canvas")
	    .attr("height", legendheight - margin.top - margin.bottom)
	    .attr("width", 1)
	    .style("height", (legendheight - margin.top - margin.bottom) + "px")
	    .style("width", (legendwidth - margin.left - margin.right) + "px")
	    .style("border", "1px solid #000")
	    .style("position", "absolute")
			.style('transform', 'rotate(-90deg)')
	    .style("top", (margin.top - 150) + "px")
	    .style("left", (margin.left + 211) + "px")
	    .node();

	  var ctx = canvas.getContext("2d");

	  var legendscale = d3.scaleLinear()
	    .range([1, legendheight - margin.top - margin.bottom - 1])
	    .domain(domain)
			.nice();

	  // image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
	  var image = ctx.createImageData(1, legendheight);
	  d3.range(legendheight).forEach(function(i) {
	    var c = d3.rgb(colorscale(legendscale.invert(i)));
	    image.data[4*i] = c.r;
	    image.data[4*i + 1] = c.g;
	    image.data[4*i + 2] = c.b;
	    image.data[4*i + 3] = 255;
	  });

	  ctx.putImageData(image, 0, 0);

	  // A simpler way to do the above, but possibly slower. keep in mind the legend width is stretched because the width attr of the canvas is 1
	  // See http://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
	  /*
	  d3.range(legendheight).forEach(function(i) {
	    ctx.fillStyle = colorscale(legendscale.invert(i));
	    ctx.fillRect(0,i,1,1);
	  });
	  */

	  var legendaxis = d3.axisBottom()
	    .scale(legendscale)
	    .tickSize(6)
	    .ticks(5)

		if(label == "Population")
			legendaxis = legendaxis.tickFormat(d3.formatPrefix(",.1", 1e6))
			// .tickFormat(d3.format(".1f"))


		this.svg.select(".legendAxis").remove();

	  this.svg
	    .append("g")
	    .attr("class", "axis legendAxis")
	    .attr("transform", "translate(32, 60) ")
	    .call(legendaxis);
	};

}
export{Map};
