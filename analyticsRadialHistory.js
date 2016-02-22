var AnalyticsRadialHistory = {


	createAnalyticsRadialHistoryPanel: function(dataManager) {
	  var thisModeVisContainer = d3.select("#modeVisContainerAnalyticsRadialHistory");
	  var modeContainerUseLeft = thisModeVisContainer.append("div")    
	  	.style("visibility", "inherit")  
	    .attr("id", "modeVisContainerAnalyticsRadialHistoryContainerLeftContainer");

	  modeContainerUseLeft
	    .append("div")
	      .attr("class", "canvases_container")     
	      .style("visibility", "inherit") 	       
	      .style("height", "99%") 	       
	      .append("div")
	        .attr("id", "RadialHistory_map_container") 
	        .style("visibility", "inherit")       
	        .attr("class", "canvas_container");

	  var modeContainerUseRight = thisModeVisContainer.append("div")    
	    .attr("id", "modeVisContainerAnalyticsRadialHistoryContainerRightContainer");

	  var analyticsContainer = modeContainerUseRight
	    .append("div")      
	      .attr("id", "modeVisContainerAnalyticsRadialHistoryAnalyticsContainer");	    
	  

	  //  Map viewer.  
	  this.mapContainerId = 'RadialHistory_map_container';
	  this.mapViewer = 
	    new MapViewerAnalyticsRadialHistory(dataManager, this.mapContainerId, MapStyles.MAP_STYLE_DARK_NAME);    

	  this.mapViewer.setActive(true);
	  this.mapViewer.analyticsContainer = analyticsContainer;

	  //mapViewwer.setActive turns visibility on, so we need to turn it off again...
	  modeContainerUseLeft.select(".canvas_container")
	  	.style("visibility", "inherit");




	  // right side stuff

	  var that = this;	   
	}

}