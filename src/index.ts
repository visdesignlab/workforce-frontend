import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {initSideBar} from './sidebar';
import {initLineChart} from './linechart'
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


var currentYear;
var globalResults;
window.update = function () {
	let year = document.getElementById('year').value;
	let mapData = document.getElementById('mapData').value;
	d3.json('../data/model-results.json').then(function(results) {
		svg.selectAll('*').remove();
		globalResults = results;
		currentYear = results[year];
		for (let county in currentYear) {
			let totalSupply = d3.sum(Object.values(currentYear[county]['supply']));
			let totalDemand = d3.sum(Object.values(currentYear[county]['demand']));
			currentYear[county]['totalSupply'] = totalSupply;
			supplyScore[county] = (totalSupply / totalDemand) / 2;
		}

		if (mapData == 'supply_need') {
			var linear = d3.scaleOrdinal()
				.domain(['Undersupplied', 'Balanced', 'Oversupplied'])
				.range([d3.interpolateRdBu(0), d3.interpolateRdBu(0.5), d3.interpolateRdBu(1)]);
		} else if (mapData == 'supply_per_100k') {
			let max = d3.max(Object.values(results[year]), d => {
				return d['totalSupply'] / d['population'] * 100000;
			});

			var linear = d3.scaleLinear()
				.domain([0, max])
				.range([d3.interpolateBlues(0), d3.interpolateBlues(1)]);
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

		let colorScale = function(d) {
			let county = d.properties.NAME + ' County';
			if (mapData == 'supply_need') {
				return d3.interpolateRdBu(supplyScore[county]);
			} else if (mapData == 'supply_per_100k') {
				function getSupplyPer100k(county) {
					return county['totalSupply'] / county['population'] * 100000;
				};

				let max = d3.max(Object.values(results[year]), d => getSupplyPer100k(d))

				const scale = d3.scaleLinear()
					.domain([0, max])
					.range([0, 1]);

				return d3.interpolateBlues(scale(getSupplyPer100k(results[year][county])));
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

	return "<h4>"+d.properties.NAME+" County</h4><table>"+
		"<tr><td>Supply/Need:</td><td>"+(supplyDemandRatio)+"</td></tr>"+
		"<tr><td>Population:</td><td>"+(population)+"</td></tr>"+
		"<tr><td>Supply/100K:</td><td>"+(supplyPer100k)+"</td></tr>"+
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