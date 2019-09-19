import * as d3 from 'd3';
import {Sidebar} from './sidebar'
class SidebarEvents{
	sidebar: Sidebar;

	constructor(sidebar:Sidebar){

		this.sidebar = sidebar;
		this.selectAllClicked();
		this.unSelectAllClicked();

	}
	
	selectAllClicked():void{
		d3.select("#selectAll").on('click',()=>{
			
				Object.keys(this.sidebar.selectedProfessions).forEach(profession => {
					this.sidebar.selectedProfessions[profession] = true;
				d3.select("#" + profession)
					.select('rect')
					.attr('fill', '#cccccc');
				
				})})}
	unSelectAllClicked():void{

		d3.select("#unSelectAll").on('click',()=>{

			Object.keys(this.sidebar.selectedProfessions).forEach(profession => {
				this.sidebar.selectedProfessions[profession] = false;
				d3.select("#" + profession)
					.select('rect')
					.attr('fill', '#ffffff');
			})
		})
		

	}


}
export{SidebarEvents}