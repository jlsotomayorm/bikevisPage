/**
 * Controls what appears on top of the map, in a WebGL layer.
 */ 

/**
 * @param dataManager provides useful data for this renderer.
 */
var MapGLRendererFlowEstimation = function(dataManager) {
  // Lazy initialization.
  this.initialized_ = false;  

  this.dataManager_ = dataManager;  
  

  this.stationsRoleLayer_ = null;
  this.stationsRoleLayerGeometry_ = null;
  this.stationsRoleGeometry_ = null;

  this.streetsFlowLayer_ = null;
  this.streetsFlowLayerGeometry_ = null;
  this.streetsFlowGeometry_ = null;


  this.stationsParticlesGeometry = null;
  this.selectedStationsParticlesGeometry = null;

  this.selectionLayer_ = null; 
  this.circulationData = null;

  this.showRoles = true; 
  this.showStreets = true;

  this.interval = 15; // in minutes
  this.timeString = "10:00:00";
  this.timeIndex = this.timeStringToIndex(this.timeString);

  this.showAllStreets = true;
  this.showUpStreets = false;
  this.showDownStreets = false;
  this.showRightStreets = false;
  this.showLeftStreets = false;

  this.colorScales = [];

  // console.log("MapGLRendererFlowEstimation");    
};

MapGLRendererFlowEstimation.prototype.timeStringToIndex = function(time) {
  // console.log(time);
  var minutes = Number(time.split(':')[0]*60) + Number(time.split(':')[1]);
  // console.log(minutes);
  return Math.floor(minutes / this.interval);
}

/**
 * Creates a vertex for one station.
 */
MapGLRendererFlowEstimation.prototype.createVertexForStation_ = function(station) {  
  var location = new google.maps.LatLng(station.latitude, station.longitude);
  //console.log(station.latitude, station.longitude);
  return this.stationsRoleLayer_.fromLatLngToVertex(location);
};


/**
 * Creates textured material for particles.
 */
