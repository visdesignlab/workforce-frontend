import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend'
import {Sidebar} from './Sidebar';
import {Linechart} from './Linechart'
class Map{
	svg:any;
	mapData:string;
	selectedCounty:string;
	supplyScore:any;
	selectedProfessions: any;
	currentYear : any;
	yearSelected: string;
	linechart:Linechart;
	sidebar:Sidebar;

	constructor(mapData:any){
		this.linechart = new Linechart()
		this.selectedCounty = 'State of Utah'
		this.mapData = mapData;
		this.yearSelected = (document.getElementById('year') as HTMLInputElement).value
		this.currentYear = {};
		this.supplyScore = {};
		this.selectedProfessions= {} ;
		this.sidebar = new Sidebar(this.selectedProfessions);
		this.svg = d3.select("#map")
			.append('svg')
			.attr('width', 600)
			.attr('height', 600);
		this.drawMap()
		//based on map data choose color scale.
		//append svg

	}

	drawMap():void{
			
			d3.json('../data/model-results.json').then((results)=> {
				this.svg.selectAll('*').remove();
				this.currentYear = results[this.yearSelected]
				var professions = Object.keys(this.currentYear['State of Utah']['supply']);
				for (let county in this.currentYear) {
					let totalSupply = 0;
					let totalDemand = 0;
					for (let profession of professions) {
						if (!this.selectedProfessions.hasOwnProperty(profession)
							|| this.selectedProfessions[profession]) {
							totalSupply += this.currentYear[county]['supply'][profession];
							totalDemand += this.currentYear[county]['demand'][profession];
						}
					}
					this.currentYear[county]['totalSupply'] = totalSupply;
					this.supplyScore[county] = (totalSupply / totalDemand) / 2;
				}
		
				if (this.mapData == 'supply_need') {
					var linear = d3.scaleOrdinal()
						.domain(['Undersupplied', 'Balanced', 'Oversupplied'])
						.range([d3.interpolateRdBu(0), d3.interpolateRdBu(0.5), d3.interpolateRdBu(1)]);
				} else if (this.mapData == 'supply_per_100k') {
					let max = d3.max(Object.keys(results[this.yearSelected]).map( d => 
						results[this.yearSelected][d]['totalSupply'] / results[this.yearSelected][d]['population'] * 100000
					));
		
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
		
				this.svg.append("g")
					.attr("class", "legendLinear")
					.attr("transform", "translate(20,20)");
				this.svg.select(".legendLinear")
					.call(legendLinear);
				function getSupplyPer100k(county) {
					return county['totalSupply'] / county['population'] * 100000;
				};
				let colorScale = (d)=> {
					let county = d.properties.NAME + ' County';
					if (this.mapData == 'supply_need') {
						return d3.interpolateRdBu(this.supplyScore[county]);
					} else if (this.mapData == 'supply_per_100k') {
						
		
						let max = d3.max(Object.keys(results[this.yearSelected]).map( d => 
							results[this.yearSelected][d]['totalSupply'] / results[this.yearSelected][d]['population'] * 100000
						));
			
						const scale = d3.scaleLinear()
							.domain([0, max])
							.range([0, 1]);
		
						return d3.interpolateBlues(scale(getSupplyPer100k(results[this.yearSelected][county])));
					}
					return d3.interpolateGreens(results[this.yearSelected][county]['population'] / 1000000);
				}
		
		
				d3.json("../data/UT-49-utah-counties.json").then((us)=> {
					var topojsonFeatures = topojson.feature(us, us.objects.cb_2015_utah_county_20m);
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
						.data(topojson.feature(us, us.objects.cb_2015_utah_county_20m).features)
						.enter().append("path")
						.attr("d", path)
						.attr('fill', colorScale)
						.attr('stroke', 'black')
						.on('click', (d)=>{
							console.log(d)
						d3.selectAll('path').classed('selected', false);
							d3.select("#"+d.properties.NAME).classed('selected', true);
							this.selectedCounty = d.properties.NAME + ' County';
							this.linechart.initLineChart(results, this.selectedCounty);
							this.sidebar.initSideBar(this.selectedProfessions,this.currentYear, this.selectedCounty);
						}) 
						.on("mouseover", (d)=>{
		
							var f = d3.format(".2f");
							const supplyDemandRatio = f(2 *this.supplyScore[d.properties.NAME + ' County']);
							const population = this.currentYear[d.properties.NAME + ' County']['population'];
							const supplyPer100k = d3.format('.0f')(
							this.currentYear[d.properties.NAME + ' County']['totalSupply'] / population * 100000);
							
							var toolTip = "<h4>"+d.properties.NAME+" County</h4><table>"+
								"<tr><td>Supply/Need:</td><td>"+(supplyDemandRatio)+"</td></tr>"+
									"<tr><td>Population:</td><td>"+(population)+"</td></tr>"+
									"<tr><td>Supply/100K:</td><td>"+(supplyPer100k)+"</td></tr>"+
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
						.attr("d", path(topojson.mesh(us, us.objects.cb_2015_utah_county_20m, function(a, b) { return a !== b; })));
		
		
					this.sidebar.initSideBar(this.selectedProfessions,this.currentYear);
					this.linechart.initLineChart(results);
				});
		
		

		});
	}
	updateMapType(mapData:string):void{
		this.mapData = mapData;
		this.drawMap();

	}
	updateMapYear(year:string){
		this.currentYear = year;
	}
	
	
	
	mouseOut(){
		d3.select("#tooltip").transition().duration(500).style("opacity", 0);      
	}

}
export{Map};