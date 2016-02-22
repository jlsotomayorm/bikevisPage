
/**
 * Class to show plots analytics about the data.
 *
 */
var CalendarViewMatrixViewer = function(dataManager, viewerContainerId) {
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
  this.dailyReducer = "m";
  this.variablesList = [];
  this.stations = [];
  this.orderLists = [];

  // return; //remove later to enable this viz
  
  this.dataManager_.loadStations(this);
  

  this.actualOrderingList = {orderedStations: []}; 
  for (stationOrder in this.actualOrderingList.orderedStations) {
    this.actualOrderingList.orderedStations[stationOrder].orderHistory = [];
  }
  this.ordering = "Balance (bikes/capacity): mean";

  this.useGlobalNormalization = true;

  this.displayAndOrderLocked = true;
  
}

CalendarViewMatrixViewer.prototype.createColorScales = function() {

  var that = this;

  this.colorScales["Blue/Black/Red"] = d3.scale.linear().domain([0.0,0.49,0.51,1]).range([
    d3.rgb(51,153,255),
    d3.rgb(0,0,0),
    d3.rgb(0,0,0),
    d3.rgb(255,51,51)
  ]).clamp(true);

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
  
  this.colorScales["Orange/White/Purple"] = d3.scale.linear().domain([1.0,0.75,0.5,0.25,0.0]).range([
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

  d3.select("#analyticsCalendarViewColorScaleOptions").selectAll(".calendarViewColorScaleOption").data(colorScaleNames).enter()
    .append("option")
      .attr("class", "calendarViewColorScaleOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;}); 


  
  this.actualPropertyColorScale = this.colorScales["Blue/Black/Red"];

  d3.select("#calendarViewColorScale").selectAll(".calendarViewColorScaleSample").remove();

  var resolution = 10;
  var colorScaleSample = [];
  for (var colorScaleSampleIndex = 0; colorScaleSampleIndex <= resolution; colorScaleSampleIndex++) {
    colorScaleSample.push(colorScaleSampleIndex/resolution);
  }
  
  var colorScaleWidth = 220;
  var colorScaleHeight = 10;

  d3.select("#calendarViewColorScale").selectAll(".calendarViewColorScaleSample").data(colorScaleSample).enter()
  .append("div")
    .attr("class", "calendarViewColorScaleSample")
    .style("width", ((colorScaleWidth - 10)/(resolution + 1))  + "px")
    .style("height", colorScaleHeight + "px")
    .style("float", "left")
    .style("background", function(d,i) { return that.actualPropertyColorScale(d);});
  
}

CalendarViewMatrixViewer.prototype.reorderLines = function() {

  // console.log("reorderLines");
  

  var that = this;  

  // console.log(that.brushExtent);

  var orderingVariable = this.variableNametoKeyMap[that.ordering.split(": ")[0]];
  var orderingStat = that.ordering.split(": ")[1];
  
  var element = document.getElementById('analyticsCalendarViewOrdering');

  element.value = this.variableKeyToNameMap[orderingVariable] + ": " + orderingStat;

  var element = document.getElementById('analyticsCalendarViewVariables');

  element.value = this.variableKeyToNameMap[this.variable];

  // console.log(this.stations);


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
        
        
        // if (that.dataManager_.stationsCalendarViewData[a.id][0][orderingVariable] == undefined) {
        if (that.dataManager_.stationsCalendarViewData[a.number] == undefined) {
        
          var index = newOrderingList.indexOf(a); 
          if (index > -1) {     
            newOrderingList[index].orderingValue = -1;        
          }

          return -1;
        }



        for (var entryIndex = that.brushExtent[0][0]; entryIndex < that.brushExtent[1][0]; entryIndex++) {
          if (that.dataManager_.stationsCalendarViewData[a.number][entryIndex] != undefined) {
            tsA[entryIndex] = that.dataManager_.stationsCalendarViewData[a.number][entryIndex];
          }
        }

        // ts[index] = Array.prototype.slice.call(that.dataManager_.stationsCalendarViewData[stationOrderingPos]);        
        
        // ts[index] = ts[index].slice(0, ts[index].length-1);      

        // ts[index] = ts[index].map(accessor)

        // that.dataManager_.stationsCalendarViewData[a.id]["length"] = Object.keys(that.dataManager_.stationsCalendarViewData[a.id]).length
        
        // tsA = Array.prototype.slice.call(that.dataManager_.stationsCalendarViewData[a.id]); 
        
        // tsA = tsA.slice(that.brushExtent[0][0], that.brushExtent[1][0]);          

        // console.log(tsA);       

        // if (that.dataManager_.stationsCalendarViewData[b.id][0][orderingVariable] == undefined) {
        if (that.dataManager_.stationsCalendarViewData[b.number] == undefined) {
          var index = newOrderingList.indexOf(b); 
          if (index > -1) {     
            newOrderingList[index].orderingValue = -1;        
          }

          return 1;
        }

        for (var entryIndex = that.brushExtent[0][0]; entryIndex < that.brushExtent[1][0]; entryIndex++) {
          if (that.dataManager_.stationsCalendarViewData[b.number][entryIndex] != undefined) {
            tsB[entryIndex] = that.dataManager_.stationsCalendarViewData[b.number][entryIndex];
          }
        }


        // that.dataManager_.stationsCalendarViewData[b.id]["length"] = Object.keys(that.dataManager_.stationsCalendarViewData[b.id]).length
        
        // tsB = Array.prototype.slice.call(that.dataManager_.stationsCalendarViewData[b.id]);        
        // tsB = tsB.slice(that.brushExtent[0][0], that.brushExtent[1][0]);
        
        

        var accessor = function(s,i) {
          // console.log(s);
          // console.log(i);
          if (s == undefined || s[orderingVariable] == undefined) {
            return undefined;
          } else {
            return s[orderingVariable][that.dailyReducer];
          }
        }

        if (orderingStat == "mean") {    
          keyA = d3.mean(tsA, accessor);
          keyB = d3.mean(tsB, accessor);
        } else if (orderingStat == "sum") {    
          keyA = d3.sum(tsA, accessor);
          keyB = d3.sum(tsB, accessor);
        } else if (orderingStat == "min") {    
          keyA = d3.min(tsA, accessor);
          keyB = d3.min(tsB, accessor);
        } else if (orderingStat == "max") {    
          keyA = d3.max(tsA, accessor);
          keyB = d3.max(tsB, accessor);
        } else if (orderingStat == "range") {
          var extendA = d3.extent(tsA, accessor);
          keyA = extendA[1] - extendA[0];
          
          var extendB = d3.extent(tsB, accessor);
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

CalendarViewMatrixViewer.prototype.createOrderLists = function() {

  var that = this;

  stats = ["mean", "min", "max", "range"];  

  var orderingNames = [];
  for (variableIndex in Object.keys(this.dataManager_.stationsCalendarViewData[218][20])) {   

    if (Object.keys(this.dataManager_.stationsCalendarViewData[218][20])[variableIndex].indexOf("SD") != -1) {
      continue;
    }

    if (Object.keys(this.dataManager_.stationsCalendarViewData[218][20])[variableIndex] == "st") {
      continue;
    }
    var variable = this.variableKeyToNameMap[Object.keys(this.dataManager_.stationsCalendarViewData[218][20])[variableIndex]];
    
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
  
  d3.select("#analyticsCalendarViewOrdering").selectAll(".calendarViewNonStationOrderingOption").data(orderingNames).enter()
    .append("option")
      .attr("class", "calendarViewNonStationOrderingOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;}); 

  // this.stations = this.dataManager_.stations;
  this.stations = [];
  console.log(Object.keys(this.dataManager_.stationsCalendarViewData).length);
  console.log(this.dataManager_.stations.length);
  for (stationIndex in this.dataManager_.stations) {
    if (this.dataManager_.stations[stationIndex].id in Object.keys(this.dataManager_.stationsCalendarViewData)) {
      this.stations.push(this.dataManager_.stations[stationIndex]);
    }
  }

  console.log(this.dataManager_.stations);
  console.log(this.stations);

  that.maxCapacity = 0;
  that.minCapacity = 99999;

  // console.log(that.dataManager_.stationsCalendarViewData);

  this.stations.forEach(function (station, index) {
    // console.log(station.id);
    station.order = index;
    station.dataArray = [];
    station.value = 0;
    station.selected = false;
    // station.capacity = d3.mean(that.dataManager_.stationsCalendarViewData[index][0]["c"]["a"]);
    station.capacity = 10;
    // day = 20;
    var capacityArray = [];
    for (var day = 20; day < 481; day++) {
      if (that.dataManager_.stationsCalendarViewData[station.number][day] != undefined) {
        capacityArray.push(that.dataManager_.stationsCalendarViewData[station.number][day]["c"]["me"]);
      }
    }
    // while (that.dataManager_.stationsCalendarViewData[station.id][day] == undefined) {
    //   day += 1;
    // }
    station.capacity = d3.mean(capacityArray);
    // station.capacity = d3.mean(that.dataManager_.stationsCalendarViewData[station.id], function(s) {
    //   console.log(s["c"]["me"]);
    //   return s["c"]["me"];
    // });
    // console.log(station.capacity);
    if (station.capacity < that.minCapacity) {
      that.minCapacity = station.capacity;
    }
    if (station.capacity > that.maxCapacity) {
      that.maxCapacity = station.capacity;
    }
  });

  this.mapViewer.createStationsLayer(this.stations);
  // console.log(this.stations);

}

CalendarViewMatrixViewer.prototype.setVariablesList = function() {

  var that = this;  

  this.dailyReducerKeyToNameMap = [];
  this.dailyReducerKeyToNameMap["me"] = "Mean";
  this.dailyReducerKeyToNameMap["ma"] = "Maximum";
  this.dailyReducerKeyToNameMap["maI"] = "Maximum (Time)";  
  this.dailyReducerKeyToNameMap["m"] = "Minimum";
  this.dailyReducerKeyToNameMap["mI"] = "Minimum (Time)";
  this.dailyReducerKeyToNameMap["r"] = "Range";

  this.dailyReducerNametoKeyMap = [];
  for (key in this.dailyReducerKeyToNameMap) {
    this.dailyReducerNametoKeyMap[this.dailyReducerKeyToNameMap[key]] = key;    
  }

  var dailyReducersList = [];

  for (reducer in this.dailyReducerKeyToNameMap) {  
    dailyReducersList.push(this.dailyReducerKeyToNameMap[reducer]);    
  }

  d3.select("#analyticsCalendarViewReducer").selectAll(".calendarViewReducerOption").data(dailyReducersList).enter()
    .append("option")
      .attr("class", "calendarViewVariableOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;});

  this.dailyReducer = "me";

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

  for (variable in Object.keys(this.dataManager_.stationsCalendarViewData[218][20])) {

    if (Object.keys(this.dataManager_.stationsCalendarViewData[218][20])[variable].indexOf("SD") != -1) {
      continue;
    }

    if (Object.keys(this.dataManager_.stationsCalendarViewData[218][20])[variable] != "st") {
      this.variablesList.push(this.variableKeyToNameMap[Object.keys(this.dataManager_.stationsCalendarViewData[218][20])[variable]]);
    }
  }

  this.variablesList.sort();

  d3.select("#analyticsCalendarViewVariables").selectAll(".calendarViewVariableOption").data(this.variablesList).enter()
    .append("option")
      .attr("class", "calendarViewVariableOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;});

  this.variable = "b";  
  
  this.createOrderLists();
  this.reorderLines();
}

CalendarViewMatrixViewer.prototype.stationsLoaded = function() {
  
  // var periodOptions = ["All", "06 2013", "07 2013", "08 2013", "09 2013", "10 2013", "11 2013", "12 2013", "01 2014", "02 2014", "Summer 2013", "Fall 2013", "Winter 2013"];

  // d3.select("#analyticsDayOfModelsPeriod").selectAll(".dayOfWeekModelsPeriodOption").data(periodOptions).enter()
  //   .append("option")
  //     .attr("class", "dayOfWeekModelsVariableOption")
  //     .attr("value", function(d) {return d;})
  //     .text(function(d) {return d;});



  // this.period = "All";
  // this.dataManager_.getStationsDayOfWeekModels(this, this.period);
  this.dataManager_.getStationsCalendarViewData(this);
  // this.stations = this.dataManager.stations;
  // console.log(this.stations);
  this.brushExtent = [];
  this.brushExtent[0] = [];  
  this.brushExtent[1] = [];
  this.brushExtent[0][0] = 0;
  this.brushExtent[1][0] = 481;
  this.brushExtent[0][1] = 0;
  this.brushExtent[1][1] = this.dataManager_.stations.length-1;
}

CalendarViewMatrixViewer.prototype.stationsCalendarViewDataLoaded = function() {
  
  console.log("stationsCalendarViewDataLoaded");

  // console.log(this.dataManager_.stationsCalendarViewData);
  
  this.setVariablesList();
  this.createColorScales();  
  
  // this.reorderLines();
  this.updateRangeSliderLimits = true;
  this.createMatrix();
  
  this.updateRankingLists();
  
  
}

CalendarViewMatrixViewer.prototype.toLocalTime = function(time) {
  var newTime = time;
  newTime.setHours(newTime.getHours() - 6);
  return newTime;
}

CalendarViewMatrixViewer.prototype.updateColorScale = function() {

  var that = this;

  d3.select("#calendarViewColorScale").selectAll(".calendarViewColorScaleSample").remove();

  var resolution = 10;
  var colorScaleSample = [];
  for (var colorScaleSampleIndex = 0; colorScaleSampleIndex <= resolution; colorScaleSampleIndex++) {
    colorScaleSample.push(colorScaleSampleIndex/resolution);
  }

  // console.log(colorScaleSample);

  var colorScaleWidth = 220;
  var colorScaleHeight = 10;

  d3.select("#calendarViewColorScale").selectAll(".calendarViewColorScaleSample").data(colorScaleSample).enter()
  .append("div")
    .attr("class", "calendarViewColorScaleSample")
    .style("width", ((colorScaleWidth - 10)/(resolution + 1))  + "px")
    .style("height", colorScaleHeight + "px")
    .style("float", "left")
    .style("background", function(d,i) { return that.actualPropertyColorScale(d);});

  
  this.createMatrix();
}

CalendarViewMatrixViewer.prototype.updateMatrix = function() {
  this.createMatrix();
}

CalendarViewMatrixViewer.prototype.getFormatedValue = function(value, variableName) {

  if (this.dailyReducer == "mI" || this.dailyReducer == "maI") {
    var tempDate1 = new Date("2013-06-01 00:00:00");
    
    var tempDate2 = new Date(tempDate1.getTime() + value*15*60000);
    
    if (value >= 96) {
      return "23:45:00";
    }

    return tempDate2.toTimeString().split(" ")[0];
  }


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

CalendarViewMatrixViewer.prototype.updateValuesRange = function() {

  // console.log("updateValuesRange");

  var that = this;

  if (that.lastPointedStationOrder >= 0 && !that.useGlobalNormalization) {
    var min = d3.min(that.ts[that.lastPointedStationOrder]);
    var max = d3.max(that.ts[that.lastPointedStationOrder]);
    // if (that.variable == "b" && max > 1 && this.dailyReducer != "mI" && this.dailyReducer != "maI") {
    
    //   max = 1;
    // }
    // d3.select("#calendarViewMinValueLabel")
    //   .text(that.getFormatedValue(min, that.variable));
    // d3.select("#calendarViewMaxValueLabel")
    //   .text(that.getFormatedValue(max, that.variable));

    // that.actualMinValue = min;
    // that.actualMaxValue = max;

  } else {
    // if (that.variable == "b" && that.globalMaxValue > 1 && this.dailyReducer != "mI" && this.dailyReducer != "maI") {
    
    //   that.globalMaxValue = 1;
    // }
    // d3.select("#calendarViewMinValueLabel")
    //   .text(that.getFormatedValue(that.globalMinValue, that.variable));
    // d3.select("#calendarViewMaxValueLabel")
    //   .text(that.getFormatedValue(that.globalMaxValue, that.variable));  

      

    // console.log(that.actualMinValue);
  }

  

  
}

CalendarViewMatrixViewer.prototype.updateCursorSelectionInfo = function(orderIndex) {
  var that = this;

  if (orderIndex < 0) {
    d3.select("#calendarViewInfoCursorId")
      .text("Id:");
    d3.select("#calendarViewInfoCursorNumber")
      .text("Number:");
    d3.select("#calendarViewInfoCursorName")
      .text("Name:");
    d3.select("#calendarViewInfoCursorRank")
      .text("Rank:");
    d3.select("#calendarViewInfoCursorRankingValue")
      .text("Ranking value:");
  } else {
    d3.select("#calendarViewInfoCursorId")
      .text("Id: " + that.actualOrderingList.orderedStations[orderIndex].id);
    d3.select("#calendarViewInfoCursorNumber")
      .text("Number:" + that.actualOrderingList.orderedStations[orderIndex].number);
    d3.select("#calendarViewInfoCursorName")
      .text("Name: " + that.actualOrderingList.orderedStations[orderIndex].name);
    d3.select("#calendarViewInfoCursorRank")
      .text("Rank:" + orderIndex);
    d3.select("#calendarViewInfoCursorRankingValue")
      .text("Ranking value:" + that.getFormatedValue(that.actualOrderingList.orderedStations[orderIndex].orderingValue, that.ordering));
  }
}

CalendarViewMatrixViewer.prototype.pointedStation = function(orderIndex) {

  var that = this;

  this.unpointedStation(this.lastPointedStationOrder);
  if (this.actualOrderingList.orderedStations[orderIndex] == undefined) {
    return;
  }
  var thisId = this.actualOrderingList.orderedStations[orderIndex].id;  
  d3.select("#calendarViewStationRepresentationShadow"+thisId)
    .attr("opacity", 1.0); 
  d3.select("#calendarViewStationRepresentation"+thisId)
    .attr("opacity", 1.0)
    // .attr("r", 9);
    .attr("stroke",  "black")
    .attr("stroke-width",  "2.5px");
  this.lastPointedStationOrder = orderIndex;
  this.updateValuesRange();  

  d3.select("#calendarViewTopStationsListLabel"+orderIndex)
    .style("font-size", "14px") 
    .style("font-weight", "bold");
  d3.select("#calendarViewLastStationsListLabel"+orderIndex)
    .style("font-size", "14px") 
    .style("font-weight", "bold");

  d3.select("#calendarViewStationInAreaListLabel"+orderIndex)
    .style("font-size", "14px") 
    .style("font-weight", "bold");

  // d3.selectAll("#dayOfWeekModelsStationRepresentationText" + this.actualOrderingList.orderedStations[orderIndex].id)
  //   .attr("fill-opacity", "1.0");

  that.updateCursorSelectionInfo(orderIndex);

  // if (that.cursorOverMatrix) {
  //   return;
  // }

  // that.updatedMatrixPointedLine(this.lastPointedStationOrder);

  if (!that.cursorOverMatrix) {
    // return;
    that.updatedMatrixPointedLine(this.lastPointedStationOrder);
  }

  var svg = d3.selectAll('#calendarViewTableSvg');
  svg.select("#calendarViewOrderHistoryLine").remove();
  svg.select("#calendarViewOrderHistoryLineShadow").remove();
  
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
  .attr("id", "calendarViewOrderHistoryLineShadow");

  svg.append('svg:path')
  .attr('d', lineFunc(that.stations[this.actualOrderingList.orderedStations[this.lastPointedStationOrder].posInStationsList].orderHistory))
  .attr('stroke', '#DDDDDD')
  .attr('pointer-events', 'none')
  .attr('stroke-width', 4)
  .attr('opacity', 1.0)
  .attr('fill', 'none')
  .attr("id", "calendarViewOrderHistoryLine");
   

}

CalendarViewMatrixViewer.prototype.updatedMatrixPointedLine = function(orderIndex) {

  var that = this;

  d3.selectAll("#calendarViewMatrixPointedStationLine").remove();

  // console.log(orderIndex);

  if (orderIndex < 0) {
    return;
  }

  var selectedStationLine = orderIndex;
  var selectedLineGroupData = that.ts[selectedStationLine]; 

  var selectedLineGroup = d3.select("#calendarViewTableSvg").append("g")
    .attr("id", "calendarViewMatrixPointedStationLine")          
    // .attr("transform", "translate(0, " + (selectedStationLine * that.matrixCellHeight - that.matrixCellHeight/2) + ")");
    .attr("transform", "translate(0, 0)");

  var minValue = that.globalMinValue;
  var maxValue = that.globalMaxValue;

  if (!that.useGlobalNormalization) {
    minValue = d3.min(selectedLineGroupData);
    maxValue = d3.max(selectedLineGroupData);
  }
  
  // console.log(selectedLineGroupData);

  selectedLineGroup.selectAll(".calendarViewMatrixPointedStationLineSamples")
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
    .attr("class", "calendarViewMatrixPointedStationLineSamples")      
    .attr("fill", function(d,i) {
      return that.actualPropertyColorScale(Math.max(0,(d-that.actualMinValue))/(that.actualMaxValue - that.actualMinValue));
    })      
    .attr("stroke", "white")      
    .attr("stroke-width", 1.0);

  selectedLineGroup
    .insert("rect", ".calendarViewMatrixPointedStationLineSamples")
    .attr("x", 0)
    .attr("y", selectedStationLine * that.matrixCellHeight -that.matrixCellHeight*4 - 2)
    .attr("height", that.matrixCellHeight * 8 + 9)      
    .attr("width", that.matrixCellWidth * that.ts[0].length)
    .attr("fill", "black")
    .attr("fill-opacity", 0.4);

  selectedLineGroup
    .insert("rect", ".calendarViewMatrixPointedStationLineSamples")
    .attr("x", 0)
    .attr("y", selectedStationLine * that.matrixCellHeight -that.matrixCellHeight*4 - 2)
    .attr("height", that.matrixCellHeight * 8 + 7)      
    .attr("width", that.matrixCellWidth * that.ts[0].length)
    .attr("fill", "black")
    .attr("fill-opacity", 0.6);

  
}

CalendarViewMatrixViewer.prototype.unpointedStation = function(orderIndex) {

  var that = this;

  if (this.actualOrderingList.orderedStations[orderIndex] == undefined) {
    return;
  }

  // d3.selectAll("#dayOfWeekModelsStationRepresentationText" + this.actualOrderingList.orderedStations[orderIndex].id)
  //   .attr("fill-opacity", "0.0");

  var thisId = this.actualOrderingList.orderedStations[orderIndex].id;
  d3.select("#calendarViewStationRepresentationShadow"+thisId)
    .attr("opacity", function(d){return (d.selected || that.brushExtent == undefined) ? 1.0 : 0.0;});
      
  d3.select("#calendarViewStationRepresentation"+thisId)
    .attr("opacity", function(d){return (d.selected || that.brushExtent == undefined) ? 1.0 : 0.1;})
    // .attr("r", 4.5);
    .attr("stroke",  "white")
    .attr("stroke-width",  "1.5px");

  d3.select("#calendarViewTopStationsListLabel"+orderIndex)
    .style("font-size", "11px") 
    .style("font-weight", "normal");
  d3.select("#calendarViewLastStationsListLabel"+orderIndex)
    .style("font-size", "11px") 
    .style("font-weight", "normal");

  d3.select("#calendarViewStationInAreaListLabel"+orderIndex)
    .style("font-size", "11px") 
    .style("font-weight", "normal");

  this.lastPointedStationOrder = -1;
  that.updateCursorSelectionInfo(-1);
  this.updateValuesRange();
}

CalendarViewMatrixViewer.prototype.updateRankingLists = function() {

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

  that.maxOrderingValue = 0;
  that.minOrderingValue = 0;

  for (var i = this.brushExtent[0][1]; i < this.brushExtent[0][1] + len; i++) {
    topStations.push(i);
    if (that.actualOrderingList.orderedStations[i].orderingValue != undefined && that.maxOrderingValue < that.actualOrderingList.orderedStations[i].orderingValue) {
      that.maxOrderingValue = that.actualOrderingList.orderedStations[i].orderingValue;
    } 
    if (that.actualOrderingList.orderedStations[i].orderingValue != undefined && that.minOrderingValue > that.actualOrderingList.orderedStations[i].orderingValue) {
      that.minOrderingValue = that.actualOrderingList.orderedStations[i].orderingValue;
    } 
  }





  // console.log(that.actualOrderingList.orderedStations);

  d3.select("#calendarViewTopStationsList").selectAll(".calendarViewStationinTop10List").remove();
  d3.select("#calendarViewLastStationsList").selectAll(".calendarViewStationinLast10List").remove();

  d3.select("#calendarViewTopStationsList").selectAll(".calendarViewStationinTop10List").data(topStations).enter()
  .append("div")
    .attr("class", "calendarViewStationinTop10List")
    .style("min-height", "20px")

    // .attr("width", "100%")
    // .style("background-color", function(d,i){
    //   var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
    //   return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
    // })
    .attr("padding-left", "10px")
    .each(function(d,i) {      

      if (that.actualOrderingList.orderedStations[d] == undefined) {
        d3.select(this).remove();
        return;
      }

      if (that.actualOrderingList.orderedStations[d].orderingValue == undefined) {
        d3.select(this).remove();
        return;
      }

      // console.log(that.actualOrderingList.orderedStations);

      var svg = d3.select(this).append("svg")
        .attr("width", "20px")
        .attr("height", "20px")
        .style("float", "left");

      svg.append("svg:circle")
          .attr("r", function(d) {
            return 3 + 7 * Math.sqrt((that.actualOrderingList.orderedStations[d].capacity - that.minCapacity) / (that.maxCapacity - that.minCapacity)/3.1416);
          })
          .attr("fill", function(d) {
            // var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
            // var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.minOrderingValue) / (that.maxOrderingValue - that.minOrderingValue);
            // return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
            // console.log(d);
            var value = (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);

            return that.actualPropertyColorScale(value); 
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
        .attr("id", "calendarViewTopStationsListLabel" + d)
        .attr("class", "calendarViewTopStationsListLabel")
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

  

  d3.select("#calendarViewLastStationsList").selectAll(".calendarViewStationinLast10List").data(lastStations).enter()
  .append("div")
    .attr("class", "calendarViewStationinLast10List")
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
        d3.select(this).remove();
        return;
      }

      if (that.actualOrderingList.orderedStations[d].orderingValue == undefined) {
        d3.select(this).remove();
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
            // var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.minOrderingValue) / (that.maxOrderingValue - that.minOrderingValue);
            // // var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
            // return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";

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
        .attr("id", "calendarViewLastStationsListLabel" + d)                       
        .attr("class", "calendarViewLastStationsListLabel")
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

CalendarViewMatrixViewer.prototype.updateStationsInAreaList = function() {

  var that = this;

  if (this.mapViewer == undefined || this.mapViewer.stationsInAreaList == undefined) {
    return;
  }

  d3.select("#calendarViewAreaStationsList").selectAll(".calendarViewStationInAreaList").remove();

  d3.select("#calendarViewAreaStationsList").selectAll(".calendarViewStationInAreaList").data(this.mapViewer.stationsInAreaList).enter()
  .append("div")
    .attr("class", "calendarViewStationInAreaList")
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
          .attr("stroke",  "white")
          .attr("stroke-width",  "1.5px");

      d3.select(this).append("label")
        // .style("background-color", backgroundColor) 
        .style("color", "black") 
        .style("font-size", "11px")  
        .style("font-weight", "normal")         
        .attr("id", "calendarViewStationInAreaListLabel" + d)
        .attr("class", "calendarViewStationInAreaListLabel")
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

CalendarViewMatrixViewer.prototype.createMatrixsetOfTimeseries = function() {  
  var that = this;

  var ts = [];
  
  var stationCount = that.actualOrderingList.orderedStations.length;
  
  var minValue = 999999;
  var maxValue = 0;    

  // var ts = [];
  
  that.actualOrderingList.orderedStations.forEach(function(station, index) {

    var stationOrderingPos = station.number;         
    
    // if (station.orderingValue == -1 || that.dataManager_.stationsCalendarViewData[stationOrderingPos][0][that.variable] == undefined) {
    if (station.orderingValue == -1 || that.dataManager_.stationsCalendarViewData[stationOrderingPos] == undefined) {
      ts[index] = [];
    } else {

      var accessor = function(s) {
        // return Math.max(Math.min(s[that.variable][that.dailyReducer], that.actualMaxValue), that.actualMinValue);
        // console.log(s[that.variable][that.dailyReducer]);
        return s[that.variable][that.dailyReducer];
      }

      that.dataManager_.stationsCalendarViewData[stationOrderingPos]["length"] = Object.keys(that.dataManager_.stationsCalendarViewData[stationOrderingPos]).length
      // if (station.id > 300) {
      //   console.log(Object.keys(that.dataManager_.stationsCalendarViewData[stationOrderingPos]));
      // }
      // console.log(that.dataManager_.stationsCalendarViewData[stationOrderingPos]["length"]);
      ts[index] = [];
      for (var entryIndex = 0; entryIndex < 481; entryIndex++) {
        if (that.dataManager_.stationsCalendarViewData[stationOrderingPos][entryIndex] != undefined) {
          ts[index][entryIndex] = that.dataManager_.stationsCalendarViewData[stationOrderingPos][entryIndex];
        }
      }

      // ts[index] = Array.prototype.slice.call(that.dataManager_.stationsCalendarViewData[stationOrderingPos]);        
      
      // ts[index] = ts[index].slice(0, ts[index].length-1);      

      ts[index] = ts[index].map(accessor)

      // console.log(ts[index]);



      // ts[index] = that.dataManager_.stationsCalendarViewData[stationOrderingPos][0][that.variable]["a"];
      // ts[index] = [];
      // for (var i = 0; i < 300; i++) {
      //   ts[index][i] = i/300.0;
      // }
    }
    
  });


  
  if (minValue > d3.min(ts, function(s) {return d3.min(s);})) {
    minValue = d3.min(ts, function(s) {return d3.min(s);});
  }

  if (maxValue < d3.max(ts, function(s) {return d3.max(s);})) {
    maxValue = d3.max(ts, function(s) {return d3.max(s);});
  }

  // that.actualOrderingList.orderedStations.forEach(function(station, index) {

  //   var stationOrderingPos = station.id;         
    
  //   if (station.orderingValue == -1 || that.dataManager_.stationsCalendarViewData[stationOrderingPos][0][that.variable] == undefined) {
  //     ts[index] = [];
  //   } else {
  //     ts[index] = that.dataManager_.stationsCalendarViewData[stationOrderingPos][0][that.variable]["a"];
  //   }
    
  // });
  
  // console.log(maxValue);

  that.globalMinValue = minValue;
  that.globalMaxValue = maxValue;



  //Max values for each variable obtained from an outlier detection algorithm
  var outlierMaxValues = {};

  outlierMaxValues['c'] = 67;
  outlierMaxValues['b'] = 1;
  outlierMaxValues['bi'] = 51.85;
  outlierMaxValues['s'] = 64.48;
  outlierMaxValues['biI'] = 4.77;
  outlierMaxValues['biO'] = 4.94;
  outlierMaxValues['f'] = 0;
  outlierMaxValues['biIF'] = 3.4;
  outlierMaxValues['biOF'] = 3.49;


  that.globalMaxValue = outlierMaxValues[that.variable];

  that.ts = ts;

  // console.log(minValue + "  " + maxValue);
  // console.log(ts);

}

CalendarViewMatrixViewer.prototype.createMatrix = function() {  

  var that = this;  

  var sampleCount = 481;
  var stationCount = that.actualOrderingList.orderedStations.length;

  this.createMatrixsetOfTimeseries();

  var ts = this.ts;

  var minValue = that.globalMinValue;
  var maxValue = that.globalMaxValue;






  // console.log(that.updateRangeSliderLimits);

  if (that.updateRangeSliderLimits) {
    that.actualMinValue = that.globalMinValue;
    that.actualMaxValue = that.globalMaxValue;

    // console.log(that.actualMaxValue);
    $( "#calendarValueRangeSlider" ).slider( "option", "step", (that.actualMaxValue - that.actualMinValue)/100.0 );
    $( "#calendarValueRangeSlider" ).slider( "option", "min" , that.actualMinValue);
    $( "#calendarValueRangeSlider" ).slider( "option", "max" , that.actualMaxValue);    
         
    $( "#calendarValueRangeSlider" ).slider( "option", "values" , [that.actualMinValue, that.actualMaxValue]);
    
    $('#calendarValueRangeSlider').slider("value", $('#calendarValueRangeSlider').slider("value"));
    $( "#calendarViewMinValueLabel" ).text( $( "#calendarValueRangeSlider" ).slider( "values", 0 ));
    $( "#calendarViewMaxValueLabel" ).text( $( "#calendarValueRangeSlider" ).slider( "values", 1 )); 

    
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
    var svgWidth = d3.select('#modeVisContainerAnalyticsCalendarViewContainerMiddleContainer')[0][0].clientWidth - that.matrixLeft;    
    var svgHeight = d3.select('#modeVisContainerAnalyticsCalendarViewContainerMiddleContainer')[0][0].clientHeight - that.matrixTop;
    


    var parentDiv = d3.select("#modeVisContainerAnalyticsCalendarViewContainerMiddleContainer");

    
    var tableCanvasDiv = parentDiv.selectAll('#calendarViewTableCanvasDiv').data(['calendarViewTableCanvasDiv']).enter().append('div');
    tableCanvasDiv
      .attr("id", "tableCanvasDiv") 
      .style("position", "relative")      
      .style("height", svgHeight + "px")
      .style("width", svgWidth + "px")
      .style("left", that.matrixLeft + "px")      
      // .style("top", (-svgHeight) + "px");
      .style("top", (that.matrixTop - 20) + "px");
   
    var tableCanvas = tableCanvasDiv.selectAll('canvas').data(['calendarViewTableCanvas']).enter().append('canvas');
    tableCanvas
      .attr("id", "calendarViewTableCanvas")
      .attr("height", (svgHeight) + "px")
      .attr("width", svgWidth + "px");    

    var canvas=document.getElementById('calendarViewTableCanvas');

    // Get context for 2d drawing from canvas
    var ctx=canvas.getContext('2d');
    // Store the current transformation matrix
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0); //  transformation matrix described by (a, b ,c , d , e, f)    a c e
                                                                                                  //   b d f
                                                                                                  //   0 0 1
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

    lines.forEach(function(station, lineIndex) {

      // var stationOrderingPos = that.actualOrderingList.orderedStations[station.id].id;
      // var stationOrderingPos = that.actualOrderingList.orderedStations[lineIndex].id;

      // if (ts[stationOrderingPos] == undefined) {
      //   return;
      // }

      // var cellWidth = svgWidth / ts[lineIndex].length;
      var cellWidth = svgWidth / 481;
      var cellHeight = svgHeight / lines.length;     

      // console.log(d3.min(Object.keys(ts[lineIndex])));
      // console.log(d3.max(Object.keys(ts[lineIndex])));
      // console.log(d3.min(Object.keys(ts[lineIndex]), function(s){return Number(s);}));
      // console.log(d3.max(Object.keys(ts[lineIndex]), function(s){return Number(s);}));


      samples = ts[lineIndex];
      if (!that.useGlobalNormalization) {
        minValue = d3.min(samples);
        maxValue = d3.max(samples);
      } else {
        minValue = that.actualMinValue;
        maxValue = that.actualMaxValue;
        // console.log(that.actualMaxValue);
      }
      


      
      // if (that.variable == "b" && maxValue > 1 && that.dailyReducer != "mI" && that.dailyReducer != "maI") {
      //   maxValue = 1;
      // }

      // console.log(samples.length);
      samples.forEach(function(sample, index) {
        ctx.fillStyle=colorScale(Math.max(0,(sample-minValue))/(maxValue-minValue));        
        ctx.fillRect(index*cellWidth,lineIndex*cellHeight,cellWidth+1,cellHeight+1);        
      });

      that.matrixCellWidth = cellWidth;
      that.matrixCellHeight = cellHeight;

      // console.log(ts[station.id]);
    });

    var svgDiv = parentDiv.selectAll('#calendarViewSvgDiv').data(['calendarViewSvgDiv']).enter().append('div');
    svgDiv
      .attr("id", "calendarViewSvgDiv")      
      .style("position", "relative")      
      .style("height", (svgHeight + that.matrixTop) + "px")
      .style("width", svgWidth + "px")
      .style("left", that.matrixLeft + "px")      
      .style("top", (-(svgHeight-(that.matrixTop-20))) + "px");
      // .style("top", (that.matrixTop) + "px");

    var svg = svgDiv.selectAll('svg').data(['svg']);
    svg.enter().append('svg')
      .style("height" , "960px")
      .style("width" , "955px")
      .style("visibility", "inherit");       

    var g = svg.selectAll('#calendarViewSvgGroup').data(['g']);
    g.enter().append('g')
      .style("visibility", "inherit") 
      .attr("id", "calendarViewSvgGroup")
      .attr('transform', 'translate(' + 0 + ',' + 0 + ')');


    var beginDate = that.toLocalTime(new Date("2013-06-01 00:00:00"));  
    var endDate = that.toLocalTime(new Date("2014-09-24 00:00:00"));
    // var beginDate = new Date(1374292800000);  
    // var endDate = new Date(1374379200000);

    var xScale = d3.time.scale().domain([beginDate, endDate]).range([0, svgWidth]);      
    
    var xAxis = d3.svg.axis()
      .scale(xScale)
      .tickFormat(d3.time.format('%b'))
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

    var tableSvg = matrixGroup.selectAll('#calendarViewTableSvg').data(['tableSvg']);
    tableSvg
      .enter().append('g')
      .style("visibility", "inherit")
      // .attr('width', svgWidth)
      .attr('id', "calendarViewTableSvg");
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

        // console.log(brush.empty());
        
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
      .attr("id", "calendarBrush")   
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
        d3.selectAll("#calendarViewMatrixPointedStationLine").remove();
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

    if (that.ordering.split(" ")[0] == "Station" && that.ordering.split(" ")[1] != "Size") {
      d3.selectAll(".calendarViewStationRepresentation")        
        .attr("fill", "hsl(" + (0.1 * 360) + ", 100%, 50%)");
    } else {
      d3.selectAll(".calendarViewStationRepresentation")        
        .attr("fill", function(d) {
          var sat = 100 * (d.orderingValue - that.minOrderingValue) / (that.maxOrderingValue - that.minOrderingValue);
          return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
        });
    }

    
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

      var timeWindowBegin = new Date("2013-06-01 00:00:00");
      // console.log(timeWindowBegin);      
      // console.log(brush.extent()[0][0]);      
      timeWindowBegin.setDate(timeWindowBegin.getDate()+Math.round(brush.extent()[0][0]));
      // timeWindowBegin.setHours(0);
      // timeWindowBegin.setSeconds(0);
      // timeWindowBegin.setMinutes(that.brushExtent[0][0]*15);
      
      var timeWindowEnd = new Date("2013-06-01 00:00:00");
      timeWindowEnd.setDate(timeWindowEnd.getDate()+Math.round(brush.extent()[1][0]));
      // console.log(brush.extent()[1][0]);
      // timeWindowEnd.setHours(0);
      // timeWindowEnd.setSeconds(0);
      // timeWindowEnd.setMinutes((that.brushExtent[1][0])*15);

      for (var i = that.brushExtent[0][1]; i < that.brushExtent[1][1]; i++) {
        d3.select("#calendarViewStationRepresentation" + that.actualOrderingList.orderedStations[i].id)
          .attr("fill", function(d) {
            // var sat = 100 * (that.actualOrderingList.orderedStations[i].orderingValue - that.minOrderingValue) / (that.maxOrderingValue - that.minOrderingValue);
            // // console.log(sat);
            // return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";

            if (!that.actualOrderingList.orderedStations[i].selected) {
              return "hsl(" + (0.1 * 360) + ", 0%, 50%)";
            }

            var value = (that.actualOrderingList.orderedStations[i].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);

            return that.actualPropertyColorScale(value);  
          });
      }

      d3.select("#calendarViewInfoBrushTimeWindow").text("Time window: " + timeWindowBegin.toDateString() + " <-> " + timeWindowEnd.toDateString());
      d3.select("#calendarViewInfoBrushRowRange").text("Row range: " + that.brushExtent[0][1] + " <-> " + (that.brushExtent[1][1]-1));
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
      d3.select("#calendarViewStationRepresentation" + that.actualOrderingList.orderedStations[i].id)
        .attr("fill", function(d) {
          // var sat = 100 * (that.actualOrderingList.orderedStations[i].orderingValue - that.minOrderingValue) / (that.maxOrderingValue - that.minOrderingValue);
          // // console.log(sat);
          // return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
          var value = (that.actualOrderingList.orderedStations[i].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);

          return that.actualPropertyColorScale(value);
        });
    }



    
  };

  updateFilterTable(that.stations, ts, that.actualPropertyColorScale);
  // that.updateFilterTable(that.actualOrderingList.orderedStations, ts, that.actualPropertyColorScale);
  this.updateValuesRange();

  if (!this.playing) {
    return;
  }

  setTimeout(function() {
    that.updateBrushExtentPlaying(that);
  }, 500)
};

CalendarViewMatrixViewer.prototype.updateBrushExtentPlaying = function(obj) {
  
  // console.log("updateBrushExtentPlaying");

  // console.log(obj.brushExtent);

  if (new Date(obj.brushExtent[1][0] + 1) > obj.xScale.domain()[1]) {
    return;
  }

  obj.brushExtent = [[new Date(obj.brushExtent[0][0] + 1),obj.brushExtent[0][1]], [new Date(obj.brushExtent[1][0] + 1),obj.brushExtent[1][1]]];
  
  // console.log(obj.brushExtent);

  obj.brush.extent(obj.brushExtent);
  obj.brush(d3.select("#calendarBrush"));
  obj.brush.event(d3.select("#calendarBrush")); 

  for (index in obj.actualOrderingList.orderedStations) {
    if (obj.actualOrderingList.orderedStations[index].id == obj.stationPointedInMapId) {
      obj.lastPointedStationOrder = index;
      obj.pointedStation(index);
    }
  }   
}

/**
 * Returns whether viewer is active.
 */
CalendarViewMatrixViewer.prototype.isActive = function() {
  return this.active_;
};

/**
 * Activates/deactivates viewer.
 */
CalendarViewMatrixViewer.prototype.setActive = function(active) {
  var mustUpdate = active && !this.active_;
  this.active_ = active;

  // Show/hide containers.
  utils.setVisibility(this.visibleContainersId_, this.active_);
  
};

CalendarViewMatrixViewer.prototype.update = function() {
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