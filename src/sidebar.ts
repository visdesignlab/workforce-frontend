import * as d3 from 'd3';
class Sidebar {
	countiesSvg: any;
	professionsSvg: any;
	selectedProfessions: any;

	constructor(selectedProfessions: any) {
		this.selectedProfessions = selectedProfessions;
		this.countiesSvg = d3.select('#counties')
			.append('svg')
			.attr('height', 1120)
		this.professionsSvg = d3.select('#professions')
			.append('svg')
			.attr('height', 1000)
	}

	updateSideBarSelections(selectedProfessions) {

	}

	changeSelectedCounty(selectedCounty) {

	}
	initSideBar(currentYear, selectedCounty = 'State of Utah') {
		this.countiesSvg.selectAll('*').remove();
		let barWidth: number = 120;
		let barHeight: number = 30;
		this.totalSupplyDemandByCounty(currentYear);
		const domainMax = d3.max(Object.keys(currentYear), d => Math.max(currentYear[d].totalSupply, currentYear[d].totalDemand));

		var xScale = d3.scaleLinear()
			.domain([0, domainMax])
			.range([0, barWidth]);

		let countiesData = [];
		for (let county in currentYear) {
			let d = currentYear[county];
			countiesData.push([county, d.totalSupply, d.totalDemand, d.totalDemand - d.totalSupply]);
		};
		var sortingFunction = this.getSortingOptions('countiesSortBy',
			'countiesSortDirection');

		var groups = this.countiesSvg.append('g')
			.selectAll('g')
			.data(countiesData.sort(sortingFunction))
			.enter()
			.append('g')
			.attr('transform', (d, i) => `translate(0, ${i * barHeight + barHeight / 2})`);

		groups.append('rect')
			.attr('width', 2 * barWidth)
			.attr('height', barHeight)
			.attr('fill', (d) => d[0] == selectedCounty ? '#cccccc' : 'none')

		groups.call(this.drawText);
		groups.call(this.draw1DScatterPlot, xScale, barWidth, 1, 2);

		d3.select('#countiesSortBy')
			.on('change', () => {
				const sortingFunction = this.getSortingOptions('countiesSortBy',
					'countiesSortDirection');

				groups.sort(sortingFunction)
					.transition()
					.delay(function (d, i) {
						return i * 50;
					})
					.duration(1000)
					.attr("transform", function (d, i) {
						let y = i * barHeight + barHeight / 2;
						return "translate(" + 0 + ", " + y + ")";
					});
			});
		d3.select('#countiesSortDirection')
			.on('change', () => {
				const sortingFunction = this.getSortingOptions('countiesSortBy',
					'countiesSortDirection');

				groups.sort(sortingFunction)
					.transition()
					.delay(function (d, i) {
						return i * 50;
					})
					.duration(1000)
					.attr("transform", function (d, i) {
						let y = i * barHeight + barHeight / 2;
						return "translate(" + 0 + ", " + y + ")";
					});
			});
	

		currentYear[selectedCounty].totalSupply = 0;
		currentYear[selectedCounty].totalDemand = 0;

		this.professionsSvg.selectAll('*').remove();
		var professions = Object.keys(currentYear[selectedCounty]['supply']);

		var stats = {}
		for (let prof of professions) {
			stats[prof] = { totalSupply: 0, totalDemand: 0 };
		}

		//for (let county in currentYear) {
		for (let prof of professions) {
			stats[prof].totalSupply += currentYear[selectedCounty]['supply'][prof];
			stats[prof].totalDemand += currentYear[selectedCounty]['demand'][prof];
		}
		//}

		var data = Object.keys(stats).map(d => [stats[d].totalSupply, stats[d].totalDemand, stats[d].totalDemand - stats[d].totalSupply]);
		var xScale = d3.scaleLinear()
			.domain([0, d3.max(data, (d) => d3.max(d))])
			.range([0, barWidth])

		var professionsData = [];

		for (let i in data) {
			professionsData.push([professions[i], ...data[i]]);
		};

		sortingFunction = this.getSortingOptions('professionsSortBy',
			'professionsSortDirection');

		var professionsGroups = this.professionsSvg.append('g')
			.selectAll('g')
			.data(professionsData.sort(sortingFunction))
			.enter()
			.append('g')
			.attr('transform', (d, i) => `translate(0, ${i * barHeight + barHeight / 2})`)
			.attr('id', (d) => d[0]);

		professionsGroups.append('rect')
			.attr('width', 2 * barWidth)
			.attr('height', barHeight - 4)
			.attr('fill', (d) => {
				if (!this.selectedProfessions.hasOwnProperty(d[0])
					|| this.selectedProfessions[d[0]]) {
					return '#cccccc';
				}
				return '#ffffff';
			})
			.attr('fill-opacity', 0.8)


		professionsGroups.on('click', (d, i, j) => {
			if (!this.selectedProfessions.hasOwnProperty(d[0])
				|| this.selectedProfessions[d[0]]) {
				this.selectedProfessions[d[0]] = false;
				console.log(d[0])
				d3.select("#" + d[0])
					.select('rect')
					.attr('fill', '#ffffff');
			} else {
				this.selectedProfessions[d[0]] = true;
				d3.select("#" + d[0])
					.select('rect')
					.attr('fill', '#cccccc');
			}
		})
		professionsGroups.call(this.drawText);
		professionsGroups.call(this.draw1DScatterPlot, xScale, barWidth, 1, 2);
		d3.select('#professionsSortBy')
			.on('change', () => {
				const sortingFunction = this.getSortingOptions('professionsSortBy',
					'professionsSortDirection');

				professionsGroups.sort(sortingFunction)
					.transition()
					.delay(function (d, i) {
						return i * 50;
					})
					.duration(1000)
					.attr("transform", function (d, i) {
						let y = i * barHeight + barHeight / 2;
						return "translate(" + 0 + ", " + y + ")";
					});
			});
			d3.select('#professionsSortDirection')
			.on('change', () => {
				const sortingFunction = this.getSortingOptions('professionsSortBy',
					'professionsSortDirection');

				professionsGroups.sort(sortingFunction)
					.transition()
					.delay(function (d, i) {
						return i * 50;
					})
					.duration(1000)
					.attr("transform", function (d, i) {
						let y = i * barHeight + barHeight / 2;
						return "translate(" + 0 + ", " + y + ")";
					});
			});
	}

