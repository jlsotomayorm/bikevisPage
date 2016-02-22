var AnalyticsTripsView = {


	createAnalyticsTripsViewPanel: function(dataManager) {

	  var thisModeVisContainer = d3.select("#modeVisContainerAnalyticsTripsView");
	  var modeContainerUseLeft = thisModeVisContainer.append("div")    
	  	.style("visibility", "inherit")
	    .attr("id", "modeVisContainerAnalyticsTripsViewContainerLeftContainer");

	  modeContainerUseLeft
	    .append("div")
	      .attr("class", "canvases_container")     
	      .style("visibility", "inherit") 	       
	      .style("height", "99%") 	       
	      .append("div")
	        .attr("id", "TripsView_map_container") 
	        .style("visibility", "inherit")       
	        .attr("class", "canvas_container");

	  var modeContainerUseMiddle = thisModeVisContainer.append("div") 
	  	.style("visibility", "inherit") 	  	
	  	// .style("background", d3.rgb(30,25,53,1)) 
	    .attr("id", "modeVisContainerAnalyticsTripsViewContainerMiddleContainer");

	   
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
	  	.attr("id", "TripsViewTimelinePlayStopIcon")
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
	    .attr("id", "modeVisContainerAnalyticsTripsViewContainerRightContainer");

	  var analyticsContainer = modeContainerUseRight
	    .append("div")      
	      .attr("id", "modeVisContainerAnalyticsTripsViewAnalyticsContainer");	    
	  

	  //  Map viewer.  
	  this.mapContainerId = 'TripsView_map_container';
	  this.mapViewer = 
	    new MapViewerAnalyticsTripsView(dataManager, this.mapContainerId, MapStyles.MAP_STYLE_DARK_NAME);    

	  this.mapViewer.setActive(true);
	  this.mapViewer.analyticsContainer = analyticsContainer;

	  this.matrixViewer = new TripsViewMatrixViewer(dataManager, 'modeVisContainerAnalyticsTripsViewContainerMiddleContainer');
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

	  var toggletripsDayOfWeek = function (day, dayNumber) {
	  	// console.log("toggletripsDayOfWeek: " + day);
	  	d3.select("#tripsDaysOfTheWeekPeriodLabel").style("font-weight", "bold");
	  	d3.select("#tripsDaysOfTheWeekDayLabel").style("font-weight", "normal");
	  	// $("#matrixDatepicker")._clearDate(this);
	  	that.matrixViewer.tripsDayOfWeek = dayNumber;
	  	
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
	  	// .style("color", "gray")	
	  	.style("float", "left")	   		  	
	  	.attr("id", "tripsDaysOfTheWeekPeriodLabel")	 
	  	// .style("font-weight", "bold")
	  	.text("Period: "); 

	  var variableOptions = div2.append("select")
	  	.attr("name", "period")
	  	.style("position", "relative")
	  	// .attr("disabled", true)
	  	.style("left", "5px")
	  	.style("top", "-3px")
	  	.attr("id", "analyticsTripsViewPeriod")
	  	.on("change", function() {
	  		d3.select("#tripsDaysOfTheWeekPeriodLabel").style("font-weight", "bold");
	  		d3.select("#tripsDaysOfTheWeekDayLabel").style("font-weight", "normal");
	  		
	  		// that.matrixViewer.period = this.value.split(" ")[0];
	  		that.matrixViewer.period = this.value;
	  		that.matrixViewer.dataManager_.getStationsPeriodTrips(that.matrixViewer, that.matrixViewer.period);
	  	}); 

	  div2 = div.append("div")
	  	.style("float", "right")	
	  	.style("height", "20px");

	  div2
	  	.append("label")
	  	.style("color", "black")	
	  	.style("float", "left")	
	  	.attr("id", "tripsDaysOfTheWeekDayLabel")
	  	.style("font-weight", "bold")	   		  	   		  	
	  	.text("Day: ");

	  var datepicker = div2.append("input")	  	
	  	.style("position", "relative")
	  	.style("left", "5px")
	  	.style("top", "-3px")
	  	.attr("id", "tripViewMatrixDatepicker");  	  

	  $(function() {
	    $( "#tripViewMatrixDatepicker" ).datepicker({
	    	dateFormat: "mm/dd/yy",
	    	defaultDate: "08/01/2013",
		    onClose: function( selectedDate ) {
		    	// console.log(selectedDate);
		    	that.matrixViewer.calendarDay = selectedDate.split("/").join("-");
		    	// that.matrixViewer.dataManager_.getDayActivity(that.matrixViewer, selectedDate.split("/").join("-"));    
		    	that.matrixViewer.dataManager_.getStationsDayTrips(that.matrixViewer, selectedDate.split("/").join("-"));    
		    	
		    	d3.select("#tripsDaysOfTheWeekPeriodLabel").style("font-weight", "normal");
			  	d3.select("#tripsDaysOfTheWeekDayLabel").style("font-weight", "bold");
			  	d3.selectAll(".tripsDayOfWeekButtom").style("font-weight", "normal");
		    }
	    });
	  });

	  // var periodOptions = ["06 2013", "08 2013", "09 2013", "10 2013", "11 2013", "12 2013", "01 2014", "02 2014", "Summer 2013", "Fall 2013", "Winter 2013", "All"];

	  // d3.select("#analyticsTripsViewPeriod").selectAll(".periodOption").data(periodOptions).enter()
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

  	div2.selectAll(".tripsDayOfWeekButtom").data(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
  		"Saturday", "Sunday", "Weekdays", "Weekend"])
  	.enter().append("div")		  	
	  	.attr("id", function (d) { return d + "Button";})
	  	.attr("class", "tripsDayOfWeekButtom")		  	
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
	  	// .style("color", "gray")
	  	.on("click", function (d,i) {

	  		// return;

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
		  			d3.selectAll(".tripsDayOfWeekButtom").style("font-weight", "normal");
		  			d3.select(this).style("font-weight", "bold");
		  		// };
		  	}
	  		toggletripsDayOfWeek(d, i);
	  	})
	  	.text(function (d) { return d;});

	  div = analyticsContainer.append("div")
	  	.style("border", "1px solid rgb(190, 190, 190)")	  		  	
	  	.style("margin", "10px")
	  	.style("clear", "both")
	  	.style("height", "640px")
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


	 //  var colorScaleWidth = 220;
	 //  var colorScaleHeight = 10;

	 //  var div2 = div.append("div")	
	 //  	.style("position", "relative")
	 //  	// .style("top", "-8px")
	 //  	.style("left", "-5px")  		  	
	 //  	.style("width", colorScaleWidth + "px");

	 //  div2.append("label")
	 //  	.style("position", "relative")
		// .style("top", "-15px")
		// .style("float", "left")
	 //  	.style("color", "black")
	 //  	.attr("id", "TripsViewMinValueLabel")	  	
	 //  	.attr("for", "minValue")	
	 //  	.text("0.0");

	 //  div2.append("label")
	 //  	.style("position", "relative")
		// .style("top", "-15px")
		// .style("float", "right")
	 //  	.style("color", "black")	  	
	 //  	.attr("id", "TripsViewMaxValueLabel")
	 //  	.attr("for", "maxValue")	
	 //  	.text("1.0");

	 //  var colorScale = div
	 //  	.append("div")
	 //  		.attr("id", "TripsViewColorScale")
	 //  		.style("position", "relative")
	 //  		.style("top", "-15px")
	 //  		.style("float", "left")
	 //  		.style("height", colorScaleHeight + "px")
	 //  		.style("width", "100%");	  

	 //  var colorScaleOptions = colorScale.append("select")
	 //  // var colorScaleOptions = div.append("select")
	 //  	.style("clear", "both")
	 //  	.style("position", "relative")
	 //  	.style("top", "0px")
	 //  	.style("left", "8px")
	 //  	.attr("name", "colorScale")
	 //  	.attr("name", "colorScale")
	 //  	.attr("id", "analyticsTripsViewColorScaleOptions")
	 //  	.on("change", function() {
	 //  		// console.log(this.value);
	 //  		that.matrixViewer.actualPropertyColorScale = that.matrixViewer.colorScales[this.value];
	 //  		that.matrixViewer.updateColorScale();  		
	 //  	});


	 //  var colorScaleRangeSlider = div2
		//   .append("div")
		//   	.style("width", "208px")
		//   	.style("position", "relative")
	 //  		.style("top", "10px")
	 //  		.style("left", "3px")
		//   	.attr("id", "tripsDayOfWeekValueRangeSlider");

		// $(function() {
		//     $( "#tripsDayOfWeekValueRangeSlider" ).slider({
		//       range: true,
		//       min: 0,
		//       max: 1,
		//       values: [ 0, 1 ],
		//       slide: function( event, ui ) {
		      	
		//         $( "#TripsViewMinValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 0 ], that.matrixViewer.variable));
		//         $( "#TripsViewMaxValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 1 ], that.matrixViewer.variable));		        
		//         that.matrixViewer.actualMinValue = ui.values[ 0 ];
		//         that.matrixViewer.actualMaxValue = ui.values[ 1 ];
		//       },
		//       stop: function( event, ui ) {
		      	
		//         $( "#TripsViewMinValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 0 ], that.matrixViewer.variable));
		//         $( "#TripsViewMaxValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 1 ], that.matrixViewer.variable));		        
		//         that.matrixViewer.actualMinValue = ui.values[ 0 ];
		//         that.matrixViewer.actualMaxValue = ui.values[ 1 ];
		        
		//         that.matrixViewer.updateRangeSliderLimits = false;
		//         that.matrixViewer.createMatrix();
		        
		    
		//       }
		//     });
		    
		//   });	  

	 //  div2 = div.append("div")
	 //  	.style("clear", "both");

	 //  div2
	 //  	.append("label")
	 //  	.style("position", "relative")
		// // .style("top", "-20px")
	 //  	.style("color", "black")	  	
	 //  	.attr("for", "useGlobalNormalization")	
	 //  	.text("Global normalization");

	 //  div2
	 //  	.append("input")
	 //  	.style("position", "relative")
		// // .style("top", "-20px")
	 //  	.attr("type", "checkbox")
	 //  	.attr("checked", "true")
	 //  	.attr("id", "useGlobalNormalization");

	 //  $( "#useGlobalNormalization" ).on( "click", function( event ) {
	 //      	// console.log(event.currentTarget.checked);
	 //      	that.matrixViewer.useGlobalNormalization = event.currentTarget.checked;
	 //      	that.matrixViewer.createMatrix();
	 //      	that.matrixViewer.updatedMatrixPointedLine(that.matrixViewer.lastPointedStationOrder);
	 //      });
	  
	  div2 = div.append("div")	
	  	.style("border", "1px solid rgb(230, 230, 230)")	  		  	
	  	// .style("margin-top", "5px")
	  	// .style("margin-top", "10px")
	  	.style("clear", "both")
	  	.style("height", "230px")
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

	  div3 = div3.append("div")
	  	.style("clear", "both")
	  	.style("padding", "10px")
	  	.style("height", "150px");

	  var div4 = div3.append("div")	
	  	.style("float", "left") 
	  	// .style("clear", "both")
	  	.style("width", "150px")  	
	  	.style("height", "20px");  

	  var viewIncomingTripsOption = div4.append("input")
	  	.attr("name", "incomingTrips")
	  	.attr("type", "checkbox")
	  	.style("float", "left")
	  	.attr("checked", true)
	  	.attr("id", "incomingTrips");

	  $( "#incomingTrips" ).on( "click", function( event ) {
	      	// console.log(event.currentTarget.checked);
	      	that.matrixViewer.viewIncomingTrips = event.currentTarget.checked;
	      	that.matrixViewer.createMatrix();	  
	      	that.matrixViewer.updatedTripsInTheMap();    	
	      });

	  div4
	  	.append("label")
	  	.style("color", "red")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "incomingTrips")	
	  	.text("Incoming trips");

	  div4 = div3.append("div")	
	  	.style("float", "left")  	
	  	.style("width", "150px")  	
	  	.style("height", "20px");  

	  var viewOutgoingTripsOption = div4.append("input")
	  	.attr("name", "outgoingTrips")
	  	.attr("type", "checkbox")
	  	.style("float", "left")
	  	.attr("checked", true)
	  	.attr("id", "outgoingTrips");

	  	$( "#outgoingTrips" ).on( "click", function( event ) {
	      	// console.log(event.currentTarget.checked);
	      	that.matrixViewer.viewOutgoingTrips = event.currentTarget.checked;
	      	that.matrixViewer.createMatrix();	 
	      	that.matrixViewer.updatedTripsInTheMap();     	
	      });

	  div4
	  	.append("label")
	  	.style("color", "blue")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "outgoingTrips")	
	  	.text("Outgoing trips");

	  	

	  div4 = div3.append("div")	 
	  	.style("float", "left")  	
	  	.style("width", "150px")  	
	  	.style("height", "20px");  

	  var viewCyclicTripsOption = div4.append("input")
	  	.attr("name", "cyclicTrips")
	  	.attr("type", "checkbox")
	  	.style("float", "left")
	  	.attr("checked", true)
	  	.attr("id", "cyclicTrips");

	  	$( "#cyclicTrips" ).on( "click", function( event ) {
	      	// console.log(event.currentTarget.checked);
	      	that.matrixViewer.viewCyclicTrips = event.currentTarget.checked;
	      	that.matrixViewer.createMatrix();	
	      	that.matrixViewer.updatedTripsInTheMap();      	
	      });

	  div4
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "cyclicTrips")	
	  	.text("Cyclic trips");

	  div4 = div3.append("div")	 
	  	.style("float", "left")  	
	  	.style("width", "150px") 	
	  	.style("height", "20px");  

	  var viewTripsDurationOption = div4.append("input")
	  	.attr("id", "tripsDuration")
	  	.attr("type", "checkbox")
	  	// .attr("disabled", true)
	  	.style("float", "left");

	  div4
	  	.append("label")
	  	// .style("color", "gray")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "tripsDuration")	
	  	.text("Trips duration");

	  $( "#tripsDuration" ).on( "click", function( event ) {
	      	// console.log(event.currentTarget.checked);
	      	that.matrixViewer.viewTripsDuration = event.currentTarget.checked;
	      	if (that.matrixViewer.viewTripsDuration) {
	      		that.matrixViewer.viewTripsDistance = false;
	      		$( "#tripsDistance" ).attr("checked", false);
	      	}
	      	
	      	that.matrixViewer.createMatrix();	      	
	      });

	  div4 = div3.append("div")	 
	  	.style("float", "left")  	
	  	.style("width", "150px")  	
	  	.style("height", "20px");  

	  var viewTripsDistanceOption = div4.append("input")
	  	.attr("id", "tripsDistance")
	  	.attr("type", "checkbox")
	  	.attr("checked", true)
	  	// .attr("disabled", true)
	  	.style("float", "left");

	  $( "#tripsDistance" ).on( "click", function( event ) {
	      	// console.log(event.currentTarget.checked);
	      	that.matrixViewer.viewTripsDistance = event.currentTarget.checked;
	      	if (that.matrixViewer.viewTripsDistance) {
	      		that.matrixViewer.viewTripsDuration = false;
	      		$( "#tripsDuration" ).attr("checked", false);
	      	}
	      	that.matrixViewer.createMatrix();	      	
	      });

	  div4
	  	.append("label")
	  	// .style("color", "gray")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "tripsDistance")	
	  	.text("Trips distance");

	  div4 = div3.append("div")	 
	  	.style("float", "left")  	
	  	.style("width", "150px") 	
	  	.style("height", "20px");  

	  var viewOutagesOption = div4.append("input")
	  	.attr("name", "outages")
	  	.attr("type", "checkbox")
	  	.style("float", "left")
	  	.attr("checked", true)
	  	.attr("id", "outages");

	  	$( "#outages" ).on( "click", function( event ) {
	      	// console.log(event.currentTarget.checked);
	      	that.matrixViewer.viewOutages = event.currentTarget.checked;
	      	that.matrixViewer.createMatrix();	      	
	      });

	  div4
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	  		  	
	  	.attr("for", "outagesTrips")	
	  	.text("Outages");

	  

	  

	  // var variableOptions = div3.append("select")
	  // 	.attr("name", "variables")
	  // 	.style("float", "right")	  		  	
	  // 	.attr("id", "analyticsTripsViewVariables")
	  // 	.on("change", function() {
	  // 		that.matrixViewer.variable = that.matrixViewer.variableNametoKeyMap[this.value];
	  // 		if (that.matrixViewer.displayAndOrderLocked) {

	  // 			var orderingStat = that.matrixViewer.ordering.split(": ")[1];

	  // 			if (orderingStat != "max" &&
			//       orderingStat != "min" &&
			//       orderingStat != "mean" &&
			//       orderingStat != "range") {

			//       orderingStat = "mean";
			//     }

	  // 			that.matrixViewer.ordering = this.value + ": " + orderingStat;

	  // 			that.matrixViewer.reorderLines();
			// 	that.matrixViewer.updateRankingLists();	  
			// }

			// if (that.matrixViewer.variable == "b") {
		 //      that.matrixViewer.globalMinValue = 0.0;
		 //      that.matrixViewer.globalMaxValue = 1.0;
		 //    }

		 //    if (that.matrixViewer.variable == "bi") {
		 //      that.matrixViewer.globalMinValue = 0;
		 //      that.matrixViewer.globalMaxValue = 70;
		 //    }

		 //    if (that.matrixViewer.variable == "biI") {
		 //      that.matrixViewer.globalMinValue = 0;
		 //      that.matrixViewer.globalMaxValue = 60;
		 //    }

		 //    if (that.matrixViewer.variable == "biIF") {
		 //      that.matrixViewer.globalMinValue = 0;
		 //      that.matrixViewer.globalMaxValue = 20;
		 //    }

		 //    if (that.matrixViewer.variable == "s") {
		 //      that.matrixViewer.globalMinValue = 0;
		 //      that.matrixViewer.globalMaxValue = 70;
		 //    }

		 //    if (that.matrixViewer.variable == "biO") {
		 //      that.matrixViewer.globalMinValue = 0;
		 //      that.matrixViewer.globalMaxValue = 60;
		 //    }

		 //    if (that.matrixViewer.variable == "biOF") {
		 //      that.matrixViewer.globalMinValue = 0;
		 //      that.matrixViewer.globalMaxValue = 20;
		 //    }

		 //    if (that.matrixViewer.variable == "f") {
		 //      that.matrixViewer.globalMinValue = 0;
		 //      that.matrixViewer.globalMaxValue = 40;
		 //    }

		 //    if (that.matrixViewer.variable == "c") {
		 //      that.matrixViewer.globalMinValue = 0;
		 //      that.matrixViewer.globalMaxValue = 70;
		 //    }

		 //    that.matrixViewer.actualMinValue = that.matrixViewer.globalMinValue;
   //  		that.matrixViewer.actualMaxValue = that.matrixViewer.globalMaxValue;

			// that.matrixViewer.updateRangeSliderLimits = true;		  
	  // 		that.matrixViewer.updateMatrix();
	  // 	});

	  
	  div3 = div2.append("div")
	  	.style("clear", "both")
	  	// .style("padding", "10px")
	  	.style("height", "20px");

	  // div3
	  // 	.append("span")
	  // 	.style("position", "relative")
	  // 	.style("left", "15px") 
	  // 	.style("top", "-2px")
	  // 	.attr("id", "tripsDaysOfWeekModelsDisplayAndOrderLockIcon")
	  // 	.attr("class", "ui-icon ui-icon-locked")
	  // 	.on("click", function() {

	  // 		if (d3.select(this).attr("class") == "ui-icon ui-icon-locked") {
	  // 			that.matrixViewer.displayAndOrderLocked = false;
	  // 			d3.select(this).attr("class", "ui-icon ui-icon-unlocked");
	  // 		} else {
	  // 			that.matrixViewer.displayAndOrderLocked = true;
			// 	d3.select(this).attr("class", "ui-icon ui-icon-locked");
			// 	that.matrixViewer.reorderLines();
			// 	that.matrixViewer.updateRankingLists();	  		
	  // 			that.matrixViewer.updateMatrix();
	  // 		}	  		
	  // 	});

	  div3
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	
	  	.style("position", "relative")
	  	// .style("top", "-2px")  		  	
	  	.attr("for", "ordering")	
	  	.text("Order:");

	  var orderingOptions = div3.append("select")
	  	.attr("name", "ordering")
	  	.style("float", "left")
	  	.style("position", "relative")
	  	.style("left", "10px") 	  		  	
	  	.attr("id", "analyticsTripsViewOrdering")
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
	  		// 	d3.select("#tripsDaysOfWeekModelsDisplayAndOrderLockIcon").attr("class", "ui-icon ui-icon-unlocked");
	  		// }

	  		that.matrixViewer.reorderLines();
	  		
	  		// that.matrixViewer.actualOrderingList = that.matrixViewer.orderLists[that.matrixViewer.ordering];
	  		
	  		that.matrixViewer.updateRankingLists();	  		
	  		that.matrixViewer.updateMatrix();	
	  		that.matrixViewer.updatedTripsInTheMap();  		
	  	});  


	div3 = div2.append("div")
	  	.style("clear", "both")
	  	// .style("padding", "10px")
	  	.style("height", "20px");

	 div3
	  	.append("label")
	  	.style("color", "black")	  	
	  	.style("float", "left")	
	  	.style("position", "relative")
	  	// .style("top", "-2px")  		  		  	
	  	.text("Filter:");

	 div3 = div2.append("div")
	  	.style("clear", "both")
	  	// .style("padding", "10px")
	  	.style("height", "25px");

	 div3.append("label")
	  	.style("position", "relative")
		.style("left", "10px")
		.style("float", "left")
	  	.style("color", "black")	  		
	  	.text("Trip distance:");

	 div4 = div3.append("div")
	  	// .style("clear", "both")
	  	.style("left", "60px")
	  	.style("float", "left")
	  	.style("width", "250px")
	  	.style("height", "20px");

	 div4.append("label")
	  	.style("position", "relative")
		// .style("top", "-15px")
		// .style("float", "left")
		.style("left", "-70px")
	  	.style("color", "black")
	  	.attr("id", "TripsViewFilterDistanceMinValueLabel")	  	
	  	.attr("for", "minValue")	
	  	.text("0 m");	  

	  var filterDistanceRangeSlider = div4
		  .append("div")
		  	.style("width", "100px")
		  	.style("position", "relative")
	  		// .style("top", "10px")
	  		.style("left", "90px")
	  		.style("float", "left")
		  	.attr("id", "tripsDayOfWeekFilterDistanceValueRangeSlider");

		$(function() {
		    $( "#tripsDayOfWeekFilterDistanceValueRangeSlider" ).slider({
		      range: true,
		      min: 0,
		      max: 14000,
		      values: [ 0, 14000 ],
		      slide: function( event, ui ) {
		      	
		        $( "#TripsViewFilterDistanceMinValueLabel" ).text( ui.values[ 0 ] + " m");
		        $( "#TripsViewFilterDistanceMaxValueLabel" ).text( ui.values[ 1 ] + " m");		        
		        that.matrixViewer.actualDistanceMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualDistanceMaxValue = ui.values[ 1 ];
		        // that.matrixViewer.updateMatrix();
		      },
		      stop: function( event, ui ) {
		      	
		        $( "#TripsViewFilterDistanceMinValueLabel" ).text( ui.values[ 0 ] + " m");
		        $( "#TripsViewFilterDistanceMaxValueLabel" ).text( ui.values[ 1 ] + " m");		        
		        that.matrixViewer.actualDistanceMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualDistanceMaxValue = ui.values[ 1 ];
		        that.matrixViewer.updateMatrix();
		        that.matrixViewer.updatedTripsInTheMap();
		        
		        // that.matrixViewer.updateRangeSliderLimits = false;
		        // that.matrixViewer.createMatrix();
		        
		    
		      }
		    });
		    
		  });	


	div4.append("label")
	  	.style("position", "relative")
		.style("left", "85px")
		// .style("float", "right")
	  	.style("color", "black")	  	
	  	.attr("id", "TripsViewFilterDistanceMaxValueLabel")
	  	.attr("for", "maxValue")	
	  	.text("14000 m"); 

	

	div3 = div2.append("div")
	  	.style("clear", "both")
	  	// .style("padding", "10px")
	  	.style("height", "25px");

	 div3.append("label")
	  	.style("position", "relative")
		.style("left", "10px")
		.style("float", "left")
	  	.style("color", "black")	  		
	  	.text("Trip duration:");

	 div4 = div3.append("div")
	  	// .style("clear", "both")
	  	.style("left", "60px")	  	
	  	.style("float", "left")
	  	.style("width", "250px")
	  	.style("height", "20px");

	 div4.append("label")
	  	.style("position", "relative")
		// .style("top", "-15px")
		// .style("float", "left")
		.style("left", "-70px")
	  	.style("color", "black")
	  	.attr("id", "TripsViewFilterDurationMinValueLabel")	  	
	  	.attr("for", "minValue")	
	  	.text("0 min");

	  

	  var filterDistanceRangeSlider = div4
		  .append("div")
		  	.style("width", "100px")
		  	.style("position", "relative")
	  		// .style("top", "10px")
	  		.style("left", "90px")
	  		.style("float", "left")
		  	.attr("id", "tripsDayOfWeekFilterDurationValueRangeSlider");

		$(function() {
		    $( "#tripsDayOfWeekFilterDurationValueRangeSlider" ).slider({
		      range: true,
		      min: 0,
		      max: 7200,
		      values: [ 0, 7200 ],
		      slide: function( event, ui ) {
		      	
		        $( "#TripsViewFilterDurationMinValueLabel" ).text( Math.floor(ui.values[ 0 ]/60) + " min");
		        $( "#TripsViewFilterDurationMaxValueLabel" ).text( Math.floor(ui.values[ 1 ]/60) + " min");		        
		        that.matrixViewer.actualDurationMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualDurationMaxValue = ui.values[ 1 ];
		        // that.matrixViewer.updateMatrix();
		      },
		      stop: function( event, ui ) {
		      	
		        $( "#TripsViewFilterDurationMinValueLabel" ).text( Math.floor(ui.values[ 0 ]/60) + " min");
		        $( "#TripsViewFilterDurationMaxValueLabel" ).text( Math.floor(ui.values[ 1 ]/60) + " min");		        
		        that.matrixViewer.actualDurationMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualDurationMaxValue = ui.values[ 1 ];
		        that.matrixViewer.updateMatrix();
		        that.matrixViewer.updatedTripsInTheMap();
		        
		        // that.matrixViewer.updateRangeSliderLimits = false;
		        // that.matrixViewer.createMatrix();
		        
		    
		      }
		    });
		    
		  });	

	div4.append("label")
	  	.style("position", "relative")
		// .style("top", "-15px")
		.style("left", "75px")
	  	.style("color", "black")	  	
	  	.attr("id", "TripsViewFilterDurationMaxValueLabel")
	  	.attr("for", "maxValue")	
	  	.text("120 min");

	div3 = div2.append("div")
	  	.style("clear", "both")
	  	// .style("padding", "10px")
	  	.style("height", "25px");

	 div3.append("label")
	  	.style("position", "relative")
		.style("left", "10px")
		.style("float", "left")
	  	.style("color", "black")	  		
	  	.text("Trip direction:");

	 div4 = div3.append("div")
	  	// .style("clear", "both")
	  	.style("left", "60px")	  	
	  	.style("float", "left")
	  	.style("width", "250px")
	  	.style("height", "20px");

	 div4.append("label")
	  	.style("position", "relative")
		// .style("top", "-15px")
		// .style("float", "left")
		.style("left", "-70px")
	  	.style("color", "black")
	  	.attr("id", "TripsViewFilterDirectionMinValueLabel")	  	
	  	.attr("for", "minValue")	
	  	.text("0 °");

	  

	  var filterDistanceRangeSlider = div4
		  .append("div")
		  	.style("width", "100px")
		  	.style("position", "relative")
	  		// .style("top", "10px")
	  		.style("left", "90px")
	  		.style("float", "left")
		  	.attr("id", "tripsDayOfWeekFilterDirectionValueRangeSlider");

		$(function() {
		    $( "#tripsDayOfWeekFilterDirectionValueRangeSlider" ).slider({
		      range: true,
		      min: 0,
		      max: 360,
		      values: [ 0, 360 ],
		      slide: function( event, ui ) {
		      	
		        $( "#TripsViewFilterDirectionMinValueLabel" ).text( ui.values[ 0 ] + " °");
		        $( "#TripsViewFilterDirectionMaxValueLabel" ).text( ui.values[ 1 ] + " °");		        
		        that.matrixViewer.actualDirectionMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualDirectionMaxValue = ui.values[ 1 ];
		        // that.matrixViewer.updateMatrix();
		      },
		      stop: function( event, ui ) {
		      	
		        $( "#TripsViewFilterDirectionMinValueLabel" ).text( ui.values[ 0 ] + " °");
		        $( "#TripsViewFilterDirectionMaxValueLabel" ).text( ui.values[ 1 ] + " °");		        
		        that.matrixViewer.actualDirectionMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualDirectionMaxValue = ui.values[ 1 ];
		        that.matrixViewer.updateMatrix();
		        that.matrixViewer.updatedTripsInTheMap();
		        
		        // that.matrixViewer.updateRangeSliderLimits = false;
		        // that.matrixViewer.createMatrix();
		        
		    
		      }
		    });
		    
		  });	

	div4.append("label")
	  	.style("position", "relative")
		// .style("top", "-15px")
		.style("left", "95px")
	  	.style("color", "black")	  	
	  	.attr("id", "TripsViewFilterDirectionMaxValueLabel")
	  	.attr("for", "maxValue")	
	  	.text("360°");	

	div3 = div2.append("div")
	  	.style("clear", "both")
	  	// .style("padding", "10px")
	  	.style("height", "25px");

	 div3.append("label")
	  	.style("position", "relative")
		.style("left", "10px")
		.style("float", "left")
	  	.style("color", "black")	  		
	  	.text("OD Flow:");

	 div4 = div3.append("div")
	  	// .style("clear", "both")
	  	.style("left", "60px")	  	
	  	.style("float", "left")
	  	.style("width", "250px")
	  	.style("height", "20px");

	 div4.append("label")
	  	.style("position", "relative")
		// .style("top", "-15px")
		// .style("float", "left")
		.style("left", "-43px")
	  	.style("color", "black")
	  	.attr("id", "TripsViewFilterFlowMinValueLabel")	  	
	  	.attr("for", "minValue")	
	  	.text("0");

	  

	  var filterDistanceRangeSlider = div4
		  .append("div")
		  	.style("width", "100px")
		  	.style("position", "relative")
	  		// .style("top", "10px")
	  		.style("left", "120px")
	  		.style("float", "left")
		  	.attr("id", "tripsDayOfWeekFilterFlowValueRangeSlider");

		$(function() {
		    $( "#tripsDayOfWeekFilterFlowValueRangeSlider" ).slider({
		      range: true,
		      min: 0,
		      max: 1000,
		      values: [ 0, 1000 ],
		      slide: function( event, ui ) {
		      	
		        $( "#TripsViewFilterFlowMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#TripsViewFilterFlowMaxValueLabel" ).text( ui.values[ 1 ]);		        
		        that.matrixViewer.actualFlowMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualFlowMaxValue = ui.values[ 1 ];
		        // that.matrixViewer.updateMatrix();
		      },
		      stop: function( event, ui ) {
		      	
		        $( "#TripsViewFilterFlowMinValueLabel" ).text( ui.values[ 0 ]);
		        $( "#TripsViewFilterFlowMaxValueLabel" ).text( ui.values[ 1 ]);		        
		        that.matrixViewer.actualFlownMinValue = ui.values[ 0 ];
		        that.matrixViewer.actualFlowMaxValue = ui.values[ 1 ];
		        that.matrixViewer.updateMatrix();
		        that.matrixViewer.updatedTripsInTheMap();
		        
		        // that.matrixViewer.updateRangeSliderLimits = false;
		        // that.matrixViewer.createMatrix();
		        
		    
		      }
		    });
		    
		  });	

	div4.append("label")
	  	.style("position", "relative")
		// .style("top", "-15px")
		.style("left", "132px")
	  	.style("color", "black")	  	
	  	.attr("id", "TripsViewFilterFlowMaxValueLabel")
	  	.attr("for", "maxValue")	
	  	.text("1000");	



	div = div.append("div")
		.style("border", "1px solid rgb(230, 230, 230)")
		.style("margin-top", "10px")	
		.style("height", "360px")
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
		  	.attr("id", "tripsDaysOfWeekModelsTopStationsList")
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
		  	.attr("id", "tripsDaysOfWeekModelsLastStationsList")
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
	  	.style("height", "160px")
	  	.style("clear", "both")	  		  	
	  	.style("padding", "0px");

	  // div
	  // 	.append("label")
	  // 	.style("color", "black")	  		  		  	
	  // 	.text("Selection information");

	  div = div.append("div");
	  	// .style("border", "1px solid rgb(190, 190, 190)")	  		  	
	  	// .style("margin", "10px")
	  	// .style("height", "240px")
	  	// .style("clear", "both")	  		  	
	  	// .style("padding", "10px");

	  divLeft = div.append("div")
	  	.style("float", "left")
	  	.style("height", "130px")
	  	.style("width", "30%")
	  	.style("padding", "5px");

	  var divInfoCursor = divLeft.append("div")
	  	.style("height", "130px")
	  	.style("padding", "0px");

	  divInfoCursor
	  	.append("label")
	  	.style("color", "black")	  		  	
	  	.attr("for", "selectInfoCursor")	
	  	.text("Cursor:");

	  var list = divInfoCursor.append("ul")
	  .style("position", "relative")
		.style("left", "-20px");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "tripsDaysOfWeekModelsInfoCursorId")  		
	  	.text("Id:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "tripsDaysOfWeekModelsInfoCursorNumber")  		
	  	.text("Number:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "tripsDaysOfWeekModelsInfoCursorName")  		
	  	.text("Name:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "tripsDaysOfWeekModelsInfoCursorRank")  		
	  	.text("Rank:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "tripsDaysOfWeekModelsInfoCursorRankingValue")  		
	  	.text("Ranking value:");	  

	  divRight = div.append("div")
	  	.style("float", "right")
	  	.style("width", "60%")
	  	.style("height", "240px")	  	
	  	.style("padding", "0px");

	  divRight
	  	.append("label")
	  	.style("color", "black")	  		  		  	
	  	.text("Brush:");

	  // divRight
		 //  .append("div")
		 //  	.attr("id", "TripsViewAreaStationsList")
		 //  	.style("padding", "5px")
		 //  	.style("overflow-y", "scroll")		  	
			// .style("height", "200px");

	  // var divInfoBrush = divLeft.append("div")
	  // 	.style("height", "100px")
	  // 	.style("width", "300px")
	  // 	.style("padding", "0px");

	  // divInfoBrush
	  // 	.append("label")
	  // 	.style("color", "black")	  		  	
	  // 	.attr("for", "selectInfoBrush")	
	  // 	.text("Brush:");

	  list = divRight.append("ul")
	  	.style("position", "relative")
		.style("left", "-20px");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "tripsDaysOfWeekModelsInfoBrushTimeWindow")  		
	  	.text("Time window:");

	  list
	  	.append("li")
	  	.style("color", "black")	  		  	
	  	.style("padding-left", "0px")	
	  	.attr("id", "tripsDaysOfWeekModelsInfoBrushRowRange")  		
	  	.text("Row range:");






	}


}