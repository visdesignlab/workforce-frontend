import * as d3 from 'd3';
interface Options {
  totalSupplyPer100K?: number
  totalDemandPer100K?: number
  totalSupply?: number
  totalDemand?: number
 };

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
var countiesSvg = d3.select('#counties')
	.append('svg')
	.attr('height', 1120)
	.attr('width', 600)
var countiesHeaderSvg = d3.select('#countiesHeader')
	.append('svg')
	.attr('height', 50)
	.attr('width', 600)

	var professionsSvg = d3.select('#professions')
		.append('svg')
		.attr('height', 1000)
		.attr('width', 600)

function initSideBar(currentYear, selectedCounty = 'State of Utah') {
	countiesSvg.selectAll('*').remove();
	countiesHeaderSvg.selectAll('*').remove();

	let mapData = (<HTMLInputElement>document.getElementById('mapData')).value;
	let domainMax;
	//totalSupplyDemandByCounty(currentYear);
	if (mapData.includes('100')) {
		domainMax = d3.max(Object.values(currentYear), d => Math.max(Number(d.totalSupplyPer100K), d.totalDemandPer100K));
	} else {
		domainMax = d3.max(Object.values(currentYear), d => Math.max(d.totalSupply, d.totalDemand));
	}

var headers = [{name: 'County', x: 0},
	{name: 'Supply', x: barWidth},
	{name: 'Need', x: 2 * barWidth},
	{name: 'Gap', x: 3 * barWidth}];
	totalSupplyDemandByCounty(currentYear);

var xScale = d3.scaleLinear()
	.domain([0, domainMax])
	.range([0, barWidth]);

	let countiesData = [];
	for (let county in currentYear) {
		let d = currentYear[county];
		if (mapData.includes('100')) {
			countiesData.push([county, d.totalSupplyPer100K, d.totalDemandPer100K, d.totalDemandPer100K - d.totalSupplyPer100K]);
		} else {
			countiesData.push([county, d.totalSupply, d.totalDemand, d.totalDemand - d.totalSupply]);
		}
	};
	var sortingFunction = getSortingOptions(0, true);

	var groups = countiesSvg.append('g')
		.selectAll('g')
		.data(countiesData.sort(sortingFunction))
		.enter()
		.append('g')
		.attr('transform', (d, i) => `translate(0, ${i * barHeight})`);

	groups.append('rect')
		.attr('width', 4 * barWidth)
		.attr('height', barHeight)
		.attr('fill', (d) => d[0] == selectedCounty ? '#cccccc' : 'none')

	var groupsHeaders = countiesHeaderSvg
		.append('g')
		.attr('id', 'sortCounties')
		.selectAll('g')
		.data(headers)
		.enter()
		.append('g')

	groupsHeaders.call(drawHeaders);
	var axis = countiesHeaderSvg.append('g');

	var xAxis = g => g
		.attr("transform", `translate(${3*barWidth},${45})`)
		.call(d3.axisTop(xScale).ticks(4).tickSize(1.5).tickFormat(d3.format(".1s")))
	axis.call(xAxis);

	groups.call(drawText);
	groups.call(drawText, 1,  50+barWidth);
	groups.call(drawText, 2,  2 * barWidth);
	if (mapData.includes('100')) {
		groups.call(draw1DScatterPlot, xScale, 3*barWidth, 1, 2, d3.interpolatePuOr(0), d3.interpolatePuOr(1));
	} else {
		groups.call(draw1DScatterPlot, xScale, 3 * barWidth, 1, 2);
	}
	var countiesSortDirection = [true];

	d3.select('#sortCounties')
		.selectAll('g')
		.on('click', (d, i) => {
			countiesSortDirection[i] = !countiesSortDirection[i];
			const sortingFunction = getSortingOptions(i, countiesSortDirection[i]);

			groups.sort(sortingFunction)
				.transition()
				.delay(function(d, i) {
					return i * 50;
				})
				.duration(1000)
				.attr("transform", function(d, i) {
					let y = i * barHeight;
					return "translate(" + 0 + ", " + y + ")";
				});
		});


	currentYear[selectedCounty].totalSupply = 0;
	currentYear[selectedCounty].totalDemand = 0;

	professionsSvg.selectAll('*').remove();
	var professions = Object.keys(currentYear[selectedCounty]['supply']);
	var population = currentYear[selectedCounty]['population'];

	var stats = {}
		for (let prof of professions) {
			stats[prof] = {totalSupply: 0, totalDemand: 0};
		}

	//for (let county in currentYear) {
		const f = d3.format('.0f');
		for (let prof of professions) {
			stats[prof].totalSupply += currentYear[selectedCounty]['supply'][prof];
			stats[prof].totalDemand += currentYear[selectedCounty]['demand'][prof];
			stats[prof].totalSupplyPer100K = Number(f(stats[prof].totalSupply / population * 100000));
			stats[prof].totalDemandPer100K = Number(f(stats[prof].totalDemand / population * 100000));
		}
	//}

	var data = Object.values(stats).map(d => {
		if (mapData.includes('100')) {
		return [(<Options>d).totalSupplyPer100K, (<Options>d).totalDemandPer100K, (<Options>d).totalDemandPer100K - (<Options>d).totalSupplyPer100K];
		} else {
		return [(<Options>d).totalSupply, (<Options>d).totalDemand, (<Options>d).totalDemand- (<Options>d).totalSupply];
		}
	});

	var xScale = d3.scaleLinear()
		.domain([0, d3.max(data, (d) => d3.max(d))])
		.range([0, barWidth])

	var professionsData = [];

	for (let i in data) {
			professionsData.push([professions[i], ...data[i]]);
	};

	sortingFunction = getSortingOptions(0, true);

	var professionsGroups = professionsSvg.append('g')
		.selectAll('g')
		.data(professionsData.sort(sortingFunction))
		.enter()
		.append('g')
		.attr('transform', (d, i) => `translate(0, ${i * barHeight + 1.4 * barHeight })`);

	professionsGroups.append('rect')
		.attr('width', 4 * barWidth)
		.attr('height', barHeight - 4)
		.attr('fill', (d) => {
			if (!window.selectedProfessions.hasOwnProperty(d[0])
				|| window.selectedProfessions[d[0]]) {
				return '#cccccc';
			}
			return '#ffffff';
		})
		.attr('fill-opacity', 0.8)


	professionsGroups.on('click', function(d, i ,j) {
		if (!window.selectedProfessions.hasOwnProperty(d[0])
			|| window.selectedProfessions[d[0]]) {
			window.selectedProfessions[d[0]] = false;
			d3.select(this)
				.select('rect')
				.attr('fill', '#ffffff');
		} else {
			window.selectedProfessions[d[0]] = true;
			d3.select(this)
				.select('rect')
				.attr('fill', '#cccccc');
		}
		window.update();
	})


	var professionsHeaders = professionsSvg
		.append('g')
		.attr('id', 'sortProfessions')
		.selectAll('g')
		.data(headers)
		.enter()
		.append('g')

	headers[0].name = 'Profession';
	professionsHeaders.call(drawHeaders);
	var axis = professionsSvg.append('g');

	var xAxis = g => g
		.attr("transform", `translate(${3*barWidth},${42})`)
		.call(d3.axisTop(xScale).ticks(4).tickSize(1.5).tickFormat(d3.format(".1s")))
	axis.call(xAxis);

	professionsGroups.call(drawText);

	professionsGroups.call(drawText, 1,  barWidth);
	professionsGroups.call(drawText, 2,  2 * barWidth);
	if (mapData.includes('100')) {
		professionsGroups.call(draw1DScatterPlot, xScale, 3*barWidth, 1, 2, d3.interpolatePuOr(0), d3.interpolatePuOr(1));
	} else {
		professionsGroups.call(draw1DScatterPlot, xScale, 3 * barWidth, 1, 2);
	}
	var professionsSortDirection = [true];
	d3.select('#sortProfessions')
		.selectAll('g')
		.on('click', (d, i) => {
			professionsSortDirection[i] = !professionsSortDirection[i];
			const sortingFunction = getSortingOptions(i, professionsSortDirection[i]);

			professionsGroups.sort(sortingFunction)
				.transition()
				.delay(function(d, i) {
					return i * 50;
				})
				.duration(1000)
				.attr("transform", function(d, i) {
					let y = i * barHeight + 1.4 * barHeight;
					return "translate(" + 0 + ", " + y + ")";
				});
		});
}

