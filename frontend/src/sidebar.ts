import * as d3 from 'd3';
import {MapController} from './mapController';

class Sidebar {
	countiesSvg: any;
	stateSvg: any;
	professionsSvg: any;
	selectedProfessions: any;
	countiesHeaderSvg: any;
	margin:any;
	lastSelected:string;
	countiesAscending:boolean;
	professionsLastSelected:string;
	professionsAscending:boolean;
	map:MapController;
	countiesSortingFunction:any;
	professionsSortingFunction:any;
	currentlySelected:Set<string>;

	constructor(map:MapController) {
		this.map = map;
		this.selectedProfessions = {};
		this.currentlySelected = new Set<string>();
		this.lastSelected = "County";
		this.countiesAscending = true;
		this.professionsLastSelected = "Profession";
		this.professionsAscending = true;
		this.countiesSortingFunction = this.getSortingOptions(0, true);
		this.professionsSortingFunction = this.getSortingOptions(0, true);


		this.countiesSvg = d3.select('#counties').select('svg');

		if (!this.countiesSvg.node()) {
			this.countiesSvg = d3.select('#counties')
				.append('svg')
				.attr('height', 1800)
				.attr("style","width:100%;")
		}

		this.professionsSvg = d3.select('#professions').select('svg');

		if (!this.professionsSvg.node()) {
			this.professionsSvg = d3.select('#professions')
				.append('svg')
				.attr('height', 700)
				.attr("style","width:100%;")
		}
		this.countiesHeaderSvg = d3.select('#countiesHeader').select('svg');

		if (!this.countiesHeaderSvg.node()) {
			this.countiesHeaderSvg = d3.select('#countiesHeader')
				.append('svg')
				.attr('height', 50)
				.attr('width', 510)
		}
	}

	destroy()
	{
		this.countiesSvg.selectAll("*").remove();
		this.professionsSvg.selectAll("*").remove();
		this.stateSvg.selectAll("*").remove();
	}