MapGLRendererFlowEstimation.prototype.createMaterialForParticles_ = function(particleSize) {
  var texture = new THREE.Texture(MapGLRendererFlowEstimation.generateSprite());
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

MapGLRendererFlowEstimation.prototype.updateColorScale = function(streetsDirection) {

  // console.log(streetsDirection);

  var that = this;

  d3.select("#flowEstimation" + streetsDirection + "ColorScale").selectAll(".colorScale" + streetsDirection + "Sample").remove();

  var resolution = 10;
  var colorScaleSample = [];
  for (var colorScaleSampleIndex = 0; colorScaleSampleIndex <= resolution; colorScaleSampleIndex++) {
    colorScaleSample.push(colorScaleSampleIndex/resolution);
  }

  // console.log(colorScaleSample);

  var colorScaleWidth = 220;
  var colorScaleHeight = 10;

  d3.select("#flowEstimation" + streetsDirection + "ColorScale").selectAll(".colorScale" + streetsDirection + "Sample").data(colorScaleSample).enter()
  .append("div")
    .attr("class", "colorScale" + streetsDirection + "Sample")
    .style("border", "1px solid rgb(190, 190, 190)")
    .style("width", ((colorScaleWidth - 10)/(resolution + 1))  + "px")
    .style("height", colorScaleHeight + "px")
    .style("float", "left")
    .style("background", function(d,i) { 
      switch (streetsDirection) {
        case "All":
          return that.colorScaleAll(d);
        break;
        case "Up":
          return that.colorScaleUp(d);
        break;
        case "Down":
          return that.colorScaleDown(d);
        break;
        case "Left":
          return that.colorScaleLeft(d);
        break;
        case "Right":
          return that.colorScaleRight(d);
        break;
      }
    });

  that.createStreetsFlowRepresentations_();
  that.render_();
}

MapGLRendererFlowEstimation.prototype.createColorScales = function() {

  var that = this;

  this.colorScales["Sequential 1"] = d3.scale.linear().domain([0.0,0.25,0.5,0.75,1.0]).range([
    d3.rgb(255, 255, 255),
    d3.rgb(255, 255, 0),
    d3.rgb(255, 127, 0),
    d3.rgb(255, 0, 0),
    d3.rgb(150, 0, 0)]).clamp(true);

  this.colorScales["Sequential 2"] = d3.scale.linear().domain([0.0, 0.25, 0.5, 0.75, 1.0]).range([
    d3.rgb(237, 248, 251),    
    d3.rgb(178, 226, 226),    
    d3.rgb(102, 194, 164),    
    d3.rgb(44, 162, 95),    
    d3.rgb(0, 109, 44)]).clamp(true);

  this.colorScales["Sequential 3"] = d3.scale.linear().domain([0.0, 0.25, 0.5, 0.75, 1.0]).range([
    d3.rgb(245, 235, 226),    
    d3.rgb(251, 180, 185),    
    d3.rgb(247, 104, 161),    
    d3.rgb(197, 27, 138),    
    d3.rgb(122, 1, 119)]).clamp(true);

  this.colorScales["Sequential 4"] = d3.scale.linear().domain([0.0, 0.25, 0.5, 0.75, 1.0]).range([
    d3.rgb(254, 240, 217),    
    d3.rgb(253, 204, 138),    
    d3.rgb(252, 141, 89),    
    d3.rgb(227, 74, 51),    
    d3.rgb(179, 0, 0)]).clamp(true);

  this.colorScales["Sequential 5"] = d3.scale.linear().domain([0.0, 0.25, 0.5, 0.75, 1.0]).range([
    d3.rgb(241, 238, 246),    
    d3.rgb(189, 201, 225),    
    d3.rgb(116, 169, 207),    
    d3.rgb(43, 140, 190),    
    d3.rgb(4, 90, 141)]).clamp(true);

  // this.colorScales["White/Red"] = d3.scale.linear().domain([0.0,1.0]).range([
  //   d3.rgb(255, 255, 255),    
  //   d3.rgb(255, 0, 0)]).clamp(true);

  // this.colorScales["White/Green"] = d3.scale.linear().domain([0.0,1.0]).range([
  //   d3.rgb(255, 255, 255),    
  //   d3.rgb(0, 255, 0)]).clamp(true);

  // this.colorScales["White/Blue"] = d3.scale.linear().domain([0.0,1.0]).range([
  //   d3.rgb(255, 255, 255),    
  //   d3.rgb(0, 0, 255)]).clamp(true);

  // this.colorScales["White/Yellow"] = d3.scale.linear().domain([0.0,1.0]).range([
  //   d3.rgb(255, 255, 255),    
  //   d3.rgb(255, 255, 0)]).clamp(true);

  // this.colorScales["Heat"] = d3.scale.linear().domain([0.0,0.25,0.5,0.75,1.0]).range([
  //   d3.rgb(0, 0, 0),
  //   d3.rgb(150, 0, 0),
  //   d3.rgb(255, 0, 0),
  //   d3.rgb(255, 255, 0),
  //   d3.rgb(255, 255, 255)]).clamp(true);

  // this.colorScales["White/Purple"] = d3.scale.linear().domain([1.0,0.0]).range([     
  //   d3.hsl(264,1.0,0.2),
  //   d3.hsl(264,1,1)
  // ]).clamp(true);

  // this.colorScales["Orange"] = d3.scale.linear().domain([0.0,0.25,0.5,0.75,1.0]).range([
  //   d3.rgb(255,255,212),
  //   d3.rgb(254,217,142),
  //   d3.rgb(254,153,41),
  //   d3.rgb(217,95,14),
  //   d3.rgb(153,52,4)
  // ]).clamp(true);   // white to orange

  // this.colorScales["White/Black"] = d3.scale.linear().domain(
  //     [0.0, 1.0]).range([
  //     d3.rgb(255,255,255),
  //     d3.rgb(0,0,0)
  //   ]).clamp(true);   // grayScale

  

  this.colorScales["Diverging 1"] = d3.scale.linear().domain(
      [0.0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0]).range([

      d3.rgb(0.129412 * 255, 0.4 * 255, 0.67451 * 255),
      d3.rgb(0.262745 * 255, 0.576471 * 255, 0.764706 * 255),
      d3.rgb(0.572549 * 255, 0.772549 * 255, 0.870588 * 255),
      d3.rgb(0.819608 * 255, 0.898039 * 255, 0.941176 * 255),
      d3.rgb(0.968627 * 255, 0.968627 * 255, 0.968627 * 255),
      d3.rgb(0.992157 * 255, 0.858824 * 255, 0.780392 * 255),
      d3.rgb(0.956863 * 255, 0.647059 * 255, 0.509804 * 255),    
      d3.rgb(0.839216 * 255, 0.376471 * 255, 0.301961 * 255),
      d3.rgb(0.698039 * 255, 0.0941176 * 255, 0.168627 * 255),
    ]).clamp(true);   // blue to white to red   
  
  this.colorScales["Diverging 2"] = d3.scale.linear().domain([0.0,0.25,0.5,0.75,1.0]).range([
    d3.rgb(94,60,153),
    d3.rgb(178,171,210),
    d3.rgb(247,247,247),
    d3.rgb(253,184,99),
    d3.rgb(230,97,1)
  ]).clamp(true);

  // this.colorScales["Blue"] = d3.scale.linear().domain([0.0,0.16,0.33,0.5,0.66,0.83,1.0]).range([
    this.colorScales["Blue"] = d3.scale.linear().domain([0.0,0.2,0.4,0.6,0.8,,1.0]).range([
    // this.colorScales["Blue"] = d3.scale.linear().domain([0.0,0.125,0.25,0.375,0.5,0.625,0.75,0.875,1.0]).range([   
    // d3.rgb(247,251,255),
    // d3.rgb(222,235,247),
// d3.rgb(198,219,239),
    d3.rgb(158,202,225),
    d3.rgb(107,174,214),
    d3.rgb(66,146,198),
    d3.rgb(33,113,181),
    d3.rgb(8,81,156),
    d3.rgb(8,48,107)
  ]).clamp(true);


  this.colorScales["Red"] = d3.scale.linear().domain([0.0,0.2,0.4,0.6,0.8,,1.0]).range([
   // d3.rgb(198,219,239),
    // d3.rgb(158,202,225),
    d3.rgb(252,146,114),
    d3.rgb(251,106,74),
    d3.rgb(239,59,44),
    d3.rgb(203,24,29),
    d3.rgb(165,15,21),
    d3.rgb(103,0,13)
  ]).clamp(true);
    

  var colorScaleNames = [];
  for (colorScaleIndex in Object.keys(this.colorScales)) {
    colorScaleNames.push(Object.keys(this.colorScales)[colorScaleIndex]);
  }  

  this.colorScaleAll = this.colorScales["Sequential 1"];
  this.colorScaleUp = this.colorScales["Sequential 2"];
  this.colorScaleDown = this.colorScales["Sequential 3"];
  this.colorScaleLeft = this.colorScales["Sequential 4"];
  this.colorScaleRight = this.colorScales["Sequential 5"];

  // console.log(colorScaleNames);

  d3.select("#analyticsFlowEstimationAllColorScaleOptions").selectAll(".colorScaleOption").data(colorScaleNames)
    .enter()
    .append("option")
      .attr("class", "colorScaleOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;}); 
  document.getElementById('analyticsFlowEstimationAllColorScaleOptions').value="Sequential 1";  

  d3.select("#analyticsFlowEstimationUpColorScaleOptions").selectAll(".colorScaleOption").data(colorScaleNames)
    .enter()
    .append("option")
      .attr("class", "colorScaleOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;}); 
  document.getElementById('analyticsFlowEstimationUpColorScaleOptions').value="Sequential 2";  

  d3.select("#analyticsFlowEstimationDownColorScaleOptions").selectAll(".colorScaleOption").data(colorScaleNames)
    .enter()
    .append("option")
      .attr("class", "colorScaleOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;});
  document.getElementById('analyticsFlowEstimationDownColorScaleOptions').value="Sequential 3";  

  d3.select("#analyticsFlowEstimationLeftColorScaleOptions").selectAll(".colorScaleOption").data(colorScaleNames)
    .enter()
    .append("option")
      .attr("class", "colorScaleOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;});
  document.getElementById('analyticsFlowEstimationLeftColorScaleOptions').value="Sequential 4";  

  d3.select("#analyticsFlowEstimationRightColorScaleOptions").selectAll(".colorScaleOption").data(colorScaleNames)
    .enter()
    .append("option")
      .attr("class", "colorScaleOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;});
  document.getElementById('analyticsFlowEstimationRightColorScaleOptions').value="Sequential 5";  

  this.updateColorScale("All");
  this.updateColorScale("Up");
  this.updateColorScale("Down");
  this.updateColorScale("Left");
  this.updateColorScale("Right");
  

  // d3.select("#dayOfWeekModelsColorScale").selectAll(".colorScaleSample").remove();

  // var resolution = 10;
  // var colorScaleSample = [];
  // for (var colorScaleSampleIndex = 0; colorScaleSampleIndex <= resolution; colorScaleSampleIndex++) {
  //   colorScaleSample.push(colorScaleSampleIndex/resolution);
  // }
  
  // var colorScaleWidth = 220;
  // var colorScaleHeight = 10;

  // d3.select("#dayOfWeekModelsColorScale").selectAll(".colorScaleSample").data(colorScaleSample).enter()
  // .append("div")
  //   .attr("class", "colorScaleSample")
  //   .style("width", ((colorScaleWidth - 10)/(resolution + 1))  + "px")
  //   .style("height", colorScaleHeight + "px")
  //   .style("float", "left")
  //   .style("background", function(d,i) { return that.actualPropertyColorScale(d);});
  
}

MapGLRendererFlowEstimation.prototype.createStationRolesRepresentations_ = function() {
  var renderer = this;
  var geometry = new THREE.Geometry();  
  var stations = this.dataManager_.getStations();    

  if (!this.stationsRoleLayer_ || !stations || this.dataManager_.circulationData[this.period][this.day] == undefined || this.dataManager_.circulationData[this.period][this.day]["deltasAndFrequency"] == undefined)  {
    return;
  } 
  
  that = this;  

  var time = this.timeString;
  
  for (stationindex in stations) {
    var station = stations[stationindex];    
    if (station.id in Object.keys(this.dataManager_.circulationData[this.period][this.day]["deltasAndFrequency"])) {
      
      var state = this.dataManager_.circulationData[this.period][this.day]["deltasAndFrequency"][station.id][time];

      var vertex = renderer.createVertexForStation_(station);
      vertex.z = state.b * 10;
      geometry.vertices.push(vertex);

      var color = new THREE.Color(0x999999);

      var avg = this.dataManager_.circulationData[this.period][this.day]["deltasAndFrequencySum"][time].a.toFixed(2)/stations.length;



      if (state.d > 0) {
        color = new THREE.Color(d3.rgb(230,97,1).hsl().toString());
        // color = color.getHSL();
        color.setHSL(color.getHSL().h,state.a/avg,color.getHSL().l);
      } else if (state.d < 0) {
        color = new THREE.Color(d3.rgb(94,60,153).hsl().toString());
        // color = color.getHSL();
        color.setHSL(color.getHSL().h,state.a/avg,color.getHSL().l);
      }         
      

      geometry.colors.push(color); 
    }
  }  

  if (this.stationsRoleGeometry_) {
    
    this.stationsRoleLayerGeometry_.getObjectByName("streetFlow").geometry.colors = geometry.colors;
    this.stationsRoleLayerGeometry_.getObjectByName("streetFlow").geometry.vertices = geometry.vertices;

    
    this.stationsRoleLayerGeometry_.getObjectByName("streetFlow").geometry.colorsNeedUpdate = true; 

    

  } else {
  
    var material = this.createMaterialForParticles_(20);    
    var particles = new THREE.ParticleSystem(geometry, material);        
    
    particles.name = "streetFlow";
    this.stationsRoleLayerGeometry_.add(particles);  
    
  }
  
  this.stationsRoleGeometry_ = geometry;
  this.stationsRoleLayer_.render();
};

MapGLRendererFlowEstimation.prototype.updateFlowRanges = function() {

  var that = this;

  this.updateFlowNormalizationLimits();

  if (that.useGlobalNormalization) {
    that.allMaxFlow = that.globalTimeMaxFlowAll;
    that.allMinFlow = that.globalTimeMinFlowAll;

    that.upMaxFlow = that.globalTimeMaxFlowAll;
    that.upMinFlow = that.globalTimeMinFlowAll;

    that.downMaxFlow = that.globalTimeMaxFlowAll;
    that.downMinFlow = that.globalTimeMinFlowAll;

    that.leftMaxFlow = that.globalTimeMaxFlowAll;
    that.leftMinFlow = that.globalTimeMinFlowAll;

    that.rightMaxFlow = that.globalTimeMaxFlowAll;
    that.rightMinFlow = that.globalTimeMinFlowAll;
  }


  // console.log("updateFlowRanges");
  // console.log(that.allMaxFlow);
  // console.log(that.upMaxFlow);
  // console.log(that.downMaxFlow);
  // console.log(that.leftMaxFlow);
  // console.log(that.rightMaxFlow);
  $( "#allRangeSlider" ).slider( "option", "min" , that.allMinFlow);
  $( "#allRangeSlider" ).slider( "option", "max" , that.allMaxFlow);
  // $( "#allRangeSlider" ).slider( "option", "values" , [that.allMinFlow, that.allMaxFlow]);
  if (that.allSelectedMin || that.allSelectedMax) {  
    // console.log("entrou");  
    // console.log(that.allMinFlow + "   " + that.allSelectedMin);
    $( "#allRangeSlider" ).slider( "option", "values" , [Math.max(that.allMinFlow, that.allSelectedMin), Math.min(that.allMaxFlow, that.allSelectedMax)]);
    // $( "#allRangeSlider" ).slider( "option", "values" , [that.allSelectedMin, that.allMaxFlow]);
  } else {
    $( "#allRangeSlider" ).slider( "option", "values" , [that.allMinFlow, that.allMaxFlow]);
  }
  // console.log($( "#allRangeSlider" ).slider( "option", "min"));
  // console.log($( "#allRangeSlider" ).slider( "option", "values"));
  // $( "#allRangeSlider" ).slider( "option", "values" , [that.allMinFlow, that.allMaxFlow]);
  $('#allRangeSlider').slider("values", $('#allRangeSlider').slider("values"));
  $( "#flowEstimationAllMinValueLabel" ).text( $( "#allRangeSlider" ).slider( "values", 0 ));
  $( "#flowEstimationAllMaxValueLabel" ).text( $( "#allRangeSlider" ).slider( "values", 1 )); 
  that.allSelectedMin = $( "#allRangeSlider" ).slider( "values", 0 );
  that.allSelectedMax = $( "#allRangeSlider" ).slider( "values", 1 );

  $( "#upRangeSlider" ).slider( "option", "min" , that.upMinFlow);
  $( "#upRangeSlider" ).slider( "option", "max" , that.upMaxFlow);
  // $( "#upRangeSlider" ).slider( "option", "values" , [that.upMinFlow, that.upMaxFlow]);
  if (that.upSelectedMin || that.upSelectedMax) {    
    $( "#upRangeSlider" ).slider( "option", "values" , [Math.max(that.upMinFlow, that.upSelectedMin), Math.min(that.upMaxFlow, that.upSelectedMax)]);
  } else {
    $( "#upRangeSlider" ).slider( "option", "values" , [that.upMinFlow, that.upMaxFlow]);
  }
  $('#upRangeSlider').slider("value", $('#upRangeSlider').slider("value"));
  $( "#flowEstimationUpMinValueLabel" ).text( $( "#upRangeSlider" ).slider( "values", 0 ));
  $( "#flowEstimationUpMaxValueLabel" ).text( $( "#upRangeSlider" ).slider( "values", 1 )); 
  that.upSelectedMin = $( "#upRangeSlider" ).slider( "values", 0 );
  that.upSelectedMax = $( "#upRangeSlider" ).slider( "values", 1 );

  $( "#downRangeSlider" ).slider( "option", "min" , that.downMinFlow);
  $( "#downRangeSlider" ).slider( "option", "max" , that.downMaxFlow);
  // $( "#downRangeSlider" ).slider( "option", "values" , [that.downMinFlow, that.downMaxFlow]);
  if (that.downSelectedMin || that.downSelectedMax) {    
    $( "#downRangeSlider" ).slider( "option", "values" , [Math.max(that.downMinFlow, that.downSelectedMin), Math.min(that.downMaxFlow, that.downSelectedMax)]);
  } else {
    $( "#downRangeSlider" ).slider( "option", "values" , [that.downMinFlow, that.downMaxFlow]);
  }  
  $('#downRangeSlider').slider("value", $('#downRangeSlider').slider("value"));
  $( "#flowEstimationDownMinValueLabel" ).text( $( "#downRangeSlider" ).slider( "values", 0 ));
  $( "#flowEstimationDownMaxValueLabel" ).text( $( "#downRangeSlider" ).slider( "values", 1 )); 
  that.downSelectedMin = $( "#downRangeSlider" ).slider( "values", 0 );
  that.downSelectedMax = $( "#downRangeSlider" ).slider( "values", 1 );

  $( "#leftRangeSlider" ).slider( "option", "min" , that.leftMinFlow);
  $( "#leftRangeSlider" ).slider( "option", "max" , that.leftMaxFlow);
  // $( "#leftRangeSlider" ).slider( "option", "values" , [that.leftMinFlow, that.leftMaxFlow]);
  if (that.leftSelectedMin || that.leftSelectedMax) {    
    $( "#leftRangeSlider" ).slider( "option", "values" , [Math.max(that.leftMinFlow, that.leftSelectedMin), Math.min(that.leftMaxFlow, that.leftSelectedMax)]);
  } else {
    $( "#leftRangeSlider" ).slider( "option", "values" , [that.leftMinFlow, that.leftMaxFlow]);
  }  
  $('#leftRangeSlider').slider("value", $('#leftRangeSlider').slider("value"));
  $( "#flowEstimationLeftMinValueLabel" ).text( $( "#leftRangeSlider" ).slider( "values", 0 ));
  $( "#flowEstimationLeftMaxValueLabel" ).text( $( "#leftRangeSlider" ).slider( "values", 1 )); 
  that.leftSelectedMin = $( "#leftRangeSlider" ).slider( "values", 0 );
  that.leftSelectedMax = $( "#leftRangeSlider" ).slider( "values", 1 );

  $( "#rightRangeSlider" ).slider( "option", "min" , that.rightMinFlow);
  $( "#rightRangeSlider" ).slider( "option", "max" , that.rightMaxFlow);
  // $( "#rightRangeSlider" ).slider( "option", "values" , [that.rightMinFlow, that.rightMaxFlow]);
  if (that.rightSelectedMin || that.rightSelectedMax) {    
    $( "#rightRangeSlider" ).slider( "option", "values" , [Math.max(that.rightMinFlow, that.rightSelectedMin), Math.min(that.rightMaxFlow, that.rightSelectedMax)]);
  } else {
    $( "#rightRangeSlider" ).slider( "option", "values" , [that.rightMinFlow, that.rightMaxFlow]);
  }  
  $('#rightRangeSlider').slider("value", $('#rightRangeSlider').slider("value"));
  $( "#flowEstimationRightMinValueLabel" ).text( $( "#rightRangeSlider" ).slider( "values", 0 ));
  $( "#flowEstimationRightMaxValueLabel" ).text( $( "#rightRangeSlider" ).slider( "values", 1 )); 
  that.rightSelectedMin = $( "#rightRangeSlider" ).slider( "values", 0 );
  that.rightSelectedMax = $( "#rightRangeSlider" ).slider( "values", 1 );
   
}

MapGLRendererFlowEstimation.prototype.pathMatrixLoaded = function() {
  console.log("MapGLRendererFlowEstimation.prototype.pathMatrixLoaded");
}

MapGLRendererFlowEstimation.prototype.createPaths_ = function(paramSourceStation) {

  console.log("MapGLRendererFlowEstimation.prototype.createPaths_");

  var renderer = this;
  var geometry = new THREE.Geometry();  
  var stations = this.dataManager_.getStations();   

  if (!stations || this.dataManager_.pathMatrix == undefined)  {
    return;
  }   
  
  // sourceStation = paramSourceStation;
  sourceStation = stations[264];
  // console.log(sourceStation);

  var that = this;

  
  if (this.streetsFlowGeometry_ != null) {
    while (this.streetsFlowGeometry_.getObjectByName("pathSegment")) {
      this.streetsFlowGeometry_.remove(this.streetsFlowGeometry_.getObjectByName("pathSegment"));
    }
  }  

  // console.log(this.dataManager_.pathMatrix["pathMatrix"][225][22][3]);

  var material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 1,
                           linewidth: 3, vertexColors: THREE.VertexColors } );

  for (destinationStationIndex in stations) {
    // var destinationStation = stations[destinationStationIndex];    
    var destinationStation = paramSourceStation;    
    // var destinationStation = stations[22];  
    console.log(sourceStation); 
    console.log(destinationStation);
    // console.log(destinationStation.id + "    " + sourceStation.id); 
    if (destinationStation.id == sourceStation.id) {
      // console.log("same id");
      continue;
    }

    if (this.dataManager_.pathMatrix["pathMatrix"][sourceStation.id][destinationStation.id] == undefined) {
      // console.log("path undefined");
      continue;
    }

    var path = this.dataManager_.pathMatrix["pathMatrix"][sourceStation.id][destinationStation.id][3];

    // console.log(path);
    // console.log(path.length);

    for (segmentIndex in path) {
      // console.log(segmentIndex);
      // if (Number(segmentIndex)+1 >= path.length) {
      //   break;
      // }
      var edge = this.dataManager_.pathMatrix["edgesList"][path[Number(segmentIndex)]];
      var node1Index = edge[0];
      var node2Index = edge[1];

      var node1 = {latitude: this.dataManager_.pathMatrix["nodeList"][node1Index][1], longitude: this.dataManager_.pathMatrix["nodeList"][node1Index][0]};
      var node2 = {latitude: this.dataManager_.pathMatrix["nodeList"][node2Index][1], longitude: this.dataManager_.pathMatrix["nodeList"][node2Index][0]};

      var vertex1 = renderer.createVertexForStation_(node1);      
      var vertex2 = renderer.createVertexForStation_(node2);

            
      var color = new THREE.Color(0xff0000);
      geometry.vertices.push(vertex1);
      geometry.colors.push(color);

      geometry.vertices.push(vertex2);
      geometry.colors.push(color);

      pathSegment = new THREE.Line(geometry, material, THREE.LinePieces);
      pathSegment.name = "pathSegment";
      this.streetsFlowLayerGeometry_.add(pathSegment); 
    }   
    // return;

    break;
  }      
  
  this.streetsFlowGeometry_ = this.streetsFlowLayerGeometry_;
  
  this.streetsFlowLayer_.render();
}

MapGLRendererFlowEstimation.prototype.createStreetsFlowRepresentations_ = function() {

  // return;

  

  console.log("createStreetsFlowRepresentations_");
  
  var renderer = this;
  var geometry = new THREE.Geometry();  
  var stations = this.dataManager_.getStations();   

  if (!stations || this.dataManager_.circulationData[this.period][this.day] == undefined)  {
    return;
  }   
  
  var that = this;

  
  if (this.streetsFlowGeometry_ != null) {
    while (this.streetsFlowGeometry_.getObjectByName("streetFlow")) {
      this.streetsFlowGeometry_.remove(this.streetsFlowGeometry_.getObjectByName("streetFlow"));
    }
  }

  if (!this.showAllStreets && !this.showUpStreets && !this.showRightStreets && !this.showLeftStreets && !this.showDownStreets) {

    // this.streetsFlowGeometry_ = this.streetsFlowLayerGeometry_;
  
    this.streetsFlowLayer_.render();

    return;
  }

  var time = this.timeIndex1;

  var thickness = 0.0000002;

  var material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 1,
                           linewidth: 3, vertexColors: THREE.VertexColors } );

  // var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 1,
  //                          linewidth: 10 } );

  var streetIndexFlowSet = {};
  var minFlow = 99999999;
  var maxFlow = 0;

  // console.log(this.dataManager_.circulationData);

  
  for (var timeIndex = this.timeIndex1; timeIndex < this.timeIndex2; timeIndex++) {        
    
    for (streetIndex in this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges']) {      
      
      // console.log(streetIndex);

      // if (streetIndexFlowSet[this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex].i] == undefined ) {
        
      //   streetIndexFlowSet[this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex].i] = {count: 0, street: this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex], flow: 0};        
        
      // }
      // streetIndexFlowSet[this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex].i].flow += Number(this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex].f);
      // streetIndexFlowSet[this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex].i].count++;
      
      // console.log(this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex]);

      if (streetIndexFlowSet[this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex]] == undefined ) {

        // console.log(this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex]);        
        
        streetIndexFlowSet[this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex]] = {count: 0, street: this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex][0], flow: 0};        
        
      }
      // streetIndexFlowSet[this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex]].flow += Number(this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex][1]) / (this.timeIndex2 - this.timeIndex1);
      streetIndexFlowSet[this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex]].flow += Number(this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex][1]);
      // streetIndexFlowSet[this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex]].count++;
    }
  }

  // console.log((this.timeIndex2 - this.timeIndex1));

  // for (streetIndexFlowSetEntry in streetIndexFlowSet) {
  //   if (streetIndexFlowSet[streetIndexFlowSetEntry] != undefined) {
      
  //     streetIndexFlowSet[streetIndexFlowSetEntry].flow /= (this.timeIndex2 - this.timeIndex1);      
      
  //   }
  // }

  // for (streetIndexFlowSetEntry in streetIndexFlowSet) {    
  //   var street = streetIndexFlowSet[streetIndexFlowSetEntry].street;
  //   var flow = streetIndexFlowSet[streetIndexFlowSetEntry].flow;     

  //   if (flow < minFlow) {
  //     minFlow = flow;
  //   }
  //   if (flow > maxFlow) {
  //     maxFlow = flow;
  //   }
  // }

 
  // console.log(minFlow + "   " + maxFlow);
  // console.log(that.allSelectedMin, that.allSelectedMax);
  // that.allSelectedMin = 0;
  // that.allSelectedMax = 10;
  // console.log(that.dataManager_.streetsGraph.graphEdges);

  for (streetIndexFlowSetEntry in streetIndexFlowSet) {
      
      // console.log(streetIndexFlowSet[streetIndexFlowSetEntry]);

      var street = streetIndexFlowSet[streetIndexFlowSetEntry].street;
      // var flow = streetIndexFlowSet[streetIndexFlowSetEntry].flow;
      var flow = streetIndexFlowSet[streetIndexFlowSetEntry].flow / (this.timeIndex2 - this.timeIndex1);
      
      // var node1Index = that.dataManager_.streetsGraph.graphEdges[street.i].node1;
      // var node2Index = that.dataManager_.streetsGraph.graphEdges[street.i].node2;
      var node1Index = that.dataManager_.streetsGraph.graphEdges[street].node1;
      var node2Index = that.dataManager_.streetsGraph.graphEdges[street].node2;
      var node1 = that.dataManager_.streetsGraph.graphNodes[node1Index];
      var node2 = that.dataManager_.streetsGraph.graphNodes[node2Index];

      

      var vertex1 = renderer.createVertexForStation_(node1);
      // console.log(vertex1);
      var vertex2 = renderer.createVertexForStation_(node2);
      // console.log(vertex2);

      
      var vertexDiff = new THREE.Vector3( vertex2.x, vertex2.y, 0 );
      vertexDiff.sub(vertex1);
      var horizontalVector = new THREE.Vector3( 1, 0, 0 );

      var angleRad = vertexDiff.angleTo(horizontalVector);
      var angleDeg = THREE.Math.radToDeg(angleRad);
      var angle = angleDeg;

      if (flow < that.allSelectedMin) {
        continue;
      }

      

      if (this.showAllStreets) {        
        // if (angle >= 225 && angle <= 315) { //down 

          // flow = Math.max(Math.min(flow, that.allSelectedMax), that.allSelectedMin); 

          // console.log(flow);                  

          var tempColor = that.colorScaleAll((flow-that.allSelectedMin)/(that.allSelectedMax - that.allSelectedMin));      
          // var tempColor = that.colorScaleAll((flow)*100);      
          var color = new THREE.Color(tempColor);
          geometry.vertices.push(vertex1);
          geometry.colors.push(color);

          geometry.vertices.push(vertex2);
          geometry.colors.push(color);
        // }     
      } else { 

        if (this.showRightStreets) {
          // if ((angle >= 0 && angle <= 45) || (angle >= 315 && angle <= 360)) { //right        
          if (Math.abs(vertexDiff.x) > Math.abs(vertexDiff.y) && vertexDiff.x > 0) { //right        

            flow = Math.max(Math.min(flow, that.rightSelectedMax), that.rightSelectedMin); 

          // console.log(flow);    

            var tempColor = that.colorScaleRight((flow-that.rightSelectedMin)/(that.rightSelectedMax - that.rightSelectedMin));      
            var color = new THREE.Color(tempColor);
            geometry.vertices.push(vertex1);
            geometry.colors.push(color);

            geometry.vertices.push(vertex2);
            geometry.colors.push(color);
          }     
        }  
        
        if (this.showUpStreets) {        
          // if (angle >= 45 && angle <= 135) { //up        
          if (Math.abs(vertexDiff.x) <= Math.abs(vertexDiff.y) && vertexDiff.y <= 0) { //up        

            flow = Math.max(Math.min(flow, that.upSelectedMax), that.upSelectedMin); 

          // console.log(flow);    

            var tempColor = that.colorScaleUp((flow-that.upSelectedMin)/(that.upSelectedMax - that.upSelectedMin));      
            var color = new THREE.Color(tempColor);
            geometry.vertices.push(vertex1);
            geometry.colors.push(color);

            geometry.vertices.push(vertex2);
            geometry.colors.push(color);
          }     
        }   

        if (this.showLeftStreets) {        
          // if (angle >= 135 && angle <= 225) { //left        
          if (Math.abs(vertexDiff.x) > Math.abs(vertexDiff.y) && vertexDiff.x <= 0) { //left        

            flow = Math.max(Math.min(flow, that.leftSelectedMax), that.leftSelectedMin); 

          // console.log(flow);    

            var tempColor = that.colorScaleLeft((flow-that.leftSelectedMin)/(that.leftSelectedMax - that.leftSelectedMin));      
            var color = new THREE.Color(tempColor);
            geometry.vertices.push(vertex1);
            geometry.colors.push(color);

            geometry.vertices.push(vertex2);
            geometry.colors.push(color);
          }     
        }   

        if (this.showDownStreets) {        
          // if (angle >= 225 && angle <= 315) { //down      
          if (Math.abs(vertexDiff.x) <= Math.abs(vertexDiff.y) && vertexDiff.y > 0) { //down

            flow = Math.max(Math.min(flow, that.downSelectedMax), that.downSelectedMin); 

          // console.log(flow);    

            var tempColor = that.colorScaleDown((flow-that.downSelectedMin)/(that.downSelectedMax - that.downSelectedMin));      
            var color = new THREE.Color(tempColor);
            geometry.vertices.push(vertex1);
            geometry.colors.push(color);

            geometry.vertices.push(vertex2);
            geometry.colors.push(color);
          }     
        }      
      }      
      
  }

  
  streetFlow = new THREE.Line(geometry, material, THREE.LinePieces);
  streetFlow.name = "streetFlow";
  this.streetsFlowLayerGeometry_.add(streetFlow);  
       
  
  this.streetsFlowGeometry_ = this.streetsFlowLayerGeometry_;
  
  this.streetsFlowLayer_.render();

  
};

