/**
 * Class serving map viewer.
 *
 */ 



/**
 * @param <String> mapContainerId ID of element to contain main map.
 * @param <string> opt_mapStyle optional style to apply to map.
 */
var MapViewerAnalyticsDayOfWeekModels = function(dataManager, mapContainerId, opt_mapStyle) {
  dataManager.addListener(this);
  // Lazy initialization.
  this.initialized_ = false;

  this.dataManager_ = dataManager;
  this.mapContainerId_ = mapContainerId;
  this.opt_mapStyle_ = opt_mapStyle; 

  // this.mapGLRenderer =  new MapGLRendererStationsUsage(dataManager);

  // These containers must be shown/hidden on activation.
  this.visibleContainersId_ = [
    '#' + this.mapContainerId_
  ];

  this.stationsOverlayCreated = false;

  
  this.historyTimeColorScale = d3.scale.linear().domain([1.0,0.85,0.4,0.0]).range([d3.rgb(150, 0, 0),
    d3.rgb(255, 0, 0),
    d3.rgb(255, 255, 0),
    d3.rgb(255, 255, 255)]);

  // this.historyTimeColorScale = d3.scale.linear().domain(
  //   [0.0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0]).range([

  //   d3.rgb(0.129412 * 255, 0.4 * 255, 0.67451 * 255),
  //   d3.rgb(0.262745 * 255, 0.576471 * 255, 0.764706 * 255),
  //   d3.rgb(0.572549 * 255, 0.772549 * 255, 0.870588 * 255),
  //   d3.rgb(0.819608 * 255, 0.898039 * 255, 0.941176 * 255),
  //   d3.rgb(0.968627 * 255, 0.968627 * 255, 0.968627 * 255),
  //   d3.rgb(0.992157 * 255, 0.858824 * 255, 0.780392 * 255),
  //   d3.rgb(0.956863 * 255, 0.647059 * 255, 0.509804 * 255),    
  //   d3.rgb(0.839216 * 255, 0.376471 * 255, 0.301961 * 255),
  //   d3.rgb(0.698039 * 255, 0.0941176 * 255, 0.168627 * 255),
  // ]);   // blue to white to red

  // this.historyTimeColorScale = d3.scale.linear().domain([1.0,0.75,0.5,0.25,0.0]).range([
  //   d3.rgb(255,255,212),
  //   d3.rgb(254,217,142),
  //   d3.rgb(254,153,41),
  //   d3.rgb(217,95,14),
  //   d3.rgb(153,52,4)
  // ]);   // white to orange
  
  // this.historyTimeColorScale = d3.scale.linear().domain([1.0,0.75,0.5,0.25,0.0]).range([
  //   d3.rgb(94,60,153),
  //   d3.rgb(178,171,210),
  //   d3.rgb(247,247,247),
  //   d3.rgb(253,184,99),
  //   d3.rgb(230,97,1)
  // ]);

  // this.historyTimeColorScale = d3.scale.linear().domain([1.0,0.0]).range([
  //   d3.hsl(264,1,1),    
  //   d3.hsl(264,1.0,0.2)
  // ]);  

  // this.frequencyWindow = 30;  // in minutes
  // this.lowFrequency = 0;
  // this.highFrequency = 2;
  
  this.timelineActualIndex = 1;
  this.dayOfWeek = 0;
  this.stationSize = 20;
  this.queryThickness = 4;
  this.useQuery = false;
  this.showHistory = false;
  this.queryAngle = 0;
  this.queryAngleRange = 10;
  this.property = "balance";
  this.mode = "value";
  this.queryStationId = -1;
  this.angleScaleSlope = d3.scale.linear().domain([-1, 1]).range([90, -90]);
  this.angleScaleBalance = d3.scale.linear().domain([0, 1]).range([45, -45]);
  this.maxStationSize = 200;
  this.stationSizeChanged = false;
};


/**
 * Activates/deactivates renderer.
 */
MapViewerAnalyticsDayOfWeekModels.prototype.setActive = function(active) {
  var mustUpdate = active && !this.active_;
  this.active_ = active;

  // Show/hide containers.
  utils.setVisibility(this.visibleContainersId_, this.active_);

  // Updates map.
  if (mustUpdate) {
    this.update();
  }
};


/**
 * Returns whether renderer is active.
 */
MapViewerAnalyticsDayOfWeekModels.prototype.isActive = function() {
  return this.active_;
};


MapViewerAnalyticsDayOfWeekModels.prototype.update = function() {
  if (!this.dataManager_.hasData() || !this.active_) {
    //return;
  }

  if (!this.initialized_) {
    this.initMap_(this.mapContainerId_, this.opt_mapStyle_);
    //this.mapGLRenderer.initialize(this.map_);
    this.initialized_ = true;
  }

  // TODO Load initial view options based on filters and selections.

  //console.log(this.dataManager_.stationsActivities);

  // this.mapGLRenderer.update();
};


/**
 * Loads Google Maps and invoke callback when done (static function).
 * @param <function> callbackName function to call once google maps is loaded.
 * @return undefined.
 */
