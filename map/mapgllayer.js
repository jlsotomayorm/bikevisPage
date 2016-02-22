/**
 * Controls what appears on top of the map, in the WebGL layer.
 */ 

/**
 * @param dataManager provides useful data for this renderer.
 * @param <String> mapContainerId ID of element to contain main map.
 * @param <string> opt_matStyle optional style to apply to map.
 */
var MapGLRenderer = function(dataManager, map) {
  // Lazy initialization.

// TODO (cesarp) Add to a class, using Closure.

var getUsedStopsInRoute = function() {
  return subwayMap['lines'][line];
};

var createVertexForStop = function(stop_id, layer) {
  var pos = stopsPosition[stop_id];
  if (pos === undefined) {
    console.log(stop_id + ' does not exist!');
  }
  var location = new google.maps.LatLng(+pos[0], +pos[1]);
  return layer.fromLatLngToVertex(location);
};


// Creates textured material for particles.
var createMaterialForParticles = function(color) {
  var texture = new THREE.Texture(generateSprite());
  texture.needsUpdate = true;
  return new THREE.ParticleBasicMaterial({
    size: 80,
    map: texture,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    color: color
  });
};


var createParticles = function(color, stops, layer, gui, updateFunction) {
  var geometry = new THREE.Geometry();
  stops.forEach(function(stop_id) {
    var vertex = createVertexForStop(stop_id, layer);
    geometry.vertices.push(vertex);
  });

  // TODO efficient?
  var material = createMaterialForParticles(color);
  var particles = new THREE.ParticleSystem(geometry, material);
  layer.add(particles);

  // Adds controls to GUI.
  gui.add(material, 'size', 2, 100).onChange(updateFunction);
  gui.add(material, 'opacity', 0.1, 1).onChange(updateFunction);
};


var createParticlesForPlannedStops = function(stops, layer, gui, updateFunction) {
  // Sprites for list of stops.
  createParticles(0xff0000, stops, layer, gui, updateFunction);
};


var createParticlesForActualStops = function(trips, layer, gui, updateFunction) {
  // Sprites for actual stops in trips.
  var usedStops = getUsedStopsInRoute(trips);
  createParticles(0x00ff00, usedStops, layer, gui, updateFunction);
};


var showTripsWithInvalidStops = function(trips, stops) {
  // Counts how many trips have invalid stops.
  // Converts to indexable dictionary.
  var stopsForRoute = {};
  for (var s_i in stops) {
    stopsForRoute[stops[s_i]] = true;
  }

  var total = 0;
  var withError = 0;
  var updateTripCount = function(trips) {
    for (var t_i in trips) {
      total += 1;
      var trip = trips[t_i];
      for (var s_i in trip) {
        var stop_id = trip[s_i][0];
        if (!stopsForRoute[stop_id]) {
          withError += 1;
          break;
        }
      }
    }
  };
  updateTripCount(trips['downtown']);
  updateTripCount(trips['uptown']);
  console.log(withError + ' trips out of ' + total + '(' +
     100 * withError / total + '%) have invalid stops');
};


function initGLLayer(map) {

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
    return;
  }

  new ThreejsLayer({ map: map }, function(layer) {
    
    var gui = new dat.GUI();
    var update = function() {
      layer.render();
    }

    var lineName = '1';
    var lineTrackName = '1';

    var stops = routesStops[lineTrackName];
    createParticlesForPlannedStops(stops, layer, gui, update);

    //var trips = tripsLine[lineName];
    //createParticlesForActualStops(trips, layer, gui, update);

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
    //        vertex = layer.fromLatLngToVertex(location);
    //    geometryLine.vertices.push( vertex );
    //  });
    //  var line = new THREE.Line(geometryLine, materialLines);
    //  layer.add(line);
    //});


    // TODO (cesarp) Remove.
    //var cornersLine = new THREE.Geometry();
    //var p0 = new THREE.Vector3(0, 0, 0);
    //var p1 = new THREE.Vector3(0.29444, 0.3757, 0);
    //cornersLine.vertices.push(p0);
    //cornersLine.vertices.push(p1);
    //layer.add(new THREE.Line(cornersLine, materialLines));


  });
}

function generateSprite() {

  var canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    gradient;

  canvas.width = 20;
  canvas.height = 20;

  gradient = context.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );

  gradient.addColorStop(1.0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.0, 'rgba(0,255,255,1)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
}
