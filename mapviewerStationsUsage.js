/**
 * Class serving map viewer.
 *
 */ 



/**
 * @param <String> mapContainerId ID of element to contain main map.
 * @param <string> opt_mapStyle optional style to apply to map.
 */
var MapViewerStationsUsage = function(dataManager, mapContainerId, opt_mapStyle) {
  dataManager.addListener(this);
  // Lazy initialization.
  this.initialized_ = false;

  this.dataManager_ = dataManager;
  this.mapContainerId_ = mapContainerId;
  this.opt_mapStyle_ = opt_mapStyle; 

  this.mapGLRenderer =  new MapGLRendererStationsUsage(dataManager);

  // These containers must be shown/hidden on activation.
  this.visibleContainersId_ = [
    '#' + this.mapContainerId_
  ];
  
};


/**
 * Activates/deactivates renderer.
 */
MapViewerStationsUsage.prototype.setActive = function(active) {
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
MapViewerStationsUsage.prototype.isActive = function() {
  return this.active_;
};


MapViewerStationsUsage.prototype.update = function() {
  if (!this.dataManager_.hasData() || !this.active_) {
    //return;
  }

  if (!this.initialized_) {
    this.initMap_(this.mapContainerId_, this.opt_mapStyle_);
    this.mapGLRenderer.initialize(this.map_);
    this.initialized_ = true;
  }

  // TODO Load initial view options based on filters and selections.

  //console.log(this.dataManager_.stationsActivities);

  this.mapGLRenderer.update();
};


/**
 * Loads Google Maps and invoke callback when done (static function).
 * @param <function> callbackName function to call once google maps is loaded.
 * @return undefined.
 */
MapViewerStationsUsage.loadGMaps = function(callbackName) {
  var script  = document.createElement("script");
  script.type = "text/javascript";
  script.src  = 
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyC50vDMewZXJZwaOnjO1R" +
    "k-gJf7EDYFibQ&sensor=true&callback=" + 
    callbackName;
  document.body.appendChild(script);
};

MapViewerStationsUsage.prototype.stationsLoaded = function() { 

  var overlay = new google.maps.OverlayView();

  console.log("MapViewerStationsUsage.prototype.stationsLoaded");

  //var data = dataManager.stations;

  //console.log(data);

  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {

    var data = dataManager.stations;    

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
          .style("width", "60px")
          .style("height", "20px")
          .style("padding-right", "100px")
          .style("font", "10px sans-serif")          
          .attr("class", "stationSvg");
 
      // Add a circle.
      marker.append("svg:circle")
          .attr("class", "stationsUsageStationRepresentation")
          .attr("stationId", function(d) { return d.id; })
          .attr("r", 4.5)
          .attr("fill", "hsl(" + (0.76 * 360) + ", 100%, 50%)")
          .attr("stroke",  "white")
          .attr("stroke-width",  "1.5px")
          .attr("cx", padding)
          .attr("cy", padding);          
 
      // Add a label.
      // marker.append("svg:text")
      //     .attr("x", padding + 7)
      //     .attr("y", padding)
      //     .attr("dy", ".31em");
      //     .text(function(d) { return d.id; });
 
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


/**
 * Sets up UX component for main map.
 * @private
 * @param <string> mapContainerId Id of element to contain main map.
 * @param <string> opt_matStyle optional style to apply to map.
 */
MapViewerStationsUsage.prototype.initMap_ = function(mapContainerId, opt_mapStyle) {  

  // Creates map.
  var mapOptions = {
    center: new google.maps.LatLng(40.731508, -73.991246),
    zoom: 13,
    //mapTypeId: google.maps.MapTypeId.ROADMAP,
    // mapTypeId: opt_mapStyle || 
    //   MapStyles.MAP_STYLE_BRIGHT_BLUE_NAME,
    mapTypeId: MapStyles.MAP_STYLE_WHITE_PURPLE_NAME,
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

  this.dataManager_.loadStations(this);

};

MapViewerStationsUsage.prototype.mouseMove = function(event) {  
  this.getStationFromCoords(event.latLng);
  //console.log(this.selectedStations);
}

MapViewerStationsUsage.prototype.mouseClicked = function(event) {
  //this.getStationFromCoords(event.latLng);  
  this.getSelectedStationsInfo();
}

MapViewerStationsUsage.prototype.getStationFromCoords = function(coords) {  
  if (!this.dataManager_ || !this.dataManager_.getStations()) {
    return;
  }
  
  // google likes to change the properties of this getBounds(),
  // so we cant hardcode their names, need to find out on the fly  
  var propertiesNames = Object.getOwnPropertyNames(this.map_.getBounds());  
  
  var bounds1 = new google.maps.LatLng(this.map_.getBounds()[propertiesNames[0]].b, this.map_.getBounds()[propertiesNames[1]].b, false);
  var bounds2 = new google.maps.LatLng(this.map_.getBounds()[propertiesNames[0]].d, this.map_.getBounds()[propertiesNames[1]].d, false);  

  // var bounds1 = new google.maps.LatLng(this.map_.getBounds().ia.b, this.map_.getBounds().ga.b, false);
  // var bounds2 = new google.maps.LatLng(this.map_.getBounds().ia.d, this.map_.getBounds().ga.d, false);  
  
  var SameThreshold = 100.0;    

  // console.log(google.maps.geometry.spherical.computeDistanceBetween(bounds1,
  //   bounds2));

  SameThreshold = google.maps.geometry.spherical.computeDistanceBetween(bounds1,
    bounds2) / SameThreshold;

  this.selectedStations = new Array();

  var stations = this.dataManager_.getStations();
  for (var stationIndex in stations)  {
    var st = stations[stationIndex];
    var stationCoords = new google.maps.LatLng(st.latitude, st.longitude, false);   
    
    if (google.maps.geometry.spherical.computeDistanceBetween(coords,stationCoords) < SameThreshold) {   
      this.selectedStations.push({distance: google.maps.geometry.spherical.computeDistanceBetween(coords,stationCoords),
        station: st});          
    }
  } 
  
  this.selectedStations.sort(function(a,b){return a.distance-b.distance});  
  
  /* update the visualization of the selected stations in the webgl layer only if the list have changed */
  if (this.selectedStations.length != this.dataManager_.selectedStations.length) {   
      //console.log(1);
      this.dataManager_.selectedStations = this.selectedStations;
      //this.mapGLRenderer.createSelectedStationsRepresentations_();
    
  } else {
    //console.log(2);
    var equal = true;

    for (var stationIndex in this.selectedStations)  {
      if (this.selectedStations[stationIndex].station.id != this.selectedStations[stationIndex].station.id) {
        equal = false;
        break;
      }
    }

    //console.log(3);

    if (!equal) {
      //console.log(4);
      this.dataManager_.selectedStations = this.selectedStations;
      //this.mapGLRenderer.createSelectedStationsRepresentations_();
    }
  }

  
}

MapViewerStationsUsage.prototype.stationModelLoaded = function(id) {  
  this.analyticsViewer.addSelectedStationUsageCharts(this.dataManager_.stations[this.dataManager_.stationsIndexedById[id]]);
}


MapViewerStationsUsage.prototype.getSelectedStationsInfo = function() {  

  for (var selectedStationIndex in this.selectedStations)  { 
    // console.log(this.selectedStations[selectedStationIndex]); 
    this.dataManager_.loadStationModel(this.selectedStations[selectedStationIndex].station.id, this);
    // this.analyticsViewer.addSelectedStationUsageCharts(this.selectedStations[selectedStationIndex].station);
  }
}


/**
 * Access to google maps.
 * @param <string> mapContainerId Id of element to contain main map.
 * @return undefined.
 */
MapViewerStationsUsage.prototype.getMap = function() {
  return this.map_;
};


/**
 * Fits map to accomodate a list of points: all of them become visible in map.
 * @param points array of LatLng positions to fit.
 */
MapViewerStationsUsage.prototype.fitToPoints = function(points) {
  var bounds = new google.maps.LatLngBounds();
  for (var i in points) {
    bounds.extend(points[i]);
  }
  this.map_.fitBounds(bounds);
  this.update();
};