MapViewerAnalyticsDayOfWeekModels.loadGMaps = function(callbackName) {
  var script  = document.createElement("script");
  script.type = "text/javascript";
  script.src  = 
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyC50vDMewZXJZwaOnjO1R" +
    "k-gJf7EDYFibQ&sensor=true&callback=" + 
    callbackName;
  document.body.appendChild(script);
};

MapViewerAnalyticsDayOfWeekModels.prototype.getAngle = function(stationId, index) {  
  var windowSize = 4;
  var angle = 0;

  if (this.dataManager_.dayOfWeekModels[this.dayOfWeek][stationId] != undefined) {
    if (this.property == "slope") {

      var modelSize = this.dataManager_.dayOfWeekModels[this.dayOfWeek][stationId]["means"].length;

      if (index < 1 + windowSize/2) {
        index = 1 + windowSize/2;
      }

      if (index > modelSize - 2 - windowSize/2) {
        index = modelSize - 2 - windowSize/2;
      }

      var delta = (this.dataManager_.dayOfWeekModels[this.dayOfWeek][stationId]["means"][index +  windowSize/2]
       - this.dataManager_.dayOfWeekModels[this.dayOfWeek][stationId]["means"][index -  windowSize/2]); 

      angle = this.angleScaleSlope(delta*2);
    } else if (this.property == "balance") {  

      angle = this.angleScaleBalance(this.dataManager_.dayOfWeekModels[this.dayOfWeek][stationId]["means"][index]);          
    }
  }

  return angle;
}


MapViewerAnalyticsDayOfWeekModels.prototype.updateLineWidth = function() {
  if (this.stationSizeChanged) {

    var that = this;

    that.transformPadding = that.stationSize/2;

    var marker = that.stationsLayer.selectAll("svg")        
      .each(function(d) {
          that.transform(d, this, that);
        }) // update existing markers      
      // .style("width", that.stationSize + "px")
      // .style("height", that.stationSize + "px"); 
      .style("width", function(d) {

          var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

          return (that.stationSize*thisSizeRatio) + "px";
        })
      .style("height", function(d) {
          var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

          return (that.stationSize*thisSizeRatio) + "px";
        }); 

    // d3.selectAll(".stationTransform")
    //   .attr("transform", "translate(" + that.transformPadding + "," + that.transformPadding + ")"); 

    d3.selectAll(".stationTransform")
      .attr("transform", function(d) {

          var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

          return "translate(" + (thisSizeRatio*that.transformPadding) + "," + (thisSizeRatio*that.transformPadding) + ")";
        }); 

    // d3.selectAll(".historyGroupBackground")
    //   .attr("r", that.stationSize/2);

    // d3.selectAll(".actualStateLine")
    //   .attr("x", -that.stationSize/2)      
    //   .attr("width", that.stationSize);

    d3.selectAll(".actualStateLine")
      // .attr("x", function(d) {

      //     // console.log(d);

      //     var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

      //     return (-that.stationSize/2*thisSizeRatio) + "px";
      //   })      
      .attr("width", function(d) {
          var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

          return (that.stationSize/2*thisSizeRatio) + "px";
        });

    d3.selectAll(".baseline")
      // .attr("x", function(d) {

      //     // console.log(d);

      //     var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

      //     return (-that.stationSize/2*thisSizeRatio) + "px";
      //   })      
      .attr("width", function(d) {
          var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

          return (that.stationSize/2*thisSizeRatio) + "px";
        });

    // d3.selectAll(".queryArea")
    //   .attr("x", -that.stationSize/2)      
    //   .attr("width", that.stationSize);

    d3.selectAll(".queryArea")
      .attr("x", function(d) {

          // console.log(d);

          var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

          return (-that.stationSize/2*thisSizeRatio) + "px";
        })      
      .attr("width", function(d) {
          var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

          return (that.stationSize*thisSizeRatio) + "px";
        });

    // d3.selectAll(".historyEntry")
    //   .attr("x", function (d) {
    //     var width = that.stationSize/4 + 3*that.stationSize/4 * (1.0 - d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length);
    //     return -width/2;
    //   })
    //   .attr("width", function (d) {
    //     var width = that.stationSize/4 + 3*that.stationSize/4 * (1.0 - d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length);
    //     return width;
    //   });

    d3.selectAll(".historyEntry")
      .attr("x", function (d) {

        var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

        var width = that.stationSize/4 + 3*that.stationSize/4 * (1.0 - d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length);
        return -width/2 * thisSizeRatio;
      })
      .attr("width", function (d) {

        var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

        var width = that.stationSize/4 + 3*that.stationSize/4 * (1.0 - d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length);
        return width * thisSizeRatio;
      });

    this.stationSizeChanged = false;
  }
};

