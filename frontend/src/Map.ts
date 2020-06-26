import * as d3 from 'd3';
import * as fc from 'd3fc';

import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {Sidebar} from './newSidebar';
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
	controller:MapController;
	totalResults:any;
	firstMap:boolean;

	private API_URL: string = 'http://127.0.0.1:5000/api/';

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
	drawMap(modelUsed: any):Promise<void>{
			// d3.select('#spinner')
			// 	.classed('d-flex', true)

		this.modelData = modelUsed;
		const map = this.controller.prov.current().state.mapType;


		const modelFile = this.controller.serverModels[this.modelData].path;

		// const option = (document.getElementById('customModel') as HTMLInputElement).value;

		let promise;
		// if (!customModel) {
		promise = d3.json(`${this.API_URL}/${modelFile}`);
		// }
		// else {


		promise = promise.then((results)=> {


			results = results[map];
			this.results = results;


			this.svg.selectAll('*').remove();
			this.svg.append('line')
			.attr('stroke', 'black')
			.attr('stroke-width', 1)
			.attr('x1', 600)
			.attr('x2', 600)
			.attr('y1', 10)
			.attr('y2', 600);

			this.svg.append('text')
				.text((!this.firstMap && this.controller.modelRemovedComparison) ? this.controller.serverModels[this.modelData].name + "(Modified)" : this.controller.serverModels[this.modelData].name)
				.attr("x", 20)
				.attr("y", 20)
				.attr('alignment-baseline', 'middle')
				.attr("id", this.controller.comparisonMode ? (this.firstMap ? "firstTitle" : "secondTitle") : "onlyTitle")
				.style('font-size', '24')
				.style("fill", this.controller.comparisonMode ? (this.firstMap ? "#1B9E77" : "#7570B3") : "#333333")
				.classed("goodFont", true)

			this.svg.append('text')
				.text("\uf059")
				.attr("x", 20)
				.attr("y", 55)
				.attr('alignment-baseline', 'middle')
				.style('font-size', '24px')
				.classed("fontAwesome", true)
				.on("mouseover", () => {
					d3.select("#descriptionTooltip").transition().duration(200).style("opacity", .9);
					d3.select("#descriptionTooltip").html("<h2>" + this.controller.serverModels[this.modelData].author + "</h2><h2>" + this.controller.serverModels[this.modelData].description + "</h2>")
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");
				})
				.on("mouseout", () => {
					d3.select("#descriptionTooltip").transition().duration(200).style("opacity", 0);
				})

			this.currentYearData = this.results[this.controller.prov.current().state.year]
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
						if (this.controller.prov.current().state.professionsSelected[profession]) {
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
				d3.json("data/UT-49-utah-counties.json").then((us)=> {
					var topojsonFeatures = topojson.feature(us, us.objects[map]);
					var mapCenter = d3.geoCentroid(topojsonFeatures);
					// var projection = d3.geoAlbersUsa()
					// 	.scale(200)
					// 	.translate([300,300]);
					let projection = d3.geoMercator().scale(4000).translate([520/2, 600/2])
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
						.on('click', d => this.controller.updateSelectedCounty(d.properties.NAME))
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

					this.updateMapType(this.controller.prov.current().state.scaleType, 0);
				});
				this.linechart.initLineChart(this.results, this.controller.prov.current().state.countiesSelected);

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
				.range([+d3.interpolateBlues(0), +d3.interpolateBlues(1)]);
		} else if (mapData == 'demand_per_100k') {
			let max = d3.max(Object.keys(currentYearData), d => {
				return currentYearData[d]['totalDemand'] / currentYearData[d]['population'] * 100000;
			});

			return d3.scaleLinear()
				.domain([0, max])
				.range([+d3.interpolateOranges(0), +d3.interpolateOranges(1)]);
		} else {
			return d3.scaleLinear()
				.domain([1000, 1000000])
				.range([+d3.interpolateGreens(0), +d3.interpolateGreens(1)]);
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
	updateMapYear(year:string):Promise<any>{

		if(!this.firstMap && !this.controller.comparisonMode)
		{
			return Promise.resolve();
		}

		console.log(year);

		const map = this.controller.prov.current().state.scaleType;
		const modelFile = this.controller.serverModels[this.modelData].path;

		let replacementJson = undefined;

		let promise1 = d3.json('data/profReplacements.json').then((res) => {
			replacementJson = res;
		})

		let promise2 = d3.json(`${this.API_URL}${modelFile}`).then((results)=> {

			promise1.then(() => {

				if(this.firstMap)
				{
					if(this.controller.removedProfessions.size > 0 && !this.controller.modelRemovedComparison)
					{
						this.controller.createDuplicateMap()
						d3.select("#onlyTitle")
							.style("fill", "#1B9E77")
					}
					else if(this.controller.removedProfessions.size == 0 && this.controller.modelRemovedComparison)
					{
						this.controller.removeDuplicateMap();
					}
				}
				else{
					if(this.controller.modelRemovedComparison)
					{
						this.removeProfessionsFromData(this.results, replacementJson);
					}
				}


				// results = results[map];
				// this.results = results;

				// this.currentYearData = results[year]
					var professions = Object.keys(this.currentYearData['State of Utah']['supply']);
					for (let county in this.currentYearData) {
						let totalSupply = 0;
						let totalDemand = 0;
						for (let profession of professions) {
							if (this.controller.prov.current().state.professionsSelected[profession]) {
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

					this.updateMapType(this.controller.prov.current().state.scaleType, 1000);
					this.linechart.initLineChart(this.results, this.controller.prov.current().state.countiesSelected);

			})
		});
		return Promise.all([promise1, promise2]);
	}

	mouseOut(){
		d3.select("#tooltip").transition().duration(500).style("opacity", 0);
	}

	highlightAllCounties(counties: string[])
	{
		d3.selectAll('svg .counties').selectAll('path')
			.filter(d => counties.includes((d as any).properties.NAME))
			.classed('selectedCounty', true);

		d3.selectAll('.selectedCounty').filter(d => {
			return !counties.includes((d as any).properties.NAME)
		})
			.classed("selectedCounty", false)

		this.linechart.initLineChart(this.results, this.controller.prov.current().state.countiesSelected);
		this.controller.setAllHighlights();
	}

	// highlightPath(name:string) {
	// 	// d3.selectAll('path').classed('selected', false);
	// 	this.linechart.initLineChart(this.results, this.controller.prov.current().state.countiesSelected);
	// 	// should be moved it id-based paths
	// 	d3.selectAll('svg .counties').selectAll('path')
	// 		.filter(d => (d as any).properties.NAME == name)
	// 		.classed('selected', true);
	// }
	//
	// unHighlightPath(name:string) {
	// 	// d3.selectAll('path').classed('selected', false);
	// 	this.linechart.initLineChart(this.results, this.controller.prov.current().state.countiesSelected);
	//
	// 	// this.linechart.initLineChart(this.results, name);
	// 	// should be moved it id-based paths
	// 	d3.selectAll('svg .counties').selectAll('path')
	// 		.filter(d => (d as any).properties.NAME == name)
	// 		.classed('selected', false);
	// }

	removeProfessionsFromData(results, replacementJson)
	{
		let profTotalDemand = {}
		let profTotalSupply = {}

		let allCounties = this.controller.prov.current().state.countiesSelected.includes("State of Utah");

		for(let county in this.results["2019"])
		{
			if(county == "State of Utah")
			{
				continue;
			}
			if(allCounties || this.controller.prov.current().state.countiesSelected.includes(county))
			{
				for(let prof in this.results["2019"][county].demand)
				{
					profTotalSupply[prof] = profTotalSupply[prof] === undefined ? this.results["2019"][county].supply[prof] : profTotalSupply[prof] + this.results["2019"][county].supply[prof];

					profTotalDemand[prof] = profTotalDemand[prof] === undefined ? this.results["2019"][county].demand[prof] : profTotalDemand[prof] + this.results["2019"][county].demand[prof];
				}
			}
		}


		for(let year in this.results)
		{
			for(let local in this.results[year])
			{
				if(!(allCounties || this.controller.prov.current().state.countiesSelected.includes(local)))
				{
					continue;
				}

				let newDemand = this.results[year][local].demand;
				let newSupply = this.results[year][local].supply;

				for(let i of Array.from(this.controller.removedProfessions))
				{

					let redistributeDemand = newDemand[i];
					let redistributeSupply = newSupply[i];

					if(this.controller.removedMapDemand[i] !== undefined)
					{
						redistributeDemand *= (1 - (this.controller.removedMapDemand[i] / profTotalDemand[i])) ;
					}
					else{
						redistributeDemand = 0;
					}

					if(this.controller.removedMapSupply[i] !== undefined)
					{
						redistributeSupply *= (1 - (this.controller.removedMapSupply[i] / profTotalSupply[i])) ;
					}
					else{
						redistributeSupply = 0;
					}

					let redistributeList = replacementJson[i].Replacements;

					redistributeList = redistributeList.filter(d => {
						return !this.controller.removedProfessions.has(d)
					});

					newDemand[i] = this.controller.removedMapDemand[i] ? newDemand[i] - redistributeDemand : newDemand[i];

					if(!allCounties)
					{
						this.results[year]["State of Utah"].demand[i] -= redistributeDemand;
					}

					redistributeDemand /= redistributeList.length;
					for (let newProfDist of redistributeList)
					{
						newDemand[newProfDist] += redistributeDemand;
						if(!allCounties)
						{
							this.results[year]["State of Utah"].demand[newProfDist] += redistributeDemand;

						}
					}

					// let redistributeSupply = newSupply[i];
					//
					// redistributeSupply /= redistributeList.length;
					//
					// for (let newProfDist of redistributeList)
					// {
					// 	newSupply[newProfDist] += redistributeSupply;
					// }
					//
					newSupply[i] = this.controller.removedMapSupply[i] ? newSupply[i] - redistributeSupply : newSupply[i];

					if(!allCounties)
					{
						this.results[year]["State of Utah"].supply[i] -= redistributeSupply;
					}
					// newSupply[i] = 0;
				}

				this.results[year][local].demand = newDemand
				this.results[year][local].supply = newSupply
			}
		}

		this.controller.removedMapDemand = {};
		this.controller.removedMapSupply = {};
	}


	removeSpaces(s) : string{
		return s.replace(/\s/g, '');
	}

	continuous(selector_id, colorscale, label, domain) {

	  var legendheight = 200,
	      legendwidth = 76,
	      margin = {top: 10, right: 60, bottom: 10, left: 2};

		d3.select(selector_id)
			.select("h2")
			.style("position", "absolute")
			.style("left", "380px")
			.style("top", '10px')
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
	    .style("top", (margin.top - 50) + "px")
	    .style("left", (margin.left + 462) + "px")
	    .node();

	  var ctx = (canvas as any).getContext("2d");

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


	  var legendaxis = d3.axisBottom(legendscale)
	    .tickSize(3)
	    .ticks(3)

		if(label == "Population")
			legendaxis = legendaxis.tickFormat(d3.formatPrefix(",.1", 1e6))

		this.svg.select(".legendAxis").remove();

	  this.svg
	    .append("g")
	    .attr("class", "axis legendAxis")
	    .attr("transform", "translate(380, 60) ")
	    .call(legendaxis);
	};

}
export{Map};
