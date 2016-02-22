var AnalyticsDayOfWeekModels = {


	createAnalyticsDayOfWeekModelsPanel: function(dataManager) {

	  var thisModeVisContainer = d3.select("#modeVisContainerAnalyticsDayOfWeekModels");
	  var modeContainerUseLeft = thisModeVisContainer.append("div")    
	  	.style("visibility", "inherit")  
	    .attr("id", "modeVisContainerAnalyticsDayOfWeekModelsContainerLeftContainer");

	  modeContainerUseLeft
	    .append("div")
	      .attr("class", "canvases_container")     
	      .style("visibility", "inherit") 	       
	      .style("height", "99%") 	       
	      .append("div")
	        .attr("id", "DayOfWeekModels_map_container") 
	        .style("visibility", "inherit")       
	        .attr("class", "canvas_container");

	  var modeContainerUseMiddle = thisModeVisContainer.append("div") 
	  	.style("visibility", "inherit") 	  	
	  	// .style("background", d3.rgb(30,25,53,1)) 
	    .attr("id", "modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer");

	   
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
	  	.attr("id", "dayOfWeekModelsTimelinePlayStopIcon")
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
	    .attr("id", "modeVisContainerAnalyticsDayOfWeekModelsContainerRightContainer");

	  var analyticsContainer = modeContainerUseRight
	    .append("div")      
	      .attr("id", "modeVisContainerAnalyticsDayOfWeekModelsAnalyticsContainer");	    
	  

	  //  Map viewer.  
	  this.mapContainerId = 'DayOfWeekModels_map_container';
	  this.mapViewer = 
	    new MapViewerAnalyticsDayOfWeekModels(dataManager, this.mapContainerId, MapStyles.MAP_STYLE_DARK_NAME);    

	  this.mapViewer.setActive(true);
	  this.mapViewer.analyticsContainer = analyticsContainer;

	  this.matrixViewer = new DayOfWeekModelsMatrixViewer(dataManager, 'modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer');
	  this.matrixViewer.setActive(true);

	  this.mapViewer.matrixViewer = this.matrixViewer;
	  this.matrixViewer.mapViewer = this.mapViewer;
	  this.matrixViewer.analyticsContainer = analyticsContainer;

	  //mapViewwer.setActive turns visibility on, so we need to turn it off again...
	  modeContainerUseLeft.select(".canvas_container")
	  	.style("visibility", "inherit");
	  modeContainerUseMiddle
	  	.style("visibility", "inherit");


	  

	  // right side stuff

	  var that = this;

	  var toggleDayOfWeek = function (day, dayNumber) {
	  	// console.log("toggleDayOfWeek: " + day);
	  	d3.select("#daysOfTheWeekPeriodLabel").style("font-weight", "bold");
	  	d3.select("#daysOfTheWeekDayLabel").style("font-weight", "normal");
	  	// $("#matrixDatepicker")._clearDate(this);
	  	that.matrixViewer.dayOfWeek = dayNumber;
	  	
	  	// that.matrixViewer.reorderLines();
	  	// that.matrixViewer.updateRankingLists();	
	  	
	  	that.matrixViewer.updateMatrix();
	  }

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
	  	.attr("id", "daysOfTheWeekPeriodLabel")	 
	  	.style("font-weight", "bold")
	  	.text("Period: "); 

	  var variableOptions = div2.append("select")
	  	.attr("name", "period")
	  	.style("position", "relative")
	  	.style("left", "5px")
	  	.style("top", "-3px")
	  	.attr("id", "analyticsDayOfModelsPeriod")
	  	.on("change", function() {
	  		d3.select("#daysOfTheWeekPeriodLabel").style("font-weight", "bold");
	  		d3.select("#daysOfTheWeekDayLabel").style("font-weight", "normal");
	  		
	  		// that.matrixViewer.period = this.value.split(" ")[0];
	  		that.matrixViewer.period = this.value;
	  		that.matrixViewer.dataManager_.getStationsDayOfWeekModels(that.matrixViewer, that.matrixViewer.period);
	  	}); 

	  div2 = div.append("div")
	  	.style("float", "right")	
	  	.style("height", "20px");

	  div2
	  	.append("label")
	  	.style("color", "black")	
	  	.style("float", "left")	
	  	.attr("id", "daysOfTheWeekDayLabel")	   		  	   		  	
	  	.text("Day: ");

	  var datepicker = div2.append("input")	  	
	  	.style("position", "relative")
	  	.style("left", "5px")
	  	.style("top", "-3px")
	  	.attr("id", "matrixDatepicker");  	  

	  $(function() {
	    $( "#matrixDatepicker" ).datepicker({
	    	dateFormat: "mm/dd/yy",
		    onClose: function( selectedDate ) {
		    	// console.log(selectedDate);
		    	that.matrixViewer.calendarDay = selectedDate.split("/").join("-");
		    	that.matrixViewer.dataManager_.getDayActivity(that.matrixViewer, selectedDate.split("/").join("-"));    
		    	d3.select("#daysOfTheWeekPeriodLabel").style("font-weight", "normal");
			  	d3.select("#daysOfTheWeekDayLabel").style("font-weight", "bold");
			  	d3.selectAll(".dayOfWeekButtom").style("font-weight", "normal");
		    }
	    });
	  });

	  // var periodOptions = ["06 2013", "08 2013", "09 2013", "10 2013", "11 2013", "12 2013", "01 2014", "02 2014", "Summer 2013", "Fall 2013", "Winter 2013", "All"];

	  // d3.select("#analyticsDayOfModelsPeriod").selectAll(".periodOption").data(periodOptions).enter()
	  //   .append("option")
	  //     .attr("class", "variableOption")
	  //     .attr("value", function(d) {return d;})
	  //     .text(function(d) {return d;});

	  div2 = div.append("div")
	  	// .style("position", "relative")
	  	// .style("left", "5px")
	  	// .style("top", "8px")
	  	.style("clear", "both")	 
	  	.style("height", "60px")
	  	.style("padding", "10px"); 

  	div2.selectAll(".dayOfWeekButtom").data(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
  		"Saturday", "Sunday", "Weekdays", "Weekend"])
  	.enter().append("div")		  	
	  	.attr("id", function (d) { return d + "Button";})
	  	.attr("class", "dayOfWeekButtom")		  	
	  	.style("background", "white")
	  	.style("font-weight", function (d) {
	  		if (d == "Monday") {
	  			return "bold";
	  		} else {
	  			return "normal";
	  		}
	  	})
	  	// .style("border", "1px double")
	  	// .style("border-color", "gray")
	  	.style("cursor", "pointer")
	  	.style("padding", "5px")
	  	.style("float", "left")
	  	.style("text-align", "center")
	  	.style("color", "black")
	  	.on("click", function (d,i) {

	  		if (d == "Weekdays") {
	  			d3.select("#MondayButton").style("font-weight", "bold");
	  			d3.select("#TuesdayButton").style("font-weight", "bold");
	  			d3.select("#WednesdayButton").style("font-weight", "bold");
	  			d3.select("#ThursdayButton").style("font-weight", "bold");
	  			d3.select("#FridayButton").style("font-weight", "bold");
	  			d3.select("#SaturdayButton").style("font-weight", "normal");
	  			d3.select("#SundayButton").style("font-weight", "normal");
	  		} else if (d == "Weekend") {
	  			d3.select("#MondayButton").style("font-weight", "normal");
	  			d3.select("#TuesdayButton").style("font-weight", "normal");
	  			d3.select("#WednesdayButton").style("font-weight", "normal");
	  			d3.select("#ThursdayButton").style("font-weight", "normal");
	  			d3.select("#FridayButton").style("font-weight", "normal");
	  			d3.select("#SaturdayButton").style("font-weight", "bold");
	  			d3.select("#SundayButton").style("font-weight", "bold");
	  		} else {
	  			// if (d3.select(this).style("font-weight") == "bold") {
		  		// 	return;
		  		// } else {
		  			d3.selectAll(".dayOfWeekButtom").style("font-weight", "normal");
		  			d3.select(this).style("font-weight", "bold");
		  		// };
		  	}
	  		toggleDayOfWeek(d, i);
	  	})
	  	.text(function (d) { return d;});

	  div = analyticsContainer.append("div")
	  	.style("border", "1px solid rgb(190, 190, 190)")	  		  	
	  	.style("margin", "10px")
	  	.style("clear", "both")
	  	.style("height", "520px")
	  	.style("padding", "10px");	   

	  

	  div = div.append("div")	  	
	  	.style("padding", "10px");

	  // div
	  // 	.append("input")
	  // 	.attr("type", "text")
	  // 	.attr("id", "queryAngle")
	  // 	.attr("readonly", "true")	  	
	  // 	.style("background", "white")
	  // 	.style("font-weight", "bold")
	  // 	.style("border", "0")	  	
	  // 	.style("margin-left", "10px")	  	
	  // 	.style("color", "black");  	
	  

	  // var queryAngleSlider = div
	  // 	.append("div")
		 //  	.style("position", "relative")
		 //  	.style("top", "-20px")
	  // 		.style("width", (colorScaleWidth - 10) + "px")
	  // 		// .style("float", "left")	
	  // 		.attr("id", "queryAngleSlider");


	  var colorScaleWidth = 220;
	  var colorScaleHeight = 10;

	  var div2 = div.append("div")	
	  	.style("position", "relative")
	  	// .style("top", "-8px")
	  	.style("left", "-5px")  		  	
	  	.style("width", colorScaleWidth + "px");

	  div2.append("label")
	  	.style("position", "relative")
		.style("top", "-15px")
		.style("float", "left")
	  	.style("color", "black")
	  	.attr("id", "dayofWeekModelsMinValueLabel")	  	
	  	.attr("for", "minValue")	
	  	.text("0.0");

	  div2.append("label")
	  	.style("position", "relative")
		.style("top", "-15px")
		.style("float", "right")
	  	.style("color", "black")	  	
	  	.attr("id", "dayofWeekModelsMaxValueLabel")
	  	.attr("for", "maxValue")	
	  	.text("1.0");

	  var colorScale = div
	  	.append("div")
	  		.attr("id", "dayOfWeekModelsColorScale")
	  		.style("position", "relative")
	  		.style("top", "-15px")
	  		.style("float", "left")
	  		.style("height", colorScaleHeight + "px")
	  		.style("width", "100%");	  

	  var colorScaleOptions = colorScale.append("select")
	  // var colorScaleOptions = div.append("select")
	  	.style("clear", "both")
	  	.style("position", "relative")
	  	.style("top", "0px")
	  	.style("left", "8px")
	  	.attr("name", "colorScale")
	  	.attr("name", "colorScale")
	  	.attr("id", "analyticsDayOfModelsColorScaleOptions")
	  	.on("change", function() {
	  		// console.log(this.value);
	  		that.matrixViewer.actualPropertyColorScale = that.matrixViewer.colorScales[this.value];
	  		that.matrixViewer.updateColorScale();  		
	  	});


	  var colorScaleRangeSlider = div2
		  .append("div")
		  	.style("width", "208px")
		  	.style("position", "relative")
	  		.style("top", "10px")
	  		.style("left", "3px")
		  	.attr("id", "dayOFWeekValueRangeSlider");

		$(function() {
		    $( "#dayOFWeekValueRangeSlider" ).slider({
		      range: true,
		      min: 0,
		      max: 1,
		      values: [ 0, 1 ],
		      slide: function( event, ui ) {
		      	
		        $( "#dayofWeekModelsMinValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 0 ], that.matrixViewer.variable));
		        $( "#dayofWeekModelsMaxValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 1 ], that.matrixViewer.variable));		        
		        that.matrixViewer.actualMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualMaxValue = ui.values[ 1 ];
		      },
		      stop: function( event, ui ) {
		      	
		        $( "#dayofWeekModelsMinValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 0 ], that.matrixViewer.variable));
		        $( "#dayofWeekModelsMaxValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 1 ], that.matrixViewer.variable));		        
		        that.matrixViewer.actualMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualMaxValue = ui.values[ 1 ];
		        
		        that.matrixViewer.updateRangeSliderLimits = false;
		        that.matrixViewer.createMatrix();
		        
		    
		      }
		    });
		    
		  });	  

	  div2 = div.append("div")
	  	.style("clear", "both");

	  div2
	  	.append("label")
	  	.style("position", "relative")
		// .style("top", "-20px")
	  	.style("color", "black")	  	
	  	.attr("for", "useGlobalNormalization")	
	  	.text("Global normalization");

	  div2
	  	.append("input")
	  	.style("position", "relative")
		// .style("top", "-20px")
	  	.attr("type", "checkbox")
	  	.attr("checked", "true")
	  	.attr("id", "useGlobalNormalization");

	  $( "#useGlobalNormalization" ).on( "click", function( event ) {
	      	// console.log(event.currentTarget.checked);
	      	that.matrixViewer.useGlobalNormalization = event.currentTarget.checked;
	      	that.matrixViewer.createMatrix();
	      	that.matrixViewer.updatedMatrixPointedLine(that.matrixViewer.lastPointedStationOrder);
	      });
	  
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

	  var variableOptions = div3.append("select")
	  	.attr("name", "variables")
	  	.style("float", "right")	  		  	
	  	.attr("id", "analyticsDayOfModelsVariables")
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

			if (that.matrixViewer.variable == "b") {
		      that.matrixViewer.globalMinValue = 0.0;
		      that.matrixViewer.globalMaxValue = 1.0;
		    }

		    if (that.matrixViewer.variable == "bi") {
		      that.matrixViewer.globalMinValue = 0;
		      that.matrixViewer.globalMaxValue = 70;
		    }

		    if (that.matrixViewer.variable == "biI") {
		      that.matrixViewer.globalMinValue = 0;
		      that.matrixViewer.globalMaxValue = 60;
		    }

		    if (that.matrixViewer.variable == "biIF") {
		      that.matrixViewer.globalMinValue = 0;
		      that.matrixViewer.globalMaxValue = 20;
		    }

		    if (that.matrixViewer.variable == "s") {
		      that.matrixViewer.globalMinValue = 0;
		      that.matrixViewer.globalMaxValue = 70;
		    }

		    if (that.matrixViewer.variable == "biO") {
		      that.matrixViewer.globalMinValue = 0;
		      that.matrixViewer.globalMaxValue = 60;
		    }

		    if (that.matrixViewer.variable == "biOF") {
		      that.matrixViewer.globalMinValue = 0;
		      that.matrixViewer.globalMaxValue = 20;
		    }

		    if (that.matrixViewer.variable == "f") {
		      that.matrixViewer.globalMinValue = 0;
		      that.matrixViewer.globalMaxValue = 40;
		    }

		    if (that.matrixViewer.variable == "c") {
		      that.matrixViewer.globalMinValue = 0;
		      that.matrixViewer.globalMaxValue = 70;
		    }

		    that.matrixViewer.actualMinValue = that.matrixViewer.globalMinValue;
    		that.matrixViewer.actualMaxValue = that.matrixViewer.globalMaxValue;

			that.matrixViewer.updateRangeSliderLimits = true;		  
	  		that.matrixViewer.updateMatrix();
	  	});

	  // div = analyticsContainer.append("div")
	  // 	.style("border", "1px solid rgb(190, 190, 190)")	  		  	
	  // 	.style("margin", "10px")
	  // 	.style("height", "400px")
	  // 	.style("clear", "both")	  		  	
	  // 	.style("padding", "10px");

	  div3 = div2.append("div")
	  	.style("height", "20px");

	  div3
	  	.append("span")
	  	.style("position", "relative")
	  	.style("left", "15px") 
	  	.style("top", "-2px")
	  	.attr("id", "daysOfWeekModelsDisplayAndOrderLockIcon")
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
	  	.attr("id", "analyticsDayOfModelsOrdering")
	  	.on("change", function() {  

	  		that.matrixViewer.ordering = this.value;

	  		if (that.matrixViewer.displayAndOrderLocked && that.matrixViewer.ordering.split(':')[0] != "Station") {
	  			that.matrixViewer.variable = that.matrixViewer.variableNametoKeyMap[that.matrixViewer.ordering.split(':')[0]];
	  	// 		that.matrixViewer.reorderLines();
				// that.matrixViewer.updateRankingLists();	  
			}	

			for (stationIndex in that.matrixViewer.stations) {			    
				that.matrixViewer.stations[stationIndex].orderHistory = [];			    
			}	  		

	  		// if (that.matrixViewer.ordering.split(':')[0] != that.matrixViewer.variableKeyToNameMap[that.matrixViewer.variable]) {
	  		// 	that.matrixViewer.displayAndOrderLocked = false;
	  		// 	d3.select("#daysOfWeekModelsDisplayAndOrderLockIcon").attr("class", "ui-icon ui-icon-unlocked");
	  		// }

	  		that.matrixViewer.reorderLines();
	  		
	  		// that.matrixViewer.actualOrderingList = that.matrixViewer.orderLists[that.matrixViewer.ordering];
	  		
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
			// var scaleColor = that.matrixViewer.actualPropertyColorScale(
			// 	that.matrixViewer.actualPropertyColorScale.domain()[that.matrixViewer.actualPropertyColorScale.domain().length - 1]
			// );
			// var newColor = d3.hsl(scaleColor);
			// newColor.l = 0.9;
			// return newColor;
			return "white";
		})
		.style("float", "left")
		.style("width", "45%");
	  	// .style("padding-top", "20px");

	  divLeft
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.text("Top: ");	

	  divLeft
		  .append("div")
		  	.attr("id", "daysOfWeekModelsTopStationsList")
		  	.style("padding", "5px")
			.style("height", "280px")
			.style("overflow-y", "scroll")		  	
			.style("background", function() {
				// var scaleColor = that.matrixViewer.actualPropertyColorScale(
				// 	that.matrixViewer.actualPropertyColorScale.domain()[that.matrixViewer.actualPropertyColorScale.domain().length - 1]
				// );
				// var newColor = d3.hsl(scaleColor);
				// newColor.l = 0.9;
				// return newColor;
				return "white";
			});

	var divRight = div.append("div")
		.style("padding", "5px")
		.style("background", function() {
			// var scaleColor = that.matrixViewer.actualPropertyColorScale(
			// 	that.matrixViewer.actualPropertyColorScale.domain()[0]
			// );
			// var newColor = d3.hsl(scaleColor);
			// newColor.l = 0.9;
			// return newColor;
			return "white";
		})
		.style("float", "right")
		.style("width", "45%");
	  	// .style("padding-top", "20px");

	  divRight
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.text("Last: ");	

	  divRight
		  .append("div")
		  	.attr("id", "daysOfWeekModelsLastStationsList")
			.style("padding", "5px")
			.style("height", "280px")
			.style("overflow-y", "scroll")		  	
			.style("background", function() {
				// var scaleColor = that.matrixViewer.actualPropertyColorScale(
				// 	that.matrixViewer.actualPropertyColorScale.domain()[0]
				// );
				// var newColor = d3.hsl(scaleColor);
				// newColor.l = 0.9;
				// return newColor;
				return "white";
			});

	 div = analyticsContainer.append("div")
	  	.style("border", "1px solid rgb(190, 190, 190)")	  		  	
	  	.style("margin", "10px")
	  	.style("height", "240px")
	  	.style("clear", "both")	  		  	
	  	.style("padding", "10px");

	  div
	  	.append("label")
	  	.style("color", "black")	  		  		  	
	  	.text("Selection information");

	  div = div.append("div");
	  	// .style("border", "1px solid rgb(190, 190, 190)")	  		  	
	  	// .style("margin", "10px")
	  	// .style("height", "240px")
	  	// .style("clear", "both")	  		  	
	  	// .style("padding", "10px");

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
	  	.attr("id", "daysOfWeekModelsInfoCursorId")  		
	  	.text("Id:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "daysOfWeekModelsInfoCursorNumber")  		
	  	.text("Number:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "daysOfWeekModelsInfoCursorName")  		
	  	.text("Name:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "daysOfWeekModelsInfoCursorRank")  		
	  	.text("Rank:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "daysOfWeekModelsInfoCursorRankingValue")  		
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
	  	.attr("id", "daysOfWeekModelsInfoBrushTimeWindow")  		
	  	.text("Time window:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "daysOfWeekModelsInfoBrushRowRange")  		
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
		  	.attr("id", "dayOfWeekModelsAreaStationsList")
		  	.style("padding", "5px")
		  	.style("overflow-y", "scroll")		  	
			.style("height", "200px");


	 
	}

}