MapViewerAnalyticsDayOfWeekModels.prototype.transform = function(d, d3object, mapviewer) {

    var thisSizeRatio = mapviewer.dataManager_.stationsActualCapacity[d.id]/(mapviewer.dataManager_.stationsActualCapacity["maxCapacity"]);

    d = new google.maps.LatLng(d.latitude, d.longitude);
    d = mapviewer.projection.fromLatLngToDivPixel(d);
    // console.log("transform: " + d);    

    // console.log(thisSizeRatio);

    // return d3.select(d3object)
    //     .style("left", (d.x - mapviewer.transformPadding) + "px")
    //     .style("top", (d.y - mapviewer.transformPadding) + "px");

    return d3.select(d3object)
        .style("left", (d.x - thisSizeRatio*mapviewer.transformPadding) + "px")
        .style("top", (d.y - thisSizeRatio*mapviewer.transformPadding) + "px");
  
}

MapViewerAnalyticsDayOfWeekModels.prototype.updateMapVisualization = function() {  
   
  
  var that = this;

  if (!this.stationsOverlayCreated) {
    
    this.stationsOverlay = new google.maps.OverlayView();
    // Add the container when the overlay is added to the map.
    this.stationsOverlay.onAdd = function() {
      
      that.stationsLayer = d3.select(this.getPanes().overlayLayer).append("div")        
        .attr("class", "stationsLayer");

      // Draw each marker as a separate SVG element.
      // We could use a single SVG, but what size would it have?
      that.stationsOverlay.draw = function() {

        // console.log("onAdd");

        var projection = this.getProjection(),
            padding = that.stationSize/2;

        that.projection = projection;

        that.transformPadding = padding;

        var data = dataManager.stations;

        // console.log(data);

        var marker = that.stationsLayer.selectAll("svg")
            .data(data)
            .each(function(d) {
              that.transform(d, this, that);
            }) // update existing markers
          .enter().append("svg:svg") 
            .style("position", "absolute")
            .style("width", that.stationSize + "px")
            .style("height", that.stationSize + "px")
            .style("padding-right", "100px")
            .style("font", "10px sans-serif") 
            // .style("background-color", "red")             
            .each(function(d) {
              that.transform(d, this, that);
            })        
            // .on("click", function (d) {
            //   console.log("click");
            // })                
            .attr("class", "DayOfWeekModelsStation")
            .on("click", function (d) {
              that.queryStationId = d.id;
              $( "#trackingStationName" ).val( "Tracking station: " + d.name);
              that.updateMapVisualization();
            }); 
        

        var stationTransform = marker.append("g")
          .attr("class", "stationTransform")
          .attr("transform", "translate(" + padding + "," + padding + ")"); 

        var historyGroup = stationTransform.append("g")
          .attr("id", function (d) {return "historyGroup" + d.id;})
          .attr("visibility", "hidden")
          .attr("class", "historyGroup");

        historyGroup.append("svg:circle")
          .attr("r", that.stationSize/2)
          .attr("class", "historyGroupBackground")
          .attr("fill", "black")
          .attr("opacity", "0.0");        

        var thickness = 3.0;

        stationTransform.append("svg:rect")            
          // .attr("x", -padding)
          .attr("x", 0)
          .attr("y", -thickness/2)
          // .attr("width", padding*2)
          .attr("width", padding)
          .attr("stroke", "none")
          .attr("shape-rendering", "crispEdges ")
          // .attr("fill", "white")
          // .attr("fill", "hsl(284,0%,90%)")            
          .attr("fill", "red")            
          .attr("transform", "rotate(0)")
          // .attr("shape-rendering", "geometricPrecision")
          .attr("opacity", "1.0")
          .attr("class", "actualStateLine")
          // .attr("transform", "rotate(85) translate(" + (-padding) + ", " + ((0.5 - 0.5)) + ")")
          .attr("height", thickness);

        stationTransform.append("svg:rect")            
          // .attr("x", -padding)
          .attr("x", 0)
          .attr("y", -thickness/2)
          // .attr("width", padding*2)
          .attr("width", padding)
          .attr("stroke", "none")
          // .attr("fill", "white")
          // .attr("fill", "hsl(284,0%,90%)")            
          .attr("fill", "black")            
          .attr("transform", "rotate(0)")
          // .attr("shape-rendering", "geometricPrecision")
          .attr("opacity", "1.0")
          .attr("class", "baseline")
          // .attr("transform", "rotate(85) translate(" + (-padding) + ", " + ((0.5 - 0.5)) + ")")
          .attr("height", 0.5);

        var queryGroup = stationTransform.append("g")
          .attr("id", function (d) {return "queryGroup" + d.id;})
          .attr("class", "queryGroup"); 



        // queryGroup.append("svg:rect")            
        //     .attr("x", -padding/2)
        //     .attr("y", -that.queryThickness/2)
        //     .attr("width", padding)
        //     .attr("stroke", "none")
        //     .attr("fill", "black")
        //     .attr("transform", "rotate(" + (that.queryAngle) + ")")
        //     .attr("opacity", (that.useQuery) ? 1.0 : 0.0)
        //     // .attr("shape-rendering", "geometricPrecision")
        //     .attr("opacity", "1.0")
        //     .attr("class", "queryArea")
        //     // .attr("transform", "rotate(85) translate(" + (-padding) + ", " + ((0.5 - 0.5)) + ")")
        //     .attr("height", that.queryThickness);

        // queryGroup.append("svg:rect")            
        //     .attr("x", -padding/2)
        //     .attr("y", 2 * (-that.queryThickness/2 - thickness/2))
        //     .attr("width", padding)
        //     .attr("stroke", "none")
        //     .attr("fill", "hsl(284,0%,90%)")
        //     .attr("transform", "rotate(" + (that.queryAngle) + ")")
        //     .attr("opacity", (that.useQuery) ? 1.0 : 0.0)
        //     // .attr("shape-rendering", "geometricPrecision")
        //     .attr("opacity", "1.0")
        //     .attr("class", "queryArea")
        //     // .attr("transform", "rotate(85) translate(" + (-padding) + ", " + ((0.5 - 0.5)) + ")")
        //     .attr("height", that.queryThickness/2);

        // queryGroup.append("svg:rect")            
        //     .attr("x", -padding)
        //     .attr("y", -that.queryThickness/2 - thickness/2)
        //     .attr("width", padding*2)
        //     .attr("stroke", "none")
        //     .attr("fill", "hsl(284,0%,90%)")
        //     // .attr("fill", "black")
        //     .attr("transform", "rotate(" + (that.queryAngle) + ")")
        //     .attr("opacity", (that.useQuery) ? 1.0 : 0.0)
        //     // .attr("shape-rendering", "geometricPrecision")
        //     .attr("opacity", "1.0")
        //     .attr("class", "queryArea")
        //     // .attr("transform", "rotate(85) translate(" + (-padding) + ", " + ((0.5 - 0.5)) + ")")
        //     .attr("height", that.queryThickness/2);

        // queryGroup.append("svg:rect")            
        //     .attr("x", -padding)
        //     .attr("y", thickness/2)
        //     .attr("width", padding*2)
        //     .attr("stroke", "none")
        //     .attr("fill", "hsl(284,0%,90%)")
        //     // .attr("fill", "black")
        //     .attr("transform", "rotate(" + (that.queryAngle) + ")")
        //     .attr("opacity", (that.useQuery) ? 1.0 : 0.0)
        //     // .attr("shape-rendering", "geometricPrecision")
        //     .attr("opacity", "1.0")
        //     .attr("class", "queryArea")
        //     // .attr("transform", "rotate(85) translate(" + (-padding) + ", " + ((0.5 - 0.5)) + ")")
        //     .attr("height", that.queryThickness/2);

        // queryGroup.append("svg:rect")            
        //     .attr("x", -padding/2)
        //     .attr("y", 2 * (+that.queryThickness/2 + thickness/2))
        //     .attr("width", padding)
        //     .attr("stroke", "none")
        //     .attr("fill", "hsl(284,0%,90%)")
        //     .attr("transform", "rotate(" + (that.queryAngle) + ")")
        //     .attr("opacity", (that.useQuery) ? 1.0 : 0.0)
        //     // .attr("shape-rendering", "geometricPrecision")
        //     .attr("opacity", "1.0")
        //     .attr("class", "queryArea")
        //     // .attr("transform", "rotate(85) translate(" + (-padding) + ", " + ((0.5 - 0.5)) + ")")
        //     .attr("height", that.queryThickness/2);

        

               

        // Add a circle.
        // stationTransform.append("svg:circle")
        //     .attr("r", 1.5)
        //     .attr("cx", 0)
        //     .attr("cy", 0);

        

        // stationTransform.append("svg:rect")            
        //     .attr("x", -padding/2)
        //     .attr("y", -thickness/2)
        //     .attr("width", padding)
        //     .attr("stroke", "none")
        //     // .attr("fill", "white")
        //     // .attr("fill", "hsl(284,0%,90%)")            
        //     .attr("fill", "black")            
        //     .attr("transform", "rotate(0)")
        //     // .attr("shape-rendering", "geometricPrecision")
        //     .attr("opacity", "1.0")
        //     .attr("class", "actualStateLine")
        //     // .attr("transform", "rotate(85) translate(" + (-padding) + ", " + ((0.5 - 0.5)) + ")")
        //     .attr("height", thickness);
      }     
    }

    this.stationsOverlay.setMap(this.map_);

    this.stationsOverlayCreated = true;
  } else {

    if (that.useQuery && that.queryStationId >= 0) {

      // var newAngle = that.queryAngle;
      // var index = that.timelineActualIndex;
      // var windowSize = 4;

      // if (that.property == "slope") {

      //   var modelSize = that.dataManager_.dayOfWeekModels[that.dayOfWeek][that.queryStationId]["means"].length;

      //   if (index < 1 + windowSize/2) {
      //     index = 1 + windowSize/2;
      //   }

      //   if (index > modelSize - 2 - windowSize/2) {
      //     index = modelSize - 2 - windowSize/2;
      //   }

      //   var delta = (that.dataManager_.dayOfWeekModels[that.dayOfWeek][that.queryStationId]["means"][index +  windowSize/2]
      //    - that.dataManager_.dayOfWeekModels[that.dayOfWeek][that.queryStationId]["means"][index -  windowSize/2]); 

      //   newAngle = that.angleScaleSlope(delta*2);
      // } else if (that.property == "balance") {  

      //   newAngle = that.angleScaleBalance(that.dataManager_.dayOfWeekModels[that.dayOfWeek][that.queryStationId]["means"][index]);          
      // }

      that.queryAngle = that.getAngle(that.queryStationId, that.timelineActualIndex);
      that.queryAngleRange = 10;
      $("#queryAngleSlider").values[0] = that.queryAngle - that.queryAngleRange/2;
      $("#queryAngleSlider").values[1] = that.queryAngle + that.queryAngleRange/2;
    }

    d3.selectAll(".queryArea")
      .attr("opacity", (that.useQuery) ? 1.0 : 0.0)
      .attr("transform", "rotate(" + (that.queryAngle) + ")");

    
    
    // console.log(data);

    var marker = that.stationsLayer.selectAll(".DayOfWeekModelsStation")
      .attr("opacity", function (d) {
        var angle = 0;        

        var index = that.timelineActualIndex;
        
        angle = that.getAngle(d.id, index);

        if (that.useQuery) {          
          var opacity = 0;

          if (that.property == "slope") {
            opacity = 1.0 - 8 * Math.abs(that.queryAngle - angle)/180;
          } else if (that.property == "balance") {          
            // opacity = 1.0 - 8 * Math.abs(that.queryAngle - angle)/90;
            if (angle >= that.queryAngle - that.queryAngleRange/2 && 
              angle <= that.queryAngle + that.queryAngleRange/2) {
              opacity = 1.0;
            } else {
              opacity = 1.0 - 8 * Math.min(Math.abs(that.queryAngle - (angle-that.queryAngleRange/2)), Math.abs(that.queryAngle - (angle+that.queryAngleRange/2)))/90;
            }
          }

          return opacity;
        } else {
          return 1.0;
        }
      });

    marker.select(".stationTransform").select(".actualStateLine")
      .attr("fill", function (d) {
        var color = (d.id == that.queryStationId) ? "yellow" : "red";
        color = (that.useQuery) ? color : "red";
        return color;
      }) 
      .attr("stroke", function (d) {
        var color = (d.id == that.queryStationId) ? "orange" : "none";
        color = (that.useQuery) ? color : "none";
        return color;
      })     
      .attr("transform", function (d) {

        // console.log(d);

        var angle = 0;        

        var index = that.timelineActualIndex;
        
        angle = that.getAngle(d.id, index);

        // if (that.useQuery) {          
        //   var opacity = 0;

        //   if (that.property == "slope") {
        //     opacity = 1.0 - 8 * Math.abs(that.queryAngle - angle)/180;
        //   } else if (that.property == "balance") {          
        //     opacity = 1.0 - 8 * Math.abs(that.queryAngle - angle)/90;
        //   }

        //   d3.select(this).attr("opacity", opacity);
        // } else {
        //   d3.select(this).attr("opacity", 1.0);
        // }
          
        // }



        

        if (that.showHistory) {
          that.drawHistory(d.id, index);
        } else {
          d3.select("#historyGroup" + d.id)
            .attr("visibility", "hidden");          
        }

        // var historyGroup = that.stationsLayer.selectAll(".DayOfWeekModelsStation")
        //   .select(".stationTransform").select(".historyGroup")
        //   .selectAll(".historyEntry") 
        //     .data(historyGroupData)            
        //   .enter().append("svg:rect")
        //     .attr("r", 4.5)
        //     .attr("x", -padding/2)
        //     .attr("y", -thickness/2)
        //     .attr("width", padding)
        //     .attr("stroke", "none")
        //     .attr("fill", "red")
        //     .attr("transform", "rotate(0)")            
        //     .attr("opacity", "1.0")
        //     .attr("class", "actualStateLine")
        //     // .attr("transform", "rotate(85) translate(" + (-padding) + ", " + ((0.5 - 0.5)) + ")")
        //     .attr("height", thickness);

        // console.log(that.dataManager_.dayOfWeekModels[d.id][that.dayOfWeek]["means"][that.timelineActualIndex]);

        return "rotate(" + (angle) + ")";
      });
  }
}

