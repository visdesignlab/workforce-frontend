import * as d3 from 'd3';
var data = {dates: {}, series: {}};
var width = 200;
var height = 200
var margin = {top: 20, right: 20, bottom: 40, left: 40};
var lineChartSvg = d3.select('#linechart').append("svg").attr("width", 800).attr('height', 800);
function initLineChart(results, selectedCounty = 'State of Utah') {
	lineChartSvg.selectAll('*').remove();
	var supply = [];
	var demand = [];
	var supply_demand = [];

	var professions = Object.keys(results[2019]['State of Utah']['supply']);
	var max = 1;
	for (let k in professions) {
		supply = [];
		demand = [];
		let profession = professions[k];

		for (let i of Object.keys(results)) {
			supply.push(results[i][selectedCounty]['supply'][profession]);
		}

		for (let i of Object.keys(results)) {
			demand.push(results[i][selectedCounty]['demand'][profession]);
		}
		supply_demand.push([supply, demand, profession]);

		max = d3.max([d3.max(demand), d3.max(supply), max])

	}

	for (let i in supply_demand) {
		createLineChart(results, supply_demand[i][0], supply_demand[i][1], supply_demand[i][2], max, +i % 4, Math.floor(+i / 4));
	}
}

function createLineChart(results, supply, demand, profession, max, xi = 0, yi = 0) {
	data.dates = Object.keys(results);
	data.series = demand;

	var x = d3.scaleLinear()
		.domain(d3.extent(data.dates))
		.range([margin.left, width - margin.right])

	var y = d3.scaleLinear()
		.domain([0, d3.max([max, d3.max(demand), d3.max(supply)])]).nice()
		.range([height - margin.bottom, margin.top])

	var xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).ticks(4).tickSize(1.5).tickFormat(d3.format(".0f")))

	var yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y).tickSize(1.5).tickFormat(d3.format(".2s")))

	var line = d3.line()
		.x((d, i) => x(data.dates[i]))
		.y(d => y(d))



	var lineChartGroup = lineChartSvg.append('g')
		.attr('transform', `translate(${xi * width}, ${yi * height})`);

	lineChartGroup.append('text')
		.attr("x", (width / 2))
        .attr("y", (margin.top))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(profession);

	data.dates = Object.keys(results);
	data.series = supply;
	lineChartGroup.append("g")
		.call(xAxis);

	lineChartGroup.append("g")
		.call(yAxis);

	const chartgroup = lineChartGroup.append("g")
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")

	chartgroup
		.append("path")
		.datum(data.series)
		.attr("stroke", "#086fad")
		.style("mix-blend-mode", "multiply")
		.attr("d", d => line(d));

	data.series = demand;
	chartgroup
		.append("path")
		.attr("stroke-dasharray", ("3, 3"))
		.datum(data.series)
		.attr("stroke", "#c7001e")
		.style("mix-blend-mode", "multiply")
		.attr("d", d => line(d));
}
export {initLineChart};
