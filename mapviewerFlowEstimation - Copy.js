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
  if (!this.dataManager_.hasData() || !this.active_) {
    //return;
  }

  if (!this.initialized_) {
    this.initMap_(this.mapContainerId_, this.opt_mapStyle_);
    this.mapGLRenderer.initialize(this.map_);
    this.initialized_ = true;
  }

  // TODO Load initial view options based on filters and selections.

  //console.log("MapViewerFlowEstimation.prototype.update");

  this.mapGLRenderer.update();
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

  if (!this.stationsOverlayCreated) {
    this.stationsOverlay = new google.maps.OverlayView();  

    // Add the container when the overlay is added to the map.
    this.stationsOverlay.onAdd = function() {

      // console.log("overlay.onAdd");      

      var data = dataManager.stations;    
      
      // console.log(data);
      // console.log(that.dataManager_.circulation);      



      that.stationsLayer = d3.select(this.getPanes().overlayLayer).append("div")        
        .attr("class", "stations");           

      // Draw each marker as a separate SVG element.
      // We could use a single SVG, but what size would it have?
      that.stationsOverlay.draw = function() {
        var projection = this.getProjection(),
            padding = 15;

            that.projection = projection;

        that.stationsLayer.selectAll(".flowEstimationStationsLayerSvg")
          .remove();

        that.stationsLayer.selectAll(".flowEstimationStation")
          .remove();
   
        // var marker = that.stationsLayer.selectAll("svg")
        //     .data(data)
        //     .each(transform) // update existing markers
        //   .enter().append("svg:svg") 
        //     .style("position", "absolute")
        //     .style("width", "30px")
        //     .style("height", "30px")
        //     .style("padding-right", "100px")
        //     .style("font", "10px sans-serif")         
        //     .each(transform)         
        //     .on("click", function (d) {
        //       console.log("click");
        //     })                
        //     .attr("class", "flowEstimationStation"); 

        var propertiesNames = Object.getOwnPropertyNames(that.map_.getBounds());  
  
        var bounds1 = new google.maps.LatLng(that.map_.getBounds()[propertiesNames[0]].b, that.map_.getBounds()[propertiesNames[1]].b, false);
        var bounds2 = new google.maps.LatLng(that.map_.getBounds()[propertiesNames[0]].d, that.map_.getBounds()[propertiesNames[1]].d, false);  


        console.log(bounds1);
        console.log(bounds2);

        var topLeft = {latitude: bounds1.d, longitude: bounds1.e};
        var bottomRight = {latitude: bounds2.d, longitude: bounds2.e};

        var pos = {tL: topLeft, bR: bottomRight};

        console.log(pos);


        that.stationsLayerSvg = that.stationsLayer.append("svg")
          .datum(pos)
          .each(transform2)
          .style("position", "absolute")
          // .style("width", "100%")
          // .style("height", "100%")
          // // .style("padding-right", "100px")  
          // .style("left", "0px")
          // .style("top", "0px") 
          // .style("width", "1000px")
          // .style("height", "1000px") 
          .style("border", "1px solid #00f")        
          .attr("class", "flowEstimationStationsLayerSvg");


        // Per-type markers, as they don't inherit styles.
        // that.stationsLayerSvg.append("svg:defs").selectAll("marker")
        //     .data(["type1"])
        //   .enter().append("svg:marker")  
        //     .attr("id", String)          
        //     .attr("viewBox", "0 -5 10 10")
        //     .attr("refX", 10)
        //     .attr("refY", 0)
        //     .attr("markerWidth", 4)
        //     .attr("markerHeight", 4)
        //     .attr("orient", "auto")
        //     .attr("fill", "black")
        //   .append("svg:path")
        //     .attr("d", "M0,-5L10,0L0,5");

        function transform2(d) {
          d1 = new google.maps.LatLng(d.tL.latitude, d.tL.longitude);
          d1 = projection.fromLatLngToDivPixel(d1);
          d2 = new google.maps.LatLng(d.bR.latitude, d.bR.longitude);
          d2 = projection.fromLatLngToDivPixel(d2);
          console.log((d2.x - d1.x));
          console.log((d2.y - d1.y));
          return d3.select(this)
              .style("width", (d2.x - d1.x) + "px")
              .style("height", (d2.y - d1.y) + "px");
              // .style("left", (d1.x) + "px")
              // .style("top", (d1.y) + "px");
        }

        function addAllEdgesFromThisNode(node) {

          d = node;

          if (!that.dataManager_.circulation.data[d.id]) {
            return;
          }

          for (arrayIndex in Object.keys(that.dataManager_.circulation.data[d.id])) {
            var index = Object.keys(that.dataManager_.circulation.data[d.id])[arrayIndex];                

            if (that.dataManager_.circulation.data[d.id][index] == 0) {
              continue;
            }

            var edge = {source: d.id, target: index, flow: that.dataManager_.circulation.data[d.id][index]};           
              
            var lineData = []
            lineData[0] = that.dataManager_.stations[that.dataManager_.stationsIndexedById[d.id]];
            lineData[1] = that.dataManager_.stations[that.dataManager_.stationsIndexedById[edge.target]];

            if (lineData[0] == undefined || lineData[1] == undefined) {
              continue;
            }  
            
            // // create a line function that can convert data[] into x and y points
            var line = d3.svg.line()
              .interpolate("cardinal")
              // assign the X function to plot our line as we wish
              .x(function(thisD,i) { 
                // console.log(thisD);
                var latLong = new google.maps.LatLng(thisD.latitude, thisD.longitude);
                var pixel = that.projection.fromLatLngToDivPixel(latLong);
                // console.log(pixel);
                return pixel.x;
              })                      
              .y(function(thisD,i) { 
                var latLong = new google.maps.LatLng(thisD.latitude, thisD.longitude);
                var pixel = that.projection.fromLatLngToDivPixel(latLong);
                // console.log(pixel);
                return pixel.y;
              });                  
           

            var path = that.stationsLayerSvg                     
              .insert("svg:path", ".flowEstimationStationRepresentation")  
                .attr("d", line(lineData))  
                .attr("sourceId", node.id)                    
                .attr("targetId", edge.target)                    
                .attr("stroke", 'black')
                .attr("stroke-width", 1)
                // .attr("stroke-opacity", 1.0)
                // .attr("stroke-opacity", 1.0 - (edge.distance/150.0))
                .attr("marker-end", "url(#type1)")
                .attr("stroke-linecap", "round")
                //.attr("stroke-dasharray", "9, 5")
                .attr("fill", 'none')
                .attr("class", "flowEstimationEdge");  
          }         
          
        }

        function highlightThisNodeEdges(node) {
          that.stationsLayerSvg.selectAll(".flowEstimationEdge")
          .each(function(d) {
            if (d3.select(this).attr("sourceId") == node.id) {
              d3.select(this).attr("stroke", "red");
            } else {
              d3.select(this).attr("stroke", "black");
            }
          });
        }

        // Add a circle.
        // marker.append("svg:circle")
        var circle = that.stationsLayerSvg.selectAll(".flowEstimationStationRepresentation")
            .data(data)            
          .enter().append("svg:circle")
            .each(transformCircle) // update existing markers
            .each(addAllEdgesFromThisNode)
            .attr("class", "flowEstimationStationRepresentation")
            .attr("stationId", function(d) { return d.id; })            
            .attr("r", function(d) { return 2 + 1.5 * Math.sqrt((20)/3.14); })
            .on("click", highlightThisNodeEdges)
            // .on("click", function (d) {
            //   console.log("click");

            //   that.stationsLayerSvg.selectAll(".link")
            //     .remove(); 

            //   that.stationsLayerSvg.selectAll(".flowEstimationEdge")                
            //     .remove(); 
              
              

            //   // for (index in that.dataManager_.circulation.data.edges) {
            //     // var edge = that.dataManager_.circulation.data.edges[index];
            //   for (arrayIndex in Object.keys(that.dataManager_.circulation.data[d.id])) {

            //     var index = Object.keys(that.dataManager_.circulation.data[d.id])[arrayIndex];                

            //     if (that.dataManager_.circulation.data[d.id][index] == 0) {
            //       continue;
            //     }

            //     var edge = {source: d.id, target: index, flow: that.dataManager_.circulation.data[d.id][index]};
                
            //     if (edge.source == d.id) {                  
                  
            //       var lineData = []
            //       lineData[0] = that.dataManager_.stations[that.dataManager_.stationsIndexedById[d.id]];
            //       lineData[1] = that.dataManager_.stations[that.dataManager_.stationsIndexedById[edge.target]];

            //       if (lineData[0] == undefined || lineData[1] == undefined) {
            //         continue;
            //       }  

                  
            //       // // create a line function that can convert data[] into x and y points
            //       var line = d3.svg.line()
            //         .interpolate("cardinal")
            //         // assign the X function to plot our line as we wish
            //         .x(function(thisD,i) { 
            //           // console.log(thisD);
            //           var latLong = new google.maps.LatLng(thisD.latitude, thisD.longitude);
            //           var pixel = that.projection.fromLatLngToDivPixel(latLong);
            //           // console.log(pixel);
            //           return pixel.x;
            //         })                      
            //         .y(function(thisD,i) { 
            //           var latLong = new google.maps.LatLng(thisD.latitude, thisD.longitude);
            //           var pixel = that.projection.fromLatLngToDivPixel(latLong);
            //           // console.log(pixel);
            //           return pixel.y;
            //         });                  
                 

            //       var path = that.stationsLayerSvg                     
            //         .insert("svg:path", ".flowEstimationStationRepresentation")  
            //           .attr("d", line(lineData))                      
            //           .attr("stroke", 'black')
            //           .attr("stroke-width", 1)
            //           // .attr("stroke-opacity", 1.0)
            //           .attr("stroke-opacity", 1.0 - (edge.distance/150.0))
            //           .attr("marker-end", "url(#type1)")
            //           .attr("stroke-linecap", "round")
            //           //.attr("stroke-dasharray", "9, 5")
            //           .attr("fill", 'none')
            //           .attr("class", "flowEstimationEdge");  


            //       // var lineData = []
            //       // lineData[0] = that.dataManager_.stations[that.dataManager_.stationsIndexedById[d.id]];
            //       // lineData[1] = that.dataManager_.stations[that.dataManager_.stationsIndexedById[edge.target]];

            //       // if (lineData[0] == undefined || lineData[1] == undefined) {
            //       //   continue;
            //       // }  

            //       // lineData = [];

            //       // var sourceIndex = d.id * 332;
            //       // var pathIndex = sourceIndex + (edge.target);

            //       // // console.log(d.id);
            //       // // console.log(that.dataManager_.stationsPathMatrix[pathIndex].source);
            //       // // console.log(edge.target);
            //       // // console.log(that.dataManager_.stationsPathMatrix[pathIndex].target);

            //       // if (that.dataManager_.stationsPathMatrix[pathIndex].source == d.id &&
            //       //   that.dataManager_.stationsPathMatrix[pathIndex].target == edge.target) {

            //       //   // console.log("found");

            //       //   for (nodeIndex in that.dataManager_.stationsPathMatrix[pathIndex].path) {
            //       //     // console.log("appending edge");

            //       //     lineData.push(that.dataManager_.streetsGraph.graphNodes[that.dataManager_.stationsPathMatrix[pathIndex].path[nodeIndex]]);
            //       //   }

            //       // }

            //       // // console.log(lineData);
                  
                  

                  
            //       // // create a line function that can convert data[] into x and y points
            //       // var line = d3.svg.line()
            //       //   .interpolate("cardinal")
            //       //   // assign the X function to plot our line as we wish
            //       //   .x(function(thisD,i) { 
            //       //     // console.log(thisD);
            //       //     var latLong = new google.maps.LatLng(thisD.latitude, thisD.longitude);
            //       //     var pixel = that.projection.fromLatLngToDivPixel(latLong);
            //       //     // console.log(pixel);
            //       //     return pixel.x;
            //       //   })                      
            //       //   .y(function(thisD,i) { 
            //       //     var latLong = new google.maps.LatLng(thisD.latitude, thisD.longitude);
            //       //     var pixel = that.projection.fromLatLngToDivPixel(latLong);
            //       //     // console.log(pixel);
            //       //     return pixel.y;
            //       //   });                  
                 

            //       // var path = that.stationsLayerSvg                     
            //       //   .insert("svg:path", ".flowEstimationStationRepresentation")  
            //       //     .attr("d", line(lineData))                      
            //       //     .attr("stroke", 'black')
            //       //     .attr("stroke-width", 2)
            //       //     // .attr("stroke-opacity", 1.0)
            //       //     .attr("stroke-opacity", 1.3 - (edge.distance/150.0))
            //       //     .attr("marker-end", "url(#type1)")
            //       //     .attr("stroke-linecap", "round")
            //       //     //.attr("stroke-dasharray", "9, 5")
            //       //     .attr("fill", 'none')
            //       //     .attr("class", "flowEstimationEdge");
                                   

            //     }                  
            //   }

            //   // var clusterfck = require("clusterfck");

            //   // function stationsDistance(station1, station2) {
            //   //   return Math.sqrt(Math.pow(station1.latitude - station2.latitude,2) + Math.pow(station1.longitude - station2.longitude,2));                                 
            //   // }                           

            //   // var clusters = clusterfck.hcluster(stationsArray, stationsDistance,
            //   //   clusterfck.AVERAGE_LINKAGE);

            //   // console.log(clusters);          
                              
            // })                       
            .attr("fill", function(d) {
              
              // console.log(Number(d.id));
              // console.log(that.dataManager_.circulation.data);

              if (d.id in  Object.keys(that.dataManager_.circulation.data)) {                

                return "purple";
                
              } else {
                return "none";
              }

              // if (d.id in  Object.keys(that.dataManager_.circulation.data.nodes)) {                

              //   if (that.dataManager_.circulation.data.nodes[d.id]['demand'] > 0) {
              //     return "blue";
              //   } else if (that.dataManager_.circulation.data.nodes[d.id]['demand'] < 0) {
              //     return "red";
              //   } else {
              //     return "gray";  
              //   }
                
              // } else {
              //   return "none";
              // }
              
            })
            .attr("stroke",  "none")
            .attr("stroke-width",  "1.5px");
            // .attr("cx", padding)
            // .attr("cy", padding);              
        
   
        // Add a label.
        // marker.append("svg:text")
        that.stationsLayerSvg.selectAll(".flowEstimationStationDemandLabel")
          .data(data)            
          .enter().append("svg:text")
            .each(transformLabel)            
            .attr("fill", "white")
            .attr("class", "flowEstimationStationDemandLabel")
            .attr("dy", ".31em")
            .style("pointer-events", "none")            
            .text(function(d) {
              // return that.dataManager_.circulation.data.nodes[d.id]['demand'];
              return "";
            });
   
        function transformCircle(d) {
          d = new google.maps.LatLng(d.latitude, d.longitude);
          d = projection.fromLatLngToDivPixel(d);
          // console.log(d);
          return d3.select(this)
              .attr("cx", (d.x) + "px")
              .attr("cy", (d.y) + "px");
        }

        function transformLabel(d) {
          d = new google.maps.LatLng(d.latitude, d.longitude);
          d = projection.fromLatLngToDivPixel(d);
          // console.log(d);
          return d3.select(this)
              .attr("x", (d.x) - 5)
              .attr("y", (d.y));
        }

        // function transform(d) {
        //   d = new google.maps.LatLng(d.latitude, d.longitude);
        //   d = projection.fromLatLngToDivPixel(d);
        //   return d3.select(this)
        //       .style("left", (d.x - padding) + "px")
        //       .style("top", (d.y - padding) + "px");
        // }
      };    
    }  
    this.stationsOverlay.setMap(this.map_);

    this.stationsOverlayCreated = true;
  } else {

    console.log("Circulation updated at " + new Date());
    
  }
}