MapGLRendererFlowEstimation.prototype.updateFlowNormalizationLimits = function() {

  var that = this;

  var streetIndexFlowSet = {};
  var minFlow = 99999999;
  var maxFlow = 0;

  if (this.dataManager_.circulationData[this.period] == undefined) {
    return;
  }

  // console.log(this.period);

  // console.log(this.period);
  // console.log(this.day);

  // console.log(this.dataManager_.circulationData);

  for (timeIndex in this.dataManager_.circulationData[this.period][this.day]["streetsFlow"]) {        
    // console.log(timeIndex);
    for (streetIndex in this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges']) {
      if (streetIndexFlowSet[streetIndex] == undefined ) {
        // console.log(this.dataManager_.circulationData[this.day]["streetsFlow"][timeIndex]['edges'][streetIndex].f);
        streetIndexFlowSet[streetIndex] = {count: 0, street: this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex][0], flow: 0};
      }
      streetIndexFlowSet[streetIndex].flow += Number(this.dataManager_.circulationData[this.period][this.day]["streetsFlow"][timeIndex]['edges'][streetIndex][1]);
      streetIndexFlowSet[streetIndex].count++;
    }      
  }

  for (streetIndexFlowSetEntry in streetIndexFlowSet) {
    if (streetIndexFlowSet[streetIndexFlowSetEntry] != undefined) {
      streetIndexFlowSet[streetIndexFlowSetEntry].flow = streetIndexFlowSet[streetIndexFlowSetEntry].flow / streetIndexFlowSet[streetIndexFlowSetEntry].count;      
    }
  }

  for (streetIndexFlowSetEntry in streetIndexFlowSet) {
    // console.log(streetIndexFlowSet[streetIndexFlowSetEntry].flow + "    " + streetIndexFlowSet[streetIndexFlowSetEntry].count); 
    // streetIndexFlowSet[streetIndexFlowSetEntry].flow = streetIndexFlowSet[streetIndexFlowSetEntry].flow / streetIndexFlowSet[streetIndexFlowSetEntry].count;
    var street = streetIndexFlowSet[streetIndexFlowSetEntry].street;
    var flow = streetIndexFlowSet[streetIndexFlowSetEntry].flow;     

    if (flow < minFlow) {
      minFlow = Math.round(flow);
    }
    if (flow > maxFlow) {
      maxFlow = Math.round(flow);
    }
  }

  minFlow = 0;
  maxFlow = 10;

  that.globalTimeMinFlow = minFlow;
  that.globalTimeMaxFlow = maxFlow;

  // console.log(minFlow + "   " + maxFlow);

  // if (this.day == "All") {
  // if (this.day == 0) {
    that.globalTimeMaxFlowAll = maxFlow;
    that.globalTimeMinFlowAll = minFlow;
  // }

  that.allMaxFlow = that.globalTimeMaxFlow;
  that.allMinFlow = that.globalTimeMinFlow;  
  that.rightMaxFlow = that.globalTimeMaxFlow;
  that.rightMinFlow = that.globalTimeMinFlow;  
  that.upMaxFlow = that.globalTimeMaxFlow;
  that.upMinFlow = that.globalTimeMinFlow;  
  that.leftMaxFlow = that.globalTimeMaxFlow;
  that.leftMinFlow = that.globalTimeMinFlow;  
  that.downMaxFlow = that.globalTimeMaxFlow;
  that.downMinFlow = that.globalTimeMinFlow;

  // that.updateFlowRanges();

}

