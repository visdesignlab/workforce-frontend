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

	let countiesData = [];
	for (let county in currentYear) {
		let d = currentYear[county];
		countiesData.push([county, d.totalSupply, d.totalDemand, d.totalDemand - d.totalSupply]);
	};

	var groups = countiesSvg.append('g')
		.selectAll('g')
		.data(countiesData)
		.enter()
		.append('g')
		.attr('transform', (d, i) => `translate(0, ${i * barHeight + barHeight / 2})`);

	groups.append('rect')
		.attr('width', 2 * barWidth)
		.attr('height', barHeight)
		.attr('fill', (d) => d[0] == selectedCounty ? '#cccccc' : 'none')

	groups.call(drawText);
	groups.call(draw1DScatterPlot, xScale, barWidth, 1, 2);

	d3.select('#countiesSortButton')
		.on('click', () => {
			const sortingFunction = getSortingOptions('countiesSortBy',
				'countiesSortDirection');

			groups.sort(sortingFunction)
				.transition()
				.delay(function(d, i) {
					return i * 50;
				})
				.duration(1000)
				.attr("transform", function(d, i) {
					let y = i * barHeight + barHeight / 2;
					return "translate(" + 0 + ", " + y + ")";
				});
		});


	currentYear[selectedCounty].totalSupply = 0;
	currentYear[selectedCounty].totalDemand = 0;

	professionsSvg.selectAll('*').remove();
	var professions = Object.keys(currentYear[selectedCounty]['supply']);

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

	var data = Object.values(stats).map(d => [d.totalSupply, d.totalDemand, d.totalDemand - d.totalSupply]);
	var xScale = d3.scaleLinear()
		.domain([0, d3.max(data, (d) => d3.max(d))])
		.range([0, barWidth])

	var professionsData = [];

	for (let i in data) {
		professionsData.push([professions[i], ...data[i]]);
	};

	var professionsGroups = professionsSvg.append('g')
		.selectAll('g')
		.data(professionsData)
		.enter()
		.append('g')
		.attr('transform', (d, i) => `translate(0, ${i * barHeight + barHeight / 2})`);

	professionsGroups.call(drawText);
	professionsGroups.call(draw1DScatterPlot, xScale, barWidth, 1, 2);
	d3.select('#professionsSortButton')
		.on('click', () => {
			const sortingFunction = getSortingOptions('professionsSortBy',
				'professionsSortDirection');

			professionsGroups.sort(sortingFunction)
				.transition()
				.delay(function(d, i) {
					return i * 50;
				})
				.duration(1000)
				.attr("transform", function(d, i) {
					let y = i * barHeight + barHeight / 2;
					return "translate(" + 0 + ", " + y + ")";
				});
		});
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

function drawText(selection, i = 0, dy = 0) {
		var groups = selection.append('g');
		
		groups
		.append('text')
		.attr('y', (d, i) => 0 * barHeight + barHeight / 2 + 5 + dy)
		.text(d => d[i]);
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

function draw1DScatterPlot(svg, xScale, x = 0, i = 0, j = 1) {
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
		.attr('fill', d => d[i] > d[j] ? '#086fad' : '#c7001e');

	groups
		.append('circle')
		.attr('r', 6)
		.attr('stroke', '#086fad')
		.attr('fill', '#086fad')
		.attr('cx', d => x + xScale(d[i]))
		.attr('cy', (d, i) => 0 * barHeight + barHeight / 2)
		.append('title')
		.text(d => d[i])

	groups
		.append('circle')
		.attr('r', 6)
		.attr('stroke', '#c7001e')
		.attr('fill', '#c7001e')
		.attr('cx', d => x + xScale(d[j]))
		.attr('cy', (d, i) => 0 * barHeight + barHeight / 2)
		.append('title')
		.text(d => d[j])
}