MapViewerAnalyticsDayOfWeekModels.prototype.drawHistory = function(stationId, actualState) { 

  // if (stationId != 313) {
  //   return;
  // }

  var that = this;

  var historyGroupData =[]
  var index = actualState;

  if (that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]) {

    // console.log(d);

    for (i in Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"])) {
      // console.log(index);
      // console.log(Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id]["means"]));
      if (i < index) {
        historyGroupData.push(i);
      } else {
        break;
      }
    }
  }

  // console.log(historyGroupData);

  // // console.log(historyGroupData);

  // var stationId = d.id;

  var thickness = 2.0;
  var padding = that.stationSize/2;

  var historyGroup = d3.select("#historyGroup" + stationId)
    .attr("visibility", "visible");

  var historyEntry = historyGroup.selectAll(".historyEntry") 
      .data(historyGroupData);  

  historyEntry.enter()
    // .append("svg:rect")          
    // .insert("svg:rect", ".historyEntry")          
    .insert("svg:rect", "rect")          
    // .insert("svg:rect", function (d) {
    //   console.log("#historyEntry" + d);            
    //   return "#historyEntry" + d;
    // })          
    // .attr("x", -padding/2)
    .attr("x", function (d) {

      // console.log(d);

      var thisSizeRatio = that.dataManager_.stationsActualCapacity[stationId]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

      // var width = that.stationSize/4 + 3*that.stationSize/4 * (1.0 - d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length);
      var width = that.stationSize/4 + 3*that.stationSize/4 * (d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length);
      // return -width/2 * thisSizeRatio;
      return 0;
      // return +width/2 * thisSizeRatio;
    })
    .attr("y", -thickness/2)
    // .attr("width", padding)
    .attr("width", function (d) {

      var thisSizeRatio = that.dataManager_.stationsActualCapacity[stationId]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

      // var width = that.stationSize/4 + 3*that.stationSize/4 * (1.0 - d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length);
      var width = that.stationSize/4 + 3*that.stationSize/4 * (d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length);
      return width/2 * thisSizeRatio;
      // return 2;
    })
    // .attr("stroke", "none")
    .attr("stroke", function (d) {
      // var width = that.stationSize/4 + 3*that.stationSize/4 * (1.0 - d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length);
      return "hsl(0, 0%, " + (100*(1.0 - 1.0*d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length)) + "%)";
    })
    .attr("stroke-opacity", "0.51")
    // .attr("fill", "red")
    .attr("fill", function (d) {
      // return that.historyTimeColorScale(1.0);
      // return that.historyTimeColorScale(d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length);
      // return "black";
      return "hsl(" + (360 * d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length) + ",70%,70%)";
      // console.log(d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length);
      // return "hsl(" + (0) + ",0%," + (100 - (10 + 90 * d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length)) + "%)";
      // return "red";
    })
    .attr("transform", function (d) {  
      var thisAngle = 0;
      var windowSize = 2;

      var dIndex = Number(d);

      // console.log("that.timelineActualIndex: " + that.timelineActualIndex);
      // console.log("dIndex: " + dIndex);
      
      if (that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId] != undefined) {
        // console.log(that.dataManager_.dayOfWeekModels[that.dayOfWeek]);
        // var modelSize = that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"].length;
        
        // thisAngle = that.getAngle(stationId, dIndex);

        if (that.property == "slope") {

          // if (dIndex < 1 + windowSize/2) {
          //   dIndex = 1 + windowSize/2;
          //   // return "rotate(" + (0) + ")";
          // }

          // if (dIndex > index - 2 - windowSize/2) {
          // // if (dIndex > Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length - windowSize/2) {
          //   dIndex = index - 2 - windowSize/2;
          //   // return "rotate(" + (0) + ")";
          // }

          var thisDelta = (that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"][dIndex +  windowSize/2]
           - that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"][dIndex -  windowSize/2]); 

            thisAngle = that.angleScaleSlope(thisDelta);
            // console.log("dIndex +  windowSize/2: " + (dIndex +  windowSize/2));
            // console.log("windowSize/2: " + windowSize/2);
            // console.log("next: " + that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"][dIndex +  windowSize/2]);
            // console.log("previous: " + that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"][dIndex -  windowSize/2]);
            // thisAngle = that.angleScaleSlope(thisDelta);
            // console.log(thisAngle);

        } else if (that.property == "balance") {          
          thisAngle = that.angleScaleBalance(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"][dIndex]);          
        }

        // thisAngle = that.angleScale1(thisDelta*2);
        // thisAngle = that.angleScale2(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"][index]);
        // angle = 45;
      }   
      return "rotate(" + (thisAngle) + ")";
    })
    // .attr("opacity", "0.1")
    .attr("opacity", function (d) {      
      // return 0.5 * d/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][stationId]["means"]).length;
      return 1;
    })
    .attr("id", function (d) {            
      return "historyEntry" + d;
    })
    .attr("class", "historyEntry")
    // .attr("transform", "rotate(85) translate(" + (-padding) + ", " + ((0.5 - 0.5)) + ")")
    .attr("height", thickness);
    
  historyEntry.exit().remove();
}