function totalSupplyDemandByCounty(currentYear) {
	var professions = Object.keys(currentYear['State of Utah']['supply']);
	for (let county in currentYear) {
		let totalSupply = d3.sum(Object.keys(currentYear[county]['supply']).map(d=>currentYear[county]['supply'][d]));
		let totalDemand = d3.sum(Object.keys(currentYear[county]['demand']).map(d=>currentYear[county]['demand'][d]));
		currentYear[county]['totalSupply'] = totalSupply;
		currentYear[county]['totalDemand'] = totalDemand;
	}
}

const barHeight = 30;
const barWidth = 120;

function drawText(selection, i = 0, dx = 0, dy = 0) {
	var groups = selection.append('g');

	const f = d3.format('.0f');

	groups
		.append('text')
		.attr('y', (d, i) => 0 * barHeight + barHeight / 2 + 5 + dy)
		.attr('x', dx)
		.text(d => isNaN(d[i]) ? d[i] : f(d[i]));
}

function drawHeaders(groups, i = 0, dx = 0, dy = 0) {
	groups
		.append('rect')
		.attr('height', barHeight)
		.attr('width', barWidth)
		.attr('x', (d, i) => d.x)
		.attr('fill', '#aabbcc')

	groups
		.append('text')
		.attr('font-weight', 'bold')
		.attr('y', (d, i) => 0 * barHeight + barHeight / 2 + 5 + dy)
		.attr('x', (d, i) => d.x)
		.text(d => d.name);
}

