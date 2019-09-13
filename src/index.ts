import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {initSideBar} from './sidebar';
import {initLineChart} from './linechart'
declare global {
	interface Window {
		selectedCounty: string;
		update: any;
		selectedProfessions: any;
	}
}
window.selectedCounty = 'State of Utah';
var  supplyScore = {};
var svg = d3.select("#map")
	.append('svg')
	.attr('width', 600)
	.attr('height', 600);

var linear = d3.scaleOrdinal()
	.domain(['Undersupplied', 'Balanced', 'Oversupplied'])
	.range([d3.interpolateRdBu(0), d3.interpolateRdBu(0.5), d3.interpolateRdBu(1)]);

var legendLinear = legendColor()
	.shapeWidth(120)
	.orient('horizontal')
	.scale(linear);

var projection = d3.geoAlbersUsa()
	.scale(200)
	.translate(300,300);
//projection = d3.geoAlbersUsa().scale([5240]).translate([1280, 430])
projection = d3.geoMercator().scale(4000).translate([600/2, 600/2])
var path = d3.geoPath(projection);

function getSortingOptions(index, ascending) {

	if (ascending) {
		const sortingFunction = function(a, b) {
			return d3.ascending(a[index], b[index]);
		}
		return sortingFunction;
	} else {
		const sortingFunction = function(a, b) {
			return d3.descending(a[index], b[index]);
		}
		return sortingFunction;
	}
}