/**
 * Sets up UX component for main map.
 * @private
 * @param <string> mapContainerId Id of element to contain main map.
 * @param <string> opt_matStyle optional style to apply to map.
 */
MapViewerAnalyticsDayOfWeekModels.prototype.initMap_ = function(mapContainerId, opt_mapStyle) {  

  // Creates map.
  var mapOptions = {
    center: new google.maps.LatLng(40.731508, -73.991246),
    zoom: 13,
    //mapTypeId: google.maps.MapTypeId.ROADMAP,
    // mapTypeId: opt_mapStyle || 
    //   MapStyles.MAP_STYLE_BRIGHT_BLUE_NAME,
    mapTypeId: MapStyles.MAP_STYLE_WHITE_LIGHTER_NAME,
    mapTypeControl: false,
    panControl: false,
    streetViewControl: false,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL,
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  };
  this.map_ = new google.maps.Map(
      document.getElementById(mapContainerId), mapOptions);

  var thisMap = this;

  google.maps.event.addListener(this.map_, 'click', function (event) {    
    thisMap.mouseClicked(event);
  });

  google.maps.event.addListener(this.map_, 'mousemove', function (event) {    
    thisMap.mouseMove(event);
  });

  // Creates styles for map
  new MapStyles(this.map_);  

  this.dataManager_.loadStationsActualState(this);  
  // this.dataManager_.getStationsActualCapacity(this);
  // this.dataManager_.getDayOfWeekModels(this.dayOfWeek,this);
};