MapGLRendererFlowEstimation.prototype.updateLimits = function() {

  var that = this;

  // console.log(1);

  // if (that.intensityData && that.intensityData[0]) {
  //   return;
  // }  

  // console.log(2);

  // if (that.intensityData == undefined) {
    that.intensityData = [];
    that.timelineMinFlow = 99999999;
    that.timelineMaxFlow = 0;
  // }

  var dayIndex = that.day;
  // dayIndex = 0;

  // console.log(this.dataManager_.circulationData);
  // console.log(this.period);
  // console.log(dayIndex);

  // for (dayIndex in this.dataManager_.circulationData) { 
    // console.log(dayIndex);
    that.intensityData[0] = [];
    // that.stationsFrequency = [];
    // that.stationsDeltas = [];
    // for (timeIndex in this.dataManager_.circulationData[this.period][dayIndex]["streetsFlow"]) {        
    //   that.intensityData[dayIndex].push(0);
    //   for (streetSegment in this.dataManager_.circulationData[this.period][dayIndex]["streetsFlow"][timeIndex]['edges']) {        
    //     that.intensityData[dayIndex][that.intensityData[dayIndex].length -1] += Number(this.dataManager_.circulationData[this.period][dayIndex]["streetsFlow"][timeIndex]['edges'][streetSegment][1]);
    //   }

    //   if (that.intensityData[dayIndex][that.intensityData[dayIndex].length -1] < that.timelineMinFlow) {
    //     that.timelineMinFlow = that.intensityData[dayIndex][that.intensityData[dayIndex].length -1];
    //   }
    //   if (that.intensityData[dayIndex][that.intensityData[dayIndex].length -1] > that.timelineMaxFlow) {
    //     that.timelineMaxFlow = that.intensityData[dayIndex][that.intensityData[dayIndex].length -1];
    //   }

    //   // for (stationIndex in this.dataManager_.circulationData[dayIndex]["frequencies"][timeIndex]) {
    //   //   if (stationIndex in that.stationsFrequency) {
    //   //     that.stationsFrequency[stationIndex] += this.dataManager_.circulationData[dayIndex]["frequencies"][timeIndex][stationIndex];
    //   //     that.stationsDeltas[stationIndex] += this.dataManager_.circulationData[dayIndex]["deltas"][timeIndex][stationIndex];
    //   //   } else {
    //   //     that.stationsFrequency[stationIndex] = this.dataManager_.circulationData[dayIndex]["frequencies"][timeIndex][stationIndex];
    //   //     that.stationsDeltas[stationIndex] = this.dataManager_.circulationData[dayIndex]["deltas"][timeIndex][stationIndex];
    //   //   }
        
    //   // }
    // } 
  // }

  var numDays = 1;

  if (this.dataManager_.circulationData[this.period][dayIndex]['numDays'] != undefined) {
    numDays = this.dataManager_.circulationData[this.period][dayIndex]['numDays'];
  }

  for (timeIndex in this.dataManager_.circulationData[this.period][dayIndex]["frequencies"]) {        
    that.intensityData[0].push(0);
    for (stationIndex in this.dataManager_.circulationData[this.period][dayIndex]["frequencies"][timeIndex]) {        
      that.intensityData[0][that.intensityData[0].length -1] += Number(this.dataManager_.circulationData[this.period][dayIndex]["frequencies"][timeIndex][stationIndex])/numDays;
    }

    if (that.intensityData[0][that.intensityData[0].length -1] < that.timelineMinFlow) {
      that.timelineMinFlow = that.intensityData[0][that.intensityData[0].length -1];
    }
    if (that.intensityData[0][that.intensityData[0].length -1] > that.timelineMaxFlow) {
      that.timelineMaxFlow = that.intensityData[0][that.intensityData[0].length -1];
    }
   
  } 

  // console.log(that.stationsFrequency);
  console.log(that.timelineMinFlow + "   " + that.timelineMaxFlow);
  that.timelineMinFlow = 0;
  that.timelineMaxFlow = 3000;
}

