
/**
 * Class to show plots analytics about the data.
 *
 */
var DayOfWeekModelsMatrixViewer = function(dataManager, viewerContainerId) {
  dataManager.addListener(this);
  // Lazy initialization.
  this.initialized_ = false;
  this.active_ = false;
  this.containerId_ = viewerContainerId;
  this.dataManager_ = dataManager;

  // These containers must be shown/hidden on activation.
  this.visibleContainersId_ = [
    '#' + this.containerId_
  ];

  this.matrixTop = 20;
  this.matrixLeft = 0;

  this.colorScales = [];  
  
  this.dayOfWeek = 0;
  this.variable = "b";
  this.variablesList = [];
  this.stations = [];
  this.orderLists = [];

  // this.dataManager_.getDayOfWeekModels(this.dayOfWeek,this);

  // return; //remove later to enable this viz

  this.dataManager_.loadStations(this);
  

  this.actualOrderingList = {orderedStations: []}; 
  for (stationOrder in this.actualOrderingList.orderedStations) {
    this.actualOrderingList.orderedStations[stationOrder].orderHistory = [];
  }
  this.ordering = "Balance (bikes/capacity): max";

  this.useGlobalNormalization = true;

  this.displayAndOrderLocked = true;
  
}

DayOfWeekModelsMatrixViewer.prototype.createColorScales = function() {

  var that = this;

  this.colorScales["Blue/White/Red"] = d3.scale.linear().domain(
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
    ]).clamp(true);;   // blue to white to red 

  this.colorScales["Black/White"] = d3.scale.linear().domain(
      [0.0, 1.0]).range([
      d3.rgb(0,0,0),
      d3.rgb(255,255,255)      
    ]).clamp(true);;   // grayScale

  this.colorScales["White/Orange"] = d3.scale.linear().domain([0.0,0.25,0.5,0.75,1.0]).range([
    d3.rgb(255,255,212),
    d3.rgb(254,217,142),
    d3.rgb(254,153,41),
    d3.rgb(217,95,14),
    d3.rgb(153,52,4)
  ]).clamp(true);;   // white to orange
  
  this.colorScales["Purple/White/Orange"] = d3.scale.linear().domain([0.0,0.25,0.5,0.75,1.0]).range([
    d3.rgb(94,60,153),
    d3.rgb(178,171,210),
    d3.rgb(247,247,247),
    d3.rgb(253,184,99),
    d3.rgb(230,97,1)
  ]).clamp(true);;

  this.colorScales["Purple/White"] = d3.scale.linear().domain([1.0,0.0]).range([
    d3.hsl(264,1,1),    
    d3.hsl(264,1.0,0.2)
  ]).clamp(true);

  this.colorScales["Heat"] = d3.scale.linear().domain([0.0,0.25,0.5,0.75,1.0]).range([
    d3.rgb(0, 0, 0),
    d3.rgb(150, 0, 0),
    d3.rgb(255, 0, 0),
    d3.rgb(255, 255, 0),
    d3.rgb(255, 255, 255)]).clamp(true);

  var colorScaleNames = [];
  for (colorScaleIndex in Object.keys(this.colorScales)) {
    colorScaleNames.push(Object.keys(this.colorScales)[colorScaleIndex]);
  }  

  d3.select("#analyticsDayOfModelsColorScaleOptions").selectAll(".dayOfWeekModelsColorScaleOption").data(colorScaleNames).enter()
    .append("option")
      .attr("class", "dayOfWeekModelsColorScaleOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;}); 


  
  this.actualPropertyColorScale = this.colorScales["Blue/White/Red"];  

  d3.select("#dayOfWeekModelsColorScale").selectAll(".dayOfWeekModelsColorScaleSample").remove();

  var resolution = 10;
  var colorScaleSample = [];
  for (var colorScaleSampleIndex = 0; colorScaleSampleIndex <= resolution; colorScaleSampleIndex++) {
    colorScaleSample.push(colorScaleSampleIndex/resolution);
  }
  
  var colorScaleWidth = 220;
  var colorScaleHeight = 10;

  d3.select("#dayOfWeekModelsColorScale").selectAll(".dayOfWeekModelsColorScaleSample").data(colorScaleSample).enter()
  .append("div")
    .attr("class", "dayOfWeekModelsColorScaleSample")
    .style("width", ((colorScaleWidth - 10)/(resolution + 1))  + "px")
    .style("height", colorScaleHeight + "px")
    .style("float", "left")
    .style("background", function(d,i) { return that.actualPropertyColorScale(d);});
  
}

DayOfWeekModelsMatrixViewer.prototype.reorderLines = function() {

  var that = this;  

  var orderingVariable = this.variableNametoKeyMap[that.ordering.split(": ")[0]];
  var orderingStat = that.ordering.split(": ")[1];
  
  var element = document.getElementById('analyticsDayOfModelsOrdering');

  element.value = this.variableKeyToNameMap[orderingVariable] + ": " + orderingStat;

  var element = document.getElementById('analyticsDayOfModelsVariables');

  element.value = this.variableKeyToNameMap[this.variable];


  var newOrderingList =  this.stations.slice(0);
  for (newOrderingListIndex in newOrderingList) {
    newOrderingList[newOrderingListIndex].posInStationsList = newOrderingListIndex;
  }  
  newOrderingList.sort(
    function(a, b) {
      var keyA = 0;
      var keyB = 0; 
      

      if (orderingStat == "Id") {
        keyA = a.id;
        keyB = b.id;
      } else if (orderingStat == "Latitude") {
        keyA = a.latitude;
        keyB = b.latitude;
      } else if (orderingStat == "Longitude") {
        keyA = a.longitude;
        keyB = b.longitude;
      } else if (orderingStat == "Name") {
        keyA = a.name;
        keyB = b.name;
      } else if (orderingStat == "Number") {
        keyA = a.number;
        keyB = b.number;
      } else {

        var tsA = [];
        var tsB = [];  
        
        if (that.usingCalendarDayData) {
          if (that.dataManager_.stationsDayActivity[that.calendarDay][a.number] == undefined ||
            that.dataManager_.stationsDayActivity[that.calendarDay][a.number][orderingVariable] == undefined) {
          
            var index = newOrderingList.indexOf(a); 
            if (index > -1) {     
              newOrderingList[index].orderingValue = -1;        
            }

            return -1;
          }

          tsA = Array.prototype.slice.call(that.dataManager_.stationsDayActivity[that.calendarDay][a.number][orderingVariable]);        
          tsA = tsA.slice(that.brushExtent[0][0], that.brushExtent[1][0]);

          if (that.dataManager_.stationsDayActivity[that.calendarDay][b.number] == undefined ||
            that.dataManager_.stationsDayActivity[that.calendarDay][b.number][orderingVariable] == undefined) {
            var index = newOrderingList.indexOf(b); 
            if (index > -1) {     
              newOrderingList[index].orderingValue = -1;        
            }

            return 1;
          }

          tsB = Array.prototype.slice.call(that.dataManager_.stationsDayActivity[that.calendarDay][b.number][orderingVariable]);        
          tsB = tsB.slice(that.brushExtent[0][0], that.brushExtent[1][0]);
        } else {
          if (that.dataManager_.stationsDayOfWeekModels[that.period][a.number][that.dayOfWeek][orderingVariable] == undefined) {
          
            var index = newOrderingList.indexOf(a); 
            if (index > -1) {     
              newOrderingList[index].orderingValue = -1;        
            }

            return -1;
          }

          tsA = Array.prototype.slice.call(that.dataManager_.stationsDayOfWeekModels[that.period][a.number][that.dayOfWeek][orderingVariable]["a"]);        
          tsA = tsA.slice(that.brushExtent[0][0], that.brushExtent[1][0]);          

          // console.log(that.period);
          // console.log(b.number);
          // console.log(that.dayOfWeek);

          if (that.dataManager_.stationsDayOfWeekModels[that.period][b.number][that.dayOfWeek][orderingVariable] == undefined) {
            var index = newOrderingList.indexOf(b); 
            if (index > -1) {     
              newOrderingList[index].orderingValue = -1;        
            }

            return 1;
          }

          tsB = Array.prototype.slice.call(that.dataManager_.stationsDayOfWeekModels[that.period][b.number][that.dayOfWeek][orderingVariable]["a"]);        
          tsB = tsB.slice(that.brushExtent[0][0], that.brushExtent[1][0]);
        }


        if (orderingStat == "mean") {    
          keyA = d3.mean(tsA);
          keyB = d3.mean(tsB);
        } else if (orderingStat == "sum") {    
          keyA = d3.sum(tsA);
          keyB = d3.sum(tsB);
        } else if (orderingStat == "min") {    
          keyA = d3.min(tsA);
          keyB = d3.min(tsB);
        } else if (orderingStat == "max") {    
          keyA = d3.max(tsA);
          keyB = d3.max(tsB);
        } else if (orderingStat == "range") {
          var extendA = d3.extent(tsA);
          keyA = extendA[1] - extendA[0];
          
          var extendB = d3.extent(tsB);
          keyB = extendB[1] - extendB[0];
        }
      } 

      
      var index = newOrderingList.indexOf(a); 
      if (index > -1) {     
        newOrderingList[index].orderingValue = keyA;        
      }


      index = newOrderingList.indexOf(b);
      if (index > -1) {     
        newOrderingList[index].orderingValue = keyB;
      }

      if(keyA < keyB) return -1;
      if(keyA > keyB) return 1;
      return 0;
    }); 

  newOrderingList.reverse();

  // console.log(this.stations);

  if (this.brushExtent[0][0] != undefined) {


    for (stationOrder in newOrderingList) {
      // console.log(newOrderingList[stationOrder]);
      if (this.stations[newOrderingList[stationOrder].posInStationsList].orderHistory == undefined) {
        this.stations[newOrderingList[stationOrder].posInStationsList].orderHistory = [];
      }
      var index = Math.floor(this.brushExtent[0][0] + (this.brushExtent[1][0] - this.brushExtent[0][0])/2);

      this.stations[newOrderingList[stationOrder].posInStationsList].orderHistory.push([Math.floor(this.brushExtent[0][0] + (this.brushExtent[1][0] - this.brushExtent[0][0])/2), stationOrder]);
      // newOrderingList[stationOrder].orderHistory.push([Math.floor(this.brushExtent[0][0] + (this.brushExtent[1][0] - this.brushExtent[0][0])/2), stationOrder]);
    }

    // console.log(this.stations[135].orderHistory);

  }

  

  this.actualOrderingList.orderedStations = newOrderingList;  

  if (this.mapViewer != undefined) {
    this.mapViewer.selectionAreaSizeChanged(0);
  }
  
}

