/**
 * Controls what appears on top of the map, in a WebGL layer.
 */ 

/**
 * @param dataManager provides useful data for this renderer.
 */
var MapGLRendererStationsUsage = function(dataManager) {
  // Lazy initialization.
  this.initialized_ = false;  

  this.dataManager_ = dataManager;  
  this.layer_ = null;  

  this.stationsParticlesGeometry = null;
  this.selectedStationsParticlesGeometry = null;

  this.selectionLayer_ = null;    
};

/**
 * Creates a vertex for one station.
 */
MapGLRendererStationsUsage.prototype.createVertexForStation_ = function(station) {  
  var location = new google.maps.LatLng(station.latitude, station.longitude);
  //console.log(station.latitude, station.longitude);
  return this.layer_.fromLatLngToVertex(location);
};


/**
 * Creates textured material for particles.
 */
MapGLRendererStationsUsage.prototype.createMaterialForParticles_ = function(particleSize) {
  var texture = new THREE.Texture(MapGLRendererStationsUsage.generateSprite());
  texture.needsUpdate = true;
  return new THREE.ParticleBasicMaterial({
    size: particleSize,
    map: texture,
    opacity: 1.0,
    //blending: THREE.Normal,
    depthTest: false,
    transparent: true,    
    vertexColors: true
  });

};

MapGLRendererStationsUsage.prototype.createStationRepresentations_ = function() {
  
  var renderer = this;
  var geometry = new THREE.Geometry();  
  var stations = this.dataManager_.getStations(); 
  var stationsActivityCount = this.dataManager_.getStationsActivityCount(); 

  if (!stations || !stationsActivityCount)  {
    return;
  } 

  //console.log(stationsActivityCount);
  
  var minCount = this.dataManager_.stationsActivityCount['minStation'].count;
  var maxCount = this.dataManager_.stationsActivityCount['maxStation'].count;

  var useFrequencyScale = d3.scale.linear()
    .domain([minCount, maxCount])
    .range([0.0, 1.0]);

  that = this;

  stations.forEach(function(station) {    
    if (!stationsActivityCount[station.id]) { 
      var vertex = renderer.createVertexForStation_(station);
      geometry.vertices.push(vertex);

      var color = new THREE.Color();

      color.setHSL(0.76, 1.0, 0.5);      

      geometry.colors.push(color);

      //console.log(station.id);
    }    
  });

  // this.colorScale = d3.scale.linear().domain([0.0,0.6,1.0]).range([d3.rgb(0, 0, 0),
  //   d3.rgb(255, 0, 0),
  //   d3.rgb(255, 255, 0)]);

  this.colorScale = d3.scale.linear().domain([0.0,0.4,0.85,1.0]).range([d3.rgb(150, 0, 0),
      d3.rgb(255, 0, 0),
      d3.rgb(255, 255, 0),
      d3.rgb(255, 255, 255)]);

  // this.colorScale = d3.scale.linear().domain([0.0,0.6,0.85,1.0]).range([d3.rgb(52, 11, 17),
  //   d3.rgb(126, 42, 6),
  //   d3.rgb(237, 208, 148),
  //   d3.rgb(255, 255, 255)]);

  stations.forEach(function(station) {
    if (stationsActivityCount[station.id]) {
      var vertex = renderer.createVertexForStation_(station);
      geometry.vertices.push(vertex);

      
            
      //if (!that.stationsParticlesGeometry) {
        //color.setHSL(0.16, useFrequencyScale(stationsActivityCount[station.id]), 0.5);      
      // } else {
      //   color.setHSL(0.36, useFrequencyScale(stationsActivityCount[station.id]), 0.5);          
      // }

      var tempColor = that.colorScale(useFrequencyScale(stationsActivityCount[station.id]));

      // color.r = tempColor.r/255.0;
      // color.g = tempColor.g/255.0;
      // color.b = tempColor.b/255.0;

      var color = new THREE.Color(tempColor);    
      
      geometry.colors.push(color);
    }
  });

  
  if (this.stationsParticlesGeometry) {
    
    this.geometry_.getObjectByName("stationsParticles").geometry.colors = geometry.colors;
    this.geometry_.getObjectByName("stationsParticles").geometry.vertices = geometry.vertices;

    //this.geometry_.getObjectByName("stationsParticles").geometry.verticesNeedUpdate  = true; 
    this.geometry_.getObjectByName("stationsParticles").geometry.colorsNeedUpdate = true; 

    //this.geometry_.verticesNeedUpdate  = true;
    //this.geometry_.colorsNeedUpdate  = true;    

  } else {
  
    var material = this.createMaterialForParticles_(40);    
    var particles = new THREE.ParticleSystem(geometry, material);        
    
    particles.name = "stationsParticles";
    this.geometry_.add(particles);  
    
  }
  
  this.stationsParticlesGeometry = geometry;
}