MapGLRendererFlowEstimation.prototype.updateTimeline = function() {

  console.log("updateTimeline");

  var that = this;   

  var analyticsFlowEstimationTimelineBars = d3.select("#analyticsFlowEstimationTimelineBars");

  // console.log(that.intensityData);
  // console.log(that.timelineMaxFlow);

  var barsSamples = analyticsFlowEstimationTimelineBars.selectAll(".analyticsFlowEstimationTimelineBarsSample")
    .data(that.intensityData[0])
    .attr("y", function(d,i) { return that.analyticsContainer.timeline.height - that.analyticsContainer.timeline.height * ((d)/(that.timelineMaxFlow));})
    .attr("height", function(d,i) {return that.analyticsContainer.timeline.height * ((d)/(that.timelineMaxFlow));});
    

  // barsSamples.selectAll("svg:title").text(function(d,i) { return d;});
}

MapGLRendererFlowEstimation.prototype.weekCirculationLoaded = function(day, period) {

  var that = this;

  this.day = day;
  this.period = period;

  console.log("MapGLRendererFlowEstimation.weekCirculationLoaded");
  // console.log(this.period);
  // console.log(this.day);
  // console.log(this.dataManager_.circulationData);
  d3.selectAll("#analyticsFlowEstimationTimeline").remove();

  // this.updateFlowNormalizationLimits();
  that.updateFlowRanges();


  var tempBrushExtent = undefined;
  if (this.analyticsContainer.timeline) {
    tempBrushExtent = this.analyticsContainer.timeline.brushExtent;
  }
  this.analyticsContainer.timeline = new AnalyticsFlowEstimationTimeline(this.dataManager_, "analyticsFlowEstimationTimelineDiv", this.day);             
  this.analyticsContainer.timeline.mapGLRenderer = this;  
  this.updateLimits();  
  this.updateTimeline();  
  if (tempBrushExtent) {
    this.analyticsContainer.timeline.brushExtent = tempBrushExtent;
    this.analyticsContainer.timeline.updateBrushExtent();
  }
   else {
    var tempBeginDate = new Date(this.analyticsContainer.timeline.beginDate);
    tempBeginDate.setHours(tempBeginDate.getHours()+8);

    var tempEndDate = new Date(this.analyticsContainer.timeline.beginDate);
    tempEndDate.setHours(tempEndDate.getHours()+10);

    this.analyticsContainer.timeline.brushExtent = [[tempBeginDate ,0],[tempEndDate,1]];
    this.analyticsContainer.timeline.updateBrushExtent();
  }
  // this.createStationRolesRepresentations_();
  // this.createStreetsFlowRepresentations_();


  // this.globalTimeMaxFlow = 0;
  // for (timeIndex in this.dataManager_.circulationData[this.day]["streetsFlow"]) {
  //     if (this.globalTimeMaxFlow < this.dataManager_.circulationData[this.day]["streetsFlow"][timeIndex]["maxFlow"]) {
  //       this.globalTimeMaxFlow = this.dataManager_.circulationData[this.day]["streetsFlow"][timeIndex]["maxFlow"];
  //     }
  // } 

  this.dayChanged = true; 
  // this.createStationRolesRepresentations_();
  // this.createStreetsFlowRepresentations_();
  this.render_();
};