	draw1DScatterPlot(svg, xScale, x = 0, i = 0, j = 1) {
		let barWidth: number = 120;
		let barHeight: number = 30;
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
			.attr('x', d => { return x + xScale(d3.min([d[i], d[j]])) })
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
	totalSupplyDemandByCounty(currentYear) {
		let barWidth: number = 120;
		let barHeight: number = 30;
		for (let county in currentYear) {
			let totalSupply = d3.sum(Object.keys(currentYear[county]['supply']).map(d => currentYear[county]['supply'][d]));
			let totalDemand = d3.sum(Object.keys(currentYear[county]['demand']).map(d => currentYear[county]['demand'][d]));
			currentYear[county]['totalSupply'] = totalSupply;
			currentYear[county]['totalDemand'] = totalDemand;
		}
	}
	drawStackedBar(svg, data, xScale) {
		let barWidth: number = 120;
		let barHeight: number = 30;
		xScale = function (d) {
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

	drawText(selection, i = 0, dy = 0) {
		let barWidth: number = 120;
		let barHeight: number = 30;
		var groups = selection.append('g');

		groups
			.append('text')
			.attr('y', (d, i) => 0 * barHeight + barHeight / 2 + 5 + dy)
			.text(d => d[i]);
	}

	getSortingOptions(sortIndexId, sortDirectionId) {
		const index = Number((document.getElementById(sortIndexId) as HTMLInputElement).value);
		const direction = (document.getElementById(sortDirectionId) as HTMLInputElement).value;

		if (direction == 'ascending') {
			const sortingFunction = function (a, b) {
				return d3.ascending(a[index], b[index]);
			}
			return sortingFunction;
		} else {
			const sortingFunction = function (a, b) {
				return d3.descending(a[index], b[index]);
			}
			return sortingFunction;
		}
	}
}

export { Sidebar };