MapViewerAnalyticsDayOfWeekModels.prototype.stationsActualStateLoaded = function() { 
  this.dataManager_.getStationsActualCapacity(this);
}

MapViewerAnalyticsDayOfWeekModels.prototype.stationsActualCapacityLoaded = function() { 
  console.log("minCapacity: " + this.dataManager_.stationsActualCapacity["minCapacity"]);   
  console.log("maxCapacity: " + this.dataManager_.stationsActualCapacity["maxCapacity"]);   
  this.dataManager_.getDayOfWeekModels(this.dayOfWeek,this);
}

MapViewerAnalyticsDayOfWeekModels.prototype.createTimeline = function() {    
  // console.log(this.dataManager_.dayOfWeekModels[dayOfWeek]);
  // console.log("dayOfWeekModelLoaded");  

  this.data = [];

  this.timeline = {};
  
  if (this.timeline.margin == null)
    this.timeline.margin = {top: 20, bottom: 30, left: 50, right: 50};
  
  
  // this.timeline.width = this.analyticsContainer.width() - this.timeline.margin.left - this.timeline.margin.right;

  this.timeline.width = 700;

  this.timeline.height = 100 - this.timeline.margin.top - this.timeline.margin.bottom;    

   
    
  this.timeline.yScale = d3.scale.linear()
    .range([this.timeline.height + this.timeline.margin.top, this.timeline.margin.top]);
    
   
  this.timeline.svg = this.analyticsContainer
    .insert("svg:svg", "svg")
    //.attr("transform", "translate(" + that.margin.left + ",0)") 
    .attr("width", this.timeline.width+this.timeline.margin.left+this.timeline.margin.right)
    .attr("height", this.timeline.height + this.timeline.margin.top + this.timeline.margin.bottom);
    

  this.timeline.title = this.timeline.svg.append("text")
    .attr("class", "timelineTitle")   
    .attr("transform", "translate(0," + this.timeline.margin.top/2 + ")") 
    // .attr("stroke", "white")
    .text("Use frequency");

  this.beginDate = new Date("2013-10-29 00:00:01"); // set one second so 3d dont show the month name in the axis
  this.endDate = new Date("2013-10-29 23:59:59");  
  
  
  // we need to get the indexes of the samples in the groupmodel, as d3 need data as an array, not an object
  this.data = $.map(this.dataManager_.dayOfWeekModels[this.dayOfWeek]["sum"]["frequencies"], function (value, key) { return key; });  
  

  this.xScale = d3.time.scale().domain([this.beginDate, this.endDate]).range([0, this.timeline.width]);

  this.beginDate = new Date("2013-10-29 00:00:00");  
    
  this.yScale = d3.scale.linear().domain([0, this.height]).range([0, this.height]);
  
  var that = this;

  this.timeline.xAxis = d3.svg.axis()
    .scale(that.xScale)
    .ticks(d3.time.hours, 3)  
    // .tickFormat("")  
    .orient("bottom");
  
  this.timeline.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + that.timeline.margin.left + "," + (that.timeline.margin.top + that.timeline.height) + ")")
    .call(that.timeline.xAxis); 

  var frequencyBars = this.timeline.svg.append("g")    
    .attr("transform", "translate(" + that.timeline.margin.left + "," + that.timeline.margin.top + ")")
    .on("mouseover", function() {      
      var coord = d3.mouse(this);      
      var index = Math.floor(coord[0] / (that.timeline.width / that.data.length));
      that.timelineActualIndex = index;
      if (that.queryStationId >= 0) {        
        // $( "#queryAngleSlider" ).val(Math.floor(-that.getAngle(that.queryStationId, index)));
        // $( "#queryAngleSlider" ).slider({ value: Math.floor(-that.getAngle(that.queryStationId, index)) });
        $( "#queryAngleSlider" ).slider({ values: [Math.floor(-that.getAngle(that.queryStationId, index)) - that.queryAngleRange/2, Math.floor(-that.getAngle(that.queryStationId, index)) + that.queryAngleRange/2] });
        $( "#queryAngle" ).val( "" + (Math.floor(-that.getAngle(that.queryStationId, index)) - that.queryAngleRange/2) + " <-> " + (Math.floor(-that.getAngle(that.queryStationId, index)) + that.queryAngleRange/2));
      }
      // console.log(that.timelineActualIndex);
      that.updateMapVisualization();
    });

  var samplingInterval = 15 * 60;

  frequencyBars.selectAll(".backgroundBar")
      .data(that.data)
      .enter()                
        .insert("line", ".backgroundBar")          
          .attr("x1", function(d,i) {
            
            var tempTime = new Date(that.beginDate.getTime() + (Number(d) + 0.5) * 1000 * samplingInterval);
            
            return that.xScale(tempTime);                    
          }) 
          .attr("x2", function(d,i) {
            
            var tempTime = new Date(that.beginDate.getTime() + (Number(d) + 0.5) * 1000 * samplingInterval);
            
            return that.xScale(tempTime);                    
          })          
          .attr("y1", that.timeline.height)
          .attr("y2", function(d,i) {
            
            // console.log(that.dataManager_.dayOfWeekModels[that.dayOfWeek]["sum"]["frequencies"][d]);
            
            // return that.timeline.height - that.timeline.height * that.dataManager_.dayOfWeekModels[that.dayOfWeek]["sum"]["frequencies"][d] / 1200;
            return 0;
          })          
          // .attr("stroke-width", function(d,i) {            
          //   return that.dataManager_.stationsModel[stationId][dayOfTheWeek]["groupModel"]["frequencyMeans"][Number(d)] * 1.0 ;                    
          // })     
          .attr("class", "backgroundBar")
          //.attr("fill", "hsl(264,100%,40%)")      //purple 1 
          //.attr("fill", "hsl(264,100%,20%)")      //purple 2 
          .attr("stroke", "hsl(264,100%,20%)");      //purple 2 
          // .attr("stroke", "hsl(284,0%,80%)");      //white 1

  frequencyBars.selectAll(".samplingBar")
      .data(that.data)
      .enter()                
        .append("line")          
          .attr("x1", function(d,i) {
            
            var tempTime = new Date(that.beginDate.getTime() + (Number(d) + 0.5) * 1000 * samplingInterval);
            
            return that.xScale(tempTime);                    
          }) 
          .attr("x2", function(d,i) {
            
            var tempTime = new Date(that.beginDate.getTime() + (Number(d) + 0.5) * 1000 * samplingInterval);
            
            return that.xScale(tempTime);                    
          })          
          .attr("y1", that.timeline.height)
          .attr("y2", function(d,i) {
            
            // console.log(that.dataManager_.dayOfWeekModels[that.dayOfWeek]["sum"]["frequencies"][d]);
            
            // return that.timeline.height - that.timeline.height * that.dataManager_.dayOfWeekModels[that.dayOfWeek]["sum"]["frequencies"][d] / 1200;
            return that.timeline.height - that.timeline.height * that.dataManager_.dayOfWeekModels[that.dayOfWeek]["sum"]["frequencies"][d] / 1200;
          })          
          // .attr("stroke-width", function(d,i) {            
          //   return that.dataManager_.stationsModel[stationId][dayOfTheWeek]["groupModel"]["frequencyMeans"][Number(d)] * 1.0 ;                    
          // })     
          .attr("class", "samplingBar")
          //.attr("fill", "hsl(264,100%,40%)")      //purple 1 
          //.attr("fill", "hsl(264,100%,20%)")      //purple 2 
          // .attr("stroke", "hsl(264,100%,20%)");      //purple 2 
          .attr("stroke", "hsl(284,0%,80%)");      //white 1
         

}