	initSideBar(selectedProfessions, currentYear, selectedCounties:Set<string>, otherCurrentYearData = []) {
		if(selectedCounties.size == 0)
		{
			this.currentlySelected = new Set<string>();
			this.currentlySelected.add("State of Utah");
		}
		else{
			this.currentlySelected = new Set<string>(selectedCounties);
		}

		let countyString:string = "Data for ";

		this.currentlySelected.forEach(d => {
			countyString += d + ", ";
		});

		countyString = countyString.substring(0, countyString.length - 2)

		d3.select("#countiesList")
			.html(countyString);

		this.selectedProfessions = selectedProfessions;

		let profString:string = "Data for ";
		let allFlag:boolean = true;

		for(let i in this.selectedProfessions)
		{
			if(this.selectedProfessions[i])
			{
				profString += i + ", "
			}
			else{
				allFlag = false;
			}
		}

		profString = profString.substring(0, profString.length - 2);

		if(allFlag)
			profString = "Data for All Professions"

		d3.select("#professionsList")
			.html(profString);

		this.countiesSvg.selectAll('*').remove();
		this.countiesHeaderSvg.selectAll('*').remove();
		this.margin = {left: 15, top:0, bottom: 0, right:15};

		let barWidth: number = 120;
		let barHeight: number = 30;

		if (this.map.comparisonMode)
		{
			barHeight *= 2;
		}

		let mapData = (<HTMLInputElement>document.getElementById('mapData')).value;
		let domainMax = 0;

		let currState = Object.keys(currentYear).filter(d => {
			return d.includes("State of")
		})[0];

		let temp = currentYear[currState];
		delete currentYear[currState];

		if (mapData.includes('100')) {
			domainMax = d3.max(Object.keys(currentYear), d => Math.max(currentYear[d]['totalSupplyPer100K'], currentYear[d]['totalDemandPer100K']));
		} else {
			domainMax = d3.max(
				d3.max(Object.keys(currentYear), d => Math.max(currentYear[d]['totalSupply'], currentYear[d]['totalDemand'])),
				d3.max(Object.keys(otherCurrentYearData), d => Math.max(otherCurrentYearData[d]['totalSupply'], otherCurrentYearData[d]['totalDemand'])));
		}

		currentYear[currState] = temp;

		var headers = [{name: 'County', x: 0},
		{name: 'Supply', x: barWidth},
		{name: 'Need', x: 2 * barWidth},
		{name: 'Gap', x: 3 * barWidth}];
		var xScale = d3.scaleLinear()
		.domain([0, domainMax])
		.range([0, barWidth]);
		let countiesData = this.calculateCountiesData(currentYear, otherCurrentYearData, mapData.includes('100'));
		console.log(countiesData)
		/**
		* Pull out the state, put it in its own SVG above.
		* TODO::  this is straight duplicating the code below it atm. Pull into a function.
		// */
		this.stateSvg = d3.select('#state');
		this.stateSvg.selectAll('svg').remove();
		this.stateSvg = this.stateSvg
				.append('svg')
				.attr('height', 30)
				.attr('style', "width:100%");

		let state = countiesData.filter(d => {
			return d[0].includes("State of");
		})[0];

		let stateGroups = this.stateSvg.append('g')
			.selectAll('g')
			.data([state])
			.enter()
			.append('g')
			.attr('class', 'pointerCursor')

		stateGroups.append('rect')
			.attr('width', 4 * barWidth + this.margin.left + this.margin.right)
			.attr('height', barHeight)
			.attr('id', d => d[0].replace(/\s/g, ''))
			.attr('class', 'background')
			.attr('border-top', 'double')
			.attr('fill', 'white')

		stateGroups.on('click', (d) => {
				this.highlightRect(d[0]);
			});

		stateGroups.on('mouseover', d => {
			d3.select(`#${this.removeSpaces(d[0])}`)
				.classed('hoverCounty', true);
			});

		stateGroups.on('mouseout', d => {
			d3.select('.hoverCounty')
				.classed('hoverCounty', false);
		})

		countiesData = countiesData.filter(d => {
			return !d[0].includes("State of");
		});


		this.countiesSvg.selectAll('rect')
			.data(countiesData.sort(this.countiesSortingFunction))
			.enter()
			.append('rect')
			.attr('width', 4 * barWidth + this.margin.left + this.margin.right)
			.attr('height', barHeight)
			.attr('y', (d, i) => i * barHeight)
			.attr('x', 0)
			.attr('fill', (d, i) => {
				if (i % 2 == 0)
				{
					return '#F0F0F0';
				}
				return 'white';
			})

		var groups = this.countiesSvg.append('g')
			.selectAll('g')
			.data(countiesData.sort(this.countiesSortingFunction))
			.enter()
			.append('g')
			.attr('transform', (d, i) => `translate(0, ${i * barHeight})`)
			.attr('class','pointerCursor countiesG')


		groups.append('rect')
			.attr('width', 4 * barWidth + this.margin.left + this.margin.right)
			.attr('height', barHeight)
			.attr('id', d => d[0].replace(/\s/g, ''))
			.attr('class', 'background')
			.attr('fill', (d, i) => {
				// if (i % 2 == 0)
				// {
				// 	return '#F0F0F0';
				// }
				return 'none';
			})
			.classed('visibleFillEvents', true)



		this.currentlySelected.forEach(i => {
			let selection = d3.select(`#${this.removeSpaces(i)}`)
				.classed('selectedCounty', true);
		});

		groups.on('click', (d) => {
				this.highlightRect(d[0]);
			});

		groups.on('mouseover', d => {
			d3.select(`#${this.removeSpaces(d[0])}`)
				.classed('hoverCounty', true);
			});

		groups.on('mouseout', d => {
			d3.select('.hoverCounty')
				.classed('hoverCounty', false);
		})

		var groupsHeaders = this.countiesHeaderSvg
			.append('g')
			.attr('id', 'sortCounties')
			.selectAll('g')
			.data(headers)
			.enter()
			.append('g')

		groupsHeaders.call(this.drawHeaders, barWidth, barHeight);

		var axis = this.countiesHeaderSvg.append('g');

		var xAxis = g => g
			.attr("transform", `translate(${3*barWidth + this.margin.left},${45})`)
			.call(d3.axisTop(xScale).ticks(4).tickSize(1.5).tickFormat(d3.format(".1s")))
		axis.call(xAxis);

		groups.call(this.drawAllText, barWidth, barHeight, this.margin.left, this.map.comparisonMode, this);
		//
		// if (Object.keys(otherCurrentYearData).length) {
		// 	groups.call(this.drawText, barWidth, barHeight / 2, this.margin.left, 1, barWidth );
		// 	groups.call(this.drawText, barWidth, barHeight / 2, this.margin.left, 2,  2 * barWidth);
		// 	groups.call(this.drawText, barWidth, barHeight / 2, this.margin.left, 4,  barWidth, barHeight / 2);
		// 	groups.call(this.drawText, barWidth, barHeight / 2, this.margin.left, 5,  2 * barWidth,barHeight / 2);
		// }
		// else{
		// 	groups.call(this.drawText, barWidth, barHeight, this.margin.left, 1, barWidth );
		// 	groups.call(this.drawText, barWidth, barHeight, this.margin.left, 2,  2 * barWidth);
		// }
		if (mapData.includes('100')) {
			if (this.map.comparisonMode){
				groups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight / 2, this.margin.left, 3*barWidth, 0, 1, 2, d3.interpolatePuOr(0), d3.interpolatePuOr(1));
				groups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight / 2, this.margin.left, 3*barWidth, barHeight / 2, 4, 5, d3.interpolatePuOr(0), d3.interpolatePuOr(1));
			}
			else{
				groups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight, this.margin.left, 3*barWidth, 0, 1, 2, d3.interpolatePuOr(0), d3.interpolatePuOr(1));
			}

		} else {
			if (this.map.comparisonMode){
				groups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight / 2, this.margin.left, 3 * barWidth, 0, 1, 2);
				groups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight / 2, this.margin.left, 3 * barWidth, barHeight / 2, 4, 5);
			}
			else{
				groups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight, this.margin.left, 3 * barWidth, 0, 1, 2);
			}
		}

		d3.select("#counties").select("svg")
			.attr("height", d => {
				return groups.data().length * barHeight + 10;
			})


		stateGroups.call(this.drawAllText, barWidth, barHeight, this.margin.left, this.map.comparisonMode, this);

		if (this.map.comparisonMode) {
			this.stateSvg.attr("height", "60");
		}
		else{
			this.stateSvg.attr("height", "30");
		}

		d3.selectAll('#sortCounties .rectButtons')
		.on('click', (d, i) => {
			//down
			if(this.lastSelected == ""){
				d3.select("#sortCounties #"+d.name).transition().duration(500).text(function(d){return "\uf0dd"});
				this.lastSelected = d.name
				this.countiesSortingFunction = this.getSortingOptions(i, true);

			}else if(this.lastSelected===d.name){
				if(this.countiesAscending){
					this.countiesAscending = false;

					this.countiesSortingFunction = this.getSortingOptions(i, false);
					d3.select("#sortCounties #"+d.name).transition().duration(500).text(function(d) { return '\uf0dd'; });

				}else{
					d3.select("#sortCounties #"+d.name).transition().duration(500).text(function(d) { return '\uf0de'; });
					this.countiesSortingFunction = this.getSortingOptions(i, true);
					this.countiesAscending = true;
			}

			}else{
				d3.select("#sortCounties #"+this.lastSelected).transition().duration(500).text(function(d) { return '\uf0dc'; });
				d3.select("#sortCounties #"+d.name).transition().duration(500).text(function(d){return "\uf0de"});
				this.lastSelected = d.name;
				this.countiesAscending = true;
				this.countiesSortingFunction = this.getSortingOptions(i, true);
			}

			this.sortCounties(groups, barHeight, 1000);
			// this.map.drawSidebar();
		});

		let tempSelectedList = Array.from(this.currentlySelected);

		this.professionsSvg.selectAll('*').remove();
		var professions = Object.keys(currentYear[tempSelectedList[0]]['supply']);
		var population = currentYear[tempSelectedList[0]]['population'];
		var stats = {};

		for (let prof of professions) {
			stats[prof] = {totalDemandPer100K:0,totalSupplyPer100K:0,totalSupply: 0, totalDemand: 0,
				otherTotalDemandPer100K:0,otherTotalSupplyPer100K:0,otherTotalSupply: 0, otherTotalDemand: 0};
		}

		const f = d3.format('.0f');
		for (let prof of professions) {
			for(let i = 0; i < tempSelectedList.length; i++)
			{
				stats[prof].totalSupply += currentYear[tempSelectedList[i]]['supply'][prof];
				stats[prof].totalDemand += currentYear[tempSelectedList[i]]['demand'][prof];
				stats[prof].totalSupplyPer100K = Number(f(stats[prof].totalSupply / population * 100000));
				stats[prof].totalDemandPer100K = Number(f(stats[prof].totalDemand / population * 100000));
				if (this.map.comparisonMode) {
					stats[prof].otherTotalSupply += otherCurrentYearData[tempSelectedList[i]]['supply'][prof];
					stats[prof].otherTotalDemand += otherCurrentYearData[tempSelectedList[i]]['demand'][prof];
					stats[prof].otherTotalSupplyPer100K = Number(f(stats[prof].otherTotalSupply / population * 100000));
					stats[prof].otherTotalDemandPer100K = Number(f(stats[prof].otherTotalDemand / population * 100000));
				}
			}
		}
	//}

	var data = Object.keys(stats).map(d => {
		if (mapData.includes('100')) {
		return [stats[d].totalSupplyPer100K, stats[d].totalDemandPer100K, stats[d].totalDemandPer100K - stats[d].totalSupplyPer100K,
		stats[d].otherTotalSupplyPer100K, stats[d].otherTotalDemandPer100K, stats[d].otherTotalDemandPer100K - stats[d].otherTotalSupplyPer100K];
		} else {
		return [stats[d].totalSupply, stats[d].totalDemand, stats[d].totalDemand- stats[d].totalSupply, stats[d].otherTotalSupply, stats[d].otherTotalDemand, stats[d].otherTotalDemand- stats[d].otherTotalSupply];
		}
	});
	var xScale = d3.scaleLinear()
		.domain([0, d3.max(data, (d) => d3.max(d))])
		.range([0, barWidth])

	var professionsData = [];

	for (let i in data) {
			professionsData.push([professions[i], ...data[i]]);
	};

	if(this.countiesAscending)
	{
		d3.select("#sortCounties #"+this.lastSelected).transition().duration(500).text(function(d) { return '\uf0de'; });
	}
	else{
		d3.select("#sortCounties #"+this.lastSelected).transition().duration(500).text(function(d) { return '\uf0dd'; });
	}

	d3.select("#allProfessions").selectAll("*").remove();
	let allProfSvg = d3.select("#allProfessions").append("svg").attr("style", "width:100%").attr('height', this.map.comparisonMode ? 60 : 30);


	let allProfData = ["All", 0, 0, 0, 0, 0, 0];

	for(let k in professionsData)
	{
		for (let j = 1; j < 7; j++)
		{
			allProfData[j] += professionsData[k][j];
		}
	}

	console.log(allFlag);

	this.professionsSvg.selectAll('rect')
		.data(professionsData.sort(this.professionsSortingFunction))
		.enter()
		.append('rect')
		.attr('width', 4 * barWidth + this.margin.left + this.margin.right)
		.attr('height', barHeight)
		.attr('y', (d, i) => i * barHeight)
		.attr('x', 0)
		.attr('fill', (d, i) => {
			if (i % 2 == 0)
			{
				return '#F0F0F0';
			}
			return 'white';
		})

	var professionsGroups = this.professionsSvg.append('g')
		.selectAll('g')
		.data(professionsData.sort(this.professionsSortingFunction))
		.enter()
		.append('g')
		.attr('transform', (d, i) => `translate(0, ${i * (barHeight)})`)
		.attr('class','professions')
		.attr('id',(d)=>d[0])

	// Reducing bar height to account for the space between bars in professions. Makes sure everything is centered.
	// barHeight = barHeight - 2;
	professionsGroups.append('rect')
		.attr('width', 4 * barWidth + this.margin.left + this.margin.right)
		.attr('height', barHeight)
		.attr('fill', (d, i) => {
			if ((!this.selectedProfessions.hasOwnProperty(d[0])
				|| this.selectedProfessions[d[0]]) && !allFlag){
				return '#A9A9A9';
			}
			return 'none';
		})
		.classed('visibleFillEvents', true)



	professionsGroups.on('click', (d, i ,j)=> {
		if(allFlag)
		{
			console.log(this.selectedProfessions)

			for( let k in this.selectedProfessions)
			{
				console.log(k)
				this.selectedProfessions[k] = false;
			}

			this.selectedProfessions[d[0]] = true;

			this.map.updateSelections(this.selectedProfessions);
		}
		else if (!this.selectedProfessions.hasOwnProperty(d[0])
				|| this.selectedProfessions[d[0]]) {

					this.selectedProfessions[d[0]] = false;
					this.map.updateSelections(this.selectedProfessions);
			}
			else {
				this.selectedProfessions[d[0]] = true;
				this.map.updateSelections(this.selectedProfessions);
			}
	})

	professionsGroups.on('mouseover', d => {
		if (!(!this.selectedProfessions.hasOwnProperty(d[0])
			|| this.selectedProfessions[d[0]])) {
				d3.select(`#${this.removeSpaces(d[0])}`).select('rect')
					.classed('hoverProfession', true);
		}
	})

	professionsGroups.on('mouseout', d => {
		d3.select(`.hoverProfession`)
			.classed('hoverProfession', false);
	})

	allProfSvg = allProfSvg.append('g')
		.selectAll('g')
		.data([allProfData])
		.enter()
		.append('g')
		.attr('transform', (d, i) => `translate(0, ${i * (barHeight)})`)
		.attr('class','professions')
		.attr('id',(d)=>d[0])
	//
	allProfSvg.append('rect')
		.attr('width', 4 * barWidth + this.margin.left + this.margin.right)
		.attr('height', barHeight)
		.attr('fill', (d, i) => {
			if (allFlag) {
				return '#A9A9A9';
			}
			return 'none';
		})
		.classed('visibleFillEvents', true)



	allProfSvg.on('click', (d, i ,j)=> {
		if(allFlag)
		{
			for( let k in this.selectedProfessions)
			{
				this.selectedProfessions[k] = false;
			}
			this.map.updateSelections(this.selectedProfessions);

		}
		else{
			for( let k in this.selectedProfessions)
			{
				this.selectedProfessions[k] = true;
			}
			this.map.updateSelections(this.selectedProfessions);

		}
	})

	allProfSvg.on('mouseover', d => {
		if (!allFlag) {
				d3.select(`#${this.removeSpaces(d[0])}`).select('rect')
					.classed('hoverProfession', true);
		}
	})

	allProfSvg.on('mouseout', d => {
		d3.select(`.hoverProfession`)
			.classed('hoverProfession', false);
	 })

	var professionsHeadData = [{name: 'Profession', x: 0},
	{name: 'Supply', x: barWidth},
	{name: 'Need', x: 2 * barWidth},
	{name: 'Gap', x: 3 * barWidth}];

	var professionHeaderSVG = d3.select('#professionsHeader');
	professionHeaderSVG.selectAll('*').remove();
	professionHeaderSVG = professionHeaderSVG
			.append('svg')
			.attr('height', 50)
			.attr('width', 600);
	var professionsHeaders = professionHeaderSVG
		.append('g')
		.attr('id', 'sortProfessions')
		.selectAll('g')
		.data(professionsHeadData)
		.enter()
		.append('g')


	professionsHeaders.call(this.drawHeaders, barWidth, barHeight);
	var axis = professionHeaderSVG.append('g');
	d3.select("#sortProfessions #" + this.professionsLastSelected).transition().duration(500).text(function(d) { return '\uf0dd'; });

	var xAxis = g => g
		.attr("transform", `translate(${3*barWidth + this.margin.left},${42})`)
		.call(d3.axisTop(xScale).ticks(4).tickSize(1.5).tickFormat(d3.format(".1s")))
	axis.call(xAxis);

	professionsGroups.call(this.drawAllText, barWidth, barHeight, this.margin.left, this.map.comparisonMode, this);
	allProfSvg.call(this.drawAllText, barWidth, barHeight, this.margin.left, this.map.comparisonMode, this);

	//
	// if (Object.keys(otherCurrentYearData).length) {
	// 	professionsGroups.call(this.drawText, barWidth, barHeight/2, this.margin.left, 1, barWidth);
	// 	professionsGroups.call(this.drawText, barWidth, barHeight/2, this.margin.left, 2,  2 * barWidth);
	// 	professionsGroups.call(this.drawText, barWidth, barHeight/2, this.margin.left, 4,  barWidth, barHeight / 2);
	// 	professionsGroups.call(this.drawText, barWidth, barHeight/2, this.margin.left, 5,  2 * barWidth, barHeight / 2);
	// }
	// else{
	// 	professionsGroups.call(this.drawText, barWidth, barHeight, this.margin.left, 1, barWidth);
	// 	professionsGroups.call(this.drawText, barWidth, barHeight, this.margin.left, 2,  2 * barWidth);
	// }
	if (mapData.includes('100')) {
		if (this.map.comparisonMode){
			professionsGroups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight/2, this.margin.left, 3*barWidth, 0, 1, 2, d3.interpolatePuOr(0), d3.interpolatePuOr(1));
			professionsGroups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight/2, this.margin.left, 3*barWidth, barHeight / 2, 1, 2, d3.interpolatePuOr(0), d3.interpolatePuOr(1));
		}
		else{
			professionsGroups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight, this.margin.left, 3*barWidth, 0, 1, 2, d3.interpolatePuOr(0), d3.interpolatePuOr(1));
		}
	} else {
		if (this.map.comparisonMode){
			professionsGroups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight/2, this.margin.left, 3 * barWidth, 0, 1, 2);
			professionsGroups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight/2, this.margin.left, 3 * barWidth, barHeight / 2, 4, 5);
		}
		else{
			professionsGroups.call(this.draw1DScatterPlot, xScale, barWidth, barHeight, this.margin.left, 3 * barWidth, 0, 1, 2);

		}
	}
	var professionsSortDirection = [true];
	d3.select('#sortProfessions')
		.selectAll('.rectButtons')
		.on('click', (d, i) => {

			//down
			if(this.professionsLastSelected == ""){
				d3.select("#sortProfessions #"+d.name).transition().duration(500).text(function(d){return "\uf0dd"});
				this.professionsLastSelected = d.name
				this.professionsSortingFunction = this.getSortingOptions(i, true);

			}else if(this.professionsLastSelected===d.name){
				if(this.professionsAscending){
					this.professionsAscending = false;
					this.professionsSortingFunction = this.getSortingOptions(i, false);
					d3.select("#sortProfessions #"+d.name).transition().duration(500).text(function(d) { return '\uf0de'; });

				}else{
					d3.select("#sortProfessions #"+d.name).transition().duration(500).text(function(d) { return '\uf0dd'; });
					this.professionsSortingFunction = this.getSortingOptions(i, true);
					this.professionsAscending = true;
			}

			}else{
				d3.select("#sortProfessions #"+this.professionsLastSelected).transition().duration(500).text(function(d) { return '\uf0dc'; });

				d3.select("#sortProfessions #"+d.name).transition().duration(500).text(function(d){return "\uf0dd"});
				this.professionsLastSelected = d.name;
				this.professionsAscending = true;
				this.professionsSortingFunction = this.getSortingOptions(i, true);
			}
			this.sortProfessions(professionsGroups, barHeight, 1000);
		});
		// for(let i of this.currentlySelected){
		// 	this.highlightBar(i);
		// }
	}

	draw1DScatterPlot(svg, xScale, barWidth, barHeight, leftMargin, x = 0, y = 0, i = 0, j = 1, iColor = '#086fad', jColor = '#c7001e') {
		const radius = 6;
		x += leftMargin;
		// if(isNaN(d[i]))
		// {
		// 	return;
		// }

			var xAxis = g => g
				.attr("transform", `translate(${barWidth},${20})`)
				.call(d3.axisTop(xScale).ticks(4).tickSize(1.5).tickFormat(d3.format(".1s")))

			var groups = svg.append('g')
				.attr('id', d => "plot" + d[0]);

			groups
				.append('line')
				.attr('stroke', '#000000')
				.attr('x1', x)
				.attr('x2', x + barWidth)
				.attr('y1', (d, i) => y + 0 * barHeight + barHeight / 2)
				.attr('y2', (d, i) => y + 0 * barHeight + barHeight / 2)
				.style("opacity", d => isNaN(d[i]) ? 0 : 1)

			groups
				.append('rect')
				.attr('class', 'scatterPlotRect')
				.attr('height', 6)

				.attr('width', d => Math.abs(xScale(d[i]) - xScale(d[j])))
				.attr('x', d => {return x + xScale(d3.min([d[i], d[j]]))})
				.attr('y', (d, i) => y + 0 * barHeight + barHeight / 2 - radius / 2)
				.attr('fill', d => d[i] > d[j] ? iColor : jColor)
				.style("opacity", d => isNaN(d[i]) ? 0 : 1);

			groups
				.append('circle')
				.attr('class', 'supplyCircle')
				.attr('r', 6)
				.attr('stroke', iColor)
				.attr('fill', iColor)
				.attr('cx', d => x + xScale(d[i]))
				.attr('cy', (d, i) => y + 0 * barHeight + barHeight / 2)
				.style("opacity", d => isNaN(d[i]) ? 0 : 1);

			groups
				.append('circle')
				.attr('class', 'needCircle')
				.attr('r', 6)
				.attr('stroke', jColor)
				.attr('fill', jColor)
				.attr('cx', d => x + xScale(d[j]))
				.attr('cy', (d, i) => y + 0 * barHeight + barHeight / 2)
				.style("opacity", d => isNaN(d[j]) ? 0 : 1)


			//making tooltip for side bars. Considered adding color to match scale, but problems with white.
			groups
				.on('mouseover', d => {
					let toolTip = "<h4>"+ (-d[3]) + "</h4>";
					d3.select("#barTooltip")
						.style("opacity", .9);
						// .style("color", d3.interpolateRdBu(d[1] / d[2] / 2));
					d3.select("#barTooltip").html(toolTip)
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");
				})

			groups.on('mouseout', () => d3.select("#barTooltip").style("opacity", 0));
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

	sortCounties(groups:any, barHeight:number, duration:number)
	{
		groups.sort(this.countiesSortingFunction)
			.transition()
			.delay(function(d, i) {
				return i * 50;
			})
			.duration(duration)
			.attr("transform", function(d, i) {
				let y = i * (barHeight);
				return "translate(" + 0 + ", " + y + ")";
			});
	}

	sortProfessions(groups:any, barHeight:number, duration:number)
	{
		groups.sort(this.professionsSortingFunction)
			.transition()
			.delay(function(d, i) {
				return i * 50;
			})
			.duration(duration)
			.attr("transform", function(d, i) {
				let y = i * (barHeight);
				return "translate(" + 0 + ", " + y + ")";
			});
	}


	drawHeaders(groups, barWidth, barHeight, i = 0, dx = 0, dy = 0) {

		groups
			.append('text')
			.attr('font-weight', 'bold')
			.attr('y', (d, i) => 15)
			.attr('x', (d, i) => d.x)
			.text(d => d.name);

		groups
			.append('text')
			.attr('y', (d, i) => 15)
			.attr('x', (d, i) => d.x+90)
			.attr("font-family","FontAwesome")
			.attr('class',"rectButtons")
			.attr('id',(d)=>d.name)
			.text(function(d) { return '\uf0dc'; });
	}

	// drawStackedBar(svg, data, xScale) {
	// 	let barWidth: number = 120;
	// 	let barHeight: number = 30;
	// 	xScale = function (d) {
	// 		return barWidth * d[0] / (d[0] + d[1]) || 0;
	// 	}
	// 	var groups = svg.append('g')
	// 		.selectAll('g')
	// 		.data(data)
	// 		.enter()
	// 		.append('g');

	// 	groups
	// 		.append('rect')
	// 		.attr('width', d => xScale(d))
	// 		.attr('height', barHeight - 4)
	// 		.attr('x', barWidth)
	// 		.attr('y', (d, i) => i * barHeight - 2)
	// 		.attr('fill', '#086fad')
	// 		.append('title')
	// 		.text(d => d[0])

	// 	groups
	// 		.append('rect')
	// 		.attr('width', d => barWidth - xScale(d))
	// 		.attr('height', barHeight - 4)
	// 		.attr('x', d => barWidth + xScale(d))
	// 		.attr('y', (d, i) => i * barHeight - 2)
	// 		.attr('fill', '#c7001e')
	// 		.append('title')
	// 		.text(d => d[1])
	// }
	updateSidebar(selectedProfessions, currentYear, selectedCounty = 'State of Utah', otherCurrentYearData = []){

	}



	drawText(selection, barWidth, barHeight, leftMargin, i = 0, dx = 0, dy = 0) {
		var groups = selection.append('g');
		dx += leftMargin;
		const f = d3.format('.0f');

		groups
			.append('text')
			.attr('y', (d, i) => 0 * barHeight + barHeight / 2 + 5 + dy)
			.attr('x', dx)
			.text(d => isNaN(d[i]) ? d[i] : f(d[i]));
	}

	drawAllText(selection, barWidth, barHeight, leftMargin, doubleBars, that) {
		var groups = selection.append('g');
		const f = d3.format('.0f');

		if(!doubleBars){
			// groups.selectAll('text')
			// 	.data([0, 1, 2])
			// 	.enter()
			// 	.append('text')
			// 	.attr('y', (d, i) => barHeight / 2)
			// 	.attr('x', (d, i) => leftMargin + barWidth * i)
			// 	.style("dominant-baseline", "middle")
			// 	.text((d, i) => isNaN(selection.data()[i][d]) ? selection.data()[i][d] : f(selection.data()[i][d]));
			//
			groups
				.append('text')
				.attr('y', (d, i) => barHeight / 2)
				.attr('x', leftMargin)
				.style("dominant-baseline", "middle")
				.text(d => isNaN(d[0]) ? d[0] : f(d[0]));

			groups
				.append('text')
				.attr('y', (d, i) => barHeight / 2)
				.attr('x', leftMargin + barWidth)
				.style("dominant-baseline", "middle")
				.text(d => isNaN(d[1]) ? "--" : f(d[1]));

			groups
				.append('text')
				.attr('y', (d, i) => barHeight / 2)
				.attr('x', leftMargin + 2 * barWidth)
				.style("dominant-baseline", "middle")
				.text(d => isNaN(d[2]) ? "--" : f(d[2]));
		}
		else
		{
			groups.append("circle")
				.attr("cx", barWidth - 5)
				.attr("cy", barHeight / 4)
				.style("fill", "#1B9E77")
				.attr("r", 5)
				.on("mouseover", () => {
					d3.select("#modelNameTooltip").transition().duration(200).style("opacity", .9);
					d3.select("#modelNameTooltip").html("<h5>" + that.map.serverModels[that.map.modelsUsed[0]].name + "</h5>")
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");
				})
				.on("mouseout", () => {
					d3.select("#modelNameTooltip").transition().duration(200).style("opacity", 0);
				});

			groups.append("circle")
				.attr("cx", barWidth - 5)
				.attr("cy", barHeight / 2 + barHeight/4)
				.style("fill", "#7570B3")
				.attr("r", 5)
				.on("mouseover", () => {
					d3.select("#modelNameTooltip").transition().duration(200).style("opacity", .9);
					d3.select("#modelNameTooltip").html("<h5>" + that.map.serverModels[that.map.modelsUsed[1]].name + "</h5>")
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");
				})
				.on("mouseout", () => {
					d3.select("#modelNameTooltip").transition().duration(200).style("opacity", 0);
				});

			groups
				.append('text')
				.attr('y', (d, i) => barHeight / 2)
				.attr('x', leftMargin)
				.style("dominant-baseline", "middle")
				.text(d => isNaN(d[0]) ? d[0] : f(d[0]));

			groups
				.append('text')
				.attr('y', (d, i) => barHeight / 4)
				.attr('x', leftMargin + barWidth)
				.style("dominant-baseline", "middle")
				.text(d => isNaN(d[1]) ? "--" : f(d[1]));

			groups
				.append('text')
				.attr('y', (d, i) => barHeight / 4)
				.attr('x', leftMargin + 2 * barWidth)
				.style("dominant-baseline", "middle")
				.text(d => isNaN(d[2]) ? "--" : f(d[2]));

			groups
				.append('text')
				.attr('y', (d, i) => barHeight/2 + barHeight / 4)
				.attr('x', leftMargin + barWidth)
				.style("dominant-baseline", "middle")
				.text(d => isNaN(d[4]) ? "--" : f(d[4]));

			groups
				.append('text')
				.attr('y', (d, i) => barHeight/2 +  barHeight / 4)
				.attr('x', leftMargin + 2 * barWidth)
				.style("dominant-baseline", "middle")
				.text(d => isNaN(d[5]) ? "--" : f(d[5]));
		}
	}


	getSortingOptions(index, ascending) {

		if (!ascending) {
			const sortingFunction = function(a, b) {
				if(index == 0)
				{
					return d3.descending(a[index], b[index]);
				}
				return d3.ascending(a[index], b[index]);
			}
			return sortingFunction;
		} else {
			const sortingFunction = function(a, b) {
				if(index == 0)
				{
					return d3.ascending(a[index], b[index]);
				}
				return d3.descending(a[index], b[index]);
			}
			return sortingFunction;
		}
	}

	highlightRect(id) {
		if(id == "State of Utah")
		{
			this.currentlySelected.forEach(id => {
				if(id == "State of Utah")
					return;
				this.map.unHighlightPath(id);
				this.unHighlightBar(id);
			})

			this.currentlySelected = new Set<string>().add("State of Utah");
			return;
		}

		if(this.currentlySelected.has(id))
		{
			this.currentlySelected.delete(id);
			this.map.unHighlightPath(id);
			this.unHighlightBar(id);

			if(this.currentlySelected.size == 0)
			{
				this.currentlySelected = new Set<string>().add("State of Utah");
			}
			return;
		}

		this.currentlySelected.add(id);
		this.map.highlightPath(id);
		this.highlightBar(id)
	}

	highlightBar(id){
		id = this.removeSpaces(id);

		this.stateSvg.select(`#${id}`)
			.classed('selectedCounty', true);

		this.countiesSvg.select(`#${id}`)
			.classed('selectedCounty', true);
	}


	unHighlightBar(id){
		id = this.removeSpaces(id);

		this.stateSvg.select(`#${id}`)
			.classed('selectedCounty', false);

		this.countiesSvg.select(`#${id}`)
			.classed('selectedCounty', false);
	}

	removeSpaces(s) : string{
		return s.replace(/\s/g, '');
	}

	calculateCountiesData(currentYear, otherCurrentYearData, mapData){
		let countiesData = [];
		for (let county in currentYear) {
			let d = currentYear[county];
			let e = otherCurrentYearData[county] || {};
			if (mapData) {
				countiesData.push([county, d.totalSupplyPer100K, d.totalDemandPer100K, d.totalDemandPer100K - d.totalSupplyPer100K,
				e.totalSupplyPer100K, e.totalDemandPer100K, e.totalDemandPer100K - e.totalSupplyPer100K]);
			} else {
				countiesData.push([county, d.totalSupply, d.totalDemand, d.totalDemand - d.totalSupply, e.totalSupply, e.totalDemand, e.totalDemand - e.totalSupply]);
			}
		};

		return countiesData
	}
}

export { Sidebar };