MapGLRendererFlowEstimation.prototype.createSelectedStationsRepresentations_ = function() {
  
  // this.createPathsRepresentations_();
  // this.createDistanceRepresentations_();
  
};


/**
 * Updates and render geometry.
 */
MapGLRendererFlowEstimation.prototype.update = function() {
  if (!this.stationsRoleLayer_) {
    return;
  }   

  this.render_();

  if (this.playing) {
    console.log("playing");
    
    this.analyticsContainer.timeline.updateBrushExtentPlaying();      
  }
};


/**
 * Renders layer.
 */
MapGLRendererFlowEstimation.prototype.render_ = function() {

  // console.log("MapGLRendererFlowEstimation.prototype.render_");

  var renderer = this;
  if (this.streetsFlowLayerGeometry_) {
    this.streetsFlowLayerGeometry_.traverse(function(child) {
      child.visible = renderer.showStreets;
    });
  }
  // this.stationsRoleLayerGeometry_.traverse(function(child) {
  //   child.visible = renderer.showRoles;
  // });

  // this.streetsFlowLayer_.render();
  // this.stationsRoleLayer_.render();

  // if (this.playing) {
  //   console.log("playing");
    
  //   setTimeout(this.analyticsContainer.timeline.updateBrushExtentPlaying, 2000);

  //   // this.analyticsContainer.timeline.updateBrushExtentPlaying();      
  // }

  if (!this.playing) {
    return;
  }

  setTimeout(function() {
    renderer.analyticsContainer.timeline.updateBrushExtentPlaying(renderer.analyticsContainer.timeline);
  }, 500)
};


