import * as d3 from 'd3';
import {Sidebar} from './sidebar'
class SidebarEvents{
	sidebar: Sidebar;

	constructor(sidebar:Sidebar){

		this.sidebar = sidebar;
		this.selectAllClicked();

	}
	
	selectAllClicked():void{
		d3.select("#selectAll").on('click',()=>{
			let setAllTrue:boolean = false;
			console.log(this.sidebar.selectedProfessions)
			console.log(Object.keys(this.sidebar.selectedProfessions))
			Object.keys(this.sidebar.selectedProfessions).forEach(profession => {
				if(this.sidebar.selectedProfessions[profession]===false){
					setAllTrue = true;
				}
			});
			if(setAllTrue){
				Object.keys(this.sidebar.selectedProfessions).forEach(profession => {
					this.sidebar.selectedProfessions[profession] = true;
				d3.select("#" + profession)
					.select('rect')
					.attr('fill', '#cccccc');
				})
				}
			
			else{
				Object.keys(this.sidebar.selectedProfessions).forEach(profession => {
					this.sidebar.selectedProfessions[profession] = false;
				d3.select("#" + profession)
					.select('rect')
					.attr('fill', '#ffffff');
				})
				
			}
			});

	}


}
export{SidebarEvents}