MapViewerFlowEstimation.prototype.circulationLoaded = function() {  
  console.log("circulationLoaded");
  // console.log(this.dataManager_.stationsActualState);

  this.updateCirculationVisualization();
}

MapViewerFlowEstimation.prototype.getCirculation = function() { 
  console.log("getCirculation");
  this.beginDate = new Date();
  this.endDate = new Date();
  this.dataManager_.getCirculation(this.beginDate, this.endDate, this);
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
    mapTypeId: MapStyles.MAP_STYLE_WHITE_PURPLE_NAME,
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

  var thisMap = this;

  google.maps.event.addListener(this.map_, 'click', function (event) {    
    thisMap.mouseClicked(event);
  });

  google.maps.event.addListener(this.map_, 'mousemove', function (event) {    
    thisMap.mouseMove(event);
  });

  // Creates styles for map
  new MapStyles(this.map_);

  this.getCirculation();
};

MapViewerFlowEstimation.prototype.mouseMove = function(event) {  
  this.getStationFromCoords(event.latLng);
  //console.log(this.selectedStations);
}

MapViewerFlowEstimation.prototype.mouseClicked = function(event) {
  //this.getStationFromCoords(event.latLng);
  this.getSelectedStationsActivity();
}

MapViewerFlowEstimation.prototype.getStationFromCoords = function(coords) {  
  
  
}

MapViewerFlowEstimation.prototype.getSelectedStationsActivity = function() {
  
  
}


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
