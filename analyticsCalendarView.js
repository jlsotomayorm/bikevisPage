var AnalyticsCalendarView = {


	createAnalyticsCalendarViewPanel: function(dataManager) {

	  var thisModeVisContainer = d3.select("#modeVisContainerAnalyticsCalendarView");
	  var modeContainerUseLeft = thisModeVisContainer.append("div")    
	  	.style("visibility", "inherit")  
	    .attr("id", "modeVisContainerAnalyticsCalendarViewContainerLeftContainer");

	  modeContainerUseLeft
	    .append("div")
	      .attr("class", "canvases_container")     
	      .style("visibility", "inherit") 	       
	      .style("height", "99%") 	       
	      .append("div")
	        .attr("id", "CalendarView_map_container") 
	        .style("visibility", "inherit")       
	        .attr("class", "canvas_container");

	  var modeContainerUseMiddle = thisModeVisContainer.append("div") 
	  	.style("visibility", "inherit") 	  	
	  	// .style("background", d3.rgb(30,25,53,1)) 
	    .attr("id", "modeVisContainerAnalyticsCalendarViewContainerMiddleContainer");

	  var timelineControlsDiv = modeContainerUseMiddle.append("div")
	 	.style("float", "left") 
	 	.style("position", "relative")
	  	.style("top", "-20px") 
	  	.style("height", "20px");	

	  timelineControlsDiv.append("div")
	  	.style("float", "left")
	   // 	.style("position", "relative")	  	
	  	// .style("top", "-20px")
	   	.text("Timeline");

	  timelineControlsDiv
	  	.append("span")
	  	.style("float", "left") 
	  	// .style("position", "relative")
	  	// .style("left", "10") 
	  	// .style("top", "-20px")
	  	.attr("id", "calendarTimelinePlayStopIcon")
	  	.attr("class", "ui-icon ui-icon-play")
	  	.on("click", function() {

	  		if (d3.select(this).attr("class") == "ui-icon ui-icon-play") {
	  			that.matrixViewer.playing = true;
	  			d3.select(this).attr("class", "ui-icon ui-icon-stop");
	  			that.matrixViewer.updateBrushExtentPlaying(that.matrixViewer);
	  		} else {
	  			that.matrixViewer.playing = false;
				d3.select(this).attr("class", "ui-icon ui-icon-play");
				
	  		}	  		
	  	});  

	  var modeContainerUseRight = thisModeVisContainer.append("div")    
	  	.style("visibility", "inherit")
	    .attr("id", "modeVisContainerAnalyticsCalendarViewContainerRightContainer");

	  var analyticsContainer = modeContainerUseRight
	    .append("div")      
	      .attr("id", "modeVisContainerAnalyticsCalendarViewAnalyticsContainer");	    
	  

	  //  Map viewer.  
	  this.mapContainerId = 'CalendarView_map_container';
	  this.mapViewer = 
	    new MapViewerAnalyticsCalendarView(dataManager, this.mapContainerId, MapStyles.MAP_STYLE_DARK_NAME);    

	  this.mapViewer.setActive(true);
	  this.mapViewer.analyticsContainer = analyticsContainer;

	  this.matrixViewer = new CalendarViewMatrixViewer(dataManager, 'modeVisContainerAnalyticsCalendarViewContainerMiddleContainer');
	  this.matrixViewer.setActive(true);

	  this.mapViewer.matrixViewer = this.matrixViewer;
	  this.matrixViewer.mapViewer = this.mapViewer;
	  this.matrixViewer.analyticsContainer = analyticsContainer;

	  //mapViewwer.setActive turns visibility on, so we need to turn it off again...
	  modeContainerUseLeft.select(".canvas_container")
	  	.style("visibility", "inherit");
	  modeContainerUseMiddle
	  	.style("visibility", "inherit");

	  

	  // right side stuff ------------------------------------------------------------------------------------

	  var that = this;

	  var toggleDayOfWeek = function (day, dayNumber) {
	  	// console.log("toggleDayOfWeek: " + day);
	  	that.matrixViewer.dayOfWeek = dayNumber;
	  	
	  	// that.matrixViewer.reorderLines();
	  	// that.matrixViewer.updateRankingLists();	
	  	
	  	that.matrixViewer.updateMatrix();
	  }

	  // var div = analyticsContainer.append("div")
	  // 	.style("border", "1px solid rgb(190, 190, 190)")	  	
	  // 	.style("height", "80px")	
	  // 	.style("margin", "10px")	
	  // 	.style("padding", "10px");

	  
	  // div2 = div.append("div")	 
	  // 	.style("clear", "both")	 
	  // 	.style("height", "60px")
	  // 	.style("padding", "10px"); 

  	
	var div = analyticsContainer.append("div")
	  	.style("border", "1px solid rgb(190, 190, 190)")	  		  	
	  	.style("margin", "10px")
	  	.style("clear", "both")
	  	.style("height", "520px")
	  	.style("padding", "10px");	   

	  

	  div = div.append("div")	  	
	  	.style("padding", "10px");
  

	  var colorScaleWidth = 220;
	  var colorScaleHeight = 10;

	  var div2 = div.append("div")	
	  	.style("position", "relative")
	  	// .style("top", "-8px")
	  	.style("left", "-5px")  		  	
	  	.style("width", colorScaleWidth + "px");

	  div2.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "left")
	  	.style("color", "black")
	  	.attr("id", "calendarViewMinValueLabel")	  	
	  	.attr("for", "minValue")	
	  	.text("0.0");

	  div2.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "right")
	  	.style("color", "black")	  	
	  	.attr("id", "calendarViewMaxValueLabel")
	  	.attr("for", "maxValue")	
	  	.text("1.0");

	  var colorScale = div
	  	.append("div")
	  		.attr("id", "calendarViewColorScale")
	  		.style("float", "left")
	  		.style("height", colorScaleHeight + "px")
	  		.style("width", "100%");
	  

	  var colorScaleOptions = colorScale.append("select")
	  // var colorScaleOptions = div.append("select")
	  	.style("clear", "both")
	  	.style("position", "relative")
	  	.style("top", "-8px")
	  	.style("left", "10px")
	  	.attr("name", "colorScale")	  	
	  	.attr("id", "analyticsCalendarViewColorScaleOptions")
	  	.on("change", function() {
	  		// console.log(this.value);
	  		that.matrixViewer.actualPropertyColorScale = that.matrixViewer.colorScales[this.value];
	  		that.matrixViewer.updateColorScale();  		
	  	});	  

	  div2 = div.append("div")
	  	.style("clear", "both");

	  	var colorScaleRangeSlider = div2
		  .append("div")
		  	.style("width", "208px")
		  	// .style("position", "relative")
	  		// .style("top", "8px")
		  	.attr("id", "calendarValueRangeSlider");

		$("#calendarValueRangeSlider").hide();

		$(function() {
		    $( "#calendarValueRangeSlider" ).slider({
		      range: true,
		      min: 0,
		      max: 1,
		      values: [ 0, 1 ],
		      slide: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	// that.mapViewer.mapGLRenderer.upSelectedMin = ui.values[ 0 ];
		      	// that.mapViewer.mapGLRenderer.upSelectedMax = ui.values[ 1 ];
		        $( "#calendarViewMinValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 0 ], that.matrixViewer.variable));
		        $( "#calendarViewMaxValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 1 ], that.matrixViewer.variable));		        
		        that.matrixViewer.actualMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualMaxValue = ui.values[ 1 ];
		      },
		      stop: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	// that.mapViewer.mapGLRenderer.upSelectedMin = ui.values[ 0 ];
		      	// that.mapViewer.mapGLRenderer.upSelectedMax = ui.values[ 1 ];
		        $( "#calendarViewMinValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 0 ], that.matrixViewer.variable));
		        $( "#calendarViewMaxValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 1 ], that.matrixViewer.variable));		        
		        that.matrixViewer.actualMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualMaxValue = ui.values[ 1 ];
		        
		        that.matrixViewer.updateRangeSliderLimits = false;
		        that.matrixViewer.createMatrix();
		        
		    //     that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  			// that.mapViewer.mapGLRenderer.render_();
	  			// console.log("stop");
		      }
		    });
		    // $( "#calendarViewMinValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 0 ], that.matrixViewer.variable));
		    // $( "#calendarViewMaxValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 1 ], that.matrixViewer.variable));		        
		    // that.mapViewer.mapGLRenderer.upSelectedMin = $( "#upRangeSlider" ).slider( "values", 0 );
		    // that.mapViewer.mapGLRenderer.upSelectedMax = $( "#upRangeSlider" ).slider( "values", 1 );
		  });

		div2 = div.append("div")
	  		.style("clear", "both");	  

	 //  div2
	 //  	.append("label")
	 //  	.style("position", "relative")
		// .style("top", "6px")
	 //  	.style("color", "black")	  	
	 //  	.attr("for", "useGlobalNormalization")	
	 //  	.text("Global normalization");

	 //  div2
	 //  	.append("input")
	 //  	.style("position", "relative")
		// .style("top", "6px")
	 //  	.attr("type", "checkbox")
	 //  	.attr("checked", "true")
	 //  	.attr("id", "useGlobalNormalization");

	  // $( "#useGlobalNormalization" ).on( "click", function( event ) {
	  //     	// console.log(event.currentTarget.checked);
	  //     	that.matrixViewer.useGlobalNormalization = event.currentTarget.checked;
	  //     	that.matrixViewer.createMatrix();
	  //     	that.matrixViewer.updatedMatrixPointedLine(that.matrixViewer.lastPointedStationOrder);
	  //     });
	  
	  div2 = div.append("div")	
	  	.style("border", "1px solid rgb(230, 230, 230)")	  		  	
	  	.style("margin-top", "5px")
	  	.style("margin-top", "10px")
	  	.style("clear", "both")
	  	.style("height", "50px")
	  	.style("padding", "5px");  	
	  	// .style("padding-top", "10px");

	  div3 = div2.append("div")
	  	.style("height", "20px");

	  div3
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "variables")	
	  	.text("Display:");	  

	  var reducerOptions = div3.append("select")
	  	.attr("name", "reducer")
	  	.style("float", "right")	  		  	
	  	.attr("id", "analyticsCalendarViewReducer")
	  	.on("change", function() {
	  		that.matrixViewer.dailyReducer = that.matrixViewer.dailyReducerNametoKeyMap[this.value];
	  		// if (that.matrixViewer.displayAndOrderLocked) {

	  		// 	var orderingStat = that.matrixViewer.ordering.split(": ")[1];

	  		// 	if (orderingStat != "max" &&
			  //     orderingStat != "min" &&
			  //     orderingStat != "mean" &&
			  //     orderingStat != "range") {

			  //     orderingStat = "mean";
			  //   }

	  			// that.matrixViewer.ordering = this.value + ": " + orderingStat;

	  			that.matrixViewer.reorderLines();
				that.matrixViewer.updateRankingLists();	  
			// }			  
			that.matrixViewer.updateRangeSliderLimits = true;
	  		that.matrixViewer.updateMatrix();
	  	});

	  var variableOptions = div3.append("select")
	  	.attr("name", "variables")
	  	.style("float", "right")	  		  	
	  	.style("width", "193px")	  		  	
	  	.attr("id", "analyticsCalendarViewVariables")
	  	.on("change", function() {
	  		that.matrixViewer.variable = that.matrixViewer.variableNametoKeyMap[this.value];
	  		if (that.matrixViewer.displayAndOrderLocked) {

	  			var orderingStat = that.matrixViewer.ordering.split(": ")[1];

	  			if (orderingStat != "max" &&
			      orderingStat != "min" &&
			      orderingStat != "mean" &&
			      orderingStat != "range") {

			      orderingStat = "mean";
			    }

	  			that.matrixViewer.ordering = this.value + ": " + orderingStat;

	  			that.matrixViewer.reorderLines();
				that.matrixViewer.updateRankingLists();	  
			}			  
			that.matrixViewer.updateRangeSliderLimits = true;
	  		that.matrixViewer.updateMatrix();
	  	});
	  
	  div3 = div2.append("div")
	  	.style("height", "20px");

	  div3
	  	.append("span")
	  	.style("position", "relative")
	  	.style("left", "15px") 
	  	.style("top", "-2px")
	  	.attr("id", "calendarViewDisplayAndOrderLockIcon")
	  	.attr("class", "ui-icon ui-icon-locked")
	  	.on("click", function() {

	  		if (d3.select(this).attr("class") == "ui-icon ui-icon-locked") {
	  			that.matrixViewer.displayAndOrderLocked = false;
	  			d3.select(this).attr("class", "ui-icon ui-icon-unlocked");
	  		} else {
	  			that.matrixViewer.displayAndOrderLocked = true;
				d3.select(this).attr("class", "ui-icon ui-icon-locked");
				that.matrixViewer.reorderLines();
				that.matrixViewer.updateRankingLists();	  		
	  			that.matrixViewer.updateMatrix();
	  		}	  		
	  	});

	  div3
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	
	  	.style("position", "relative")
	  	.style("top", "-2px")  		  	
	  	.attr("for", "ordering")	
	  	.text("Order:");

	  var orderingOptions = div3.append("select")
	  	.attr("name", "ordering")
	  	.style("float", "right")
	  	.style("position", "relative")
	  	.style("top", "-10px") 	  		  	
	  	.attr("id", "analyticsCalendarViewOrdering")
	  	.on("change", function() {  

	  		that.matrixViewer.ordering = this.value;

	  		if (that.matrixViewer.displayAndOrderLocked && that.matrixViewer.ordering.split(':')[0] != "Station") {
	  			that.matrixViewer.variable = that.matrixViewer.variableNametoKeyMap[that.matrixViewer.ordering.split(':')[0]];
	  		  
			}		

			for (stationIndex in that.matrixViewer.stations) {			    
				that.matrixViewer.stations[stationIndex].orderHistory = [];			    
			}  		
	  		
	  		that.matrixViewer.reorderLines();
	  		
	  		that.matrixViewer.updateRankingLists();	  		
	  		that.matrixViewer.updateMatrix();	  		
	  	});  

	  


	div = div.append("div")
		.style("border", "1px solid rgb(230, 230, 230)")
		.style("margin-top", "10px")	
		.style("height", "350px")
		.style("clear", "both")
		.style("padding", "5px")
	  	.style("padding-top", "20px");

	div
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.text("Ranking");

	div = div.append("div")
		.style("clear", "both")
	  	.style("padding-top", "20px");	

	var divLeft = div.append("div")
		.style("padding", "5px")
		.style("background", function() {			
			return "white";
		})
		.style("float", "left")
		.style("width", "45%");	  	

	  divLeft
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.text("Top: ");	

	  divLeft
		  .append("div")
		  	.attr("id", "calendarViewTopStationsList")
		  	.style("padding", "5px")
			.style("height", "200px")
			.style("background", function() {				
				return "white";
			});

	var divRight = div.append("div")
		.style("padding", "5px")
		.style("background", function() {			
			return "white";
		})
		.style("float", "right")
		.style("width", "45%");	  	

	  divRight
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.text("Last: ");	

	  divRight
		  .append("div")
		  	.attr("id", "calendarViewLastStationsList")
			.style("padding", "5px")
			.style("height", "200px")
			.style("background", function() {				
				return "white";
			});

	 div = analyticsContainer.append("div")
	  	.style("border", "1px solid rgb(190, 190, 190)")	  		  	
	  	.style("margin", "10px")
	  	.style("height", "260px")
	  	.style("clear", "both")	  		  	
	  	.style("padding", "10px");

	  div
	  	.append("label")
	  	.style("color", "black")	  		  		  	
	  	.text("Selection information");

	  div = div.append("div");	  	

	  divLeft = div.append("div")
	  	.style("float", "left")
	  	.style("height", "240px")
	  	.style("width", "45%")
	  	.style("padding", "5px");

	  var divInfoCursor = divLeft.append("div")
	  	.style("height", "140px")
	  	.style("padding", "0px");

	  divInfoCursor
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.attr("for", "selectInfoCursor")	
	  	.text("Cursor:");

	  var list = divInfoCursor.append("ul");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "calendarViewInfoCursorId")  		
	  	.text("Id:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "calendarViewInfoCursorNumber")  		
	  	.text("Number:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "calendarViewInfoCursorName")  		
	  	.text("Name:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "calendarViewInfoCursorRank")  		
	  	.text("Rank:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "calendarViewInfoCursorRankingValue")  		
	  	.text("Ranking value:");

	  var divInfoBrush = divLeft.append("div")
	  	.style("height", "100px")
	  	.style("padding", "0px");

	  divInfoBrush
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.attr("for", "selectInfoBrush")	
	  	.text("Brush:");

	  list = divInfoBrush.append("ul");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "calendarViewInfoBrushTimeWindow")  		
	  	.text("Time window:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "calendarViewInfoBrushRowRange")  		
	  	.text("Row range:");

	  divRight = div.append("div")
	  	.style("float", "right")
	  	.style("width", "45%")
	  	.style("height", "240px")	  	
	  	.style("padding", "0px");

	  divRight
	  	.append("label")
	  	.style("color", "black")	  		  		  	
	  	.text("Area:");

	  divRight
		  .append("div")
		  	.attr("id", "calendarViewAreaStationsList")
		  	.style("padding", "5px")
		  	.style("overflow-y", "scroll")		  	
			.style("height", "200px");
	 
	}

}