DayOfWeekModelsMatrixViewer.prototype.createOrderLists = function() {

  var that = this;

  stats = ["mean", "min", "max", "range"];  

  var orderingNames = [];
  for (variableIndex in Object.keys(this.dataManager_.stationsDayOfWeekModels[that.period][72][0])) {   

    if (Object.keys(this.dataManager_.stationsDayOfWeekModels[that.period][72][0])[variableIndex].indexOf("SD") != -1) {
      continue;
    }

    if (Object.keys(this.dataManager_.stationsDayOfWeekModels[that.period][72][0])[variableIndex] == "st") {
      continue;
    }
    var variable = this.variableKeyToNameMap[Object.keys(this.dataManager_.stationsDayOfWeekModels[that.period][72][0])[variableIndex]];
    // for (statIndex in Object.keys(this.dataManager_.stationsDayOfWeekModels[313][0]["stats"][variable])) {
    //   var stat = Object.keys(this.dataManager_.stationsDayOfWeekModels[313][0]["stats"][variable])[statIndex];
    //   var orderingListName = variable + " " + stat;      
    // }
    for (stat in stats) {      
      orderingNames.push(variable + ": " + stats[stat]); 
    }
  }
 

  orderingNames.unshift("Station: Latitude");
  orderingNames.unshift("Station: Longitude");
  // orderingNames.unshift("Station: Size");
  orderingNames.unshift("Station: Name");
  orderingNames.unshift("Station: Number");
  orderingNames.unshift("Station: Id");

  orderingNames.sort();  

  // this.orderLists["Station Id"] = {name: "Station Id", orderedStations: []};      
  // this.orderLists["Station Latitude"] = {name: "Station Latitude", orderedStations: []}; 
  // this.orderLists["Station Longitude"] = {name: "Station Longitude", orderedStations: []};   
  // this.orderLists["Station Size"] = {name: "Station Size", orderedStations: []}; 
  // this.orderLists["Station Name"] = {name: "Station Name", orderedStations: []}; 
  // this.orderLists["Station Number"] = {name: "Station Number", orderedStations: []}; 

  
  // for (index in this.orderLists) {
  //   orderingNames.push(this.orderLists[index].name);
  // }
  
  d3.select("#analyticsDayOfModelsOrdering").selectAll(".dayOfWeekModelsNonStationOrderingOption").data(orderingNames).enter()
    .append("option")
      .attr("class", "dayOfWeekModelsNonStationOrderingOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;}); 

  // this.stations = this.dataManager_.stations;
  this.stations = [];
  for (stationIndex in this.dataManager_.stations) {
    if (this.dataManager_.stations[stationIndex].id in Object.keys(this.dataManager_.stationsDayOfWeekModels[that.period])) {
      this.stations.push(this.dataManager_.stations[stationIndex]);
    }
  }



  // console.log(that.period);
  // console.log(that.dayOfWeek);

  // console.log(that.dataManager_.stationsDayOfWeekModels[that.period]);

  that.maxCapacity = 0;
  that.minCapacity = 99999;

  this.stations.forEach(function (station, index) {
    // console.log(station.number);
    station.order = index;
    station.dataArray = [];
    station.value = 0;
    station.selected = false;
    station.capacity = 0;
    if (that.dataManager_.stationsDayOfWeekModels[that.period][station.number] != undefined) {
      station.capacity = d3.mean(that.dataManager_.stationsDayOfWeekModels[that.period][station.number][that.dayOfWeek]["c"]["a"]);
      if (station.capacity < that.minCapacity) {
        that.minCapacity = station.capacity;
      }
      if (station.capacity > that.maxCapacity) {
        that.maxCapacity = station.capacity;
      }
    }
  });

  this.mapViewer.createStationsLayer(this.stations);
  // console.log(this.stations);

}

DayOfWeekModelsMatrixViewer.prototype.setVariablesList = function() {

  var that = this;

  this.variableKeyToNameMap = [];
  this.variableKeyToNameMap["b"] = "Balance (bikes/capacity)";
  this.variableKeyToNameMap["bSD"] = "Balance StdDev";
  this.variableKeyToNameMap["bi"] = "Bikes Available";
  this.variableKeyToNameMap["biSD"] = "Bikes Available StdDev";
  this.variableKeyToNameMap["biI"] = "Bikes arrival";
  this.variableKeyToNameMap["biISD"] = "Bikes arrival StdDev";
  this.variableKeyToNameMap["biIF"] = "Bikes arrival frequency (arrivals/minute)";
  this.variableKeyToNameMap["biIFSD"] = "Bikes arrival frequency StdDev";
  this.variableKeyToNameMap["biO"] = "Bikes take out";
  this.variableKeyToNameMap["biOSD"] = "Bikes take out StdDev";
  this.variableKeyToNameMap["biOF"] = "Bikes take out frequency (take outs/minute)";
  this.variableKeyToNameMap["biOFSD"] = "Bikes take out frequency StdDev";
  this.variableKeyToNameMap["c"] = "Station capacity";
  this.variableKeyToNameMap["cSD"] = "Station capacity StdDev";
  this.variableKeyToNameMap["f"] = "Frequency ((arrivals+takeouts)/minute)";
  this.variableKeyToNameMap["fSD"] = "Frequency StdDev";
  this.variableKeyToNameMap["s"] = "Free slots";
  this.variableKeyToNameMap["sSD"] = "Free slots StdDev";  
  this.variableKeyToNameMap["Station"] = "Station";  

  this.variableNametoKeyMap = [];
  for (key in this.variableKeyToNameMap) {
    this.variableNametoKeyMap[this.variableKeyToNameMap[key]] = key;    
  }

  // console.log(this.variableNametoKeyMap);
  


  for (variable in Object.keys(this.dataManager_.stationsDayOfWeekModels[that.period][72][0])) {

    if (Object.keys(this.dataManager_.stationsDayOfWeekModels[that.period][72][0])[variable].indexOf("SD") != -1) {
      continue;
    }

    if (Object.keys(this.dataManager_.stationsDayOfWeekModels[that.period][72][0])[variable] != "st") {
      this.variablesList.push(this.variableKeyToNameMap[Object.keys(this.dataManager_.stationsDayOfWeekModels[that.period][72][0])[variable]]);
    }
  }

  this.variablesList.sort();

  d3.select("#analyticsDayOfModelsVariables").selectAll(".dayOfWeekModelsVariableOption").data(this.variablesList).enter()
    .append("option")
      .attr("class", "dayOfWeekModelsVariableOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;});

  this.variable = "b";  
  
  // this.stations = Object.keys(this.dataManager_.stationsDayOfWeekModels).map(function(i) {
  //   // console.log(i);
  //   return { 
  //       id: i
  //   };
  // });

  // console.log(this.variablesList);
  this.createOrderLists();
  this.reorderLines();
}

DayOfWeekModelsMatrixViewer.prototype.stationsLoaded = function() {
  // console.log(this.dataManager_.stations);
  // this.dataManager_.getStationsDayOfWeekModels(this);

  

  var periodOptions = ["All", "06 2013", "07 2013", "08 2013", "09 2013", "10 2013", "11 2013", "12 2013", "01 2014", "02 2014", "03 2014", "04 2014", "05 2014", "06 2014", "07 2014", "08 2014", "09 2014", "Summer 2013", "Fall 2013", "Winter 2013", "Spring 2014", "Summer 2014"];

  d3.select("#analyticsDayOfModelsPeriod").selectAll(".dayOfWeekModelsPeriodOption").data(periodOptions).enter()
    .append("option")
      .attr("class", "dayOfWeekModelsVariableOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;});

  this.period = "All";
  this.dataManager_.getStationsDayOfWeekModels(this, this.period);
  this.brushExtent = [];
  this.brushExtent[0] = [];  
  this.brushExtent[1] = [];
  this.brushExtent[0][1] = 0;
  this.brushExtent[1][1] = this.dataManager_.stations.length-1;
}

DayOfWeekModelsMatrixViewer.prototype.stationsDayActivityLoaded  = function() {
  console.log(this.dataManager_.stationsDayActivity);
  // if (!this.stationsDayOfWeekModelLoadedBefore) {
  //   this.setVariablesList();
  //   this.createColorScales();  
  //   this.stationsDayOfWeekModelLoadedBefore = true; 
  // }

  this.usingCalendarDayData = true;
  this.usingPeriodDayOfWeekData = false;

  // this.updateRangeSliderLimits = true;

  this.createMatrix(); 
  // console.log(this.dataManager_.dayOfWeekModels[dayOfWeek]);
  console.log("stationsDayActivityLoaded");
}

DayOfWeekModelsMatrixViewer.prototype.stationsDayOfWeekModelLoaded = function() {
  // console.log(this.dataManager_.stationsDayOfWeekModels);
  if (!this.stationsDayOfWeekModelLoadedBefore) {
    this.setVariablesList();
    this.createColorScales();  
    this.stationsDayOfWeekModelLoadedBefore = true; 
    this.globalMinValue = 0.0;
    this.globalMaxValue = 1.0;
    this.actualMinValue = 0.0;
    this.actualMaxValue = 1.0;
    this.updateRangeSliderLimits = true;
  }

  this.usingCalendarDayData = false;
  this.usingPeriodDayOfWeekData = true;

  // this.updateRangeSliderLimits = true;

  this.createMatrix(); 
  // console.log(this.dataManager_.dayOfWeekModels[dayOfWeek]);
  // console.log("stationsDayOfWeekModelLoaded");

  d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer").style("display", "none");
  d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerLeftContainer").style("display", "none");
}

DayOfWeekModelsMatrixViewer.prototype.toLocalTime = function(time) {
  var newTime = time;
  newTime.setHours(newTime.getHours() - 6);
  return newTime;
}

DayOfWeekModelsMatrixViewer.prototype.updateColorScale = function() {

  var that = this;

  d3.select("#dayOfWeekModelsColorScale").selectAll(".dayOfWeekModelsColorScaleSample").remove();

  var resolution = 10;
  var colorScaleSample = [];
  for (var colorScaleSampleIndex = 0; colorScaleSampleIndex <= resolution; colorScaleSampleIndex++) {
    colorScaleSample.push(colorScaleSampleIndex/resolution);
  }

  // console.log(colorScaleSample);

  var colorScaleWidth = 220;
  var colorScaleHeight = 10;

  d3.select("#dayOfWeekModelsColorScale").selectAll(".dayOfWeekModelsColorScaleSample").data(colorScaleSample).enter()
  .append("div")
    .attr("class", "dayOfWeekModelsColorScaleSample")
    .style("width", ((colorScaleWidth - 10)/(resolution + 1))  + "px")
    .style("height", colorScaleHeight + "px")
    .style("float", "left")
    .style("background", function(d,i) { return that.actualPropertyColorScale(d);});

  this.createMatrix();
}

DayOfWeekModelsMatrixViewer.prototype.updateMatrix = function() {
  this.createMatrix();
}

DayOfWeekModelsMatrixViewer.prototype.getFormatedValue = function(value, variableName) {


  if (variableName.indexOf("StdDev") != -1) {
    return value.toFixed(2);
  }  

  if (variableName == "Bikes Available" ||
    variableName == "Free slots" ||
    variableName == "Station capacity" ||
    variableName == "Bikes arrival" ||
    variableName == "Bikes take out" ||
    variableName == "Station: Id" ||
    variableName == "Station: Number" ||
    variableName == "Station capacity") {

    return Math.round(value);
  }

  if (variableName == "Station: Name" ||
    variableName == "Station: Latitude" ||
    variableName == "Station: Longitude") {

    return "";
  }

  return value.toFixed(3);  
}

DayOfWeekModelsMatrixViewer.prototype.updateValuesRange = function() {

  var that = this;

  if (that.lastPointedStationOrder >= 0 && !that.useGlobalNormalization) {
    var min = d3.min(that.ts[that.lastPointedStationOrder]);
    var max = d3.max(that.ts[that.lastPointedStationOrder]);
    d3.select("#dayofWeekModelsMinValueLabel")
      .text(that.getFormatedValue(min, that.variable));
    d3.select("#dayofWeekModelsMaxValueLabel")
      .text(that.getFormatedValue(max, that.variable));
  } else {
    // d3.select("#dayofWeekModelsMinValueLabel")
    //   .text(that.getFormatedValue(that.globalMinValue, that.variable));
    // d3.select("#dayofWeekModelsMaxValueLabel")
    //   .text(that.getFormatedValue(that.globalMaxValue, that.variable));    
  }
}

DayOfWeekModelsMatrixViewer.prototype.updateCursorSelectionInfo = function(orderIndex) {
  var that = this;

  if (orderIndex < 0) {
    d3.select("#daysOfWeekModelsInfoCursorId")
      .text("Id:");
    d3.select("#daysOfWeekModelsInfoCursorNumber")
      .text("Number:");
    d3.select("#daysOfWeekModelsInfoCursorName")
      .text("Name:");
    d3.select("#daysOfWeekModelsInfoCursorRank")
      .text("Rank:");
    d3.select("#daysOfWeekModelsInfoCursorRankingValue")
      .text("Ranking value:");
  } else {
    d3.select("#daysOfWeekModelsInfoCursorId")
      .text("Id: " + that.actualOrderingList.orderedStations[orderIndex].id);
    d3.select("#daysOfWeekModelsInfoCursorNumber")
      .text("Number:" + that.actualOrderingList.orderedStations[orderIndex].number);
    d3.select("#daysOfWeekModelsInfoCursorName")
      .text("Name: " + that.actualOrderingList.orderedStations[orderIndex].name);
    d3.select("#daysOfWeekModelsInfoCursorRank")
      .text("Rank:" + orderIndex);
    d3.select("#daysOfWeekModelsInfoCursorRankingValue")
      .text("Ranking value:" + that.getFormatedValue(that.actualOrderingList.orderedStations[orderIndex].orderingValue, that.ordering));
  }
}

DayOfWeekModelsMatrixViewer.prototype.pointedStation = function(orderIndex) {

  var that = this;

  this.unpointedStation(this.lastPointedStationOrder);
  if (this.actualOrderingList.orderedStations[orderIndex] == undefined) {
    return;
  }
  var thisId = this.actualOrderingList.orderedStations[orderIndex].id; 
  d3.select("#dayOfWeekModelsStationRepresentationShadow"+thisId)
    .attr("opacity", 1.0); 
  d3.select("#dayOfWeekModelsStationRepresentation"+thisId)
    .attr("opacity", 1.0)
    // .attr("r", 9);
    .attr("stroke",  "black")
    .attr("stroke-width",  "2.5px");
  this.lastPointedStationOrder = orderIndex;
  this.updateValuesRange();  

  d3.select("#dayOfWeekmodelsTopStationsListLabel"+orderIndex)
    .style("font-size", "14px") 
    .style("font-weight", "bold");
  d3.select("#dayOfWeekmodelsLastStationsListLabel"+orderIndex)
    .style("font-size", "14px") 
    .style("font-weight", "bold");

  d3.select("#dayOfWeekModelsStationInAreaListLabel"+orderIndex)
    .style("font-size", "14px") 
    .style("font-weight", "bold");

  // d3.selectAll("#dayOfWeekModelsStationRepresentationText" + this.actualOrderingList.orderedStations[orderIndex].id)
  //   .attr("fill-opacity", "1.0");

  that.updateCursorSelectionInfo(orderIndex);

  if (!that.cursorOverMatrix) {
    // return;
    that.updatedMatrixPointedLine(this.lastPointedStationOrder);
  }

  

  var svg = d3.selectAll('#daysOfWeekModelsTableSvg');
  svg.select("#dayOfWeekModelsOrderHistoryLine").remove();
  svg.select("#dayOfWeekModelsOrderHistoryLineShadow").remove();
  
  var lineFunc = d3.svg.line()
  .x(function(d) {
    return that.xScale(d[0]);
  })
  .y(function(d) {
    return that.yScale(d[1]);
  })
  .interpolate('monotone');

  var shadowLineFunc = d3.svg.line()
  .x(function(d) {
    return that.xScale(d[0])+2;
  })
  .y(function(d) {
    return that.yScale(d[1])+2;
  })
  .interpolate('monotone');

  svg.append('svg:path')
  .attr('d', shadowLineFunc(that.stations[this.actualOrderingList.orderedStations[this.lastPointedStationOrder].posInStationsList].orderHistory))
  .attr('pointer-events', 'none')
  .attr('stroke', 'black')
  .attr('stroke-width', 5)
  .attr('opacity', 0.7)
  .attr('fill', 'none')
  .attr("id", "dayOfWeekModelsOrderHistoryLineShadow");

  svg.append('svg:path')
  .attr('d', lineFunc(that.stations[this.actualOrderingList.orderedStations[this.lastPointedStationOrder].posInStationsList].orderHistory))
  .attr('stroke', '#DDDDDD')
  .attr('pointer-events', 'none')
  .attr('stroke-width', 4)
  .attr('opacity', 1.0)
  .attr('fill', 'none')
  .attr("id", "dayOfWeekModelsOrderHistoryLine");

  
  // for (index in that.stations[this.actualOrderingList.orderedStations[this.lastPointedStationOrder].posInStationsList].orderHistory) {
  //   d3.select("#dayOfWeekModelsOrderHistoryLine").remove();

  // }   

}

DayOfWeekModelsMatrixViewer.prototype.updatedMatrixPointedLine = function(orderIndex) {

  var that = this;

  d3.selectAll("#daysOfWeekModelsMatrixPointedStationLine").remove();

  // console.log(orderIndex);

  if (orderIndex < 0) {
    return;
  }

  var selectedStationLine = orderIndex;
  var selectedLineGroupData = that.ts[selectedStationLine]; 

  var selectedLineGroup = d3.select("#daysOfWeekModelsTableSvg").append("g")
    .attr("id", "daysOfWeekModelsMatrixPointedStationLine")          
    // .attr("transform", "translate(0, " + (selectedStationLine * that.matrixCellHeight - that.matrixCellHeight/2) + ")");
    .attr("transform", "translate(0, 0)");

  var minValue = that.globalMinValue;
  var maxValue = that.globalMaxValue;

  if (!that.useGlobalNormalization) {
    minValue = d3.min(selectedLineGroupData);
    maxValue = d3.max(selectedLineGroupData);
  }
  
  // console.log(selectedLineGroupData);

  selectedLineGroup.selectAll(".daysOfWeekModelsMatrixPointedStationLineSamples")
    .data(selectedLineGroupData)
    .enter()
    .append("rect")    
    .attr("x", function(d,i) {        
      return i * that.matrixCellWidth;
    })
    .attr("y", function(d,i) { 
      return selectedStationLine * that.matrixCellHeight -that.matrixCellHeight*4;
    })
    .attr("height", function(d,i) {
      return that.matrixCellHeight * 8;
    })      
    .attr("width", function(d) {
      return that.matrixCellWidth;
    })
    .attr("class", "daysOfWeekModelsMatrixPointedStationLineSamples")      
    .attr("fill", function(d,i) {
      // return that.actualPropertyColorScale((d-minValue)/maxValue);
      return that.actualPropertyColorScale(Math.max(0,(d-that.actualMinValue))/(that.actualMaxValue - that.actualMinValue));
    })      
    .attr("stroke", "white")      
    .attr("stroke-width", 1.0);

  selectedLineGroup
    .insert("rect", ".daysOfWeekModelsMatrixPointedStationLineSamples")
    .attr("x", 0)
    .attr("y", selectedStationLine * that.matrixCellHeight -that.matrixCellHeight*4 - 2)
    .attr("height", that.matrixCellHeight * 8 + 9)      
    .attr("width", that.matrixCellWidth * that.ts[0].length)
    .attr("fill", "black")
    .attr("fill-opacity", 0.4);

  selectedLineGroup
    .insert("rect", ".daysOfWeekModelsMatrixPointedStationLineSamples")
    .attr("x", 0)
    .attr("y", selectedStationLine * that.matrixCellHeight -that.matrixCellHeight*4 - 2)
    .attr("height", that.matrixCellHeight * 8 + 7)      
    .attr("width", that.matrixCellWidth * that.ts[0].length)
    .attr("fill", "black")
    .attr("fill-opacity", 0.6);




  
}

DayOfWeekModelsMatrixViewer.prototype.unpointedStation = function(orderIndex) {

  var that = this;

  if (this.actualOrderingList.orderedStations[orderIndex] == undefined) {
    return;
  }

  // d3.selectAll("#dayOfWeekModelsStationRepresentationText" + this.actualOrderingList.orderedStations[orderIndex].id)
  //   .attr("fill-opacity", "0.0");

  var thisId = this.actualOrderingList.orderedStations[orderIndex].id;  
  d3.select("#dayOfWeekModelsStationRepresentationShadow"+thisId)
    .attr("opacity", function(d){return (d.selected || that.brushExtent == undefined) ? 1.0 : 0.0;});
        
  d3.select("#dayOfWeekModelsStationRepresentation"+thisId)
    .attr("opacity", function(d){return (d.selected || that.brushExtent == undefined) ? 1.0 : 0.1;})
    // .attr("r", 4.5);
    .attr("stroke",  "gray")
    .attr("stroke-width",  "1.5px");

  d3.select("#dayOfWeekmodelsTopStationsListLabel"+orderIndex)
    .style("font-size", "11px") 
    .style("font-weight", "normal");
  d3.select("#dayOfWeekmodelsLastStationsListLabel"+orderIndex)
    .style("font-size", "11px") 
    .style("font-weight", "normal");

  d3.select("#dayOfWeekModelsStationInAreaListLabel"+orderIndex)
    .style("font-size", "11px") 
    .style("font-weight", "normal");

  this.lastPointedStationOrder = -1;
  that.updateCursorSelectionInfo(-1);
  this.updateValuesRange();
}

DayOfWeekModelsMatrixViewer.prototype.updateRankingLists = function() {

  var that = this;

  var topStations = [];

  // console.log(this.brushExtent);

  var len = Math.min(10, this.brushExtent[1][1] - this.brushExtent[0][1]) ; 
  // console.log("len: " + len);

  if (len == 0) {
    this.brushExtent[0][1] = 0;
    this.brushExtent[1][1] = that.actualOrderingList.orderedStations.length - 1;
    len = Math.min(10, this.brushExtent[1][1] - this.brushExtent[0][1]);
  }

  for (var i = this.brushExtent[0][1]; i < this.brushExtent[0][1] + len; i++) {
    topStations.push(i);    
  }



  // console.log(topStations);

  d3.select("#daysOfWeekModelsTopStationsList").selectAll(".dayOfWeekmodelsStationinTop10List").remove();

  d3.select("#daysOfWeekModelsTopStationsList").selectAll(".dayOfWeekmodelsStationinTop10List").data(topStations).enter()
  .append("div")
    .attr("class", "dayOfWeekmodelsStationinTop10List")
    .style("min-height", "20px")

    // .attr("width", "100%")
    // .style("background-color", function(d,i){
    //   var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
    //   return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
    // })
    .attr("padding-left", "10px")
    .each(function(d,i) {     
      

      if (that.actualOrderingList.orderedStations[d] == undefined) {
        return;
      }

      var svg = d3.select(this).append("svg")
        .attr("width", "20px")
        .attr("height", "20px")
        .style("float", "left");

      svg.append("svg:circle")
          .attr("r", function(d) {
            return 3 + 7 * Math.sqrt((that.actualOrderingList.orderedStations[d].capacity - that.minCapacity) / (that.maxCapacity - that.minCapacity)/3.1416);
          })
          // .attr("fill", function(d) {
          //   var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
          //   return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
          // })
          .attr("fill", function(d) {

            var value = (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);

            return that.actualPropertyColorScale(value);        
            //var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
            //return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
          })          
          .attr("cx", 10)
          .attr("cy", 10)          
          .attr("stroke",  "gray")
          .attr("stroke-width",  "1.5px");

      d3.select(this).append("label")
        // .style("background-color", backgroundColor) 
        .style("color", "black") 
        .style("font-size", "11px")  
        .style("font-weight", "normal")         
        .attr("id", "dayOfWeekmodelsTopStationsListLabel" + d)
        .attr("class", "dayOfWeekmodelsTopStationsListLabel")
        .text(function(d,i) {         
          

          var thisOrderingValue = that.actualOrderingList.orderedStations[d].orderingValue;

          
          return that.getFormatedValue(thisOrderingValue, that.ordering) + " - " + that.actualOrderingList.orderedStations[d].name;
        }); 
    })
    .on("mouseover", function(d,i){
      // that.pointedStation(that.brushExtent[0][1] + i);
      that.pointedStation(d);
    })
    .on("mouseout", function(d,i){
      // that.unpointedStation(that.brushExtent[0][1] + i);
    });


  var lastStations = []

  var len = Math.min(10, this.brushExtent[1][1] - this.brushExtent[0][1])  

  for (var i = this.brushExtent[1][1] - 1; i > this.brushExtent[1][1] - 1 - len; i--) {
    lastStations.push(i);    
  }

  lastStations.reverse();

  d3.select("#daysOfWeekModelsLastStationsList").selectAll(".dayOfWeekmodelsStationinLast10List").remove();

  d3.select("#daysOfWeekModelsLastStationsList").selectAll(".dayOfWeekmodelsStationinLast10List").data(lastStations).enter()
  .append("div")
    .attr("class", "dayOfWeekmodelsStationinLast10List")
    .style("min-height", "20px")
    // .style("background-color", function(d,i){
    //   var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
    //   return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
    // })
    // .attr("width", "100%")
    .attr("padding-left", "10px")
    .each(function(d,i) {
      
      var stationId = that.actualOrderingList.orderedStations[d].id;                
      
      
      if (that.actualOrderingList.orderedStations[d] == undefined) {
        return;
      }

      var svg = d3.select(this).append("svg")
        .attr("width", "20px")
        .attr("height", "20px")
        .style("float", "left");

      svg.append("svg:circle")
          .attr("r", function(d) {
            return 3 + 7 * Math.sqrt((that.actualOrderingList.orderedStations[d].capacity - that.minCapacity) / (that.maxCapacity - that.minCapacity)/3.1416);
          })
          // .attr("fill", function(d) {
          //   var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
          //   return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
          // })
          .attr("fill", function(d) {

            var value = (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);

            // var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
            // return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";

            return that.actualPropertyColorScale(value); 
          })
          .attr("cx", 10)
          .attr("cy", 10)          
          .attr("stroke",  "gray")
          .attr("stroke-width",  "1.5px");

      d3.select(this).append("label")
        .style("color", "black")
        .style("font-size", "11px")
        .style("font-weight", "normal")
        .attr("id", "dayOfWeekmodelsLastStationsListLabel" + d)                       
        .attr("class", "dayOfWeekmodelsLastStationsListLabel")
        .text(function(d,i) {
          
          var thisOrderingValue = that.actualOrderingList.orderedStations[d].orderingValue;

          
          return that.getFormatedValue(thisOrderingValue, that.ordering) + " - " + that.actualOrderingList.orderedStations[d].name;
        }); 
    }).on("mouseover", function(d,i){
      that.pointedStation(d);
    })
    .on("mouseout", function(d,i){
      // that.unpointedStation(that.brushExtent[0][1] + i);
    });
  
}

DayOfWeekModelsMatrixViewer.prototype.updateStationsInAreaList = function() {

  var that = this;

  if (this.mapViewer == undefined || this.mapViewer.stationsInAreaList == undefined) {
    return;
  }

  d3.select("#dayOfWeekModelsAreaStationsList").selectAll(".dayOfWeekModelsStationInAreaList").remove();

  d3.select("#dayOfWeekModelsAreaStationsList").selectAll(".dayOfWeekModelsStationInAreaList").data(this.mapViewer.stationsInAreaList).enter()
  .append("div")
    .attr("class", "dayOfWeekModelsStationInAreaList")
    .style("min-height", "20px")

    // .attr("width", "100%")
    // .style("background-color", function(d,i){
    //   var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
    //   return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
    // })
    .attr("padding-left", "10px")
    .each(function(d,i) {     
      
      // console.log(d);
      if (that.actualOrderingList.orderedStations[d] == undefined) {
        return;
      }

      var svg = d3.select(this).append("svg")
        .attr("width", "20px")
        .attr("height", "20px")
        .style("float", "left");

      svg.append("svg:circle")
          .attr("r", function(d) {
            return 3 + 7 * Math.sqrt((that.actualOrderingList.orderedStations[d].capacity - that.minCapacity) / (that.maxCapacity - that.minCapacity)/3.1416);
          })
          .attr("fill", function(d) {
            var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
            return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
          })
          .attr("cx", 10)
          .attr("cy", 10)          
          .attr("stroke",  "gray")
          .attr("stroke-width",  "1.5px");

      d3.select(this).append("label")
        // .style("background-color", backgroundColor) 
        .style("color", "black") 
        .style("font-size", "11px")  
        .style("font-weight", "normal")         
        .attr("id", "dayOfWeekModelsStationInAreaListLabel" + d)
        .attr("class", "dayOfWeekModelsStationInAreaListLabel")
        .text(function(d,i) {         
          

          var thisOrderingValue = that.actualOrderingList.orderedStations[d].orderingValue;

          
          return that.getFormatedValue(thisOrderingValue, that.ordering) + " - " + that.actualOrderingList.orderedStations[d].name;
        }); 
    })
    .on("mouseover", function(d,i){
      // that.pointedStation(that.brushExtent[0][1] + i);
      that.pointedStation(d);
    })
    .on("mouseout", function(d,i){
      // that.unpointedStation(that.brushExtent[0][1] + i);
    });
}

DayOfWeekModelsMatrixViewer.prototype.createMatrixsetOfTimeseries = function() {  
  var that = this;

  var ts = [];

  // var sampleCount = 97;
  var stationCount = that.actualOrderingList.orderedStations.length;
  
  var minValue = 999999;
  var maxValue = 0;

  if (that.usingCalendarDayData) {
    that.actualOrderingList.orderedStations.forEach(function(station, index) {

      var stationOrderingPos = station.number;   

      // console.log(that.calendarDay);
      // console.log(stationOrderingPos);
      
      if (station.orderinValue == -1 || that.dataManager_.stationsDayActivity[that.calendarDay][stationOrderingPos] == undefined || that.dataManager_.stationsDayActivity[that.calendarDay][stationOrderingPos][that.variable] == undefined) {
        ts[index] = [];
      } else {
        ts[index] = that.dataManager_.stationsDayActivity[that.calendarDay][stationOrderingPos][that.variable];
      }
      
    });

    minValue = d3.min(ts, function(s) {return d3.min(s);});
    maxValue = d3.max(ts, function(s) {return d3.max(s);});
    
  } else {

    // console.log(that.dataManager_.stationsDayOfWeekModels);

    for (var forDayOfWeek = 0; forDayOfWeek < 7; forDayOfWeek++) {

      var ts = [];
      // console.log(that.variable);
      that.actualOrderingList.orderedStations.forEach(function(station, index) {

        var stationOrderingPos = station.number;   

        // console.log(station);
        
        if (station.orderingValue == -1 || that.dataManager_.stationsDayOfWeekModels[that.period][stationOrderingPos][forDayOfWeek][that.variable] == undefined) {
          ts[index] = [];
        } else {
          ts[index] = that.dataManager_.stationsDayOfWeekModels[that.period][stationOrderingPos][forDayOfWeek][that.variable]["a"];
        }
        
      });

      // that.ts = ts;
      if (minValue > d3.min(ts, function(s) {return d3.min(s);})) {
        minValue = d3.min(ts, function(s) {return d3.min(s);});
      }

      if (maxValue < d3.max(ts, function(s) {return d3.max(s);})) {
        maxValue = d3.max(ts, function(s) {return d3.max(s);});
      }
      
    }   

    that.actualOrderingList.orderedStations.forEach(function(station, index) {

      var stationOrderingPos = station.number;   

      // console.log(station);
      
      if (station.orderingValue == -1 || that.dataManager_.stationsDayOfWeekModels[that.period][stationOrderingPos][that.dayOfWeek][that.variable] == undefined) {
        ts[index] = [];
      } else {
        ts[index] = that.dataManager_.stationsDayOfWeekModels[that.period][stationOrderingPos][that.dayOfWeek][that.variable]["a"];
      }
      
    });
  }

  // that.globalMinValue = minValue;
  // that.globalMaxValue = maxValue;

  that.ts = ts;
}

DayOfWeekModelsMatrixViewer.prototype.createMatrix = function() {  

  var that = this;  

  var sampleCount = 97;
  var stationCount = that.actualOrderingList.orderedStations.length;

  this.createMatrixsetOfTimeseries();

  var ts = this.ts;

  var minValue = that.globalMinValue;
  var maxValue = that.globalMaxValue;

  // console.log(that.variable);

  if (that.updateRangeSliderLimits) {

    

    // that.actualMinValue = that.globalMinValue;
    // that.actualMaxValue = that.globalMaxValue;

    // console.log(that.actualMaxValue);
    $( "#dayOFWeekValueRangeSlider" ).slider( "option", "step", (that.actualMaxValue - that.actualMinValue)/100.0 );
    $( "#dayOFWeekValueRangeSlider" ).slider( "option", "min" , that.actualMinValue);
    $( "#dayOFWeekValueRangeSlider" ).slider( "option", "max" , that.actualMaxValue);    
         
    $( "#dayOFWeekValueRangeSlider" ).slider( "option", "values" , [that.actualMinValue, that.actualMaxValue]);
    
    $('#dayOFWeekValueRangeSlider').slider("value", $('#dayOFWeekValueRangeSlider').slider("value"));
    $( "#dayofWeekModelsMinValueLabel" ).text( $( "#dayOFWeekValueRangeSlider" ).slider( "values", 0 ));
    $( "#dayofWeekModelsMaxValueLabel" ).text( $( "#dayOFWeekValueRangeSlider" ).slider( "values", 1 )); 

    
  }

  that.updateRangeSliderLimits = false;
  
  // var stationCount = that.actualOrderingList.orderedStations.length;  

  // var minValue = 999999;
  // var maxValue = 0;

  // for (var forDayOfWeek = 0; forDayOfWeek < 7; forDayOfWeek++) {

  //   var ts = [];
    
  //   that.actualOrderingList.orderedStations.forEach(function(station, index) {

  //     var stationOrderingPos = station.id;   

      
      
  //     if (station.orderingValue == -1 || that.dataManager_.stationsDayOfWeekModels[that.period][stationOrderingPos][forDayOfWeek][that.variable] == undefined) {
  //       ts[index] = [];
  //     } else {
  //       ts[index] = that.dataManager_.stationsDayOfWeekModels[that.period][stationOrderingPos][forDayOfWeek][that.variable]["a"];
  //     }
      
  //   });

    
  //   if (minValue > d3.min(ts, function(s) {return d3.min(s);})) {
  //     minValue = d3.min(ts, function(s) {return d3.min(s);});
  //   }

  //   if (maxValue < d3.max(ts, function(s) {return d3.max(s);})) {
  //     maxValue = d3.max(ts, function(s) {return d3.max(s);});
  //   }
    
  // }

  // that.globalMinValue = minValue;
  // that.globalMaxValue = maxValue;

  // var ts = [];
  // that.actualOrderingList.orderedStations.forEach(function(station, index) {

  //   var stationOrderingPos = station.id;   
        
  //   if (station.orderingValue == -1 || that.dataManager_.stationsDayOfWeekModels[that.period][stationOrderingPos][that.dayOfWeek][that.variable] == undefined) {
  //     ts[index] = [];
  //   } else {
  //     ts[index] = that.dataManager_.stationsDayOfWeekModels[that.period][stationOrderingPos][that.dayOfWeek][that.variable]["a"];
  //   }
    
  // });

  // that.ts = ts;

       
  /**
   * Updates filter table using an array of stations, and
   * an array of timeseries, indexed by station.id.
   */
  var updateFilterTable = function(lines, ts, colorScale) {
    // Creates svg container.
    var svgWidth = d3.select('#modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer')[0][0].clientWidth - that.matrixLeft;    
    var svgHeight = d3.select('#modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer')[0][0].clientHeight - that.matrixTop;
    


    var parentDiv = d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer");

    
    var tableCanvasDiv = parentDiv.selectAll('#dayOfWeekModelsTableCanvasDiv').data(['dayOfWeekModelsTableCanvasDiv']).enter().append('div');
    tableCanvasDiv
      .attr("id", "tableCanvasDiv") 
      .style("position", "relative")      
      .style("height", svgHeight + "px")
      .style("width", svgWidth + "px")
      .style("left", that.matrixLeft + "px")       
      // .style("top", "-20px")      
      // .style("top", (-svgHeight) + "px");
      .style("top", (that.matrixTop - 20) + "px");
   
    var tableCanvas = tableCanvasDiv.selectAll('canvas').data(['dayOfWeekModelsTableCanvas']).enter().append('canvas');
    tableCanvas
      .attr("id", "dayOfWeekModelsTableCanvas")
      .attr("height", (svgHeight) + "px")
      .attr("width", svgWidth + "px");    

    var canvas=document.getElementById('dayOfWeekModelsTableCanvas');
    var ctx=canvas.getContext('2d');
    // Store the current transformation matrix
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    ctx.restore();

    // console.log(that.dataManager_.stationsDayOfWeekModels[stationOrderingPos][that.dayOfWeek]);


    // var minValue = d3.min(ts, function(s) {return d3.min(s);});
    // var maxValue = d3.max(ts, function(s) {return d3.max(s);});

    // that.globalMinValue = minValue;
    // that.globalMaxValue = maxValue;

    // console.log("Range: " + minValue + " - " + maxValue);
    // console.log("lines.length: " + lines.length);

    var cellWidth = svgWidth / sampleCount;
    var cellHeight = svgHeight / lines.length;     

    lines.forEach(function(station, lineIndex) {

      // var stationOrderingPos = that.actualOrderingList.orderedStations[station.id].id;
      // var stationOrderingPos = that.actualOrderingList.orderedStations[lineIndex].id;

      // if (ts[stationOrderingPos] == undefined) {
      //   return;
      // }

      

      samples = ts[lineIndex];
      if (!that.useGlobalNormalization) {
        minValue = d3.min(samples);
        maxValue = d3.max(samples);
      } else {
        minValue = that.actualMinValue;
        maxValue = that.actualMaxValue;
        // console.log(that.actualMaxValue);
      }
      samples.forEach(function(sample, index) {            
        ctx.fillStyle=colorScale((sample-minValue)/(maxValue-minValue));        
        ctx.fillRect(index*cellWidth,lineIndex*cellHeight,cellWidth+1,cellHeight+1);        
      });

      that.matrixCellWidth = cellWidth;
      that.matrixCellHeight = cellHeight;

      // console.log(ts[station.id]);
    });

    // for (i=0;i<10;i++){
    //    ctx.lineWidth = 0.25+i;
    //    ctx.beginPath();
    //    ctx.moveTo(5+i*14,5);
    //    ctx.lineTo(20+i*14,140);
    //    ctx.stroke();
    // }

    var svgDiv = parentDiv.selectAll('#dayOfWeekModelsSvgDiv').data(['dayOfWeekModelsSvgDiv']).enter().append('div');
    svgDiv
      .attr("id", "dayOfWeekModelsSvgDiv")      
      .style("position", "relative")      
      .style("height", (svgHeight + that.matrixTop) + "px")
      .style("width", svgWidth + "px")
      .style("left", that.matrixLeft + "px")      
      .style("top", (-(svgHeight-(that.matrixTop-20))) + "px");
      // .style("top", (that.matrixTop) + "px");

    var svg = svgDiv.selectAll('svg').data(['svg']);
    svg.enter().append('svg')
      .style("height" , "960px")
      .style("width" , "764px")
      .style("visibility", "inherit");       

    var g = svg.selectAll('#dayOfWeekModelsSvgGroup').data(['g']);
    g.enter().append('g')
      .style("visibility", "inherit") 
      .attr("id", "dayOfWeekModelsSvgGroup")
      .attr('transform', 'translate(' + 0 + ',' + 0 + ')');


    // var beginDate = that.toLocalTime(new Date("2013-07-20 06:00:00"));  
    // var endDate = that.toLocalTime(new Date("2013-07-21 06:00:00"));
    var beginDate = new Date(1374292800000);  
    beginDate.setHours(0);
    var endDate = new Date(1374379200000);
    endDate.setHours(0);

    // console.log(beginDate);
    // console.log(endDate);

    var xScale = d3.time.scale().domain([beginDate, endDate]).range([0, svgWidth]);      
    
    var xAxis = d3.svg.axis()
      .scale(xScale)
      .tickFormat(d3.time.format('%H'))
      .orient("bottom");    

    var matrixAxis = g.selectAll('.matrixAxis').data(['matrixAxis']);
    matrixAxis.enter().append("g")
      .attr("class", "matrixAxis")          
      .attr("transform", "translate(0, 0)");
    matrixAxis
      .call(xAxis);

    var matrixGroup = g.selectAll('#matrixGroup').data(['matrixGroup']);
    matrixGroup.enter().append('g')
      .style("visibility", "inherit")
      .attr("id", "matrixGroup")
      .attr('transform', 'translate(' + 0 + ',' + 20 + ')');

    var tableSvg = matrixGroup.selectAll('#daysOfWeekModelsTableSvg').data(['tableSvg']);
    tableSvg
      .enter().append('g')
      .style("visibility", "inherit")
      // .attr('width', svgWidth)
      .attr('id', "daysOfWeekModelsTableSvg");
      // .attr('height', svgHeight);    
    

    updateFilterTableBrush(tableSvg, svgWidth, svgHeight);
  };
   
  var updateFilterTableBrush = function(svg, width, height) {

    // console.log("updateFilterTableBrush");
    // console.log(width);
    // console.log(height);

    var xScale = d3.scale.linear().domain([0, sampleCount]).range([0, width]);
    var yScale = d3.scale.linear().domain([0, stationCount]).range([0, height]);

    that.xScale = xScale;
    that.yScale = yScale;
      
    var brush = d3.svg.brush()      
      .x(xScale)
      .y(yScale)
      .on('brush', brushed)
      .on('brushend', function() {
        // console.log("brushend");
        var extent0 = brush.extent(),
          extent1;
        
        extent1 = extent0.map(function(corner) {
            return corner.map(Math.round);
        });     

        console.log(brush.empty());
        
        if (that.brushExtent[0][0] != extent1[0][0] || 
          that.brushExtent[1][0] != extent1[1][0]
          || brush.empty()) {

          that.brushExtent = extent1;

          if (brush.empty()) {
            that.brushExtent[0] = [0,0];
            that.brushExtent[1] = [that.ts[0].length,that.ts.length];
          }

          // console.log(that.brushExtent);
          
          that.reorderLines();
          that.updateRankingLists();       
          that.updateMatrix();
        }

        
      });

    that.brush = brush;
      
    var gBrush = svg.selectAll('.brush').data(['brush']);
    gBrush.enter().append("g")
      // .style("display", "inherit")
      // .style("visibility", "inherit")      
      .classed('brush', true)
      .attr("id", "dayOfWeekModelsBrush")   
      .on("mousemove", function(){
        // console.log(d3.mouse(this));

        var thisLineId = Math.floor(d3.mouse(this)[1]/that.matrixCellHeight);

        // that.unpointedStation(that.lastPointedStationId);
        that.pointedStation(thisLineId);
        that.cursorOverMatrix = true;
      })
      .on("mouseout", function(){
        // console.log(d3.mouse(this));

        // var thisLineId = Math.floor(d3.mouse(this)[1]/that.matrixCellHeight);

        // that.unpointedStation(that.lastPointedStationId);
        that.unpointedStation(that.lastPointedStationOrder);
        that.cursorOverMatrix = false;
      })
      .on("mouseover", function(){
        d3.selectAll("#daysOfWeekModelsMatrixPointedStationLine").remove();
        that.cursorOverMatrix = true;
      })
      .on("click", function(){
        console.log("click");
        for (stationIndex in that.stations) {          
          that.stations[stationIndex].orderHistory = [];         
        }
      })
      .on("dblclick", function(){
        console.log("dblclick");

        // var thisLineId = Math.floor(d3.mouse(this)[1]/that.matrixCellHeight);

        // that.unpointedStation(that.lastPointedStationId);
        that.reorderLines();
        that.createMatrix();
      });

    // if (that.ordering.split(" ")[0] == "Station" && that.ordering.split(" ")[1] != "Size") {
    //   d3.selectAll(".dayOfWeekModelsStationRepresentation")        
    //     .attr("fill", "hsl(" + (0.1 * 360) + ", 100%, 50%)");
    // } else {
    //   d3.selectAll(".dayOfWeekModelsStationRepresentation")        
    //     // .attr("fill", function(d) {
    //     //   var sat = 100 * (d.orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
    //     //   return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
    //     // });        
    //     .attr("fill", function(d) {

    //       // if (d.selected) {

    //         var value = (d.orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);

    //         return that.actualPropertyColorScale(value);                  

    //       // } else {
    //       //   return "hsl(" + (0.1 * 360) + ", 0%, 50%)";
    //       // }
    //     });       
    // }

    // d3.select("#matrixGroup")
    // .on("mouseover", function(){
    //   console.log(d3.mouse(this));
    // });

    gBrush.call(brush);

      
    function brushed() {
      // console.log("brushed");
      var extent0 = brush.extent(),
          extent1;
        
      extent1 = extent0.map(function(corner) {
          return corner.map(Math.round);
      });     
      that.brushExtent[0][1] = extent1[0][1];
      that.brushExtent[1][1] = extent1[1][1];
      that.actualOrderingList.orderedStations.forEach(function(station, order) {
        if (order >= that.brushExtent[0][1] && order < that.brushExtent[1][1]) {
          station.selected = true;
        } else {
          station.selected = false;
        }
      });   
      that.mapViewer.updateStationsLayer(that.stations);
      that.updateRankingLists();

      var timeWindowBegin = new Date();
      timeWindowBegin.setHours(0);
      timeWindowBegin.setSeconds(0);
      timeWindowBegin.setMinutes(extent1[0][0]*15);
      // console.log(extent1[0][0]);
      // console.log(timeWindowBegin.toTimeString());
      // 1000*that.brushExtent[0][0]*15*60);
      var timeWindowEnd = new Date();
      timeWindowEnd.setHours(0);
      timeWindowEnd.setSeconds(0);
      timeWindowEnd.setMinutes((extent1[1][0])*15);

      for (var i = that.brushExtent[0][1]; i < that.brushExtent[1][1]; i++) {
        d3.select("#dayOfWeekModelsStationRepresentation" + that.actualOrderingList.orderedStations[i].id)
          // .attr("fill", function(d) {

          //   var sat = 100 * (that.actualOrderingList.orderedStations[i].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
          //   // console.log(sat);
          //   return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
          // });
          .attr("fill", function(d) {

            if (!that.actualOrderingList.orderedStations[i].selected) {
              return "hsl(" + (0.1 * 360) + ", 0%, 50%)";
            }

            var value = (that.actualOrderingList.orderedStations[i].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);

            return that.actualPropertyColorScale(value);        
            //var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
            //return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
          }) ; 
      }

      d3.select("#daysOfWeekModelsInfoBrushTimeWindow").text("Time window: " + timeWindowBegin.toTimeString().split(" ")[0] + " <-> " + timeWindowEnd.toTimeString().split(" ")[0]);
      d3.select("#daysOfWeekModelsInfoBrushRowRange").text("Row range: " + that.brushExtent[0][1] + " <-> " + (that.brushExtent[1][1]-1));
      d3.select(this).call(brush.extent(extent1));  
    }

    if (that.brushExtent != undefined) {
      that.actualOrderingList.orderedStations.forEach(function(station, order) {
        if (order >= that.brushExtent[0][1] && order < that.brushExtent[1][1]) {
          station.selected = true;
        } else {
          station.selected = false;
        }
      }); 
      that.mapViewer.updateStationsLayer(that.stations);
      that.updateRankingLists();
    }

    for (var i = that.brushExtent[0][1]; i < that.brushExtent[1][1]; i++) {
      d3.select("#dayOfWeekModelsStationRepresentation" + that.actualOrderingList.orderedStations[i].id)
        // .attr("fill", function(d) {
        //   var sat = 100 * (that.actualOrderingList.orderedStations[i].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
        //   // console.log(sat);
        //   return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
        // });
        .attr("fill", function(d) {

          // if (!d.selected) {
          //   return "hsl(" + (0.1 * 360) + ", 0%, 50%)";
          // }

          var value = (that.actualOrderingList.orderedStations[i].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);

          return that.actualPropertyColorScale(value);        
          //var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
          //return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
        }) ; 
    }

    // if (that.ordering.split(" ")[0] == "Station" && that.ordering.split(" ")[1] != "Size") {
    //   d3.selectAll(".dayOfWeekModelsStationRepresentation")        
    //     .attr("fill", "hsl(" + (0.1 * 360) + ", 100%, 50%)");
    // } else {
    //   d3.selectAll(".dayOfWeekModelsStationRepresentation")        
    //     .attr("fill", function(d) {
    //       var sat = 100 * (d.orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]].orderingValue);
    //       return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
    //     });
    // }


    // brush.extent([width, height]);
    //console.log(brush.extent());
  };

  // updateFilterTable(that.stations, ts, that.actualPropertyColorScale);
  updateFilterTable(that.actualOrderingList.orderedStations, ts, that.actualPropertyColorScale);
  this.updateValuesRange();

  if (!this.playing) {
    return;
  }

  setTimeout(function() {
    that.updateBrushExtentPlaying(that);
  }, 500)
};

DayOfWeekModelsMatrixViewer.prototype.updateBrushExtentPlaying = function(obj) {
  
  // console.log("updateBrushExtentPlaying");

  // console.log(obj.brushExtent);

  if (new Date(obj.brushExtent[1][0] + 1) > obj.xScale.domain()[1]) {
    return;
  }

  obj.brushExtent = [[new Date(obj.brushExtent[0][0] + 1),obj.brushExtent[0][1]], [new Date(obj.brushExtent[1][0] + 1),obj.brushExtent[1][1]]];
  
  // console.log(obj.brushExtent);

  obj.brush.extent(obj.brushExtent);
  obj.brush(d3.select("#dayOfWeekModelsBrush"));
  obj.brush.event(d3.select("#dayOfWeekModelsBrush"));

  for (index in obj.actualOrderingList.orderedStations) {
    if (obj.actualOrderingList.orderedStations[index].id == obj.stationPointedInMapId) {
      obj.lastPointedStationOrder = index;
      obj.pointedStation(index);
    }
  }  

  // obj.updatedMatrixPointedLine(obj.lastPointedStationOrder);
}

/**
 * Returns whether viewer is active.
 */
DayOfWeekModelsMatrixViewer.prototype.isActive = function() {
  return this.active_;
};

/**
 * Activates/deactivates viewer.
 */
DayOfWeekModelsMatrixViewer.prototype.setActive = function(active) {
  var mustUpdate = active && !this.active_;
  this.active_ = active;

  // Show/hide containers.
  utils.setVisibility(this.visibleContainersId_, this.active_);
  
};

DayOfWeekModelsMatrixViewer.prototype.update = function() {
  if (!this.dataManager_.hasData() || !this.active_) {
    //return;
  }

  if (!this.initialized_) {
    
    this.initialized_ = true;
  }

  // TODO Load initial view options based on filters and selections.

  //console.log(this.dataManager_.stationsActivities);
  //this.plotSelectedStationsFrequencyCharts();
  
};