MapGLRendererStationsUsage.prototype.createSelectedStationsRepresentations_ = function() {

  //console.log("createSelectedStationsRepresentations_");

  var renderer = this;
  var geometry = new THREE.Geometry();  
  var stations = this.dataManager_.getStations(); 
  
  var selectedStations = this.dataManager_.selectedStations;

  if (!stations || !selectedStations)  {
    return;
  } 

  for (var stationIndex in stations)  {
    if (stations[stationIndex].id == 268) {
      var vertex = renderer.createVertexForStation_(stations[stationIndex]);
      geometry.vertices.push(vertex);

      var color = new THREE.Color();

      color.setHSL(0.76, 1.0, 0.0);      

      geometry.colors.push(color); 
    }
  }
   

  that = this;

  selectedStations.forEach(function(station) {        

      if (that.dataManager_.streetsGraph) {        
        for (var stationWithNode in that.dataManager_.streetsGraph.stationWithNodes) {          
          if (station.station.id == that.dataManager_.streetsGraph.stationWithNodes[stationWithNode].stationId) {
            //console.log(1);
            var closestNode = {"latitude": that.dataManager_.streetsGraph.stationWithNodes[stationWithNode].closestNodeLatitude,
             "longitude": that.dataManager_.streetsGraph.stationWithNodes[stationWithNode].closestNodeLongitude};

            var vertex = renderer.createVertexForStation_(closestNode);
            geometry.vertices.push(vertex);

            var color = new THREE.Color();

            color.setHSL(0.76, 1.0, 0.0);      

            geometry.colors.push(color);

            //console.log(that.dataManager_.streetsGraph.stationWithNodes[stationWithNode]); 

            break;  
          }
        }
      } 

      // var vertex = renderer.createVertexForStation_(station.station);
      // geometry.vertices.push(vertex);

      // var color = new THREE.Color();

      // color.setHSL(0.76, 1.0, 0.0);      

      // geometry.colors.push(color);      
    
  }); 
    
  // if (this.selectedStationsParticlesGeometry) {
    
  //   this.geometry_.getObjectByName("selectedStationsParticles").geometry.colors = geometry.colors;
  //   this.geometry_.getObjectByName("selectedStationsParticles").geometry.vertices = geometry.vertices;
    
  //   this.geometry_.getObjectByName("selectedStationsParticles").geometry.colorsNeedUpdate = true; 

      

  // } else {

    if (this.selectionGeometry_.getObjectByName("selectedStationsParticles")) {
      this.selectionGeometry_.remove(this.selectionGeometry_.getObjectByName("selectedStationsParticles"));
    }
  
    var material = this.createMaterialForParticles_(60);    
    var particles = new THREE.ParticleSystem(geometry, material);        
    
    particles.name = "selectedStationsParticles";
    this.selectionGeometry_.add(particles);  
       
  //}
  
  this.selectedStationsParticlesGeometry = geometry;
  
  this.selectionLayer_.render();
}

/**
 * Updates and render geometry.
 */