/**
 * Initializes GL layer for render on top of the map.
 */
MapGLRendererFlowEstimation.prototype.initialize = function(map) {

  // console.log("MapGLRendererFlowEstimation.prototype.initialize");

  var that = this;

  var renderer = this;

  // console.log("1");
  // console.log(map);

  if (!Detector.webgl) {
    // console.log("1.1");
    Detector.addGetWebGLMessage();
    return;
  }

  new ThreejsLayer({ map: map }, function(layer) {
    // console.log(renderer);
    renderer.streetsFlowLayer_ = layer;

    renderer.streetsFlowLayerGeometry_ = new THREE.Object3D();
    renderer.streetsFlowLayer_.add(renderer.streetsFlowLayerGeometry_);    
    
    renderer.update();    
  });

  new ThreejsLayer({ map: map }, function(layer) {
    // console.log(renderer);
    // renderer.layer_ = layer;

    // renderer.geometry_ = new THREE.Object3D();
    // renderer.layer_.add(renderer.geometry_);

    // renderer.stationsGeometry_ = {};

    renderer.stationsRoleLayer_ = layer;

    renderer.stationsRoleLayerGeometry_ = new THREE.Object3D();
    renderer.stationsRoleLayer_.add(renderer.stationsRoleLayerGeometry_);

    // renderer.stationsRoleGeometry_ = {};

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

    // that.dataManager_.loadCirculationFilesforVisualizationFromFile("2013-01-08", that);
    
  });

  this.useGlobalNormalization = true;
  // this.dayOfWeek = 9; 
  this.dayOfWeek = 0; 
  this.allSelectedMin = undefined;
  this.allSelectedMax = undefined;
  this.upSelectedMin = undefined;
  this.upSelectedMax = undefined;
  this.downSelectedMin = undefined;
  this.downSelectedMax = undefined;
  this.leftSelectedMin = undefined;
  this.leftSelectedMax = undefined;
  this.rightSelectedMin = undefined;
  this.rightSelectedMax = undefined;

  // this.allSelectedMin = 0;
  // this.allSelectedMax = 10;
  // this.upSelectedMin = 0;
  // this.upSelectedMax = 10;
  // this.downSelectedMin = 0;
  // this.downSelectedMax = 10;
  // this.leftSelectedMin = 0;
  // this.leftSelectedMax = 10;
  // this.rightSelectedMin = 0;
  // this.rightSelectedMax = 10;

  // console.log("2");

  var periodOptions = ["All", "06 2013", "07 2013", "08 2013", "09 2013", "10 2013", "11 2013", "12 2013", "01 2014", "02 2014", "Summer 2013", "Fall 2013", "Winter 2013"];

  d3.select("#analyticsFlowPeriod").selectAll(".flowPeriodOption").data(periodOptions).enter()
    .append("option")
      .attr("class", "flowPeriodOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;});

  // this.dayOfWeek = "All";
  this.dayOfWeek = 0;
  this.period = "All";
  // this.dataManager_.getStationsDayOfWeekModels(this, this.period);

  // this.dataManager_.getWeekCirculation(this.dayOfWeek, this.period, this);
  // this.dataManager_.getPathMatrix(this);
  this.initialized_ = true;

  
};

// MapGLRendererFlowEstimation.prototype.circulationLoaded = function() {

//   console.log("MapGLRendererFlowEstimation.circulationLoaded"); 
//   this.createStationRolesRepresentations_();
// };


/**
 * Generates a sprite to use for particle renderer.
 * @static
 */
MapGLRendererFlowEstimation.generateSprite = function() {
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
