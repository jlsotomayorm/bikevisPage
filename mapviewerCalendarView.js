/**
 * Class serving map viewer.
 *
 */ 



/**
 * @param <String> mapContainerId ID of element to contain main map.
 * @param <string> opt_mapStyle optional style to apply to map.
 */
var MapViewerAnalyticsCalendarView = function(dataManager, mapContainerId, opt_mapStyle) {
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
  
};


/**
 * Activates/deactivates renderer.
 */
MapViewerAnalyticsCalendarView.prototype.setActive = function(active) {
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
MapViewerAnalyticsCalendarView.prototype.isActive = function() {
  return this.active_;
};


MapViewerAnalyticsCalendarView.prototype.update = function() {
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
MapViewerAnalyticsCalendarView.loadGMaps = function(callbackName) {
  var script  = document.createElement("script");
  script.type = "text/javascript";
  script.src  = 
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyC50vDMewZXJZwaOnjO1R" +
    "k-gJf7EDYFibQ&sensor=true&callback=" + 
    callbackName;
  document.body.appendChild(script);
};

/**
 * Sets up UX component for main map.
 * @private
 * @param <string> mapContainerId Id of element to contain main map.
 * @param <string> opt_matStyle optional style to apply to map.
 */
MapViewerAnalyticsCalendarView.prototype.initMap_ = function(mapContainerId, opt_mapStyle) {  

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

  // this.distanceWidget = new DistanceWidget(this.map_, this);
  // this.distanceWidget.set('position', new google.maps.LatLng(40.68869765262219, -74.01943203772277));
  
};

MapViewerAnalyticsCalendarView.prototype.selectionAreaCenterChanged = function(lat, lng) {
  // console.log("selectionAreaCenterChanged: " + lat + "  " + lng);

  var that = this;

  if (that.matrixViewer == undefined) {
    return;
  }
  // console.log(that.matrixViewer.actualOrderingList.orderedStations);

  this.stationsInAreaList = [];

  for (stationIndex in that.matrixViewer.actualOrderingList.orderedStations) {
    if (this.distanceWidget.contains(that.matrixViewer.actualOrderingList.orderedStations[stationIndex]['latitude'], that.matrixViewer.actualOrderingList.orderedStations[stationIndex]['longitude']) > 0) {
      
      this.stationsInAreaList.push(stationIndex);
    }
  }

  
  that.matrixViewer.updateStationsInAreaList();
};

MapViewerAnalyticsCalendarView.prototype.selectionAreaSizeChanged = function(radius) {
  var that = this;

  if (that.matrixViewer == undefined) {
    return;
  }
  // console.log(that.matrixViewer.actualOrderingList.orderedStations);

  this.stationsInAreaList = [];

  for (stationIndex in that.matrixViewer.actualOrderingList.orderedStations) {
    if (this.distanceWidget.contains(that.matrixViewer.actualOrderingList.orderedStations[stationIndex]['latitude'], that.matrixViewer.actualOrderingList.orderedStations[stationIndex]['longitude']) > 0) {
      
      this.stationsInAreaList.push(stationIndex);
    }
  }

  
  that.matrixViewer.updateStationsInAreaList();
};

MapViewerAnalyticsCalendarView.prototype.updateStationsLayer = function(stationsInfo) {

  // return;

  var data = stationsInfo;

  var that = this;
  

  d3.selectAll(".calendarViewStationRepresentationShadow")    
    .attr("opacity", function(d,i) {
      // if (that.dataManager_.streetsGraph.stationWithNodes[i].closestNodeDistance >= 0.000312630) {
      //   return 0;
      // }
      return (d.selected) ? 1.0 : 0.0;}
    ); 

  d3.selectAll(".calendarViewStationRepresentation")
    .attr("fill", "hsl(" + (0.1 * 360) + ", 0%, 50%)")
    .attr("opacity", function(d,i) {
      // if (that.dataManager_.streetsGraph.stationWithNodes[i].closestNodeDistance >= 0.000312630) {
      //   return 0;
      // }
      return (d.selected) ? 1.0 : 0.2;}
    );  
};

MapViewerAnalyticsCalendarView.prototype.createStationsLayer = function(stationsInfo) { 

  var that = this;

  that.distanceWidget = new DistanceWidget(that.map_, that);
  that.distanceWidget.set('position', new google.maps.LatLng(40.68869765262219, -74.01943203772277));      

  var overlay = new google.maps.OverlayView();  
  
  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {

    // console.log("onAdd");

    var data = stationsInfo;        

    var layer = d3.select(this.getPanes().overlayImage).append("div").attr("class", "stations");         

    // Draw each marker as a separate SVG element.
    // We could use a single SVG, but what size would it have?
    overlay.draw = function() {

      // return;
      
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
          .attr("class", "stationSvg");

      // Add shadow 
      var shadow = marker.append("svg:circle")
          .attr("class", "calendarViewStationRepresentationShadow")          
          .attr("id", function(d) {
            return "calendarViewStationRepresentationShadow" + d.id;
          })          
          .attr("r", function(d) {
            return 4 + 7 * Math.sqrt((d.capacity - that.matrixViewer.minCapacity) / (that.matrixViewer.maxCapacity - that.matrixViewer.minCapacity)/3.1416);
          })
          .attr("fill", "hsl(" + (0.1 * 360) + ", 0%, 0%)")          
          .attr("cx", function(d) {
            return padding + (4 + 7 * Math.sqrt((d.capacity - that.matrixViewer.minCapacity) / (that.matrixViewer.maxCapacity - that.matrixViewer.minCapacity)/3.1416))/3;
          })
          .attr("cy", function(d) {
            return padding + (4 + 7 * Math.sqrt((d.capacity - that.matrixViewer.minCapacity) / (that.matrixViewer.maxCapacity - that.matrixViewer.minCapacity)/3.1416))/3;
          }); 
 
      // Add a circle.
      var circle = marker.append("svg:circle")
          .attr("class", "calendarViewStationRepresentation")          
          .attr("id", function(d) {
            return "calendarViewStationRepresentation" + d.id;
          })          
          .attr("r", function(d) {
            return 4 + 7 * Math.sqrt((d.capacity - that.matrixViewer.minCapacity) / (that.matrixViewer.maxCapacity - that.matrixViewer.minCapacity)/3.1416);
          })
          .attr("fill", "hsl(" + (0.1 * 360) + ", 100%, 50%)")
          .attr("stroke",  "gray")
          .attr("stroke-width",  "1.5px")
          .attr("cx", padding)
          .attr("cy", padding)
          .on("mouseover", function(d){
            // console.log(d);
            for (stationIndex in that.matrixViewer.actualOrderingList.orderedStations) {
              if (that.matrixViewer.actualOrderingList.orderedStations[stationIndex].id == d.id) {
                that.matrixViewer.stationPointedInMapId = d.id;
                that.matrixViewer.pointedStation(stationIndex);
                return;
              }
            }
          });

      circle
        .append("svg:title")
          .text(function(d, i) { return d.name; });          
 
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

}


MapViewerAnalyticsCalendarView.prototype.mouseMove = function(event) {  
  // this.getStationFromCoords(event.latLng);
  //console.log(this.selectedStations);
}

MapViewerAnalyticsCalendarView.prototype.mouseClicked = function(event) {
  //this.getStationFromCoords(event.latLng);  
  // this.getSelectedStationsInfo();
}

/**
 * Access to google maps.
 * @param <string> mapContainerId Id of element to contain main map.
 * @return undefined.
 */
MapViewerAnalyticsCalendarView.prototype.getMap = function() {
  return this.map_;
};


/**
 * Fits map to accomodate a list of points: all of them become visible in map.
 * @param points array of LatLng positions to fit.
 */
MapViewerAnalyticsCalendarView.prototype.fitToPoints = function(points) {
  var bounds = new google.maps.LatLngBounds();
  for (var i in points) {
    bounds.extend(points[i]);
  }
  this.map_.fitBounds(bounds);
  this.update();
};
