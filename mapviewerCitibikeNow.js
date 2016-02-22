/**
 * Class serving map viewer.
 *
 */ 



/**
 * @param <String> mapContainerId ID of element to contain main map.
 * @param <string> opt_mapStyle optional style to apply to map.
 */
var MapViewerCitibikeNow = function(dataManager, mapContainerId, opt_mapStyle) {
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

  this.frequencyColorScale = d3.scale.linear().domain([0.0,0.25,0.5,0.75,1.0]).range([
    d3.rgb(94,60,153),
    d3.rgb(178,171,210),
    d3.rgb(247,247,247),
    d3.rgb(253,184,99),
    d3.rgb(230,97,1)
  ]);

  this.frequencyWindow = 30;  // in minutes
  this.lowFrequency = 0;
  this.highFrequency = 2;
  
};


/**
 * Activates/deactivates renderer.
 */
MapViewerCitibikeNow.prototype.setActive = function(active) {
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
MapViewerCitibikeNow.prototype.isActive = function() {
  return this.active_;
};


MapViewerCitibikeNow.prototype.update = function() {
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
MapViewerCitibikeNow.loadGMaps = function(callbackName) {
  var script  = document.createElement("script");
  script.type = "text/javascript";
  script.src  = 
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyC50vDMewZXJZwaOnjO1R" +
    "k-gJf7EDYFibQ&sensor=true&callback=" + 
    callbackName;
  document.body.appendChild(script);
};

MapViewerCitibikeNow.prototype.updateStationsState = function() {  
  // console.log("updateStationsState: " + this.lowFrequency + "   " + this.highFrequency);
  
  
  var that = this;

  if (!this.stationsOverlayCreated) {
    this.stationsOverlay = new google.maps.OverlayView();  

    // Add the container when the overlay is added to the map.
    this.stationsOverlay.onAdd = function() {

      // console.log("overlay.onAdd");
      // console.log(that.dataManager_.stationsActualState);

      // var data = dataManager.stations;    
      var data = that.dataManager_.stationsActualState;
      console.log("stationsActualState");
      // console.log(data);


      // for (var station in data) {
      //   if (data[station].id == 163) {
      //     console.log(data[station]);
      //   }
      // }


      that.stationsLayer = d3.select(this.getPanes().overlayLayer).append("div")        
        .attr("class", "stations");      

      // Draw each marker as a separate SVG element.
      // We could use a single SVG, but what size would it have?
      that.stationsOverlay.draw = function() {
        var projection = this.getProjection(),
            padding = 15;
   
        var marker = that.stationsLayer.selectAll("svg")
            .data(data)
            .each(transform) // update existing markers
          .enter().append("svg:svg") 
            .style("position", "absolute")
            // .attr("width", "300")
            // .attr("height", "300")
            // .style("padding-right", "100px")
            .style("font", "10px sans-serif")         
            .each(transform)
            .each(function (d) {
              // filters go in defs element
              var defs = d3.select(this).append("defs");

              // create filter with id #drop-shadow
              // height=130% so that the shadow is not clipped
              var filter = defs.append("filter")
                  .attr("id", "drop-shadow" + d.id)            
                  .attr("width", "200%")
                  .attr("height", "200%");

              // SourceAlpha refers to opacity of graphic that this filter will be applied to
              // convolve that with a Gaussian with standard deviation 3 and store result
              // in blur
              filter.append("feGaussianBlur")
                  .attr("in", "SourceAlpha")
                  .attr("stdDeviation", 2)
                  .attr("result", "blur");

              // translate output of Gaussian blur to the right and downwards with 2px
              // store result in offsetBlur
              filter.append("feOffset")            
                  .attr("id", "feOffset" + d.id)
                  .attr("in", "blur")
                  .attr("dx", 0)
                  .attr("dy", 0)
                  .attr("result", "offsetBlur");

              // overlay original SourceGraphic over translated blurred opacity by using
              // feMerge filter. Order of specifying inputs is important!
              var feMerge = filter.append("feMerge");

              feMerge.append("feMergeNode")
                  .attr("in", "offsetBlur");
              feMerge.append("feMergeNode")
                  .attr("in", "SourceGraphic");
            })            
            .attr("class", "citibikeNowStation");   
        

        // // Add a elipse.
        // marker.append("svg:ellipse")
        //     .attr("class", "citibikeNowStationBikesDirectionRepresentation")
        //     .attr("stationId", function(d) { return d.id; })            
        //     .attr("rx", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes)/3.14); })
        //     .attr("ry", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes)/3.14) / 2; })
        //     .attr("fill", "hsl(" + (0.76 * 360) + ", 100%, 30%)")  
        //     .attr("stroke",  "white")
        //     .attr("stroke-width",  "1.5px")          
        //     .attr("cx", padding)
        //     .attr("cy", padding);

        // // filters go in defs element
        // var defs = marker.append("defs");

        // // create filter with id #drop-shadow
        // // height=130% so that the shadow is not clipped
        // var filter = defs.append("filter")
        //     .attr("id", "drop-shadow")            
        //     .attr("width", "200%")
        //     .attr("height", "200%");

        // // SourceAlpha refers to opacity of graphic that this filter will be applied to
        // // convolve that with a Gaussian with standard deviation 3 and store result
        // // in blur
        // filter.append("feGaussianBlur")
        //     .attr("in", "SourceAlpha")
        //     .attr("stdDeviation", 2)
        //     .attr("result", "blur");

        // // translate output of Gaussian blur to the right and downwards with 2px
        // // store result in offsetBlur
        // filter.append("feOffset")            
        //     .attr("id", "feOffset")
        //     .attr("in", "blur")
        //     .attr("dx", Math.random())
        //     .attr("dy", Math.random())
        //     .attr("result", "offsetBlur");

        // // overlay original SourceGraphic over translated blurred opacity by using
        // // feMerge filter. Order of specifying inputs is important!
        // var feMerge = filter.append("feMerge");

        // feMerge.append("feMergeNode")
        //     .attr("in", "offsetBlur");
        // feMerge.append("feMergeNode")
        //     .attr("in", "SourceGraphic");

        // Add a circle.
        var circle = marker.append("svg:circle")
            .attr("class", "citibikeNowStationTotalRepresentation")
            .attr("stationId", function(d) { return d.id; })            
            .attr("r", function(d) { return 2 + 1.0 * Math.sqrt((d.bikes + d.free)/3.14); })
            .attr("fill", "hsl(" + (0.76 * 360) + ", 100%, 70%)")
            // .attr("stroke",  "white")
            // .attr("stroke-width",  "1.5px")
            .style("filter", function(d) { return "url(#drop-shadow" + d.id + ")"; })
            .attr("cx", padding)
            .attr("cy", padding);

        // Add a circle.
        // marker.append("svg:circle")
        //     .attr("class", "citibikeNowStationTotalRepresentation")
        //     .attr("stationId", function(d) { return d.id; })            
        //     .attr("r", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes + d.free)/3.14); })
        //     .attr("fill", "hsl(" + (0.76 * 360) + ", 100%, 70%)")
        //     .attr("stroke",  "white")
        //     .attr("stroke-width",  "1.5px")
        //     .attr("cx", padding)
        //     .attr("cy", padding);

        // // Add a circle.
        // marker.append("svg:circle")
        //     .attr("class", "citibikeNowStationBikesRepresentation")
        //     .attr("stationId", function(d) { return d.id; })            
        //     .attr("r", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes)/3.14); })
        //     .attr("fill", "hsl(" + (0.76 * 360) + ", 100%, 30%)")            
        //     .attr("cx", padding)
        //     .attr("cy", padding);            

                      
        
   
        // Add a label.
        // marker.append("svg:text")
        //     .attr("x", padding + 7)
        //     .attr("y", padding)
        //     .attr("dy", ".31em")
        //     .text(function(d) { return d.name; });
   
        function transform(d) {
          d = new google.maps.LatLng(d.lat * 0.000001, d.lng * 0.000001);
          d = projection.fromLatLngToDivPixel(d);
          return d3.select(this)
              .style("left", (d.x - padding) + "px")
              .style("top", (d.y - padding) + "px");
        }
      };    
    }  
    this.stationsOverlay.setMap(this.map_);

    this.stationsOverlayCreated = true;
  } else {

    console.log("Stations state updated at " + new Date());

    var data = that.dataManager_.stationsActualState;
    // var padding = 10;

    // function transform(d) {
    //   d = new google.maps.LatLng(d.lat * 0.000001, d.lng * 0.000001);
    //   d = that.stationsOverlay.getProjection().fromLatLngToDivPixel(d);
    //   return d3.select(this)
    //       .style("left", (d.x - padding) + "px")
    //       .style("top", (d.y - padding) + "px");
    // }

    // console.log(that.dataManager_.stationsActualFrequency);

    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    var now = new Date();

    that.dayOfTheWeek = (today).getDay() - 1;  // 0 is sunday...    
    if (that.dayOfTheWeek < 0) {
      that.dayOfTheWeek = 6;
    }

    var nowInSeconds = (now.getTime() - today.getTime())/1000;

    // console.log("nowInSeconds: " + nowInSeconds);

    that.nowIndexInTheModel = Math.floor(nowInSeconds/Number(that.dataManager_.stationsModel["samplingInterval"]));

    // console.log(that.dayOfTheWeek); 

    // console.log(that.nowIndexInTheModel);  

    var marker = that.stationsLayer.selectAll(".citibikeNowStation")
      .data(data)           
      .each(
        function(station) { 

          // console.log(station);            

          // console.log("dayOfTheWeek: " + that.dayOfTheWeek); 

          // console.log("nowIndexInTheModel: " + that.nowIndexInTheModel);
          // console.log(that.dataManager_.stationsModel[station.id][that.dayOfTheWeek]["groupModel"]["meansDeviations"]);

          var deviationInTheModel = that.dataManager_.stationsModel[station.id][that.dayOfTheWeek]["groupModel"]["meansDeviations"][Number(that.nowIndexInTheModel)];    

          var confidenceThreshold = 0.5;

          that.confident = (deviationInTheModel <= confidenceThreshold);
          
          that.confidence = that.confident ? deviationInTheModel : 1.0;

          var ellipseHeightMod = 1.0;

          var padding = d3.select(this).select(".citibikeNowStationTotalRepresentation").attr("cx");

          // console.log(Object.keys(that.dataManager_.stationsModel[station.id][that.dayOfTheWeek]["groupModel"]["meansDeviations"]).length);         

          var angle = 0;

          var ellipseTranslateXMod = 0;

          if (that.confident && (that.nowIndexInTheModel + 1) < Object.keys(that.dataManager_.stationsModel[station.id][that.dayOfTheWeek]["groupModel"]["meansDeviations"]).length) {
            var diff =  that.dataManager_.stationsModel[station.id][that.dayOfTheWeek]["groupModel"]["meansDeviations"][(that.nowIndexInTheModel + 1)] - that.dataManager_.stationsModel[station.id][that.dayOfTheWeek]["groupModel"]["meansDeviations"][(that.nowIndexInTheModel)];

            var ratio = diff * 10;
            angle = -ratio * 90;

            ellipseHeightMod = that.confidence;

            ellipseTranslateXMod = ellipseHeightMod;

            // console.log("diff: " + diff + "   angle: " + angle + "    confidence: " + that.confidence);
          }      

          ellipseTranslateXMod = 0.0; 

          d3.select(this).select(".citibikeNowStationTotalRepresentation")             
            // .attr("transform",  "rotate(" + angle + ", " + padding + ", " + padding + ")")
            .attr("r", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes + d.free)/3.14); })
            // .attr("ry", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes + d.free)/3.14); })
            // .attr("ry", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes + d.free)/3.14); })
            .attr("fill", function(d) {

              if (that.dataManager_.stationsActualFrequency) {                

                var activitiesPerMinute = that.dataManager_.stationsActualFrequency[d.id]/that.frequencyWindow;

                var transformedActivitiesPerMinute = 0;
                if ((that.highFrequency - that.lowFrequency) > 0) {
                  transformedActivitiesPerMinute = Math.max(activitiesPerMinute - that.lowFrequency,0) / (that.highFrequency - that.lowFrequency);
                }

                color = d3.hsl(that.frequencyColorScale(transformedActivitiesPerMinute));

                color = d3.hsl(color.h, color.s, 0.7);

                return color;
              } else {
                return "hsl(" + (0.76 * 360) + ", 100%, 70%)";
              }
            }); 

          // console.log(d3.select(this).select("defs").select("filter"));

          d3.select(this).select("defs").select("filter").select("#feOffset" + station.id)
            // .attr("dx", function(d) { 

            //   return Math.random();

            //   // if ((d.bikes/(d.bikes + d.free)) < 0.8) {
            //   //   return 3;
            //   // } else {
            //   //   return 0;
            //   // }

              
            // })
            // .attr("dy", function(d) { 

            //   return Math.random();

            //   // if ((d.bikes/(d.bikes + d.free)) < 0.8) {
            //   //   return 3;
            //   // } else {
            //   //   return 0;
            //   // }

              
            // });
            .attr("dx", function(d) { return 3 * (d.bikes/(d.bikes + d.free)); })
            .attr("dy", function(d) { return 3 * (d.bikes/(d.bikes + d.free)); });

          // d3.select(this).select(".citibikeNowStationTotalRepresentation")             
          //   // .attr("transform",  "rotate(" + angle + ", " + padding + ", " + padding + ")")
          //   .attr("r", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes + d.free)/3.14); })
          //   // .attr("ry", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes + d.free)/3.14); })
          //   // .attr("ry", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes + d.free)/3.14); })
          //   .attr("fill", function(d) {

          //     if (that.dataManager_.stationsActualFrequency) {                

          //       var activitiesPerMinute = that.dataManager_.stationsActualFrequency[d.id]/that.frequencyWindow;

          //       var transformedActivitiesPerMinute = 0;
          //       if ((that.highFrequency - that.lowFrequency) > 0) {
          //         transformedActivitiesPerMinute = Math.max(activitiesPerMinute - that.lowFrequency,0) / (that.highFrequency - that.lowFrequency);
          //       }

          //       color = d3.hsl(that.frequencyColorScale(transformedActivitiesPerMinute));

          //       color = d3.hsl(color.h, color.s, 0.7);

          //       return color;
          //     } else {
          //       return "hsl(" + (0.76 * 360) + ", 100%, 70%)";
          //     }
          //   });  

          // d3.select(this).select(".citibikeNowStationBikesRepresentation")               
          //   .attr("r", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes)/3.14); })            
                     
          //   .attr("fill", function(d) {

          //     if (that.dataManager_.stationsActualFrequency) {                
          //       var activitiesPerMinute = that.dataManager_.stationsActualFrequency[d.id]/that.frequencyWindow;

          //       var transformedActivitiesPerMinute = 0;
          //       if ((that.highFrequency - that.lowFrequency) > 0) {
          //         transformedActivitiesPerMinute = Math.max(activitiesPerMinute - that.lowFrequency,0) / (that.highFrequency - that.lowFrequency);
          //       }

          //       color = d3.hsl(that.frequencyColorScale(transformedActivitiesPerMinute));

          //       color = d3.hsl(color.h, color.s, 0.3);

          //       return color;
          //     } else {
          //       return "hsl(" + (0.76 * 360) + ", 100%, 30%)";
          //     }
          //   });   


          // d3.select(this).select(".citibikeNowStationTotalDirectionRepresentation")             
          //   .attr("transform",  "rotate(" + angle + ", " + padding + ", " + padding + ")" + " translate(" + 4 * ellipseTranslateXMod + ", " + 0 + ")")
          //   .attr("rx", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes + d.free)/3.14) + 2 * ellipseTranslateXMod; })
          //   .attr("ry", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes + d.free)/3.14) - 3 * ellipseTranslateXMod; })
          //   // .attr("ry", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes + d.free)/3.14); })
          //   .attr("fill", function(d) {

          //     if (that.dataManager_.stationsActualFrequency) {
          //       // color = d3.hsl(that.frequencyColorScale(that.dataManager_.stationsActualFrequency[d.id]/Math.sqrt(that.dataManager_.stationsActualFrequency["maxFrequency"])));
          //       var activitiesPerMinute = that.dataManager_.stationsActualFrequency[d.id]/that.frequencyWindow;

          //       var transformedActivitiesPerMinute = 0;
          //       if ((that.highFrequency - that.lowFrequency) > 0) {
          //         transformedActivitiesPerMinute = Math.max(activitiesPerMinute - that.lowFrequency,0) / (that.highFrequency - that.lowFrequency);
          //       }

          //       color = d3.hsl(that.frequencyColorScale(transformedActivitiesPerMinute));

          //       color = d3.hsl(color.h, color.s, 0.7);

          //       return color;
          //     } else {
          //       return "hsl(" + (0.76 * 360) + ", 100%, 70%)";
          //     }
          //   }); 

          // d3.select(this).select(".citibikeNowStationBikesDirectionRepresentation")   
          //   .attr("transform",  "rotate(" + angle + ", " + padding + ", " + padding + ")" + " translate(" + 4 * ellipseTranslateXMod + ", " + 0 + ")")
          //   .attr("rx", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes)/3.14) + 6 * ellipseTranslateXMod; })
          //   .attr("ry", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes)/3.14); })            
          //   // .attr("ry", function(d) { return 2 + 1.5 * Math.sqrt((d.bikes)/3.14); })            
          //   .attr("fill", function(d) {

          //     if (that.dataManager_.stationsActualFrequency) {
          //       // color = d3.hsl(that.frequencyColorScale(that.dataManager_.stationsActualFrequency[d.id]/Math.sqrt(that.dataManager_.stationsActualFrequency["maxFrequency"])));
          //       var activitiesPerMinute = that.dataManager_.stationsActualFrequency[d.id]/that.frequencyWindow;

          //       var transformedActivitiesPerMinute = 0;
          //       if ((that.highFrequency - that.lowFrequency) > 0) {
          //         transformedActivitiesPerMinute = Math.max(activitiesPerMinute - that.lowFrequency,0) / (that.highFrequency - that.lowFrequency);
          //       }

          //       color = d3.hsl(that.frequencyColorScale(transformedActivitiesPerMinute));

          //       color = d3.hsl(color.h, color.s, 0.3);

          //       return color;
          //     } else {
          //       return "hsl(" + (0.76 * 360) + ", 100%, 30%)";
          //     }
          //   });                    
        }
      );

    // marker.select(".citibikeNowStationTotalRepresentation")      
    //   // .attr("stationId", function(d) { return d.id; })
    //   //.attr("r", function(d) { return 3.5 + 3.5 * d.bikes/(d.bikes + d.free); })
    //   // .attr("r", function(d) { return 2 + 0.1 * (d.bikes + d.free); })      
    //   .attr("r", function(d) { return 1.5 * Math.sqrt((d.bikes + d.free)/3.14); })
    //   .attr("fill", "hsl(" + (0.76 * 360) + ", 100%, 70%)");
    //   // .attr("stroke",  "white")
    //   // .attr("stroke-width",  "1.5px")
    //   // .attr("cx", padding)
    //   // .attr("cy", padding);          

    
  }
}

