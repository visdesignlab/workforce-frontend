import * as d3 from 'd3';
class Linechart{
	data:any;
	width:any;
	height:any;
	margin:any;
	clipPathID:any;
	lineChartSvg:any;
	results: any;
	constructor(){
	this.data = {dates: {}, series: {}};
	this.width = 200;
	this.height = 200
	this.margin = {top: 20, right: 20, bottom: 40, left: 40};
	this.lineChartSvg = d3.select('#linechart').append("svg").attr("width", 600).attr('height', 800);
	this.clipPathID = 0;

	}

	public updateLineChart(selectedCounty) {
		this.initLineChart(this.results, selectedCounty);
	}

	public destroy() {
		this.lineChartSvg.selectAll('*').remove();
	}

	public initLineChart(results, selectedCounty = 'State of Utah') {
		this.lineChartSvg.selectAll('*').remove();
		this.lineChartSvg.append('line')
			.attr('stroke', 'black')
			.attr('stroke-width', 2)
			.attr('x1', 600)
			.attr('x2', 600)
			.attr('y1', 0)
			.attr('y2', 800);
		this.results = results;
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
			this.createAreaChart(results, supply_demand[i][0], supply_demand[i][1], supply_demand[i][2], max, +i % 3, Math.floor(+i / 3));
		}
	}

	private createLineChart(results, supply, demand, profession, max, xi = 0, yi = 0) {
		this.data.dates = Object.keys(results);
		this.data.series = demand;

		var x = d3.scaleLinear()
			.domain(d3.extent(this.data.dates))
			.range([this.margin.left, this.width - this.margin.right])

		var y = d3.scaleLinear()
			.domain([0, d3.max([max, d3.max(demand), d3.max(supply)])]).nice()
			.range([this.height - this.margin.bottom, this.margin.top])

		var xAxis = g => g
			.attr("transform", `translate(0,${this.height - this.margin.bottom})`)
			.call(d3.axisBottom(x).ticks(4).tickSize(1.5).tickFormat(d3.format(".0f")))

		var yAxis = g => g
			.attr("transform", `translate(${this.margin.left},0)`)
			.call(d3.axisLeft(y).tickSize(1.5).tickFormat(d3.format(".2s")))

		var line = d3.line()
			.x((d, i) => x(this.data.dates[i]))
			.y(d => y(d))



		var lineChartGroup = this.lineChartSvg.append('g')
			.attr('transform', `translate(${xi * this.width}, ${yi * this.height})`)

		lineChartGroup.append('text')
			.attr("x", (this.width / 2))
			.attr("y", (this.margin.top))
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.text(profession);

		this.data.dates = Object.keys(results);
		this.data.series = supply;
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
			.datum(this.data.series)
			.attr("stroke", "#086fad")
			.style("mix-blend-mode", "multiply")
			.attr("d", d => line(d));

		this.data.series = demand;
		chartgroup
			.append("path")
			.attr("stroke-dasharray", ("3, 3"))
			.datum(this.data.series)
			.attr("stroke", "#c7001e")
			.style("mix-blend-mode", "multiply")
			.attr("d", d => line(d));
	}

	private createAreaChart(results, supply, demand, profession, max, xi = 0, yi = 0) {
		this.data.dates = Object.keys(results);
		this.data.series = demand;

		var x = d3.scaleLinear()
			.domain(d3.extent(this.data.dates))
			.range([this.margin.left, this.width - this.margin.right])

		var y = d3.scaleLinear()
			.domain([0, d3.max([max, d3.max(demand), d3.max(supply)])]).nice()
			.range([this.height - this.margin.bottom, this.margin.top])

		var xAxis = g => g
			.attr("transform", `translate(0,${this.height - this.margin.bottom})`)
			.call(d3.axisBottom(x).ticks(4).tickSize(1.5).tickFormat(d3.format(".0f")))

		var yAxis = g => g
			.attr("transform", `translate(${this.margin.left},0)`)
			.call(d3.axisLeft(y).ticks(5).tickSize(1.5).tickFormat(d3.format(".2s")))

		var line = d3.line()
			.x((d, i) => x(this.data.dates[i]))
			.y(d => y(d))



		var lineChartGroup = this.lineChartSvg.append('g')
			.attr('transform', `translate(${xi * this.width}, ${yi * this.height})`)

		lineChartGroup.append('text')
			.attr("x", (this.width / 2))
			.attr("y", (this.margin.top))
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.text(profession);

		this.data.dates = Object.keys(results);
		this.data.series = supply;
		lineChartGroup.append("g")
			.call(xAxis);

		lineChartGroup.append("g")
			.call(yAxis);

		var aboveUid = 'above' + this.clipPathID;;
		var belowUid = 'below' + this.clipPathID;;
		this.clipPathID += 1;
		var colors = ['#086fad', '#c7001e'];
		const chartgroup = lineChartGroup.append("g")
			.attr("fill", "none")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")

		chartgroup
			.append("path")
			.datum(this.data.series)
			.attr("stroke", "#086fad")
			.style("mix-blend-mode", "multiply")
			.attr("d", d => line(d));


		chartgroup.append("clipPath")
			.datum(this.data.series)
			.attr("id", aboveUid)
			.append("path")
			.attr("d", d3.area()
				.x((d, i) => x(this.data.dates[i]))
				.y0(this.height)
				.y1(d => y(d)));

		chartgroup.append("clipPath")
			.datum(this.data.series)
			.attr("id", belowUid)
			.append("path")
			.attr("d", d3.area()
				.x((d, i) => x(this.data.dates[i]))
				.y0(0)
				.y1(d => y(d)));

		chartgroup.append("path")
			.datum(demand)
			.attr('clip-path', `url(#${belowUid})`)
			.attr("fill", colors[1])
			.attr("d", d3.area()
				.x((d, i) => x(this.data.dates[i]))
				.y0(this.height)
				.y1(d => y(d)));

		chartgroup.append("path")
			.datum(demand)
			.attr('clip-path', `url(#${aboveUid})`)
			.attr("fill", colors[0])
			.attr("d", d3.area()
				.x((d, i) => x(this.data.dates[i]))
				.y0(0)
				.y1(d => y(d)));

		this.data.series = demand;
		chartgroup
			.append("path")
			.attr("stroke-dasharray", ("3, 3"))
			.datum(this.data.series)
			.attr("stroke", "#c7001e")
			.style("mix-blend-mode", "multiply")
			.attr("d", d => line(d));
	}
}

export {Linechart};
