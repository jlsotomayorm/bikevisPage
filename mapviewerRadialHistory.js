/**
 * Class serving map viewer.
 *
 */ 



/**
 * @param <String> mapContainerId ID of element to contain main map.
 * @param <string> opt_mapStyle optional style to apply to map.
 */
var MapViewerAnalyticsRadialHistory = function(dataManager, mapContainerId, opt_mapStyle) {
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
  this.stationSize = 100;
  this.queryThickness = 4;
  this.useQuery = false;
  this.showHistory = false;
  this.queryAngle = 0;
  this.property = "balance";
  this.queryStationId = -1;
  this.angleScaleSlope = d3.scale.linear().domain([-1, 1]).range([90, -90]);
  this.angleScaleBalance = d3.scale.linear().domain([0, 1]).range([45, -45]);
  this.maxStationSize = 200;
  this.stationSizeChanged = false;
};


/**
 * Activates/deactivates renderer.
 */
MapViewerAnalyticsRadialHistory.prototype.setActive = function(active) {
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
MapViewerAnalyticsRadialHistory.prototype.isActive = function() {
  return this.active_;
};


MapViewerAnalyticsRadialHistory.prototype.update = function() {
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
MapViewerAnalyticsRadialHistory.loadGMaps = function(callbackName) {
  var script  = document.createElement("script");
  script.type = "text/javascript";
  script.src  = 
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyC50vDMewZXJZwaOnjO1R" +
    "k-gJf7EDYFibQ&sensor=true&callback=" + 
    callbackName;
  document.body.appendChild(script);
};

MapViewerAnalyticsRadialHistory.prototype.getAngle = function(stationId, index) {  
  
}

MapViewerAnalyticsRadialHistory.prototype.transform = function(d, d3object, mapviewer) {

    // var thisSizeRatio = mapviewer.dataManager_.stationsActualCapacity[d.id]/(mapviewer.dataManager_.stationsActualCapacity["maxCapacity"]);

    d = new google.maps.LatLng(d.latitude, d.longitude);
    d = mapviewer.projection.fromLatLngToDivPixel(d);
    // console.log(d);    

    // console.log(thisSizeRatio);

    // return d3.select(d3object)
    //     .style("left", (d.x - mapviewer.transformPadding) + "px")
    //     .style("top", (d.y - mapviewer.transformPadding) + "px");

    return d3.select(d3object)
        .style("left", (d.x - mapviewer.transformPadding) + "px")
        .style("top", (d.y - mapviewer.transformPadding) + "px");
  
}

MapViewerAnalyticsRadialHistory.prototype.updateMapVisualization = function() {  
   
  
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

        // var marker = that.stationsLayer.selectAll("svg")
        //     .data(data)
        //     .each(function(d) {
        //       that.transform(d, this, that);
        //     }) // update existing markers
        //   .enter().append("svg:svg") 
        //     .style("position", "absolute")
        //     .style("width", that.stationSize + "px")
        //     .style("height", that.stationSize + "px")
        //     .style("padding-right", "100px")
        //     .style("font", "10px sans-serif") 
        //     // .style("background-color", "red")             
        //     .each(function(d) {
        //       that.transform(d, this, that);
        //     })        
        //     // .on("click", function (d) {
        //     //   console.log("click");
        //     // })                
        //     .attr("class", "syncStation")
        //     .on("click", function (d) {
        //       that.queryStationId = d.id;
        //       $( "#trackingStationName" ).val( "Tracking station: " + d.name);
        //       that.updateMapVisualization();
        //     }); 
        

        // var stationTransform = marker.append("g")
        //   .attr("class", "stationTransform")
        //   .attr("transform", "translate(" + padding + "," + padding + ")"); 

        // var historyGroup = stationTransform.append("g")
        //   .attr("id", function (d) {return "historyGroup" + d.id;})
        //   .attr("visibility", "visible")
        //   .attr("class", "historyGroup");

        // historyGroup.append("svg:circle")
        //   .attr("r", function (d) {            
        //     var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);

        //     var r = Math.sqrt((thisSizeRatio)/3.14);
        //     return that.stationSize/2 * r;
        //   })
        //   .attr("class", "historyGroupBackground")
        //   .attr("fill", "blue")
        //   .attr("opacity", "0.15");

        // var thickness = 0.5;
        
        // for (interval in Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][0]["means"])) {          
        //   stationTransform.selectAll(".historyGroup")
        //   .append("svg:rect")            
        //     .attr("x", 0)
        //     .attr("y", -thickness/2)
        //     .attr("width", function (d) {              
        //       // console.log(that.dataManager_.stationsActualCapacity[d.id]);
        //       if (that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id] == undefined) {
        //         return 0;
        //       }
        //       if (!(interval in Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id]["means"]))) {
        //         return 0;
        //       }
        //       var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);
        //       // console.log(that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id]["means"][interval]);
        //       // return that.stationSize/2 * thisSizeRatio * that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id]["means"][interval];

        //       var length = thisSizeRatio * that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id]["means"][interval];

        //       var r = Math.sqrt((length)/3.14);

        //       return that.stationSize/2 * r;

        //       // return that.stationSize/2;
        //     })
        //     .attr("stroke", "none")            
        //     .attr("fill", "red")            
        //     .attr("transform", function (d) { 
        //       if (that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id] == undefined) {
        //         return 0;
        //       }
        //       if (!(interval in Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id]["means"]))) {
        //         return 0;
        //       }
        //       return "rotate(" + (-90 + 360*interval/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id]["means"]).length) +")";
        //     })
        //     .attr("opacity", "1.0")
        //     .attr("class", "historyLine")            
        //     .attr("height", thickness);
        // }

        // for (interval in Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][0]["means"])) {          
        //   stationTransform.selectAll(".historyGroup")
        //   .insert("svg:circle", ".historyLine")            
        //     .attr("r", function (d) {
        //       if (that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id] == undefined) {
        //         return 0;
        //       }
        //       if (!(interval in Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id]["means"]))) {
        //         return 0;
        //       }
        //       var thisSizeRatio = that.dataManager_.stationsActualCapacity[d.id]/(that.dataManager_.stationsActualCapacity["maxCapacity"]);
        //       // console.log(that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id]["means"][interval]);
        //       return that.stationSize/2 * thisSizeRatio * interval/Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][0]["means"]).length;
        //     })            
        //     .attr("stroke", function (d) {
        //       if (that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id] == undefined) {
        //         return "white";
        //       }
        //       if (!(interval in Object.keys(that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id]["means"]))) {
        //         return "white";
        //       }
        //       return that.historyTimeColorScale(that.dataManager_.dayOfWeekModels[that.dayOfWeek][d.id]["means"][interval]);
        //     })            
        //     .attr("stroke-width", 1)            
        //     .attr("fill", "none")                        
        //     .attr("opacity", "0.5")
        //     .attr("class", "historyLine");
        // }

        // var thickness = 2.0;

        // stationTransform.append("svg:rect")            
        //   .attr("x", -padding)
        //   .attr("y", -thickness/2)
        //   .attr("width", padding*2)
        //   .attr("stroke", "none")
        //   // .attr("fill", "white")
        //   // .attr("fill", "hsl(284,0%,90%)")            
        //   .attr("fill", "black")            
        //   .attr("transform", "rotate(0)")
        //   // .attr("shape-rendering", "geometricPrecision")
        //   .attr("opacity", "1.0")
        //   .attr("class", "actualStateLine")
        //   // .attr("transform", "rotate(85) translate(" + (-padding) + ", " + ((0.5 - 0.5)) + ")")
        //   .attr("height", thickness);

      }     
    }

    this.stationsOverlay.setMap(this.map_);

    this.stationsOverlayCreated = true;
  } else {
    
  }
}

