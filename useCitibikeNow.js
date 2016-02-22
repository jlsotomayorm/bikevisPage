var UseCitibikeNow = {


	createUseCitibikeNowPanel: function(dataManager) {
	  var thisModeVisContainer = d3.select("#modeVisContainerUseCitibikeNow");
	  var modeContainerUseLeft = thisModeVisContainer.append("div")    
	  	.style("visibility", "inherit")  
	    .attr("id", "modeVisContainerUseCitibikeNowContainerLeftContainer");

	  modeContainerUseLeft
	    .append("div")
	      .attr("class", "canvases_container")     
	      .style("visibility", "inherit") 	       
	      .style("height", "99%") 	       
	      .append("div")
	        .attr("id", "CitibikeNow_map_container") 
	        .style("visibility", "inherit")       
	        .attr("class", "canvas_container");

	  var modeContainerUseRight = thisModeVisContainer.append("div")    
	    .attr("id", "modeVisContainerUseCitibikeNowContainerRightContainer");

	  var analyticsContainer = modeContainerUseRight
	    .append("div")      
	      .attr("id", "modeVisContainerUseCitibikeNowAnalyticsContainer");	    
	  

	  //  Map viewer.  
	  this.mapContainerId = 'CitibikeNow_map_container';
	  this.mapViewer = 
	    new MapViewerCitibikeNow(dataManager, this.mapContainerId, MapStyles.MAP_STYLE_DARK_NAME);    

	  this.mapViewer.setActive(true);

	  //mapViewwer.setActive turns visibility on, so we need to turn it off again...
	  modeContainerUseLeft.select(".canvas_container")
	  	.style("visibility", "inherit");




	  // right side stuff


	  analyticsContainer
	  	.append("label")
	  	.attr("class", "control_label")	  	
	  	.attr("for", "frequency")	
	  	.text("Frequency range (activity/min)");

	  analyticsContainer
	  	.append("input")
	  	.attr("type", "text")
	  	.attr("id", "frequency")
	  	.attr("readonly", "true")
	  	.style("background", "black")
	  	.style("font-weight", "bold")
	  	.style("border", "0")
	  	.style("width", "50")
	  	.style("margin", "10px")
	  	.style("float", "left")
	  	.style("color", "white");	

	  var that = this;

	  var frequencySlider = analyticsContainer
	  	.append("div")
	  		.attr("id", "frequencySlider");

	  var frequencyColorScaleWidth = 220;
	  var frequencyColorScaleHeight = 10;
	  var frequencyColorScale = analyticsContainer
	  	.append("div")
	  		.style("margin", "10px")
	  		.style("height", frequencyColorScaleHeight + "px")
	  		.style("width", frequencyColorScaleWidth + "px");

	  var resolution = 10;
	  for (i = 0; i <= resolution; i++) {
	  	frequencyColorScale
	  		.append("div")
		  		.style("width", ((frequencyColorScaleWidth - 10)/(resolution + 1))  + "px")
		  		.style("height", frequencyColorScaleHeight + "px")
		  		.style("float", "left")
		  		.style("background", that.mapViewer.frequencyColorScale(i/resolution));
	  }

	  $(function() {
	    $( "#frequencySlider" ).slider({
	      range: true,
	      min: 0,
	      max: 3,
	      step: 0.1,
	      values: [ that.mapViewer.lowFrequency, that.mapViewer.highFrequency ],
	      slide: function( event, ui ) {
	      	that.mapViewer.lowFrequency = ui.values[ 0 ];
	      	that.mapViewer.highFrequency = ui.values[ 1 ];
	        $( "#frequency" ).val( "" + ui.values[ 0 ] + " - " + ui.values[ 1 ] );
	        that.mapViewer.updateStationsState();
	      }
	    });
	    $( "#frequency" ).val( "" + $( "#frequencySlider" ).slider( "values", 0 ) +
      		" - " + $( "#frequencySlider" ).slider( "values", 1 ) );
	  });

	  
	  // var analyticsViewer = new StationUsageAnalyticsViewer(dataManager, 'modeVisContainerAnalyticsStationsUsageAnalyticsContainer');
	  // analyticsViewer.setActive(true);

	  // mapViewer.analyticsViewer = analyticsViewer;
	  // analyticsViewer.mapViewer = mapViewer;
	}

}