var AnalyticsFlowEstimation = {


	createAnalyticsFlowEstimationPanel: function(dataManager) {
	  var thisModeVisContainer = d3.select("#modeVisContainerAnalyticsFlowEstimation");
	  var modeContainerAnalyticsLeft = thisModeVisContainer.append("div")   
	  	.style("visibility", "inherit")  
	    .attr("id", "modeVisContainerAnalyticsFlowEstimationContainerLeftContainer");

	  modeContainerAnalyticsLeft
	    .append("div")
	      .attr("class", "canvases_container") 
	      .style("height", "99%")
	      .style("visibility", "inherit") 	      
	      .append("div")
	        .attr("id", "FlowEstimation_map_container")
	        .style("visibility", "inherit")        	        
	        .attr("class", "canvas_container");

	  var modeContainerAnalyticsRight = thisModeVisContainer.append("div")    
	    .attr("id", "modeVisContainerAnalyticsFlowEstimationContainerRightContainer");

	  modeContainerAnalyticsRight
	    .append("div")      
	      .attr("id", "modeVisContainerAnalyticsFlowEstimationAnalyticsContainer");

	  var analyticsContainer = modeContainerAnalyticsRight;


	  //  Map viewer.  
	  var mapContainerId = 'FlowEstimation_map_container';
	  this.mapViewer = 
	    new MapViewerFlowEstimation(dataManager, mapContainerId, MapStyles.MAP_STYLE_DARK_NAME);

	  this.mapViewer.analyticsContainer = analyticsContainer;   
	  this.mapViewer.mapGLRenderer.analyticsContainer = analyticsContainer;

	  this.mapViewer.mapGLRenderer.mapViewer = this.mapViewer;

	  this.mapViewer.setActive(true);

	  //mapViewwer.setActive turns visibility on, so we need to turn it off again...
	  modeContainerAnalyticsLeft.select(".canvas_container")	  	
	  	.style("visibility", "inherit");

	  var that = this;

	  var div = analyticsContainer.append("div")
	  	.style("border", "1px solid rgb(190, 190, 190)")	  	
	  	.style("height", "80px")	
	  	.style("margin", "10px")	
	  	.style("padding", "10px");

	  var div2 = div.append("div")
	  	.style("float", "left")	
	  	.style("height", "20px");

	  div2
	  	.append("label")
	  	.style("color", "black")	
	  	.style("float", "left")
	  	.attr("id", "flowPeriodLabel")	 
	  	.style("font-weight", "bold")	   		  	
	  	.text("Period: "); 

	  var variableOptions = div2.append("select")
	  	.attr("name", "period")
	  	.style("position", "relative")
	  	.style("left", "5px")
	  	.style("top", "-3px")
	  	.attr("id", "analyticsFlowPeriod")
	  	.on("change", function() {
	  		d3.select("#flowPeriodLabel").style("font-weight", "bold");
	  		d3.select("#flowDayLabel").style("font-weight", "normal");
	  		that.mapViewer.mapGLRenderer.period = this.value.split(" ")[0];
	  		// that.matrixViewer.dataManager_.getStationsDayOfWeekModels(that.matrixViewer, that.matrixViewer.period);
	  	}); 

	  div2 = div.append("div")
	  	.style("float", "right")	
	  	.style("height", "20px");

	  div2
	  	.append("label")
	  	.style("color", "black")	
	  	.style("float", "left")	  
	  	.attr("id", "flowDayLabel") 		  	
	  	.text("Day: ");

	  var datepicker = div2.append("input")	  	
	  	.style("position", "relative")
	  	.style("left", "5px")
	  	.style("top", "-3px")
	  	.attr("id", "flowDatepicker");  	  

	  $(function() {
	    $( "#flowDatepicker" ).datepicker({
	    	dateFormat: "mm/dd/yy",
		    onClose: function( selectedDate ) {

		    	console.log(selectedDate);
		    	var date = selectedDate.split("/")[2] + "-" + selectedDate.split("/")[1] + "-" + selectedDate.split("/")[0];
		    	// var date1 = new Date(selectedDate.split("/")[2] + "-" + selectedDate.split("/")[0] + "-" + selectedDate.split("/")[1]);
		    	// date1.setDate(date1.getDate()+1);
		    	// var date2 = date1.toISOString();
		    	// date2 = date2.split("T")[0];
		    	// date = date2.split("-")[0] + "-" + date2.split("-")[2] + "-" + date2.split("-")[1];
		    	
		    	that.mapViewer.mapGLRenderer.dataManager_.getDailyCirculation(date, that.mapViewer.mapGLRenderer);    
		    	d3.select("#flowPeriodLabel").style("font-weight", "normal");
			  	d3.select("#flowDayLabel").style("font-weight", "bold");
			  	d3.selectAll(".flowDayOfWeekButtom").style("font-weight", "normal");
		    }
	    });
	  });	  

	   

	var div2 = div.append("div")
	  .style("padding-top", "30px")
	  .style("height", "70px"); 

  	div2
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.text("Days of Week"); 

	div2 = div2.append("div")
	  .style("padding", "10px");

  	div2.selectAll(".flowDayOfWeekButtom").data(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
  		"Saturday", "Sunday", "Weekdays", "Weekend", "All"])
  	.enter().append("div")		  	
	  	.attr("id", function (d) { return "flow" + d + "Button";})
	  	.attr("class", "flowDayOfWeekButtom")		  	
	  	.style("background", "white")
	  	.style("font-weight", function (d) {
	  		// if (d == "All") {
	  		// 	return "bold";
	  		// } else {
	  			return "normal";
	  		// }
	  	})
	  	// .style("border", "1px double")
	  	// .style("border-color", "gray")
	  	.style("cursor", "pointer")
	  	.style("padding", "5px")
	  	.style("float", "left")
	  	.style("text-align", "center")
	  	.style("color", "black")
	  	.on("click", function (d,i) {

	  		if (d == "All") {
	  			d3.select("#flowMondayButton").style("font-weight", "bold");
	  			d3.select("#flowTuesdayButton").style("font-weight", "bold");
	  			d3.select("#flowWednesdayButton").style("font-weight", "bold");
	  			d3.select("#flowThursdayButton").style("font-weight", "bold");
	  			d3.select("#flowFridayButton").style("font-weight", "bold");
	  			d3.select("#flowSaturdayButton").style("font-weight", "bold");
	  			d3.select("#flowSundayButton").style("font-weight", "bold");
	  		} else if (d == "Weekdays") {
	  			d3.select("#flowMondayButton").style("font-weight", "bold");
	  			d3.select("#flowTuesdayButton").style("font-weight", "bold");
	  			d3.select("#flowWednesdayButton").style("font-weight", "bold");
	  			d3.select("#flowThursdayButton").style("font-weight", "bold");
	  			d3.select("#flowFridayButton").style("font-weight", "bold");
	  			d3.select("#flowSaturdayButton").style("font-weight", "normal");
	  			d3.select("#flowSundayButton").style("font-weight", "normal");
	  		} else if (d == "Weekend") {
	  			d3.select("#flowMondayButton").style("font-weight", "normal");
	  			d3.select("#flowTuesdayButton").style("font-weight", "normal");
	  			d3.select("#flowWednesdayButton").style("font-weight", "normal");
	  			d3.select("#flowThursdayButton").style("font-weight", "normal");
	  			d3.select("#flowFridayButton").style("font-weight", "normal");
	  			d3.select("#flowSaturdayButton").style("font-weight", "bold");
	  			d3.select("#flowSundayButton").style("font-weight", "bold");
	  		} else {
	  			// if (d3.select(this).style("font-weight") == "bold") {
		  		// 	// return;
		  		// } else {
		  			d3.selectAll(".flowDayOfWeekButtom").style("font-weight", "normal");
		  			d3.select(this).style("font-weight", "bold");
		  		// };
		  	}
	  		toggleDayOfWeek(d, i);
	  		// that.mapViewer.mapGLRenderer.updateTimeline();
	  	})
	  	.text(function (d) { return d;});

	d3.select("#flowMondayButton").style("font-weight", "bold");
	// d3.select("#flowTuesdayButton").style("font-weight", "bold");
	// d3.select("#flowWednesdayButton").style("font-weight", "bold");
	// d3.select("#flowThursdayButton").style("font-weight", "bold");
	// d3.select("#flowFridayButton").style("font-weight", "bold");
	// d3.select("#flowSaturdayButton").style("font-weight", "bold");
	// d3.select("#flowSundayButton").style("font-weight", "bold");

	div = analyticsContainer.append("div")
	  	.style("border", "1px solid rgb(190, 190, 190)")	  	
	  	.style("height", "140px")	
	  	.style("margin", "10px")	
	  	.style("padding", "10px");

	var timelineDiv =   div
	  	.append("div")
	  	.attr("id", "analyticsFlowEstimationTimelineDiv")
	  	.style("width", "820px");

	timelineDiv.append("div")
		.style("float", "left") 
		.style("height", "40px") 
		.text("Timeline");

	 var timelineControlsDiv = timelineDiv.append("div")
	 	.style("float", "left") 
	 	.style("position", "relative")
	  	.style("left", "20px") 
	  	.style("height", "20px");	

	  timelineControlsDiv
	  	.append("span")
	  	.style("float", "left") 
	  	// .style("position", "relative")
	  	// .style("left", "10") 
	  	// .style("top", "-2px")
	  	.attr("id", "flowTimelinePlayStopIcon")
	  	.attr("class", "ui-icon ui-icon-play")
	  	.on("click", function() {

	  		if (d3.select(this).attr("class") == "ui-icon ui-icon-play") {
	  			that.mapViewer.mapGLRenderer.playing = true;
	  			d3.select(this).attr("class", "ui-icon ui-icon-stop");
	  			that.mapViewer.mapGLRenderer.analyticsContainer.timeline.updateBrushExtentPlaying(that.mapViewer.mapGLRenderer.analyticsContainer.timeline);
	  		} else {
	  			that.mapViewer.mapGLRenderer.playing = false;
				d3.select(this).attr("class", "ui-icon ui-icon-play");
				
	  		}	  		
	  	});  

	  // var stepDiv = timelineControlsDiv.append("div")
	  // 	.style("position", "relative")
	  // 	.style("float", "left")
  	// 	.style("left", "40px");

	 //  stepDiv.append("div")
	 //  	.text("Step ratio: ")
	 //  	.style("float", "left");

	 //  stepDiv.append("div")
	 //  	.attr("id", "timelineStepLabel")
	 //  	.style("position", "relative")
	 //  	.style("left", "10px")
	 //  	.style("float", "left");



	 //  var timelineStepSlider = stepDiv.append("div")
	 //  	.style("width", "100px")
	 //  	.style("position", "relative")
	 //  	.style("left", "10px")
  // 		.style("top", "3px")
  // 		.style("float", "left")
	 //  	.attr("id", "timelineStepSlider");

		// $(function() {
		//     $( "#timelineStepSlider" ).slider({		      
		//       min: 0.1,
		//       max: 1.0,
		//       step: 0.1,
		//       value: [ 0.5 ],
		//       slide: function( event, ui ) {
		//       	// console.log(ui.values[ 0 ]);
		//       	that.mapViewer.mapGLRenderer.timelineStep = ui.value;		      	
		//         $( "#timelineStepLabel" ).text( ui.value);		        		        
		//       },
		//       stop: function( event, ui ) {
		//       	// console.log(ui.values[ 0 ]);
		//     //   	that.mapViewer.mapGLRenderer.allSelectedMin = ui.values[ 0 ];
		//     //   	that.mapViewer.mapGLRenderer.allSelectedMax = ui.values[ 1 ];
		//     //     $( "#flowEstimationAllMinValueLabel" ).text( ui.values[ 0 ]);
		//     //     $( "#flowEstimationAllMaxValueLabel" ).text( ui.values[ 1 ]);
		//     //     that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	 //  			// that.mapViewer.mapGLRenderer.render_();
	 //  			// console.log("stop");
	 //  			that.mapViewer.mapGLRenderer.timelineStep = ui.value;		      	
		//         $( "#timelineStepLabel" ).text( ui.value);
		//       }
		//     });
		//     $( "#timelineStepLabel" ).text( $( "#timelineStepSlider" ).slider( "value"));		    
		//     that.mapViewer.mapGLRenderer.timelineStep = $( "#timelineStepSlider" ).slider( "value");		    
		//   }); 


	


	  // timelineControlsDiv
	  // 	.append("span")
	  // 	.style("position", "relative")
	  // 	.style("left", "15px") 
	  // 	.style("top", "-2px")
	  // 	.attr("id", "flowTimelineStopIcon")
	  // 	.attr("class", "ui-icon ui-icon-stop")
	  // 	.on("click", function() {

	  // 	// 	if (d3.select(this).attr("class") == "ui-icon ui-icon-locked") {
	  // 	// 		that.matrixViewer.displayAndOrderLocked = false;
	  // 	// 		d3.select(this).attr("class", "ui-icon ui-icon-unlocked");
	  // 	// 	} else {
	  // 	// 		that.matrixViewer.displayAndOrderLocked = true;
			// 	// d3.select(this).attr("class", "ui-icon ui-icon-locked");
			// 	// that.matrixViewer.reorderLines();
			// 	// that.matrixViewer.updateRankingLists();	  		
	  // 	// 		that.matrixViewer.updateMatrix();
	  // 	// 	}	  		
	  // 	});

	  var toggleDayOfWeek = function (day, dayNumber) {	 

	  	d3.select("#flowPeriodLabel").style("font-weight", "bold");
	  	d3.select("#flowDayLabel").style("font-weight", "normal");

	  	that.mapViewer.mapGLRenderer.dayOfWeek = dayNumber;	 
	  	 	
	  	that.mapViewer.mapGLRenderer.dataManager_.getWeekCirculation(that.mapViewer.mapGLRenderer.dayOfWeek, that.mapViewer.mapGLRenderer.period, that.mapViewer.mapGLRenderer);
	  	
	  }	  

	 div = analyticsContainer.append("div")
	  	.style("border", "1px solid rgb(190, 190, 190)")	  	
	  	.style("height", "370px")	
	  	.style("margin", "10px")	
	  	.style("padding", "10px");	

	 div2 = div.append("div")
	  	.style("height", "15px");

	  div2
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "Roles")
	  	.text("Map");    

	  div2 = div.append("div").style("padding", "10px");

	  div2
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "Roles")
	  	.text("Display stations");
	  	

	  div2
	  	.append("input")
	  	.attr("type", "checkbox")	  	
	  	.attr("name", "roles")
	  	.attr("value", "true")
	  	.attr("checked", "true")
	  	.attr("id", "rolesCheckbox")
	  	.on("change", function() {
	  		// that.mapViewer.mapGLRenderer.showRoles = this.checked;
	  		// that.mapViewer.mapGLRenderer.update();
	  		that.mapViewer.showRoles = this.checked;
	  		that.mapViewer.updateStationsLayer();
	  	});

	  div2 = div.append("div").style("padding", "10px");

	  div2
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	  		  		  	
	  	.text("Display bike lanes");
	  	

	  div2
	  	.append("input")
	  	.attr("type", "checkbox")	  	
	  	.attr("name", "lanes")	  	
	  	.attr("id", "lanesCheckbox")
	  	.on("change", function() {
	  		// that.mapViewer.mapGLRenderer.showRoles = this.checked;
	  		// that.mapViewer.mapGLRenderer.update();
	  		if (this.checked) {
	  			that.mapViewer.bikeLayer  = new google.maps.BicyclingLayer();	  			
  				that.mapViewer.bikeLayer.setMap(that.mapViewer.map_);

  				// var transitLayer = new google.maps.TransitLayer();
  				// transitLayer.setMap(map);
	  		} else {
	  			that.mapViewer.bikeLayer.setMap(undefined);
	  		}
	  		// that.mapViewer.showRoles = this.checked;
	  		// that.mapViewer.updateStationsLayer();
	  	});

	  div2 = div.append("div").style("padding", "10px").style("height", "30px").style("width", "360px");  

	  div2
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "Streets")	
	  	.text("Display all flow");

	  div2
	  	.append("input")
	  	.attr("type", "checkbox")	  	
	  	.attr("name", "allstreets")	  	
	  	.attr("checked", "true")
	  	.style("float", "left")	  		  	
	  	.attr("id", "allStreetsCheckbox")
	  	.on("change", function() {
	  		that.mapViewer.mapGLRenderer.showAllStreets = this.checked;
	  		that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  		that.mapViewer.mapGLRenderer.render_();
	  	});

	  var colorScaleWidth = 220;
	  var colorScaleHeight = 10;

	  var div3 = div2.append("div")	
	  	.style("position", "relative")
	  	// .style("top", "-8px")
	  	.style("left", "-5px")  		  	
	  	.style("float", "right")	  		  	
	  	.style("width", colorScaleWidth + "px");	  

	  var colorScaleDiv = div3
	  	.append("div")	  		
	  		.style("float", "left")
	  		.style("position", "relative")
	  		.style("left", "10px")
	  		.style("top", "-20px")
	  		.style("padding", "3px")
	  		.style("width", "260px")
	  		.style("height", (colorScaleHeight*2) + "px");
	  		// .style("width", "100%");	  

	  colorScaleRangeDiv = colorScaleDiv
	  	.append("div")	  			  		
	  		.style("position", "relative")
	  		.style("top", "5px")
	  		// .style("padding", "3px")
	  		.style("width", "230px")
	  		.style("height", "20px");

	  colorScaleRangeDiv.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "left")
	  	.style("color", "black")
	  	.attr("id", "flowEstimationAllMinValueLabel")	  		  	
	  	// .attr("for", "minValue")
	  	.text("0.0");

	  colorScaleRangeDiv.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "right")
	  	.style("color", "black")	  	
	  	.attr("id", "flowEstimationAllMaxValueLabel")
	  	// .attr("for", "maxValue")	
	  	.text("1.0");

	  var colorScale = colorScaleDiv
	  	.append("div")
	  		.style("clear", "both")
	  		.attr("id", "flowEstimationAllColorScale")
	  		.style("height", colorScaleHeight + "px");
	  		// .style("width", "100%");	

	  var colorScaleRangeSlider = colorScaleDiv
		  .append("div")
		  	.style("width", "230px")
		  	.style("position", "relative")
	  		.style("top", "8px")
		  	.attr("id", "allRangeSlider");

		$(function() {
		    $( "#allRangeSlider" ).slider({
		      range: true,
		      min: 0,
		      max: 1,
		      values: [ 0, 1 ],
		      slide: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	that.mapViewer.mapGLRenderer.allSelectedMin = ui.values[ 0 ];
		      	that.mapViewer.mapGLRenderer.allSelectedMax = ui.values[ 1 ];
		        $( "#flowEstimationAllMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#flowEstimationAllMaxValueLabel" ).text( ui.values[ 1 ]);		        
		      },
		      stop: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	that.mapViewer.mapGLRenderer.allSelectedMin = ui.values[ 0 ];
		      	that.mapViewer.mapGLRenderer.allSelectedMax = ui.values[ 1 ];
		        $( "#flowEstimationAllMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#flowEstimationAllMaxValueLabel" ).text( ui.values[ 1 ]);
		        that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  			that.mapViewer.mapGLRenderer.render_();
	  			// console.log("stop");
		      }
		    });
		    $( "#flowEstimationAllMinValueLabel" ).text( $( "#allRangeSlider" ).slider( "values", 0 ));
		    $( "#flowEstimationAllMaxValueLabel" ).text( $( "#allRangeSlider" ).slider( "values", 1 ));		    
		    that.mapViewer.mapGLRenderer.allSelectedMin = $( "#allRangeSlider" ).slider( "values", 0 );
		    that.mapViewer.mapGLRenderer.allSelectedMax = $( "#allRangeSlider" ).slider( "values", 1 );
		  }); 	

	  var colorScaleOptions = div3.append("select")
	  // var colorScaleOptions = div.append("select")
	  	// .style("clear", "both")
	  	.style("float", "left")	  		  	
	  	.style("position", "relative")
	  	.style("top", "-28px")
	  	.style("left", colorScaleWidth + 30 + "px")
	  	.attr("name", "colorScaleAll")	  	
	  	.attr("id", "analyticsFlowEstimationAllColorScaleOptions")
	  	.on("change", function() {
	  		// console.log(this.value);
	  		that.mapViewer.mapGLRenderer.colorScaleAll = that.mapViewer.mapGLRenderer.colorScales[this.value];
	  		that.mapViewer.mapGLRenderer.updateColorScale("All");  		
	  	});	



	  div2 = div.append("div").style("padding", "10px").style("height", "30px").style("width", "360px");   

	  div2
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "Streets")	
	  	.text("Display up flow");

	  div2
	  	.append("input")
	  	.attr("type", "checkbox")	  	
	  	.attr("name", "upstreets")
	  	.style("float", "left")	  	
	  	// .attr("checked", "false")
	  	.attr("id", "upStreetsCheckbox")
	  	.on("change", function() {
	  		that.mapViewer.mapGLRenderer.showUpStreets = this.checked;
	  		that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  		that.mapViewer.mapGLRenderer.render_();
	  	});

	  div3 = div2.append("div")	
	  	.style("position", "relative")
	  	// .style("top", "-8px")
	  	.style("left", "-5px")  		  	
	  	.style("float", "right")	  		  	
	  	.style("width", colorScaleWidth + "px");	  

	  colorScaleDiv = div3
	  	.append("div")	  		
	  		.style("float", "left")
	  		.style("position", "relative")
	  		.style("left", "10px")
	  		.style("top", "-20px")
	  		.style("padding", "3px")
	  		.style("width", "260px")
	  		.style("height", (colorScaleHeight*2) + "px");
	  		// .style("width", "100%");	  

	  colorScaleRangeDiv = colorScaleDiv
	  	.append("div")	  			  		
	  		.style("position", "relative")
	  		.style("top", "5px")
	  		.style("width", "230px")
	  		.style("height", "20px");

	  colorScaleRangeDiv.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "left")
	  	.style("color", "black")
	  	.attr("id", "flowEstimationUpMinValueLabel")	  		  	
	  	// .attr("for", "minValue")
	  	.text("0.0");

	  colorScaleRangeDiv.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "right")
	  	.style("color", "black")	  	
	  	.attr("id", "flowEstimationUpMaxValueLabel")
	  	// .attr("for", "maxValue")	
	  	.text("1.0");

	  colorScale = colorScaleDiv
	  	.append("div")
	  		.style("clear", "both")
	  		.attr("id", "flowEstimationUpColorScale")
	  		.style("height", colorScaleHeight + "px");
	  		// .style("width", "100%");	

	  colorScaleRangeSlider = colorScaleDiv
		  .append("div")
		  	.style("width", "230px")
		  	.style("position", "relative")
	  		.style("top", "8px")
		  	.attr("id", "upRangeSlider");

		$(function() {
		    $( "#upRangeSlider" ).slider({
		      range: true,
		      min: 0,
		      max: 1,
		      values: [ 0, 1 ],
		      slide: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	that.mapViewer.mapGLRenderer.upSelectedMin = ui.values[ 0 ];
		      	that.mapViewer.mapGLRenderer.upSelectedMax = ui.values[ 1 ];
		        $( "#flowEstimationUpMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#flowEstimationUpMaxValueLabel" ).text( ui.values[ 1 ]);		        
		      },
		      stop: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	that.mapViewer.mapGLRenderer.upSelectedMin = ui.values[ 0 ];
		      	that.mapViewer.mapGLRenderer.upSelectedMax = ui.values[ 1 ];
		        $( "#flowEstimationUpMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#flowEstimationUpMaxValueLabel" ).text( ui.values[ 1 ]);
		        that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  			that.mapViewer.mapGLRenderer.render_();
	  			// console.log("stop");
		      }
		    });
		    $( "#flowEstimationUpMinValueLabel" ).text( $( "#upRangeSlider" ).slider( "values", 0 ));
		    $( "#flowEstimationUpMaxValueLabel" ).text( $( "#upRangeSlider" ).slider( "values", 1 ));		    
		    that.mapViewer.mapGLRenderer.upSelectedMin = $( "#upRangeSlider" ).slider( "values", 0 );
		    that.mapViewer.mapGLRenderer.upSelectedMax = $( "#upRangeSlider" ).slider( "values", 1 );
		  }); 	

	  colorScaleOptions = div3.append("select")
	  // var colorScaleOptions = div.append("select")
	  	// .style("clear", "both")
	  	.style("float", "left")	  		  	
	  	.style("position", "relative")
	  	.style("top", "-28px")
	  	.style("left", colorScaleWidth + 30 + "px")
	  	.attr("name", "colorScaleUp")	  	
	  	.attr("id", "analyticsFlowEstimationUpColorScaleOptions")
	  	.on("change", function() {
	  		// console.log(this.value);
	  		that.mapViewer.mapGLRenderer.colorScaleUp = that.mapViewer.mapGLRenderer.colorScales[this.value];
	  		that.mapViewer.mapGLRenderer.updateColorScale("Up");  		
	  	});	

	  div2 = div.append("div").style("padding", "10px").style("height", "30px").style("width", "360px"); 

	  div2
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "Streets")	
	  	.text("Display down flow");

	  div2
	  	.append("input")
	  	.attr("type", "checkbox")	  	
	  	.attr("name", "downstreets")
	  	.style("float", "left")		  	
	  	// .attr("checked", "false")
	  	.attr("id", "downStreetsCheckbox")
	  	.on("change", function() {
	  		that.mapViewer.mapGLRenderer.showDownStreets = this.checked;
	  		that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  		that.mapViewer.mapGLRenderer.render_();
	  	});

	  div3 = div2.append("div")	
	  	.style("position", "relative")
	  	// .style("top", "-8px")
	  	.style("left", "-5px")  		  	
	  	.style("float", "right")	  		  	
	  	.style("width", colorScaleWidth + "px");	  

	  colorScaleDiv = div3
	  	.append("div")	  		
	  		.style("float", "left")
	  		.style("position", "relative")
	  		.style("left", "10px")
	  		.style("top", "-20px")
	  		.style("padding", "3px")
	  		.style("width", "260px")
	  		.style("height", (colorScaleHeight*2) + "px");
	  		// .style("width", "100%");	  

	  colorScaleRangeDiv = colorScaleDiv
	  	.append("div")	  			  		
	  		.style("position", "relative")
	  		.style("top", "5px")
	  		.style("width", "230px")
	  		.style("height", "20px");

	  colorScaleRangeDiv.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "left")
	  	.style("color", "black")
	  	.attr("id", "flowEstimationDownMinValueLabel")	  		  	
	  	// .attr("for", "minValue")
	  	.text("0.0");

	  colorScaleRangeDiv.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "right")
	  	.style("color", "black")	  	
	  	.attr("id", "flowEstimationDownMaxValueLabel")
	  	// .attr("for", "maxValue")	
	  	.text("1.0");

	  colorScale = colorScaleDiv
	  	.append("div")
	  		.style("clear", "both")
	  		.attr("id", "flowEstimationDownColorScale")
	  		.style("height", colorScaleHeight + "px");
	  		// .style("width", "100%");	

	  colorScaleRangeSlider = colorScaleDiv
		  .append("div")
		  	.style("width", "230px")
		  	.style("position", "relative")
	  		.style("top", "8px")
		  	.attr("id", "downRangeSlider");

		$(function() {
		    $( "#downRangeSlider" ).slider({
		      range: true,
		      min: 0,
		      max: 1,
		      values: [ 0, 1 ],
		      slide: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	that.mapViewer.mapGLRenderer.downSelectedMin = ui.values[ 0 ];
		      	that.mapViewer.mapGLRenderer.downSelectedMax = ui.values[ 1 ];
		        $( "#flowEstimationDownMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#flowEstimationDownMaxValueLabel" ).text( ui.values[ 1 ]);		        
		      },
		      stop: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	that.mapViewer.mapGLRenderer.downSelectedMin = ui.values[ 0 ];
		      	that.mapViewer.mapGLRenderer.downSelectedMax = ui.values[ 1 ];
		        $( "#flowEstimationDownMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#flowEstimationDownMaxValueLabel" ).text( ui.values[ 1 ]);
		        that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  			that.mapViewer.mapGLRenderer.render_();
	  			// console.log("stop");
		      }
		    });
		    $( "#flowEstimationDownMinValueLabel" ).text( $( "#downRangeSlider" ).slider( "values", 0 ));
		    $( "#flowEstimationDownMaxValueLabel" ).text( $( "#downRangeSlider" ).slider( "values", 1 ));		    
		    that.mapViewer.mapGLRenderer.downSelectedMin = $( "#downRangeSlider" ).slider( "values", 0 );
		    that.mapViewer.mapGLRenderer.downSelectedMax = $( "#downRangeSlider" ).slider( "values", 1 );
		  }); 	

	  colorScaleOptions = div3.append("select")
	  // var colorScaleOptions = div.append("select")
	  	// .style("clear", "both")
	  	.style("float", "left")	  		  	
	  	.style("position", "relative")
	  	.style("top", "-28px")
	  	.style("left", colorScaleWidth + 30 + "px")
	  	.attr("name", "colorScaleDown")	  	
	  	.attr("id", "analyticsFlowEstimationDownColorScaleOptions")
	  	.on("change", function() {
	  		// console.log(this.value);
	  		that.mapViewer.mapGLRenderer.colorScaleDown = that.mapViewer.mapGLRenderer.colorScales[this.value];
	  		that.mapViewer.mapGLRenderer.updateColorScale("Down");  		
	  	});

	  div2 = div.append("div").style("padding", "10px").style("height", "30px").style("width", "360px");  

	  div2
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "Streets")	
	  	.text("Display left flow");

	  div2
	  	.append("input")
	  	.attr("type", "checkbox")	  	
	  	.attr("name", "leftstreets")	  	
	  	.style("float", "left")
	  	// .attr("checked", "false")
	  	.attr("id", "leftStreetsCheckbox")
	  	.on("change", function() {
	  		that.mapViewer.mapGLRenderer.showLeftStreets = this.checked;
	  		that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  		that.mapViewer.mapGLRenderer.render_();
	  	});

	  div3 = div2.append("div")	
	  	.style("position", "relative")
	  	// .style("top", "-8px")
	  	.style("left", "-5px")  		  	
	  	.style("float", "right")	  		  	
	  	.style("width", colorScaleWidth + "px");	  

	  colorScaleDiv = div3
	  	.append("div")	  		
	  		.style("float", "left")
	  		.style("position", "relative")
	  		.style("left", "10px")
	  		.style("top", "-20px")
	  		.style("padding", "3px")
	  		.style("width", "260px")
	  		.style("height", (colorScaleHeight*2) + "px");
	  		// .style("width", "100%");	  

	  colorScaleRangeDiv = colorScaleDiv
	  	.append("div")	  			  		
	  		.style("position", "relative")
	  		.style("top", "5px")
	  		.style("width", "230px")
	  		.style("height", "20px");

	  colorScaleRangeDiv.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "left")
	  	.style("color", "black")
	  	.attr("id", "flowEstimationLeftMinValueLabel")	  		  	
	  	// .attr("for", "minValue")
	  	.text("0.0");

	  colorScaleRangeDiv.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "right")
	  	.style("color", "black")	  	
	  	.attr("id", "flowEstimationLeftMaxValueLabel")
	  	// .attr("for", "maxValue")	
	  	.text("1.0");

	  colorScale = colorScaleDiv
	  	.append("div")
	  		.style("clear", "both")
	  		.attr("id", "flowEstimationLeftColorScale")
	  		.style("height", colorScaleHeight + "px");
	  		// .style("width", "100%");	

	  colorScaleRangeSlider = colorScaleDiv
		  .append("div")
		  	.style("width", "230px")
		  	.style("position", "relative")
	  		.style("top", "8px")
		  	.attr("id", "leftRangeSlider");

		$(function() {
		    $( "#leftRangeSlider" ).slider({
		      range: true,
		      min: 0,
		      max: 1,
		      values: [ 0, 1 ],
		      slide: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	that.mapViewer.mapGLRenderer.leftSelectedMin = ui.values[ 0 ];
		      	that.mapViewer.mapGLRenderer.leftSelectedMax = ui.values[ 1 ];
		        $( "#flowEstimationLeftMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#flowEstimationLeftMaxValueLabel" ).text( ui.values[ 1 ]);		        
		      },
		      stop: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	that.mapViewer.mapGLRenderer.leftSelectedMin = ui.values[ 0 ];
		      	that.mapViewer.mapGLRenderer.leftSelectedMax = ui.values[ 1 ];
		        $( "#flowEstimationLeftMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#flowEstimationLeftMaxValueLabel" ).text( ui.values[ 1 ]);
		        that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  			that.mapViewer.mapGLRenderer.render_();
	  			// console.log("stop");
		      }
		    });
		    $( "#flowEstimationLeftMinValueLabel" ).text( $( "#leftRangeSlider" ).slider( "values", 0 ));
		    $( "#flowEstimationLeftMaxValueLabel" ).text( $( "#leftRangeSlider" ).slider( "values", 1 ));		    
		    that.mapViewer.mapGLRenderer.leftSelectedMin = $( "#leftRangeSlider" ).slider( "values", 0 );
		    that.mapViewer.mapGLRenderer.leftSelectedMax = $( "#leftRangeSlider" ).slider( "values", 1 );
		  }); 	

	  colorScaleOptions = div3.append("select")
	  // var colorScaleOptions = div.append("select")
	  	// .style("clear", "both")
	  	.style("float", "left")	  		  	
	  	.style("position", "relative")
	  	.style("top", "-28px")
	  	.style("left", colorScaleWidth + 30 + "px")
	  	.attr("name", "colorScaleLeft")	  	
	  	.attr("id", "analyticsFlowEstimationLeftColorScaleOptions")
	  	.on("change", function() {
	  		// console.log(this.value);
	  		that.mapViewer.mapGLRenderer.colorScaleLeft = that.mapViewer.mapGLRenderer.colorScales[this.value];
	  		that.mapViewer.mapGLRenderer.updateColorScale("Left");  		
	  	});

	  div2 = div.append("div").style("padding", "10px").style("height", "30px").style("width", "360px");   

	  div2
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "Streets")	
	  	.text("Display right flow");

	  div2
	  	.append("input")
	  	.attr("type", "checkbox")	  	
	  	.attr("name", "rightstreets")
	  	.style("float", "left")	  	
	  	// .attr("checked", "false")
	  	.attr("id", "rightStreetsCheckbox")
	  	.on("change", function() {
	  		that.mapViewer.mapGLRenderer.showRightStreets = this.checked;
	  		that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  		that.mapViewer.mapGLRenderer.render_();
	  	});

	  div3 = div2.append("div")	
	  	.style("position", "relative")
	  	// .style("top", "-8px")
	  	.style("left", "-5px")  		  	
	  	.style("float", "right")	  		  	
	  	.style("width", colorScaleWidth + "px");	  

	  colorScaleDiv = div3
	  	.append("div")	  		
	  		.style("float", "left")
	  		.style("position", "relative")
	  		.style("left", "10px")
	  		.style("top", "-20px")
	  		.style("padding", "3px")
	  		.style("width", "260px")
	  		.style("height", (colorScaleHeight*2) + "px");
	  		// .style("width", "100%");	  

	  colorScaleRangeDiv = colorScaleDiv
	  	.append("div")	  			  		
	  		.style("position", "relative")
	  		.style("top", "5px")
	  		.style("width", "230px")
	  		.style("height", "20px");

	  colorScaleRangeDiv.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "left")
	  	.style("color", "black")
	  	.attr("id", "flowEstimationRightMinValueLabel")	  		  	
	  	// .attr("for", "minValue")
	  	.text("0.0");

	  colorScaleRangeDiv.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
		.style("float", "right")
	  	.style("color", "black")	  	
	  	.attr("id", "flowEstimationRightMaxValueLabel")
	  	// .attr("for", "maxValue")	
	  	.text("1.0");

	  colorScale = colorScaleDiv
	  	.append("div")
	  		.style("clear", "both")
	  		.attr("id", "flowEstimationRightColorScale")
	  		.style("height", colorScaleHeight + "px");
	  		// .style("width", "100%");	

	  colorScaleRangeSlider = colorScaleDiv
		  .append("div")
		  	.style("width", "230px")
		  	.style("position", "relative")
	  		.style("top", "8px")
		  	.attr("id", "rightRangeSlider");

		$(function() {
		    $( "#rightRangeSlider" ).slider({
		      range: true,
		      min: 0,
		      max: 1,
		      values: [ 0, 1 ],
		      slide: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	that.mapViewer.mapGLRenderer.rightSelectedMin = ui.values[ 0 ];
		      	that.mapViewer.mapGLRenderer.rightSelectedMax = ui.values[ 1 ];
		        $( "#flowEstimationRightMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#flowEstimationRightMaxValueLabel" ).text( ui.values[ 1 ]);		        
		      },
		      stop: function( event, ui ) {
		      	// console.log(ui.values[ 0 ]);
		      	that.mapViewer.mapGLRenderer.rightSelectedMin = ui.values[ 0 ];
		      	that.mapViewer.mapGLRenderer.rightSelectedMax = ui.values[ 1 ];
		        $( "#flowEstimationRightMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#flowEstimationRightMaxValueLabel" ).text( ui.values[ 1 ]);
		        that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  			that.mapViewer.mapGLRenderer.render_();
	  			// console.log("stop");
		      }
		    });
		    $( "#flowEstimationRightMinValueLabel" ).text( $( "#rightRangeSlider" ).slider( "values", 0 ));
		    $( "#flowEstimationRightMaxValueLabel" ).text( $( "#rightRangeSlider" ).slider( "values", 1 ));		    
		    that.mapViewer.mapGLRenderer.rightSelectedMin = $( "#rightRangeSlider" ).slider( "values", 0 );
		    that.mapViewer.mapGLRenderer.rightSelectedMax = $( "#rightRangeSlider" ).slider( "values", 1 );
		  }); 	

	  colorScaleOptions = div3.append("select")
	  // var colorScaleOptions = div.append("select")
	  	// .style("clear", "both")
	  	.style("float", "left")	  		  	
	  	.style("position", "relative")
	  	.style("top", "-28px")
	  	.style("left", colorScaleWidth + 30 + "px")
	  	.attr("name", "colorScaleRight")	  	
	  	.attr("id", "analyticsFlowEstimationRightColorScaleOptions")
	  	.on("change", function() {
	  		// console.log(this.value);
	  		that.mapViewer.mapGLRenderer.colorScaleRight = that.mapViewer.mapGLRenderer.colorScales[this.value];
	  		that.mapViewer.mapGLRenderer.updateColorScale("Right");  		
	  	});

	  // div2 = div.append("div").style("padding", "10px").style("height", "30px").style("width", "360px");   

	  // div2
	  // 	.append("label")
	  // 	.style("color", "black")	  	
	  // 	.style("float", "left")	  		  	
	  // 	.attr("for", "Roles")
	  // 	.text("Use global normalization (All)");
	  	

	  // div2
	  // 	.append("input")
	  // 	.attr("type", "checkbox")	  	
	  // 	.attr("name", "roles")
	  // 	.attr("value", "true")
	  // 	.attr("checked", "true")
	  // 	.attr("id", "globalNormalizationCheckbox")
	  // 	.on("change", function() {
	  // 		// that.mapViewer.mapGLRenderer.showRoles = this.checked;
	  // 		// that.mapViewer.mapGLRenderer.update();
	  // 		that.mapViewer.mapGLRenderer.useGlobalNormalization = this.checked;
	  // 		that.mapViewer.mapGLRenderer.updateFlowRanges();
	  // 		that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
	  // 		that.mapViewer.mapGLRenderer.render_();
	  // 	});

	  

	  // div = analyticsContainer.append("div").style("padding", "10px");

	  // div
	  // 	.append("div")
	  // 	.attr("id", "analyticsFlowEstimationCalendar");

	  // this.flowEstimationCalendar = new FlowEstimationCalendar(dataManager, $("#analyticsFlowEstimationCalendar"));             
	  // this.flowEstimationCalendar.analyticsContainer = this;
   //    this.flowEstimationCalendar.add();   

	  

	  

	div = analyticsContainer.append("div")
	  	.style("border", "1px solid rgb(190, 190, 190)")	  		  	
	  	.style("margin", "10px")
	  	.style("height", "200px")
	  	.style("clear", "both")	  		  	
	  	.style("padding", "10px");

	  div
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.attr("for", "selectInfo")	
	  	.text("Selection information");

	  var divInfoCursor = div.append("div")
	  	.style("height", "100px")
	  	.style("padding", "5px");

	  divInfoCursor
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.attr("for", "selectInfoCursor")	
	  	.text("Station");

	  var list = divInfoCursor.append("ul");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "10px")	
	  	.attr("id", "flowEstimationInfoCursorId")  		
	  	.text("Id:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "10px")	
	  	.attr("id", "flowEstimationInfoCursorNumber")  		
	  	.text("Number:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "10px")	
	  	.attr("id", "flowEstimationInfoCursorName")  		
	  	.text("Name:");	  

	  var divInfoBrush = div.append("div")
	  	.style("height", "100px")
	  	.style("padding", "5px");

	  divInfoBrush
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.attr("for", "selectInfoBrush")	
	  	.text("Timeline");

	  list = divInfoBrush.append("ul");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "10px")	
	  	.attr("id", "flowEstimationInfoBrushTimeWindow")  		
	  	.text("Time window:");	

	  that.mapViewer.mapGLRenderer.createColorScales();  	  
	}	

}