MapGLRendererStationsUsage.prototype.update = function() {
  if (!this.layer_) {
    return;
  }


  if (this.dataManager_.stationsActivityCountChanged) {
    //this.createStationRepresentations_();
    
    this.dataManager_.stationsActivityCountChanged = false;
  }
  

/**
  var lines = this.dataManager_.getLines();
  for (var i in lines) {
    var line = lines[i];
    var visible = this.dataManager_.isVisibleLine(line);

    if (visible && !(line in this.linesGeometry_)) {
      this.createGeometryForLine_(line);
    }

    // Toggle line geometry visibility.
    if (line in this.linesGeometry_) {
      this.linesGeometry_[line].stops.visible = visible;
      // TODO toggle track for line
    }
  }
  */

  // $.get(
  //     "http://localhost:8080/stations",
  //     "",
  //     function(data) { console.log(data); },
  //     "html"
  // );

  //this.stations = this.dataManager_.getStations();
  //this.dataManager_.loadStations(this.createStationRepresentations_);
  //this.createStationRepresentations_(this.stations);

  this.render_();
};


/**
 * Renders layer.
 */
MapGLRendererStationsUsage.prototype.render_ = function() {
  this.layer_.render();
};


/**
 * Initializes GL layer for render on top of the map.
 */
MapGLRendererStationsUsage.prototype.initialize = function(map) {
  var renderer = this;
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
    return;
  }

  new ThreejsLayer({ map: map }, function(layer) {
    renderer.selectionLayer_ = layer;

    renderer.selectionGeometry_ = new THREE.Object3D();
    renderer.selectionLayer_.add(renderer.selectionGeometry_);    
    
    renderer.update();    
  });

  new ThreejsLayer({ map: map }, function(layer) {
    renderer.layer_ = layer;

    renderer.geometry_ = new THREE.Object3D();
    renderer.layer_.add(renderer.geometry_);

    renderer.stationsGeometry_ = {};

    // These are indexed by line id.
    //renderer.linesGeometry_ = {};

    //renderer.gui_ = new dat.GUI();
    renderer.update();

    //var trips = tripsLine[lineName];
    //renderer.createParticlesForActualStops_(trips);

    //showTripsWithInvalidStops(trips, stops);

    // Lines for track segments.
    //var materialLines = new THREE.LineBasicMaterial({
    //    color: 0x0000ff,
    //    opacity: 0.5,
    //    linewidth: 10,
    //    map: texture
    //});
    //mtagraph.trackSegments.forEach(function(trackSeg){
    //  var geometryLine = new THREE.Geometry();

    //  trackSeg.shape.points.forEach(function(point){
    //    var location = new google.maps.LatLng(point[0], point[1]),
    //        vertex = renderer.layer_.fromLatLngToVertex(location);
    //    geometryLine.vertices.push( vertex );
    //  });
    //  var line = new THREE.Line(geometryLine, materialLines);
    //  renderer.layer_.add(line);
    //});


    // TODO (cesarp) Remove.
    //var cornersLine = new THREE.Geometry();
    //var p0 = new THREE.Vector3(0, 0, 0);
    //var p1 = new THREE.Vector3(0.29444, 0.3757, 0);
    //cornersLine.vertices.push(p0);
    //cornersLine.vertices.push(p1);
    //renderer.layer_.add(new THREE.Line(cornersLine, materialLines));


  });
};

/**
 * Generates a sprite to use for particle renderer.
 * @static
 */
MapGLRendererStationsUsage.generateSprite = function() {
  var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      gradient;

  canvas.width = 20;
  canvas.height = 20;

  gradient = context.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );

  // gradient.addColorStop(1.0, 'rgba(255,255,255,0)');  
  // gradient.addColorStop(0.0, 'rgba(255,255,255,1)');

  gradient.addColorStop(0.0, 'rgba(255,255,255,1)');  
  gradient.addColorStop(0.8, 'rgba(255,255,255,0.6)');  
  gradient.addColorStop(1.0, 'rgba(255,255,255,0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
};