function drawStackedBar(svg, data, xScale) {
	xScale = function(d) {
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

function draw1DScatterPlot(svg, xScale, x = 0, i = 0, j = 1, iColor = '#086fad', jColor = '#c7001e') {
	const radius = 6;

	var xAxis = g => g
		.attr("transform", `translate(${barWidth},${20})`)
		.call(d3.axisTop(xScale).ticks(4).tickSize(1.5).tickFormat(d3.format(".1s")))

	//svg.append('g')
	//	.call(xAxis)
	var groups = svg.append('g');
	groups
		.append('line')
		.attr('stroke', '#000000')
		.attr('x1', x)
		.attr('x2', x + barWidth)
		.attr('y1', (d, i) => 0 * barHeight + barHeight / 2)
		.attr('y2', (d, i) => 0 * barHeight + barHeight / 2)

	groups
		.append('rect')
		.attr('height', 6)
		.attr('width', d => Math.abs(xScale(d[i]) - xScale(d[j])))
		.attr('x', d => {return x + xScale(d3.min([d[i], d[j]]))})
		.attr('y', (d, i) => 0 * barHeight + barHeight / 2 - radius / 2)
		.attr('fill', d => d[i] > d[j] ? iColor : jColor);

	groups
		.append('circle')
		.attr('r', 6)
		.attr('stroke', iColor)
		.attr('fill', iColor)
		.attr('cx', d => x + xScale(d[i]))
		.attr('cy', (d, i) => 0 * barHeight + barHeight / 2)
		.append('title')
		.text(d => d[i])

	groups
		.append('circle')
		.attr('r', 6)
		.attr('stroke', jColor)
		.attr('fill', jColor)
		.attr('cx', d => x + xScale(d[j]))
		.attr('cy', (d, i) => 0 * barHeight + barHeight / 2)
		.append('title')
		.text(d => d[j])
}
export {initSideBar};
