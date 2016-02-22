/**
 * Class serving map viewer.
 *
 */ 



/**
 * @param <String> mapContainerId ID of element to contain main map.
 * @param <string> opt_mapStyle optional style to apply to map.
 */
var MapViewerFlowEstimation = function(dataManager, mapContainerId, opt_mapStyle) {
  dataManager.addListener(this);
  // Lazy initialization.
  this.initialized_ = false;

  this.dataManager_ = dataManager;
  this.mapContainerId_ = mapContainerId;
  this.opt_mapStyle_ = opt_mapStyle; 

  this.mapGLRenderer =  new MapGLRendererFlowEstimation(dataManager);

  this.stationsOverlayCreated = false;

  // These containers must be shown/hidden on activation.
  this.visibleContainersId_ = [
    '#' + this.mapContainerId_
  ];

  this.showRoles = true;

  this.dataManager_.loadStations(this);  
};


/**
 * Activates/deactivates renderer.
 */
MapViewerFlowEstimation.prototype.setActive = function(active) {
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
MapViewerFlowEstimation.prototype.isActive = function() {
  return this.active_;
};


MapViewerFlowEstimation.prototype.update = function() {
  // console.log("MapViewerFlowEstimation.prototype.update");
  if (!this.dataManager_.hasData() || !this.active_) {
    //return;
  }

  if (!this.initialized_) {
    this.initMap_(this.mapContainerId_, this.opt_mapStyle_);
    // this.mapGLRenderer.initialize(this.map_);
    this.initialized_ = true;
  }

  // TODO Load initial view options based on filters and selections.

  // console.log("MapViewerFlowEstimation.prototype.update");

  if (this.mapGLRenderer.initialized_) {
    this.mapGLRenderer.update();
  }
};


/**
 * Loads Google Maps and invoke callback when done (static function).
 * @param <function> callbackName function to call once google maps is loaded.
 * @return undefined.
 */
MapViewerFlowEstimation.loadGMaps = function(callbackName) {
  var script  = document.createElement("script");
  script.type = "text/javascript";
  script.src  = 
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyC50vDMewZXJZwaOnjO1R" +
    "k-gJf7EDYFibQ&sensor=true&callback=" + 
    callbackName;
  document.body.appendChild(script);
};

MapViewerFlowEstimation.prototype.updateCirculationVisualization = function() {  
   
  
  var that = this;

  
}

MapViewerFlowEstimation.prototype.circulationLoaded = function() {  
  // console.log("circulationLoaded");
  // console.log(this.dataManager_.stationsActualState);

  // this.updateCirculationVisualization();
}

MapViewerFlowEstimation.prototype.getCirculation = function() { 
  // console.log("getCirculation");
  // this.beginDate = new Date();
  // this.endDate = new Date();
  // this.dataManager_.getCirculation(this.beginDate, this.endDate, this);
  // this.updateCirculationVisualization(); //remove later when we actually load the circulation data
}

/**
 * Sets up UX component for main map.
 * @private
 * @param <string> mapContainerId Id of element to contain main map.
 * @param <string> opt_matStyle optional style to apply to map.
 */
MapViewerFlowEstimation.prototype.initMap_ = function(mapContainerId, opt_mapStyle) {
  // Creates map.
  var mapOptions = {
    center: new google.maps.LatLng(40.731508, -73.991246),
    zoom: 13,
    //mapTypeId: google.maps.MapTypeId.ROADMAP,
    // mapTypeId: opt_mapStyle || 
    //   MapStyles.MAP_STYLE_BRIGHT_BLUE_NAME,
    mapTypeId: MapStyles.MAP_STYLE_WHITE_LIGHTER_NO_LABELS_NAME,
    // mapTypeId: MapStyles.MAP_STYLE_WHITE_LIGHTER_SIMPLE_NAME,
    //mapTypeId: MapStyles.MAP_STYLE_PURPLE_WHITE_NAME,
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

  // this.bikeLayer = new google.maps.BicyclingLayer();
  // this.bikeLayer.setMap(this.map_);

  var thisMap = this;

  google.maps.event.addListener(this.map_, 'click', function (event) {    
    thisMap.mouseClicked(event);
  });

  google.maps.event.addListener(this.map_, 'mousemove', function (event) {    
    thisMap.mouseMove(event);
  });

  // Creates styles for map
  new MapStyles(this.map_);

  // this.mapGLRenderer.initialize(this.map_);

  // this.getCirculation();
  
};

MapViewerFlowEstimation.prototype.updateStationsLayer = function() {
  
  var that = this;

  var dayIndex = that.mapGLRenderer.day;
  
  that.stationsFrequency = [];
  that.stationsDeltas = [];
  // console.log(that.mapGLRenderer.period);
  // console.log(dayIndex);
  // console.log(this.dataManager_.circulationData);
  for (var timeIndex = that.mapGLRenderer.timeIndex1; timeIndex < that.mapGLRenderer.timeIndex2; timeIndex++) {

    // if (!(timeIndex in this.dataManager_.circulationData[dayIndex]["frequencies"])) {           
    //   continue;
    // }
    
    for (tempStationIndex in this.dataManager_.circulationData[that.mapGLRenderer.period][dayIndex]["frequencies"][timeIndex]) {

      var stationIndex = tempStationIndex;

      if (stationIndex == 321) {
        stationIndex = 313;
      }

      if (stationIndex == 331) {
        stationIndex = 324;
      }

      if (Number(stationIndex) in that.stationsFrequency) {
        that.stationsFrequency[Number(stationIndex)] += Number(this.dataManager_.circulationData[that.mapGLRenderer.period][dayIndex]["frequencies"][timeIndex][tempStationIndex]);
        that.stationsDeltas[Number(stationIndex)] += Number(this.dataManager_.circulationData[that.mapGLRenderer.period][dayIndex]["deltas"][timeIndex][tempStationIndex]);
      } else {
        that.stationsFrequency[Number(stationIndex)] = Number(this.dataManager_.circulationData[that.mapGLRenderer.period][dayIndex]["frequencies"][timeIndex][tempStationIndex]);
        that.stationsDeltas[Number(stationIndex)] = Number(this.dataManager_.circulationData[that.mapGLRenderer.period][dayIndex]["deltas"][timeIndex][tempStationIndex]);
      }
      
    }
  } 
  
  // console.log(that.stationsDeltas);

  // d3.selectAll(".flowEstimationStationRepresentation")    
  //   .attr("fill", function(d,i) {        
  //       if (that.stationsDeltas[d.id] == undefined || that.stationsDeltas[d.id] == 0) {
  //         return "hsl(" + (0.1 * 360) + ", 0%, 50%)";
  //       } else if (that.stationsDeltas[d.id] > 0) {
  //         return "hsl(" + (0) + ", 100%, 50%)";
  //       } else if (that.stationsDeltas[d.id] < 0) {
  //         return "hsl(" + (240) + ", 100%, 50%)";
  //       }
        
  //     }
  //   )
  //   .attr("opacity", function(d,i) {      
  //     return (that.showRoles) ? 1.0 : 0.2;}
  //   );  

  var padding = 10;


  // console.log(that.stationsDeltas);
  // console.log(that.stationsFrequency);
  // console.log(this.dataManager_.circulationData[that.mapGLRenderer.period][dayIndex]);
  
  var numDays = 1;

  if (this.dataManager_.circulationData[that.mapGLRenderer.period][dayIndex]['numDays'] != undefined) {
    numDays = this.dataManager_.circulationData[that.mapGLRenderer.period][dayIndex]['numDays'];
  }

  var stationSvgs = d3.selectAll(".flowEstimationStationSvg").each(function (p) {
    // console.log(p.datum);
    if (that.stationsDeltas[p.id] == undefined || that.stationsDeltas[p.id] == 0) {
      // console.log(this);
      d3.select(this).selectAll(".flowEstimationStationRepresentation").remove();
      d3.select(this).append("svg:circle")
          .attr("class", "flowEstimationStationRepresentation")          
          .attr("id", function(d) {
            // console.log(d);
            return "flowEstimationStationRepresentation" + d.id;
          })          
          .attr("r", function(d) {
            
            return 3;
          })
          .attr("opacity", function(d,i) {      
            return (that.showRoles) ? 1.0 : 0.0;}
          )
          .attr("fill", "hsl(" + (0.1 * 360) + ", 0%, 70%)")
          .attr("stroke",  "white")
          .attr("stroke-width",  "1.5px")
          .attr("cx", padding)
          .attr("cy", padding)
          .on("mouseenter", function(d){
            
          })
          .on("mouseover", function(d){
            d3.select("#flowEstimationInfoCursorId").text("Id: " + d.id);
            d3.select("#flowEstimationInfoCursorNumber").text("Number: " + d.number);
            d3.select("#flowEstimationInfoCursorName").text("Name: " + d.name);            
          })
          .on("mouseout", function(d){
            d3.select("#flowEstimationInfoCursorId").text("Id:");
            d3.select("#flowEstimationInfoCursorNumber").text("Number:");
            d3.select("#flowEstimationInfoCursorName").text("Name:");            
          }); 
      if (that.stationsFrequency[p.id] != undefined) {
        d3.select(this).selectAll(".flowEstimationStationRepresentation").attr("transform", "translate(" + 10 + "," + 10 + ") scale(" + (0.5 + 1.5 * that.stationsFrequency[p.id]/d3.max(that.stationsFrequency)) + ")");
      }
    } else if (that.stationsDeltas[p.id] < 0) {
      d3.select(this).selectAll(".flowEstimationStationRepresentation").remove();
      d3.select(this).append("path")
          .attr("class", "flowEstimationStationRepresentation")          
          .attr("id", function(d) {
            return "flowEstimationStationRepresentation" + d.id;
          })                    
          .attr("opacity", function(d,i) {      
            return (that.showRoles) ? 1.0 : 0.0;}
          )
          // .attr("fill", "hsl(" + (0.0 * 360) + ", 100%, 50%)")
          .attr("fill", "hsl(" + (0.0 * 360) + ", 100%, 50%)")
          .attr("stroke",  "white")
          .attr("stroke-width",  "0.5px")
          .attr("d", d3.svg.symbol().type("triangle-up"))
          .attr("transform", function(d) { return "translate(" + 10 + "," + 10 + ")"; })
          // .on("mouseenter", function(d){
            
          // })
          .on("mouseover", function(d){
            d3.select("#flowEstimationInfoCursorId").text("Id: " + d.id);
            d3.select("#flowEstimationInfoCursorNumber").text("Number: " + d.number);
            d3.select("#flowEstimationInfoCursorName").text("Name: " + d.name);            
          })
          .on("mouseout", function(d){
            d3.select("#flowEstimationInfoCursorId").text("Id:");
            d3.select("#flowEstimationInfoCursorNumber").text("Number:");
            d3.select("#flowEstimationInfoCursorName").text("Name:");            
          });   
      // d3.select(this).selectAll(".flowEstimationStationRepresentation").attr("transform", "translate(" + 10 + "," + 10 + ") scale(" + (0.5 + 1.5 * that.stationsFrequency[p.id]/d3.max(that.stationsFrequency)) + ")");
      d3.select(this).selectAll(".flowEstimationStationRepresentation").attr("transform", "translate(" + 10 + "," + 10 + ") scale(" + (0.5 + 1.5 * that.stationsFrequency[p.id]/numDays/(that.mapGLRenderer.timeIndex2 - that.mapGLRenderer.timeIndex1)/50.0) + ")");
      // d3.select(this).selectAll(".flowEstimationStationRepresentation").attr("transform", "translate(" + 10 + "," + 10 + ") scale(" + (0.5 + 1.5 * that.stationsFrequency[p.id]/that.mapGLRenderer.timelineMaxFlow) + ")");
      // p.attr("fill", "hsl(" + (0.0 * 360) + ", 100%, 50%)");
    } else if (that.stationsDeltas[p.id] > 0) {
      d3.select(this).selectAll(".flowEstimationStationRepresentation").remove();
      d3.select(this).append("path")
          .attr("class", "flowEstimationStationRepresentation")          
          .attr("id", function(d) {
            return "flowEstimationStationRepresentation" + d.id;
          })                    
          .attr("opacity", function(d,i) {      
            return (that.showRoles) ? 1.0 : 0.0;}
          )
          .attr("fill", "hsl(" + (240) + ", 100%, 50%)")
          .attr("stroke",  "white")
          .attr("stroke-width",  "0.5px")
          .attr("d", d3.svg.symbol().type("triangle-down"))
          .attr("transform", function(d) { return "translate(" + 10 + "," + 10 + ")"; })
          // .on("mouseenter", function(d){
            
          // })
          .on("mouseover", function(d){
            d3.select("#flowEstimationInfoCursorId").text("Id: " + d.id);
            d3.select("#flowEstimationInfoCursorNumber").text("Number: " + d.number);
            d3.select("#flowEstimationInfoCursorName").text("Name: " + d.name);            
          })
          .on("mouseout", function(d){
            d3.select("#flowEstimationInfoCursorId").text("Id:");
            d3.select("#flowEstimationInfoCursorNumber").text("Number:");
            d3.select("#flowEstimationInfoCursorName").text("Name:");            
          }); 
      // p.attr("fill", "hsl(" + (240) + ", 100%, 50%)");
      d3.select(this).selectAll(".flowEstimationStationRepresentation").attr("transform", "translate(" + 10 + "," + 10 + ") scale(" + (0.5 + 1.5 * that.stationsFrequency[p.id]/numDays/(that.mapGLRenderer.timeIndex2 - that.mapGLRenderer.timeIndex1)/50.0) + ")");
      // d3.select(this).selectAll(".flowEstimationStationRepresentation").attr("transform", "translate(" + 10 + "," + 10 + ") scale(" + (0.5 + 1.5 * that.stationsFrequency[p.id]/d3.max(that.stationsFrequency)) + ")");
      // d3.select(this).selectAll(".flowEstimationStationRepresentation").attr("transform", "translate(" + 10 + "," + 10 + ") scale(" + (0.5 + 1.5 * that.stationsFrequency[p.id]/that.mapGLRenderer.timelineMaxFlow) + ")");
    }
    
    // d3.select(this).attr("transform", "scale(" + (1.0 + 1.0 * that.stationsFrequency[p.id]/d3.max(that.stationsFrequency)) + ") translate(" + 10 + "," + 10 + ")");
  });  
}

MapViewerFlowEstimation.prototype.createStationsLayer = function(stationsInfo) { 

  var overlay = new google.maps.OverlayView();

  var that = this;

  // console.log("MapViewerFlowEstimation.prototype.createStationsLayer");

  //var data = dataManager.stations;

  //console.log(data);

  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {

    var data = stationsInfo; 

    // console.log(data);

    var layer = d3.select(this.getPanes().overlayLayer).append("div")
      // .attr("position", "absolute")
      // .attr("position", "absolute")
      // .attr("width", "60px")
      // .attr("height", "20px")
      // .attr("padding-right", "100px")
      // .attr("font", "10px sans-serif")
      .attr("class", "stations");      

    // Draw each marker as a separate SVG element.
    // We could use a single SVG, but what size would it have?
    overlay.draw = function() {
      var projection = this.getProjection(),
          padding = 10;
 
      var marker = layer.selectAll("svg")
          .data(data)
          .each(transform) // update existing markers
        .enter().append("svg:svg")          
          .each(transform)
          .style("position", "absolute")
          .style("width", "20px")
          .style("height", "20px")
          // .style("padding-right", "100px")
          // .style("font", "10px sans-serif")          
          .attr("class", "flowEstimationStationSvg");
 
      // Add a circle.
      var circle = marker.append("svg:circle")
          .attr("class", "flowEstimationStationRepresentation")          
          .attr("id", function(d) {
            return "flowEstimationStationRepresentation" + d.id;
          })          
          .attr("r", function(d) {
            
            return 3;
          })
          .attr("opacity", function(d,i) {
            
            return 1;
          })
          .attr("fill", "hsl(" + (0.1 * 360) + ", 0%, 70%)")
          .attr("stroke",  "white")
          .attr("stroke-width",  "1.5px")
          .attr("cx", padding)
          .attr("cy", padding)
          .on("mouseenter", function(d){
            
          })
          .on("mouseover", function(d){
            d3.select("#flowEstimationInfoCursorId").text("Id: " + d.id);
            d3.select("#flowEstimationInfoCursorNumber").text("Number: " + d.number);
            d3.select("#flowEstimationInfoCursorName").text("Name: " + d.name);            
          })
          .on("mouseout", function(d){
            d3.select("#flowEstimationInfoCursorId").text("Id:");
            d3.select("#flowEstimationInfoCursorNumber").text("Number:");
            d3.select("#flowEstimationInfoCursorName").text("Name:");            
          });   

      // circle
      //   .append("svg:title")
      //     .text(function(d, i) { return d.name; });       

      // var stations = marker.append("path")
      //     .attr("class", "flowEstimationStationRepresentation")          
      //     .attr("id", function(d) {
      //       return "flowEstimationStationRepresentation" + d.id;
      //     })          
      //     // .attr("r", function(d) {
            
      //     //   return 5;
      //     // })
      //     .attr("opacity", function(d,i) {
            
      //       return 1;
      //     })
      //     .attr("fill", "hsl(" + (0.1 * 360) + ", 100%, 50%)")
      //     .attr("stroke",  "white")
      //     .attr("stroke-width",  "1.5px")
      //     .attr("d", d3.svg.symbol().type("triangle-up"))
      //     .attr("transform", function(d) { return "translate(" + 10 + "," + 10 + ")"; })
      //     .on("mouseenter", function(d){
            
      //     })
      //     .on("mouseover", function(d){
      //       d3.select("#flowEstimationInfoCursorId").text("Id: " + d.id);
      //       d3.select("#flowEstimationInfoCursorNumber").text("Number: " + d.number);
      //       d3.select("#flowEstimationInfoCursorName").text("Name: " + d.name);            
      //     })
      //     .on("mouseout", function(d){
      //       d3.select("#flowEstimationInfoCursorId").text("Id:");
      //       d3.select("#flowEstimationInfoCursorNumber").text("Number:");
      //       d3.select("#flowEstimationInfoCursorName").text("Name:");            
      //     });   

      // stations
      //   .append("svg:title")
      //     .text(function(d, i) { return d.name; });       
 
      // Add a label.
      // marker.append("svg:text")
      //     .attr("id", function(d) {
      //       return "dayOfWeekModelsStationRepresentationText" + d.id;
      //     })
      //     .attr("x", padding + 7)
      //     .attr("y", padding)
      //     .attr("dy", ".31em")          
      //     .attr("fill-opacity", "0.0")
      //     .text(function(d) { return d.name; });
 
      function transform(d) {
        d = new google.maps.LatLng(d.latitude, d.longitude);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
      }
    };
    
  }

  // console.log(this);

  overlay.setMap(this.map_);

  // this.mapGLRenderer.initialize(this.map_);  
}

MapViewerFlowEstimation.prototype.stationsLoaded = function() { 
  // this.mapGLRenderer.createStationRepresentations_();
  // console.log("MapViewerFlowEstimation.prototype.stationsLoaded");
  // this.update();
 // this.createStationsLayer(this.dataManager_.stations);    
  this.dataManager_.loadStreetsGraph(this);
  // this.mapGLRenderer.initialize(this.map_);
}

MapViewerFlowEstimation.prototype.streetsGraphLoaded = function() { 
  
  // console.log("MapViewerFlowEstimation.prototype.streetsGraphLoaded");
  // while (!this.mapGLRenderer.initialized_) {  
    this.mapGLRenderer.initialize(this.map_);
  // }
  this.createStationsLayer(this.dataManager_.stations);    
  
}

MapViewerFlowEstimation.prototype.mouseMove = function(event) {  
  // this.getStationFromCoords(event.latLng);
  //console.log(this.selectedStations);
}

MapViewerFlowEstimation.prototype.mouseClicked = function(event) {
  //this.getStationFromCoords(event.latLng);
  // this.getSelectedStationsActivity();
}

// MapViewerFlowEstimation.prototype.getStationFromCoords = function(coords) {  
  
  
// }

// MapViewerFlowEstimation.prototype.getSelectedStationsActivity = function() {
  
  
// }


/**
 * Access to google maps.
 * @param <string> mapContainerId Id of element to contain main map.
 * @return undefined.
 */
MapViewerFlowEstimation.prototype.getMap = function() {
  return this.map_;
};


/**
 * Fits map to accomodate a list of points: all of them become visible in map.
 * @param points array of LatLng positions to fit.
 */
MapViewerFlowEstimation.prototype.fitToPoints = function(points) {
  var bounds = new google.maps.LatLngBounds();
  for (var i in points) {
    bounds.extend(points[i]);
  }
  this.map_.fitBounds(bounds);
  this.update();
};
