import * as d3 from 'd3';
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

	/**
	 *
	 */
	constructor(controller){
		this.controller = controller;
		this.linechart = new Linechart(controller)
		this.currentYearData = {};
		this.supplyScore = {};
		this.svg = d3.select("#map")
			.append('svg')
			.attr('width', 600)
			.attr('height', 600)
			.attr('transform', 'translate(0,0)');
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
		const modelFile = this.modelData == 'model1' ? 'model-results.json' : 'model2-results.json';
		const serverUrl = 'http://mothra.sci.utah.edu:5000/restful';
		// const option = (document.getElementById('customModel') as HTMLInputElement).value;
		// let request = {
		// 	method:"POST",
		// 	mode: "cors",
		// 	body: JSON.stringify({
		// 		"geo": selectedCounties[0],
		// 		"year": yearSelected,
		// 		"option": option,
		// 		"sub_option":"all_combination",
		// 		"wage_max":"0",
		// 		"wage_weight":"0"
		// 	}),
		// 	headers: {
		// 		"Content-type": "application/json; charset=UTF-8"
		// 	}
		// };
		let promise;
		// if (!customModel) {
			promise = d3.json(`../data/${modelFile}`);
		// }
		// else {
		// 	promise = d3.json(serverUrl, request);
		// }



		promise = promise.then((results)=> {
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

			this.svg.append('text')
				.text(this.modelData == 'model1' ? 'Model 1' : 'Model 2')
				.attr("x", 500)
				.attr("y", 30)
				.attr('alignment-baseline', 'middle')
				.style('font-weight', 'bold')
				.style('font-size', '24px')

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


				var legendLinear = legendColor()
					.shapeWidth(115)
					.labelFormat(d3.format(".0f"))
					.orient('horizontal')
					.scale(linear);

				this.svg.append("g")
					.attr("class", "legendLinear")
					.attr("transform", "translate(20,20)");
				this.svg.select(".legendLinear")
					.call(legendLinear);
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
		} else if (mapData == 'supply_per_100k') {


			let max = d3.max(Object.keys(that.currentYearData).map( d =>
				that.currentYearData[d]['totalSupply'] / that.currentYearData[d]['population'] * 100000
			));

			const scale = d3.scaleLinear()
				.domain([0, max])
				.range([0, 1]);

			return d3.interpolatePurples(scale(that.currentYearData[county]['totalSupply']/that.currentYearData[county]['population']*100000));
		} else if (mapData == 'demand_per_100k') {

			let max = d3.max(Object.keys(that.currentYearData), d => that.currentYearData[d]['totalDemand']/that.currentYearData[d]['population']*100000)

			const scale = d3.scaleLinear()
				.domain([0, max])
				.range([0, 1]);

			return d3.interpolateOranges(scale(that.currentYearData[county]['totalDemand']/that.currentYearData[county]['population']*100000));
		}else{
			return d3.interpolateGreens(that.currentYearData[county]['population'] / 1000000);
		}
	};
	/**
	 * this updates the map when the user selects a new type of map
	 * @param mapData this the selection of the new map type
	 */
	updateMapType(mapData:string, duration:number):void{
		let that:any = this;
		let colorScale:any = this.myColorScale;
		let linear:any =this.getLinear(mapData, this.currentYearData)
		var legendLinear:any = legendColor()
					.shapeWidth(115)
					.labelFormat(d3.format(".0f"))
					.orient('horizontal')
					.scale(linear);

		console.log(mapData);
		// console.log(colorScale);

		d3.selectAll('g.legendLinear').call(legendLinear)
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
		const modelFile = this.modelData == 'model1' ? 'model-results.json' : 'model2-results.json';
		let promise = d3.json(`../data/${modelFile}`).then((results)=> {
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

}
export{Map};