MapViewerCitibikeNow.prototype.stationsActualStateLoaded = function() {  
  // console.log("MapViewerCitibikeNow.prototype.stationsActualStateLoaded");
  // console.log(this.dataManager_.stationsActualState);

  this.updateStationsState();
}

MapViewerCitibikeNow.prototype.fetchStationsActualState = function() {  
  this.dataManager_.loadStationsActualState(this);
}


/**
 * Sets up UX component for main map.
 * @private
 * @param <string> mapContainerId Id of element to contain main map.
 * @param <string> opt_matStyle optional style to apply to map.
 */
MapViewerCitibikeNow.prototype.initMap_ = function(mapContainerId, opt_mapStyle) {  

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

  // this.dataManager_.loadStations(this);

  var that = this;

  // this.fetchStationsActualState();
  var stationsStateFetchingTimer = setInterval(
    function() {  
      that.dataManager_.loadStationsActualState(that);
      that.dataManager_.getStationsActualFrequency(that.frequencyWindow);
    }
  , 10 * 1000);

};

MapViewerCitibikeNow.prototype.mouseMove = function(event) {  
  this.getStationFromCoords(event.latLng);
  //console.log(this.selectedStations);
}

MapViewerCitibikeNow.prototype.mouseClicked = function(event) {
  //this.getStationFromCoords(event.latLng);  
  this.getSelectedStationsInfo();
}

MapViewerCitibikeNow.prototype.getStationFromCoords = function(coords) {  
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

MapViewerCitibikeNow.prototype.getSelectedStationsInfo = function() {  

  for (var selectedStationIndex in this.selectedStations)  { 
  console.log(this.selectedStations[selectedStationIndex]);   
    this.analyticsViewer.addSelectedStationUsageCharts(this.selectedStations[selectedStationIndex].station);
  }
}


/**
 * Access to google maps.
 * @param <string> mapContainerId Id of element to contain main map.
 * @return undefined.
 */
MapViewerCitibikeNow.prototype.getMap = function() {
  return this.map_;
};


/**
 * Fits map to accomodate a list of points: all of them become visible in map.
 * @param points array of LatLng positions to fit.
 */
MapViewerCitibikeNow.prototype.fitToPoints = function(points) {
  var bounds = new google.maps.LatLngBounds();
  for (var i in points) {
    bounds.extend(points[i]);
  }
  this.map_.fitBounds(bounds);
  this.update();
};