var currentYear;
var globalResults;
window.selectedProfessions = {};
window.update = function() {
	let year = (document.getElementById('year') as HTMLInputElement).value;
	let mapData = (document.getElementById('mapData') as HTMLInputElement).value;
	d3.json('../data/model-results.json').then(function(results) {
		svg.selectAll('*').remove();
		globalResults = results;
		currentYear = results[year];
		var professions = Object.keys(currentYear['State of Utah']['supply']);
		for (let county in currentYear) {
			let totalSupply = 0;
			let totalDemand = 0;
			for (let profession of professions) {
				if (!window.selectedProfessions.hasOwnProperty(profession)
					|| window.selectedProfessions[profession]) {
					totalSupply += currentYear[county]['supply'][profession];
					totalDemand += currentYear[county]['demand'][profession];
				}
			}
			let population = currentYear[county].population;
			currentYear[county]['totalSupply'] = totalSupply;
			currentYear[county]['totalDemand'] = totalDemand;
			currentYear[county]['totalSupplyPer100K'] = totalSupply / population * 100000;
			currentYear[county]['totalDemandPer100K'] = totalDemand / population * 100000;
			supplyScore[county] = (totalSupply / totalDemand) / 2;
		}

		if (mapData == 'supply_need') {
			var linear = d3.scaleOrdinal()
				.domain(['Undersupplied', 'Balanced', 'Oversupplied'])
				.range([d3.interpolateRdBu(0), d3.interpolateRdBu(0.5), d3.interpolateRdBu(1)]);
		} else if (mapData == 'supply_need_per_100K') {
			var linear = d3.scaleOrdinal()
				.domain(['Undersupplied', 'Balanced', 'Oversupplied'])
				.range([d3.interpolatePuOr(1), d3.interpolatePuOr(0.5), d3.interpolatePuOr(0)]);
		} else if (mapData == 'supply_per_100k') {
			let max = d3.max(Object.keys(results[year]).map( d => 
				results[year][d]['totalSupply'] / results[year][d]['population'] * 100000
			));

			var linear = d3.scaleLinear()
				.domain([0, max])
				.range([d3.interpolatePurples(0), d3.interpolatePurples(1)]);
		} else if (mapData == 'demand_per_100k') {
			let max = d3.max(Object.values(results[year]), d => {
				return d['totalDemand'] / d['population'] * 100000;
			});

			var linear = d3.scaleLinear()
				.domain([0, max])
				.range([d3.interpolateOranges(0), d3.interpolateOranges(1)]);
		} else {
			var linear = d3.scaleLinear()
				.domain([1000, 1000000])
				.range([d3.interpolateGreens(0), d3.interpolateGreens(1)]);
		}

		var legendLinear = legendColor()
			.shapeWidth(115)
			.labelFormat(d3.format(".0f"))
			.orient('horizontal')
			.scale(linear);

		svg.append("g")
			.attr("class", "legendLinear")
			.attr("transform", "translate(20,20)");
		svg.select(".legendLinear")
			.call(legendLinear);
		function getSupplyPer100k(county) {
			return county['totalSupply'] / county['population'] * 100000;
		};
		let colorScale = function(d) {
			let county = d.properties.NAME + ' County';
			if (mapData == 'supply_need') {
				return d3.interpolateRdBu(supplyScore[county]);
			} else if (mapData == 'supply_need_per_100K') {
				return d3.interpolatePuOr(1 - supplyScore[county]);
			} else if (mapData == 'supply_per_100k') {
				

				let max = d3.max(Object.keys(results[year]).map( d => 
					results[year][d]['totalSupply'] / results[year][d]['population'] * 100000
				));
	
				const scale = d3.scaleLinear()
					.domain([0, max])
					.range([0, 1]);

				return d3.interpolatePurples(scale(getSupplyPer100k(results[year][county])));
			} else if (mapData == 'demand_per_100k') {
				function getDemandPer100k(county) {
					return county['totalDemand'] / county['population'] * 100000;
				};

				let max = d3.max(Object.values(results[year]), d => getDemandPer100k(d))

				const scale = d3.scaleLinear()
					.domain([0, max])
					.range([0, 1]);

				return d3.interpolateOranges(scale(getDemandPer100k(results[year][county])));
			}
			return d3.interpolateGreens(results[year][county]['population'] / 1000000);
		}


		d3.json("../data/UT-49-utah-counties.json").then(function(us) {
			var topojsonFeatures = topojson.feature(us, us.objects.cb_2015_utah_county_20m);
			var mapCenter = d3.geoCentroid(topojsonFeatures);
			projection.center(mapCenter);
			var path = d3.geoPath(projection);

			svg.append("g")
				.attr("class", "counties")
				.attr("transform", "translate(20,40)")
				.selectAll("path")
				.data(topojson.feature(us, us.objects.cb_2015_utah_county_20m).features)
				.enter().append("path")
				.attr("d", path)
				.attr('fill', colorScale)
				.attr('stroke', 'black')
				.on('click', function(d) {
					d3.selectAll('path').classed('selected', false);
					d3.select(this).classed('selected', true);
					window.selectedCounty = d.properties.NAME + ' County';
					initLineChart(results, window.selectedCounty);
					initSideBar(currentYear, window.selectedCounty);
				}) 
				.on("mouseover", mouseOver).on("mouseout", mouseOut);

			svg.append("path")
				.attr("class", "county-borders")
				.attr("transform", "translate(20,40)")
				.attr("d", path(topojson.mesh(us, us.objects.cb_2015_utah_county_20m, function(a, b) { return a !== b; })));


			initSideBar(currentYear);
			initLineChart(results);
		});
	});
};
function toolTip(d){
	var f = d3.format(".2f");
	const supplyDemandRatio = f(2 *supplyScore[d.properties.NAME + ' County']);
	const population = currentYear[d.properties.NAME + ' County']['population'];
	const supplyPer100k = d3.format('.0f')(
		currentYear[d.properties.NAME + ' County']['totalSupply'] / population * 100000);
	const demandPer100k = d3.format('.0f')(
		currentYear[d.properties.NAME + ' County']['totalDemand'] / population * 100000);

	return "<h4>"+d.properties.NAME+" County</h4><table>"+
		"<tr><td>Supply/Need:</td><td>"+(supplyDemandRatio)+"</td></tr>"+
		"<tr><td>Population:</td><td>"+(population)+"</td></tr>"+
		"<tr><td>Supply/100K:</td><td>"+(supplyPer100k)+"</td></tr>"+
		"<tr><td>Demand/100K:</td><td>"+(demandPer100k)+"</td></tr>"+
		"</table>";
}
function mouseOver(d){
	d3.select("#tooltip").transition().duration(200).style("opacity", .9);      

	d3.select("#tooltip").html(toolTip(d))  
		.style("left", (d3.event.pageX) + "px")     
		.style("top", (d3.event.pageY - 28) + "px");
}

function mouseOut(){
	d3.select("#tooltip").transition().duration(500).style("opacity", 0);      
}
