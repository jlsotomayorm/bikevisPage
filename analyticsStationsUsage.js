var AnalyticsStationsUsage = {


	createAnalyticsStationsUsagePanel: function(dataManager) {
	  var thisModeVisContainer = d3.select("#modeVisContainerAnalyticsStationsUsage");
	  var modeContainerAnalyticsLeft = thisModeVisContainer.append("div")    
	    .attr("id", "modeVisContainerAnalyticsStationsUsageContainerLeftContainer");

	  modeContainerAnalyticsLeft
	    .append("div")
	      .attr("class", "canvases_container") 
	      .style("height", "99%")     
	      .append("div")
	        .attr("id", "StationsUsage_map_container") 
	        .style("visibility", "inherit")       
	        .attr("class", "canvas_container");

	  var modeContainerAnalyticsRight = thisModeVisContainer.append("div")    
	    .attr("id", "modeVisContainerAnalyticsStationsUsageContainerRightContainer");

	  modeContainerAnalyticsRight
	    .append("div")      
	      .attr("id", "modeVisContainerAnalyticsStationsUsageAnalyticsContainer");


	  //  Map viewer.  
	  var mapContainerId = 'StationsUsage_map_container';
	  var mapViewer = 
	    new MapViewerStationsUsage(dataManager, mapContainerId, MapStyles.MAP_STYLE_DARK_NAME);    

	  mapViewer.setActive(true);

	  var analyticsViewer = new StationUsageAnalyticsViewer(dataManager, 'modeVisContainerAnalyticsStationsUsageAnalyticsContainer');
	  analyticsViewer.setActive(true);

	  mapViewer.analyticsViewer = analyticsViewer;
	  analyticsViewer.mapViewer = mapViewer;
	}

}