MapViewerAnalyticsDayOfWeekModels.prototype.dayOfWeekModelLoaded = function(dayOfWeek) {  
  this.dayOfWeek = dayOfWeek;
  this.createTimeline(); 
  this.updateMapVisualization();
  // console.log(this.dataManager_.dayOfWeekModels[dayOfWeek]);
  // console.log("dayOfWeekModelLoaded");
}

MapViewerAnalyticsDayOfWeekModels.prototype.mouseMove = function(event) {  
  // this.getStationFromCoords(event.latLng);
  //console.log(this.selectedStations);
}

MapViewerAnalyticsDayOfWeekModels.prototype.mouseClicked = function(event) {
  //this.getStationFromCoords(event.latLng);  
  // this.getSelectedStationsInfo();
}

/**
 * Access to google maps.
 * @param <string> mapContainerId Id of element to contain main map.
 * @return undefined.
 */
MapViewerAnalyticsDayOfWeekModels.prototype.getMap = function() {
  return this.map_;
};


/**
 * Fits map to accomodate a list of points: all of them become visible in map.
 * @param points array of LatLng positions to fit.
 */
MapViewerAnalyticsDayOfWeekModels.prototype.fitToPoints = function(points) {
  var bounds = new google.maps.LatLngBounds();
  for (var i in points) {
    bounds.extend(points[i]);
  }
  this.map_.fitBounds(bounds);
  this.update();
};
