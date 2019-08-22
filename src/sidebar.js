var countiesSvg = d3.select('#counties')
	.append('svg')
	.attr('height', 1120)
	var professionsSvg = d3.select('#professions')
		.append('svg')
		.attr('height', 1000)
function initSideBar(currentYear, selectedCounty = 'State of Utah') {
	countiesSvg.selectAll('*').remove();

	totalSupplyDemandByCounty(currentYear);
	const domainMax = d3.max(Object.values(currentYear), d => Math.max(d.totalSupply, d.totalDemand));

var xScale = d3.scaleLinear()
	.domain([0, domainMax])
	.range([0, barWidth]);

	drawText(countiesSvg, Object.keys(currentYear), 20);
	draw1DScatterPlot(countiesSvg, Object.values(currentYear).map(d => [d.totalSupply, d.totalDemand]), xScale);


	currentYear[selectedCounty].totalSupply = 0;
	currentYear[selectedCounty].totalDemand = 0;

	professionsSvg.selectAll('*').remove();
	var professions = Object.keys(currentYear[selectedCounty]['supply']);
	drawText(professionsSvg, professions, 20);


	var stats = {}
		for (let prof of professions) {
			stats[prof] = {totalSupply: 0, totalDemand: 0};
		}

	//for (let county in currentYear) {
		for (let prof of professions) {
			stats[prof].totalSupply += currentYear[selectedCounty]['supply'][prof];
			stats[prof].totalDemand += currentYear[selectedCounty]['demand'][prof];
		}
	//}

	var data = Object.values(stats).map(d => [d.totalSupply, d.totalDemand]);
	var xScale = d3.scaleLinear()
		.domain([0, d3.max(data, (d) => d3.max(d))])
		.range([0, barWidth])

	draw1DScatterPlot(professionsSvg, data, xScale);
}

function totalSupplyDemandByCounty(currentYear) {
	for (let county in currentYear) {
		let totalSupply = d3.sum(Object.values(currentYear[county]['supply']));
		let totalDemand = d3.sum(Object.values(currentYear[county]['demand']));
		currentYear[county]['totalSupply'] = totalSupply;
		currentYear[county]['totalDemand'] = totalDemand;
	}
}

const barHeight = 30;
const barWidth = 120;


function drawText(svg, data, dy = 0) {
	svg.append('g')
		.selectAll('rect')
		.data(data)
		.enter()
		.append('text')
		.attr('y', (d, i) => i * barHeight + barHeight / 2 + 5 + dy)
		.text(d => d);
}

function drawStackedBar(svg, data, xScale) {
	var xScale = function(d) {
		return barWidth * d[0] / (d[0] + d[1]) || 0;
	}
	var groups = svg.append('g')
		.selectAll('g')
		.data(data)
		.enter()
		.append('g');

	groups
		.append('rect')
		.attr('width', d => xScale(d))
		.attr('height', barHeight - 4)
		.attr('x', barWidth)
		.attr('y', (d, i) => i * barHeight - 2)
		.attr('fill', '#086fad')
		.append('title')
		.text(d => d[0])

	groups
		.append('rect')
		.attr('width', d => barWidth - xScale(d))
		.attr('height', barHeight - 4)
		.attr('x', d => barWidth + xScale(d))
		.attr('y', (d, i) => i * barHeight - 2)
		.attr('fill', '#c7001e')
		.append('title')
		.text(d => d[1])
}

function draw1DScatterPlot(svg, data, xScale) {
	const radius = 6;

	var groups = svg.append('g')
		.selectAll('g')
		.data(data)
		.enter()
		.append('g')
		.attr('transform', `translate(${barWidth}, 20)`)

	var xAxis = g => g
		.attr("transform", `translate(${barWidth},${20})`)
		.call(d3.axisTop(xScale).ticks(4).tickSize(1.5).tickFormat(d3.format(".1s")))

	svg.append('g')
		.call(xAxis)
	groups
		.append('line')
		.attr('stroke', '#000000')
		.attr('x1', 0)
		.attr('x2', barWidth)
		.attr('y1', (d, i) => i * barHeight + barHeight / 2)
		.attr('y2', (d, i) => i * barHeight + barHeight / 2)

	groups
		.append('rect')
		.attr('height', 6)
		.attr('width', d => Math.abs(xScale(d[0]) - xScale(d[1])))
		.attr('x', d => xScale(d3.min(d)))
		.attr('y', (d, i) => i * barHeight + barHeight / 2 - radius / 2)
		.attr('fill', d => d[0] > d[1] ? '#086fad' : '#c7001e');

	groups
		.append('circle')
		.attr('r', 6)
		.attr('stroke', '#086fad')
		.attr('fill', '#086fad')
		.attr('cx', d => xScale(d[0]))
		.attr('cy', (d, i) => i * barHeight + barHeight / 2)
		.append('title')
		.text(d => d[0])

	groups
		.append('circle')
		.attr('r', 6)
		.attr('stroke', '#c7001e')
		.attr('fill', '#c7001e')
		.attr('cx', d => xScale(d[1]))
		.attr('cy', (d, i) => i * barHeight + barHeight / 2)
		.append('title')
		.text(d => d[1])
}
