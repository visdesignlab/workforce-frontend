import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {Sidebar} from './sidebar';
import {Linechart} from './linechart'
/**
 * 
 */
class Map{
	svg:any;
	mapData:string;
	selectedCounty:string;
	supplyScore:any;
	selectedProfessions: any;
	currentYearData : any;
	yearSelected: string;
	linechart:Linechart;
	sidebar:Sidebar;

	/**
	 * 
	 */
	constructor(){
		this.selectedProfessions = {}
		this.linechart = new Linechart()
		this.selectedCounty = 'State of Utah'
		this.mapData = "supply_need";
		this.yearSelected = (document.getElementById('year') as HTMLInputElement).value
		this.currentYearData = {};
		this.supplyScore = {};
		this.sidebar = new Sidebar(this);
		this.svg = d3.select("#map")
			.append('svg')
			.attr('width', 600)
			.attr('height', 600);
		this.drawMap()


	}
	/**
	 * initial drawing of map.
	 */
	drawMap(map = 'LHD'):void{
			d3.json('../data/model-results.json').then((results)=> {
				results = results[map];
				this.svg.selectAll('*').remove();
				this.currentYearData = results[this.yearSelected]
				var professions = Object.keys(this.currentYearData['State of Utah']['supply']);
				for(let profession in professions){
				}
				for (let county in this.currentYearData) {
					let totalSupply = 0;
					let totalDemand = 0;
					for (let profession of professions) {
						this.selectedProfessions[profession]= true;
						totalSupply += this.currentYearData[county]['supply'][profession];
						totalDemand += this.currentYearData[county]['demand'][profession];
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
					projection = d3.geoMercator().scale(4000).translate([600/2, 600/2])
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
						.on('click', function(d){
						d3.selectAll('path').classed('selected', false);
							d3.select(this).classed('selected', true);
							that.selectedCounty = d.properties.NAME;
							//TODO
							//update sidebar/linechart when we click on a county
							that.linechart.initLineChart(results, that.selectedCounty);
							that.sidebar.initSideBar(that.selectedProfessions, that.currentYearData, that.selectedCounty);
						}) 
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
							"<tr><td>Demand/100K:</td><td>"+(demandPer100k)+"</td></tr>"+
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



					this.sidebar.initSideBar(this.selectedProfessions,this.currentYearData);
					this.linechart.initLineChart(results);
				});
		
		

		});
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
	updateMapType(mapData:string):void{
		this.mapData = mapData;
		let that:any = this;
		let colorScale:any = this.myColorScale; 
		let linear:any =this.getLinear(this.mapData,this.currentYearData) 
		var legendLinear:any = legendColor()
					.shapeWidth(115)
					.labelFormat(d3.format(".0f"))
					.orient('horizontal')
					.scale(linear);

		d3.select('g.legendLinear').call(legendLinear)	
		d3.json("../data/UT-49-utah-counties.json").then((us)=> {
			this.svg.select('g.counties').selectAll('path').each(function(d){
				var selectedCounty:string = d.properties.NAME
				d3.select(this).transition().duration(1000).attr('fill',colorScale(d,that,mapData));

			});
		this.sidebar.initSideBar(this.selectedProfessions,this.currentYearData,this.selectedCounty);
		});
	
	}
	/**
	 * This handles when the user selects a new year
	 * @param year this is the new year selected by the user
	 */
	updateMapYear(year:string):void{
		this.yearSelected = year;
		d3.json('../data/model-results.json').then((results)=> {
			this.currentYearData = results[this.yearSelected]
				var professions = Object.keys(this.currentYearData['State of Utah']['supply']);
				for (let county in this.currentYearData) {
					let totalSupply = 0;
					let totalDemand = 0;
					for (let profession of professions) {
						if (!this.sidebar.selectedProfessions.hasOwnProperty(profession)
							|| this.sidebar.selectedProfessions[profession]) {
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
		});
		//after we update the year, we then update the map
		this.updateMapType(this.mapData);
	}
	updateSelections(selectedProfessions:any){
		this.selectedProfessions = selectedProfessions;
		this.updateMapYear(this.yearSelected)
	}
	mouseOut(){
		d3.select("#tooltip").transition().duration(500).style("opacity", 0);      
	}

}
export{Map};