/**
 * Sets up UX component for main map.
 * @private
 * @param <string> mapContainerId Id of element to contain main map.
 * @param <string> opt_matStyle optional style to apply to map.
 */
MapViewerAnalyticsRadialHistory.prototype.initMap_ = function(mapContainerId, opt_mapStyle) {  

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

  this.dataManager_.getStationsActualCapacity(this);
  // this.dataManager_.getDayOfWeekModels(this.dayOfWeek,this);
};

MapViewerAnalyticsRadialHistory.prototype.stationsActualCapacityLoaded = function() { 
  console.log("minCapacity: " + this.dataManager_.stationsActualCapacity["minCapacity"]);   
  console.log("maxCapacity: " + this.dataManager_.stationsActualCapacity["maxCapacity"]);   
  this.dataManager_.getDayOfWeekModels(this.dayOfWeek,this);
}

MapViewerAnalyticsRadialHistory.prototype.dayOfWeekModelLoaded = function(dayOfWeek) {  
  this.dayOfWeek = dayOfWeek;  
  this.updateMapVisualization();
  // console.log(this.dataManager_.dayOfWeekModels[dayOfWeek]);
  // console.log("dayOfWeekModelLoaded");
}

MapViewerAnalyticsRadialHistory.prototype.mouseMove = function(event) {  
  // this.getStationFromCoords(event.latLng);
  //console.log(this.selectedStations);
}

MapViewerAnalyticsRadialHistory.prototype.mouseClicked = function(event) {
  //this.getStationFromCoords(event.latLng);  
  // this.getSelectedStationsInfo();
}

/**
 * Access to google maps.
 * @param <string> mapContainerId Id of element to contain main map.
 * @return undefined.
 */
MapViewerAnalyticsRadialHistory.prototype.getMap = function() {
  return this.map_;
};


/**
 * Fits map to accomodate a list of points: all of them become visible in map.
 * @param points array of LatLng positions to fit.
 */
MapViewerAnalyticsRadialHistory.prototype.fitToPoints = function(points) {
  var bounds = new google.maps.LatLngBounds();
  for (var i in points) {
    bounds.extend(points[i]);
  }
  this.map_.fitBounds(bounds);
  this.update();
};
