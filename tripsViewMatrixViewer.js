
/**
 * Class to show plots analytics about the data.
 *
 */
var TripsViewMatrixViewer = function(dataManager, viewerContainerId) {
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
  this.tripsDayOfWeek = 0;
  this.variable = "b";
  this.variablesList = [];
  this.stations = [];
  this.orderLists = [];

  // this.dataManager_.getTripsView(this.dayOfWeek,this);
  this.dataManager_.loadStations(this);
  

  this.actualOrderingList = {orderedStations: []}; 
  for (stationOrder in this.actualOrderingList.orderedStations) {
    this.actualOrderingList.orderedStations[stationOrder].orderHistory = [];
  }
  this.ordering = "Balance (bikes/capacity): max";

  this.useGlobalNormalization = true;

  this.displayAndOrderLocked = true;

  this.viewOutages = true;
  this.viewOutgoingTrips = true;
  this.viewIncomingTrips = true;
  this.viewCyclicTrips = true;
  

  this.actualDistanceMinValue = 0;
  this.actualDistanceMaxValue = 14000;

  this.actualDurationMinValue = 0;
  this.actualDurationMaxValue = 7200;

  this.actualDirectionMinValue = 0;
  this.actualDirectionMaxValue = 360;

  this.actualFlowMinValue = 0;
  this.actualFlowMaxValue = 1000;

  this.viewTripsDistance = true;
  this.viewTripsDuration = false;

  this.matrixPointedColumn = -1;
}

TripsViewMatrixViewer.prototype.createColorScales = function() {

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

  // console.log(colorScaleNames); 

  d3.select("#analyticsTripsViewColorScaleOptions").selectAll(".TripsViewColorScaleOption").data(colorScaleNames).enter()
    .append("option")
      .attr("class", "TripsViewColorScaleOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;}); 


  
  this.actualPropertyColorScale = this.colorScales["Heat"];  

  d3.select("#TripsViewColorScale").selectAll(".TripsViewColorScaleSample").remove();

  var resolution = 10;
  var colorScaleSample = [];
  for (var colorScaleSampleIndex = 0; colorScaleSampleIndex <= resolution; colorScaleSampleIndex++) {
    colorScaleSample.push(colorScaleSampleIndex/resolution);
  }
  
  var colorScaleWidth = 220;
  var colorScaleHeight = 10;

  d3.select("#TripsViewColorScale").selectAll(".TripsViewColorScaleSample").data(colorScaleSample).enter()
  .append("div")
    .attr("class", "TripsViewColorScaleSample")
    .style("width", ((colorScaleWidth - 10)/(resolution + 1))  + "px")
    .style("height", colorScaleHeight + "px")
    .style("float", "left")
    .style("background", function(d,i) { return that.actualPropertyColorScale(d);});
  
}

TripsViewMatrixViewer.prototype.reorderLines = function() {

  var that = this;  

  var orderingVariable = this.variableNametoKeyMap[that.ordering.split(": ")[0]];
  var orderingStat = that.ordering.split(": ")[1];

  var element = document.getElementById('analyticsTripsViewOrdering');

  if (orderingVariable == "out" ||
    orderingVariable == "fout" ||
    orderingVariable == "eout") {

    orderingStat = "sum";

    element.value = this.variableKeyToNameMap[orderingVariable];
  } else {
    element.value = this.variableKeyToNameMap[orderingVariable] + ": " + orderingStat;
  } 

  

  // var element = document.getElementById('analyticsTripsViewVariables');

  // element.value = this.variableKeyToNameMap[this.variable];

  console.log("reorderLines");
  console.log(orderingVariable + "  " + orderingStat);

  


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
          if (that.dataManager_.stationsDayTrips[that.calendarDay][a.number] == undefined) {
          
            var index = newOrderingList.indexOf(a); 
            if (index > -1) {     
              newOrderingList[index].orderingValue = -1;        
            }

            return -1;
          }
          
          tsA = [];
          for (var i = that.brushExtent[0][0]; i < that.brushExtent[1][0]; i++) {
            if (that.dataManager_.stationsDayTrips[that.calendarDay][a.number][i] == undefined) {
           
            } else {
              tsA.push(that.dataManager_.stationsDayTrips[that.calendarDay][a.number][i]);
            }
          }
          
          if (that.dataManager_.stationsDayTrips[that.calendarDay][b.number] == undefined) {
            var index = newOrderingList.indexOf(b); 
            if (index > -1) {     
              newOrderingList[index].orderingValue = -1;        
            }

            return 1;
          }         

          tsB = [];
          for (var i = that.brushExtent[0][0]; i < that.brushExtent[1][0]; i++) {
            if (that.dataManager_.stationsDayTrips[that.calendarDay][b.number][i] == undefined) {
           
            } else {
              tsB.push(that.dataManager_.stationsDayTrips[that.calendarDay][b.number][i]);
            }
          }
        } else {
          if (that.dataManager_.stationsPeriodTrips[that.period][that.tripsDayOfWeek][a.number] == undefined) {
          
            var index = newOrderingList.indexOf(a); 
            if (index > -1) {     
              newOrderingList[index].orderingValue = -1;        
            }

            return -1;
          }
          
          tsA = [];
          for (var i = that.brushExtent[0][0]; i < that.brushExtent[1][0]; i++) {
            if (that.dataManager_.stationsPeriodTrips[that.period][that.tripsDayOfWeek][a.number][i] == undefined) {
           
            } else {
              tsA.push(that.dataManager_.stationsPeriodTrips[that.period][that.tripsDayOfWeek][a.number][i]);
            }
          }
          
          if (that.dataManager_.stationsPeriodTrips[that.period][that.tripsDayOfWeek][b.number] == undefined) {
            var index = newOrderingList.indexOf(b); 
            if (index > -1) {     
              newOrderingList[index].orderingValue = -1;        
            }

            return 1;
          }         

          tsB = [];
          for (var i = that.brushExtent[0][0]; i < that.brushExtent[1][0]; i++) {
            if (that.dataManager_.stationsPeriodTrips[that.period][that.tripsDayOfWeek][b.number][i] == undefined) {
           
            } else {
              tsB.push(that.dataManager_.stationsPeriodTrips[that.period][that.tripsDayOfWeek][b.number][i]);
            }
          }
          // if (that.dataManager_.stationsTripsView[that.period][a.number][that.dayOfWeek][orderingVariable] == undefined) {
          
          //   var index = newOrderingList.indexOf(a); 
          //   if (index > -1) {     
          //     newOrderingList[index].orderingValue = -1;        
          //   }

          //   return -1;
          // }

          // tsA = Array.prototype.slice.call(that.dataManager_.stationsTripsView[that.period][a.number][that.dayOfWeek][orderingVariable]["a"]);        
          // tsA = tsA.slice(that.brushExtent[0][0], that.brushExtent[1][0]);                    

          // if (that.dataManager_.stationsTripsView[that.period][b.number][that.dayOfWeek][orderingVariable] == undefined) {
          //   var index = newOrderingList.indexOf(b); 
          //   if (index > -1) {     
          //     newOrderingList[index].orderingValue = -1;        
          //   }

          //   return 1;
          // }

          // tsB = Array.prototype.slice.call(that.dataManager_.stationsTripsView[that.period][b.number][that.dayOfWeek][orderingVariable]["a"]);        
          // tsB = tsB.slice(that.brushExtent[0][0], that.brushExtent[1][0]);
        }

        // console.log(tsA);


        if (orderingStat == "mean") {    
          // keyA = d3.mean(tsA, function(d) {           
          //  return (d[orderingVariable] == undefined) ? 0 : d[orderingVariable].length;
          // });
          // keyB = d3.mean(tsB, function(d) {           
          //  return (d[orderingVariable] == undefined) ? 0 : d[orderingVariable].length;
          // });
          // console.log(tsA);
          // console.log(keyA + "  " + keyB);          
          keyA = d3.mean(tsA, function(d) { return d[orderingVariable]});
          keyB = d3.mean(tsB, function(d) { return d[orderingVariable]});
        } else if (orderingStat == "sum") {    
          keyA = d3.sum(tsA, function(d) { return d[orderingVariable]});
          keyB = d3.sum(tsB, function(d) { return d[orderingVariable]});
        } else if (orderingStat == "min") {    
          keyA = d3.min(tsA, function(d) { return d[orderingVariable]});
          keyB = d3.min(tsB, function(d) { return d[orderingVariable]});
        } else if (orderingStat == "max") {    
          keyA = d3.max(tsA, function(d) { return d[orderingVariable]});
          keyB = d3.max(tsB, function(d) { return d[orderingVariable]});
        } else if (orderingStat == "range") {
          var extendA = d3.extent(tsA, function(d) { return d[orderingVariable]});
          keyA = extendA[1] - extendA[0];
          
          var extendB = d3.extent(tsB, function(d) { return d[orderingVariable]});
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

  // for (newOrderingListIndex in newOrderingList) {
  //   newOrderingList[newOrderingListIndex].order = newOrderingListIndex;
  // } 

  // console.log(this.stations);

  if (this.brushExtent[0][0] != undefined) {


    for (stationOrder in newOrderingList) {
      // console.log(newOrderingList[stationOrder]);
      if (this.stations[newOrderingList[stationOrder].posInStationsList].orderHistory == undefined) {
        this.stations[newOrderingList[stationOrder].posInStationsList].orderHistory = [];
      }
      var index = Math.floor(this.brushExtent[0][0] + (this.brushExtent[1][0] - this.brushExtent[0][0])/2);

      this.stations[newOrderingList[stationOrder].posInStationsList].orderHistory.push([Math.floor(this.brushExtent[0][0] + (this.brushExtent[1][0] - this.brushExtent[0][0])/2), stationOrder]);
      this.stations[newOrderingList[stationOrder].posInStationsList]["order"] = stationOrder;
      // newOrderingList[stationOrder].orderHistory.push([Math.floor(this.brushExtent[0][0] + (this.brushExtent[1][0] - this.brushExtent[0][0])/2), stationOrder]);
    }

    // console.log(this.stations[135].orderHistory);

  }

  


  this.actualOrderingList.orderedStations = newOrderingList; 



  // if (this.mapViewer != undefined) {
  //   this.mapViewer.selectionAreaSizeChanged(0);
  // }
  
}

TripsViewMatrixViewer.prototype.createOrderLists = function() {

  var that = this;

  stats = ["mean", "min", "max", "range"];  

  // console.log(this.variableKeyToNameMap);

  var orderingNames = [];
  for (variable in this.variableKeyToNameMap) {       
    
    if (variable == "out" ||
      variable == "fout" ||
      variable == "eout") {

      orderingNames.push(this.variableKeyToNameMap[variable]); 
    } else {
      for (stat in stats) {      
        orderingNames.push(this.variableKeyToNameMap[variable] + ": " + stats[stat]); 
      }
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
  
  d3.select("#analyticsTripsViewOrdering").selectAll(".TripsViewNonStationOrderingOption").data(orderingNames).enter()
    .append("option")
      .attr("class", "TripsViewNonStationOrderingOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;}); 

  // this.stations = this.dataManager_.stations;
  this.stations = [];
  for (stationIndex in this.dataManager_.stations) {
    // if (this.dataManager_.stations[stationIndex].id in Object.keys(this.dataManager_.stationsDayTrips[this.calendarDay])) {
    this.stations.push(this.dataManager_.stations[stationIndex]);
    // }
  }



  // console.log(that.period);
  // console.log(that.dayOfWeek);

  // console.log(that.dataManager_.stationsTripsView[that.period]);

  // that.maxCapacity = 0;
  // that.minCapacity = 99999;

  this.stations.forEach(function (station, index) {
    // console.log(station.number);
    station.order = index;
    station.dataArray = [];
    station.value = 0;
    station.selected = false;    
  });

  // this.ordering = orderingNames[17];
  this.ordering = "Number of outages";

  this.mapViewer.createStationsLayer(this.stations);
  // console.log(this.stations);

}

TripsViewMatrixViewer.prototype.setVariablesList = function() {

  var that = this;

  this.variableKeyToNameMap = [];
  // this.variableKeyToNameMap["b"] = "Balance (bikes/capacity)";
  // this.variableKeyToNameMap["bSD"] = "Balance StdDev";
  // this.variableKeyToNameMap["bi"] = "Bikes Available";
  // this.variableKeyToNameMap["biSD"] = "Bikes Available StdDev";
  // this.variableKeyToNameMap["biI"] = "Bikes arrival";
  // this.variableKeyToNameMap["biISD"] = "Bikes arrival StdDev";
  // this.variableKeyToNameMap["biIF"] = "Bikes arrival frequency (arrivals/minute)";
  // this.variableKeyToNameMap["biIFSD"] = "Bikes arrival frequency StdDev";
  // this.variableKeyToNameMap["biO"] = "Bikes take out";
  // this.variableKeyToNameMap["biOSD"] = "Bikes take out StdDev";
  // this.variableKeyToNameMap["biOF"] = "Bikes take out frequency (take outs/minute)";
  // this.variableKeyToNameMap["biOFSD"] = "Bikes take out frequency StdDev";
  // this.variableKeyToNameMap["c"] = "Station capacity";
  // this.variableKeyToNameMap["cSD"] = "Station capacity StdDev";
  // this.variableKeyToNameMap["f"] = "Frequency ((arrivals+takeouts)/minute)";
  // this.variableKeyToNameMap["fSD"] = "Frequency StdDev";
  // this.variableKeyToNameMap["s"] = "Free slots";
  // this.variableKeyToNameMap["sSD"] = "Free slots StdDev";  
  // this.variableKeyToNameMap["Station"] = "Station";  

  
  this.variableKeyToNameMap["isp"] = "Number of incoming origins"; 
  this.variableKeyToNameMap["osp"] = "Number of outgoing destinations"; 
  this.variableKeyToNameMap["gsp"] = "Number of origins and destinations"; 
  this.variableKeyToNameMap["tdi"] = "Trips distance";
  this.variableKeyToNameMap["tdu"] = "Trips duration";
  this.variableKeyToNameMap["ior"] = "In/out difference";
  // this.variableKeyToNameMap["spd"] = "Deviation from shortest path";  
  this.variableKeyToNameMap["nc"] = "Number of cyclic trips";
  this.variableKeyToNameMap["ni"] = "Number of incoming trips"; 
  this.variableKeyToNameMap["no"] = "Number of outgoing trips"; 
  this.variableKeyToNameMap["nt"] = "Number of trips"; 
  this.variableKeyToNameMap["out"] = "Number of outages"; 
  this.variableKeyToNameMap["fout"] = "Number of full outages"; 
  this.variableKeyToNameMap["eout"] = "Number of empty outages"; 
  this.variableKeyToNameMap["b"] = "Balance"; 
  this.variableKeyToNameMap["c"] = "Capacity"; 

  this.variableNametoKeyMap = [];
  for (key in this.variableKeyToNameMap) {
    this.variableNametoKeyMap[this.variableKeyToNameMap[key]] = key;    
  }

  // for (variable in Object.keys(this.dataManager_.stationsTripsView[that.period][72][0])) {

  //   if (Object.keys(this.dataManager_.stationsTripsView[that.period][72][0])[variable].indexOf("SD") != -1) {
  //     continue;
  //   }

  //   if (Object.keys(this.dataManager_.stationsTripsView[that.period][72][0])[variable] != "st") {
  //     this.variablesList.push(this.variableKeyToNameMap[Object.keys(this.dataManager_.stationsTripsView[that.period][72][0])[variable]]);
  //   }
  // }

  this.variablesList.push("Number of trips");

  this.variablesList.sort();

  d3.select("#analyticsTripsViewVariables").selectAll(".TripsViewVariableOption").data(this.variablesList).enter()
    .append("option")
      .attr("class", "TripsViewVariableOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;});

  this.variable = "nt";   

  // return;


  
  this.createOrderLists();
  this.reorderLines();
}

TripsViewMatrixViewer.prototype.processPeriodData = function(data, period, weekday) {

  console.log("processPeriodData");
  // console.log(this.dataManager_.stationsDirectionDistanceMatrix[344][530]);

  var that = this;

  var dayData = data[period][weekday];

  if (dayData == undefined || dayData == null) {
    return {};
  }

  // this.variableKeyToNameMap["isp"] = "Incoming spread"; 
  // this.variableKeyToNameMap["osp"] = "Outgoing spread"; *
  // this.variableKeyToNameMap["gsp"] = "General spread"; 
  // this.variableKeyToNameMap["tdi"] = "Trips distance"; *
  // this.variableKeyToNameMap["tdu"] = "Trips duration"; *
  // this.variableKeyToNameMap["ior"] = "In/out ratio"; *
  // this.variableKeyToNameMap["spd"] = "Deviation from shortest path";  
  // this.variableKeyToNameMap["nc"] = "Number of cyclic trips"; *
  // this.variableKeyToNameMap["ni"] = "Number of incoming trips";  *
  // this.variableKeyToNameMap["no"] = "Number of outgoing trips"; *
  // this.variableKeyToNameMap["nt"] = "Number of trips"; *

  // console.log(Object.keys(dayData));
  for (var keyIndex in Object.keys(dayData)) {

    var thisStationCapacity = -1;

    var stationNumber = Object.keys(dayData)[keyIndex];

    // console.log(stationNumber);

    for (var i = 0; i < 24; i++) {
      // console.log(i);
      if (dayData[stationNumber][i] == undefined) {
        
      } else {

        //turn the entry for the given time slot of the station into an array with some stats about the trips

        
        var oldContent = dayData[stationNumber][i];

        var newContent = [];
        newContent["no"] = 0;
        newContent["ni"] = 0;
        newContent["nc"] = 0;
        newContent["tdu"] = 0;
        newContent["tdi"] = 0;
        newContent["nt"] = 0;
        newContent["ior"] = 0;
        newContent["spd"] = 0;
        newContent["osp"] = oldContent.length;
        newContent["isp"] = 0;
        newContent["gsp"] = 0;
        newContent["ospn"] = 0;
        newContent["trips"] = oldContent;
        newContent["out"] = 0;
        newContent["fout"] = 0;
        newContent["eout"] = 0;
        newContent["b"] = 0; 
        newContent["c"] = 0; 
        



        //this cell has already been initialized
        if (dayData[stationNumber][i]["no"] != undefined) {

          newContent = oldContent;
          oldContent = newContent["trips"];
          // console.log("initialized");
          // console.log(dayData[stationNumber][i]);
        }

        if (that.dataManager_.stationsDayOfWeekModels[period][stationNumber] != undefined) {
          if (that.dataManager_.stationsDayOfWeekModels[period][stationNumber][weekday] != undefined
            && that.dataManager_.stationsDayOfWeekModels[period][stationNumber][weekday]["b"] != undefined
            && that.dataManager_.stationsDayOfWeekModels[period][stationNumber][weekday]["c"] != undefined) {

            var avgBalance = 0.0;            
            var avgCapacity = 0.0;            

            for (var j = 0; j < 4; j++) {
              avgBalance += that.dataManager_.stationsDayOfWeekModels[period][stationNumber][weekday]["b"]["a"][i*4+j];
              avgCapacity += that.dataManager_.stationsDayOfWeekModels[period][stationNumber][weekday]["c"]["a"][i*4+j];
            }

            avgBalance = avgBalance/4.0;
            avgCapacity = avgCapacity/4.0;

            // ctx.strokeStyle=colorScale(avgBalance);        
            // ctx.strokeStyle = 'rgba(255,255,255,1.0)';
            if (avgBalance > 0.9) {
              newContent["fout"] = 1;
              newContent["out"] = 1;
              // ctx.strokeStyle = 'rgba(255,0,0,0.5)';
              // ctx.strokeRect(3 + key*cellWidth-2, 3 + lineIndex*cellHeight-2,cellWidth-2,cellHeight-2);          
            } else if (avgBalance < 0.1) {
              newContent["eout"] = 1;
              newContent["out"] = 1;
              // ctx.strokeStyle = 'rgba(0,0,255,0.5)';
              // ctx.strokeRect(3 + key*cellWidth-2, 3 + lineIndex*cellHeight-2,cellWidth-2,cellHeight-2);          
            }  

            newContent["c"] = avgCapacity;

            newContent["b"] = avgBalance; 

            if (thisStationCapacity < 0) {
              thisStationCapacity = d3.mean(that.dataManager_.stationsDayOfWeekModels[period][stationNumber][weekday]["c"]["a"]);
              if (that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[stationNumber]] != undefined) {
                that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[stationNumber]]["capacity"] = thisStationCapacity;  

                // d3.select("#TripsViewStationRepresentationShadow" + that.actualOrderingList.orderedStations[i].id)
                //   .attr("r", function(d) {
                //     if (that.usingCalendarDayData) {
                //       return 3 + 7 * Math.sqrt(((that.brushExtent[1][1] - that.brushExtent[0][1]) -  (i - that.brushExtent[0][1])) / (that.brushExtent[1][1] - that.brushExtent[0][1]) /3.1416);
                //     } else {
                //       var minCapacity = 5;
                //       var maxCapacity = 65;
                //       var capacity = that.actualOrderingList.orderedStations[i].capacity;
                //       // console.log(capacity);
                //       // return 3 + 4 * Math.log(that.actualOrderingList.orderedStations[i].capacity);
                //       return 1 + Math.sqrt(capacity/3.1416);
                //     }
                    
                //   });

                var stationId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[stationNumber]].id;

                d3.selectAll("#TripsViewStationRepresentation" + stationId)
                  .attr("r", function(d) {                    
                    var minCapacity = 5;
                    var maxCapacity = 65;
                    var capacity = thisStationCapacity;
                    // console.log(capacity);
                    // return 3 + 4 * Math.log(that.actualOrderingList.orderedStations[i].capacity);
                    return 4 + 7 * Math.sqrt((capacity - minCapacity) / (maxCapacity - minCapacity)/3.1416);
            
                });

                d3.selectAll("#TripsViewStationRepresentationShadow" + stationId)
                  .attr("r", function(d) {                    
                    var minCapacity = 5;
                    var maxCapacity = 65;
                    var capacity = thisStationCapacity;
                    // console.log(capacity);
                    // return 3 + 4 * Math.log(that.actualOrderingList.orderedStations[i].capacity);
                    return 4 + 7 * Math.sqrt((capacity - minCapacity) / (maxCapacity - minCapacity)/3.1416);
            
                });
              }
              
            }

          }
        }

        
        for (var tripIndex = 0; tripIndex < oldContent.length; tripIndex++) {

          newContent["tdu"] += oldContent[tripIndex][2]; 

          if (stationNumber == oldContent[tripIndex][0]) {
            newContent["nc"] += oldContent[tripIndex][1];
                       
          } else {

            // console.log(stationNumber);
            // console.log(oldContent[tripIndex]);

            if (that.dataManager_.stationsDirectionDistanceMatrix[stationNumber] == undefined) {
              continue;
            }

            var directionDistanceArray = that.dataManager_.stationsDirectionDistanceMatrix[stationNumber][oldContent[tripIndex][0]];

            if (directionDistanceArray == undefined || directionDistanceArray.length < 3) {
              continue;
            }

            newContent["tdi"] += directionDistanceArray[0]; 

            newContent["no"] += oldContent[tripIndex][1];

            // for (var tripIndex2 = 0; tripIndex2 < oldContent.length; tripIndex2++) {
            //   var directionDistanceArray2 = that.dataManager_.stationsDirectionDistanceMatrix[stationNumber][oldContent[tripIndex2][0]];

            //   if (directionDistanceArray2 == undefined || directionDistanceArray2.length < 3) {
            //     continue;
            //   }
              
            //   newContent["osp"] += Math.abs(Math.atan2(directionDistanceArray2[2] - directionDistanceArray[2], directionDistanceArray[1] - directionDistanceArray[1]) * 180 / Math.PI);
            //   newContent["ospn"] += 1;
              
            // }


            //update the entry of the destination station for this trip, adding a incoming trip

            if (dayData[oldContent[tripIndex][0]] == undefined) {
              dayData[oldContent[tripIndex][0]] = {};
            }

            if (dayData[oldContent[tripIndex][0]][i] == undefined) {
              dayData[oldContent[tripIndex][0]][i] = [];              
            }

            if (dayData[oldContent[tripIndex][0]][i]["no"] == undefined) {
              var newContentDestination = [];
              var oldContentDestination = dayData[oldContent[tripIndex][0]][i];
              newContentDestination["no"] = oldContent[tripIndex][1];
              newContentDestination["ni"] = 0;
              newContentDestination["nc"] = 0;
              newContentDestination["tdu"] = 0;
              newContentDestination["tdi"] = 0;
              newContentDestination["ior"] = 1;
              newContentDestination["nt"] = 1;
              newContentDestination["spd"] = 0;
              newContentDestination["osp"] = oldContent.length;
              newContentDestination["isp"] = 1;
              newContentDestination["gsp"] = oldContent.length + 1;
              newContentDestination["out"] = 0;
              newContentDestination["fout"] = 0;
              newContentDestination["eout"] = 0;
              newContentDestination["b"] = 0;              
              newContentDestination["c"] = 0; 
        
              newContentDestination["trips"] = oldContentDestination;

              newContentDestination["ni"] += oldContent[tripIndex][1];
              

              dayData[oldContent[tripIndex][0]][i] = newContentDestination;
            } else {
              dayData[oldContent[tripIndex][0]][i]["ni"] += oldContent[tripIndex][1];
              dayData[oldContent[tripIndex][0]][i]["nt"] += oldContent[tripIndex][1];

              dayData[oldContent[tripIndex][0]][i]["ior"] += oldContent[tripIndex][1];  
              dayData[oldContent[tripIndex][0]][i]["isp"] += 1;           
              dayData[oldContent[tripIndex][0]][i]["gsp"] += 1;
            }

          }
        }
        newContent["nt"] = newContent["nc"] + newContent["no"] + newContent["ni"];
        newContent["gsp"] = newContent["osp"] + newContent["isp"];
        newContent["ior"] = newContent["ni"] - newContent["no"];
        // newContent["osp"] /= newContent["ospn"];

        dayData[stationNumber][i] = newContent;
      }
    }
  }

  return dayData;

}

TripsViewMatrixViewer.prototype.processDayData = function(dayData) {

  console.log("processDayData");
  // console.log(this.dataManager_.stationsDirectionDistanceMatrix[344][530]);

  var that = this;

  // this.variableKeyToNameMap["isp"] = "Incoming spread"; 
  // this.variableKeyToNameMap["osp"] = "Outgoing spread"; *
  // this.variableKeyToNameMap["gsp"] = "General spread"; 
  // this.variableKeyToNameMap["tdi"] = "Trips distance"; *
  // this.variableKeyToNameMap["tdu"] = "Trips duration"; *
  // this.variableKeyToNameMap["ior"] = "In/out ratio"; *
  // this.variableKeyToNameMap["spd"] = "Deviation from shortest path";  
  // this.variableKeyToNameMap["nc"] = "Number of cyclic trips"; *
  // this.variableKeyToNameMap["ni"] = "Number of incoming trips";  *
  // this.variableKeyToNameMap["no"] = "Number of outgoing trips"; *
  // this.variableKeyToNameMap["nt"] = "Number of trips"; *

  // console.log(Object.keys(dayData));
  for (var keyIndex in Object.keys(dayData)) {

    var stationNumber = Object.keys(dayData)[keyIndex];

    // console.log(stationNumber);

    for (var i = 0; i < 24; i++) {
      if (dayData[stationNumber][i] == undefined) {
        
      } else {

        //turn the entry for the given time slot of the station into an array with some stats about the trips

        
        var oldContent = dayData[stationNumber][i];

        var newContent = [];
        newContent["no"] = oldContent.length;
        newContent["ni"] = 0;
        newContent["nc"] = 0;
        newContent["tdu"] = 0;
        newContent["tdi"] = 0;
        newContent["nt"] = 0;
        newContent["ior"] = 0;
        newContent["spd"] = 0;
        newContent["osp"] = 0;
        newContent["ospn"] = 0;
        newContent["trips"] = oldContent;
        newContent["out"] = 0;
        newContent["fout"] = 0;
        newContent["eout"] = 0;
        newContent["b"] = 0;
        // newContent["c"] = d3.mean(that.dataManager_.stationsDayActivity[that.calendarDay][stationNumber]["c"]);

        //this cell has already been initialized
        if (dayData[stationNumber][i]["no"] != undefined) {

          newContent = oldContent;
          oldContent = newContent["trips"];
          // console.log("initialized");
          // console.log(dayData[stationNumber][i]);
        }

        if (that.dataManager_.stationsDayActivity[that.calendarDay][stationNumber] != undefined) {

          var avgBalance = 0.0;

          for (var j = 0; j < 4; j++) {
            avgBalance += that.dataManager_.stationsDayActivity[that.calendarDay][stationNumber]["b"][i*4+j];
          }

          avgBalance = avgBalance/4.0;

          // ctx.strokeStyle=colorScale(avgBalance);        
          // ctx.strokeStyle = 'rgba(255,255,255,1.0)';
          if (avgBalance > 0.8) {
            newContent["fout"] = 1;
            newContent["out"] = 1;
            // ctx.strokeStyle = 'rgba(255,0,0,0.5)';
            // ctx.strokeRect(3 + key*cellWidth-2, 3 + lineIndex*cellHeight-2,cellWidth-2,cellHeight-2);          
          } else if (avgBalance < 0.2) {
            newContent["eout"] = 1;
            newContent["out"] = 1;
            // ctx.strokeStyle = 'rgba(0,0,255,0.5)';
            // ctx.strokeRect(3 + key*cellWidth-2, 3 + lineIndex*cellHeight-2,cellWidth-2,cellHeight-2);          
          }  

          newContent["b"] = avgBalance; 

        }

        
        for (var tripIndex = 0; tripIndex < oldContent.length; tripIndex++) {

          newContent["tdu"] += oldContent[tripIndex][1]; 

          if (stationNumber == oldContent[tripIndex][0]) {
            newContent["nc"] += 1;
                       
          } else {

            // console.log(stationNumber);
            // console.log(oldContent[tripIndex]);

            if (that.dataManager_.stationsDirectionDistanceMatrix[stationNumber] == undefined) {
              continue;
            }

            var directionDistanceArray = that.dataManager_.stationsDirectionDistanceMatrix[stationNumber][oldContent[tripIndex][0]];

            if (directionDistanceArray == undefined || directionDistanceArray.length < 3) {
              continue;
            }

            newContent["tdi"] += directionDistanceArray[0]; 

            newContent["no"] += 1;

            for (var tripIndex2 = 0; tripIndex2 < oldContent.length; tripIndex2++) {
              var directionDistanceArray2 = that.dataManager_.stationsDirectionDistanceMatrix[stationNumber][oldContent[tripIndex2][0]];

              if (directionDistanceArray2 == undefined || directionDistanceArray2.length < 3) {
                continue;
              }
              
              newContent["osp"] += Math.abs(Math.atan2(directionDistanceArray2[2] - directionDistanceArray[2], directionDistanceArray[1] - directionDistanceArray[1]) * 180 / Math.PI);
              newContent["ospn"] += 1;
              // newContent["osp"] += Math.sqrt(directionDistanceArray[1] * directionDistanceArray2[1] + directionDistanceArray[2] * directionDistanceArray2[2]);
            }


            //update the entry of the destination station for this trip, adding a incoming trip

            if (dayData[oldContent[tripIndex][0]][i] == undefined) {
              dayData[oldContent[tripIndex][0]][i] = [];              
            }

            if (dayData[oldContent[tripIndex][0]][i]["no"] == undefined) {
              var newContentDestination = [];
              var oldContentDestination = dayData[oldContent[tripIndex][0]][i];
              newContentDestination["no"] = oldContentDestination.length;
              newContentDestination["ni"] = 0;
              newContentDestination["nc"] = 0;
              newContentDestination["tdu"] = 0;
              newContentDestination["tdi"] = 0;
              newContentDestination["ior"] = 1;
              newContentDestination["nt"] = 1;
              newContentDestination["spd"] = 0;
              newContentDestination["out"] = 0;
              newContentDestination["fout"] = 0;
              newContentDestination["eout"] = 0;
              newContentDestination["b"] = 0;
              newContentDestination["trips"] = oldContentDestination;

              newContentDestination["ni"] += 1;

              dayData[oldContent[tripIndex][0]][i] = newContentDestination;
            } else {
              dayData[oldContent[tripIndex][0]][i]["ni"] += 1;
              dayData[oldContent[tripIndex][0]][i]["nt"] += 1;

              dayData[oldContent[tripIndex][0]][i]["ior"] += 1;              
            }

          }
        }
        newContent["nt"] = newContent["nc"] + newContent["no"] + newContent["ni"];
        newContent["ior"] = newContent["ni"] - newContent["no"];
        newContent["osp"] /= newContent["ospn"];

        dayData[stationNumber][i] = newContent;
      }
    }
  }

  return dayData;

}

TripsViewMatrixViewer.prototype.stationsLoaded = function() {
  // console.log(this.dataManager_.stations);
  // this.dataManager_.getStationsTripsView(this);

  var periodOptions = ["06 2013", "07 2013", "08 2013", "09 2013", "10 2013", "11 2013", "12 2013", "01 2014", "02 2014", "03 2014", "04 2014", "05 2014", "06 2014", "07 2014", "08 2014", "09 2014", "Summer 2013", "Fall 2013", "Winter 2013", "Spring 2014", "Summer 2014", "All"];

  d3.select("#analyticsTripsViewPeriod").selectAll(".TripsViewPeriodOption").data(periodOptions).enter()
    .append("option")
      .attr("class", "TripsViewVariableOption")
      .attr("value", function(d) {return d;})
      .text(function(d) {return d;});

  // this.period = "All";
  this.period = "07 2013";
  this.tripsDayOfWeek = 0;
  // this.calendarDay = "07-01-2013";
  // this.calendarDay = "07-06-2013";
  this.calendarDay = "08-01-2013";

  this.dataManager_.getStationsDirectionDistanceMatrix(this);

  // this.dataManager_.getStationsDayTrips(this, this.calendarDay);

  // return;

  this.brushExtent = [];
  this.brushExtent[0] = [];  
  this.brushExtent[1] = [];
  this.brushExtent[0][1] = 0;
  this.brushExtent[1][1] = this.dataManager_.stations.length-1;
  this.brushExtent[0][0] = 0;
  this.brushExtent[1][0] = 23;
}

TripsViewMatrixViewer.prototype.stationsDirectionDistanceMatrixLoaded = function() {

  console.log("stationsDirectionDistanceMatrixLoaded");

  console.log(this.dataManager_.stationsDirectionDistanceMatrix);
  
  // this.dataManager_.getStationsDayTrips(this, this.calendarDay); 
  // this.calendarDay = 0; 
  this.dataManager_.getStationsPeriodTrips(this, this.period);  
  
}

TripsViewMatrixViewer.prototype.stationsDayActivityLoaded  = function() {
  console.log(this.dataManager_.stationsDayActivity);
  if (!this.stationsDayOfWeekModelLoadedBefore) {

    this.setVariablesList();
    this.createColorScales();  
    this.stationsDayOfWeekModelLoadedBefore = true; 
  }

  this.usingCalendarDayData = true;
  this.usingPeriodDayOfWeekData = false;

  // this.updateRangeSliderLimits = true;

  this.createMatrix(); 
  // console.log(this.dataManager_.TripsView[dayOfWeek]);
  console.log("stationsDayActivityLoaded");

}

TripsViewMatrixViewer.prototype.stationsDayTripsLoaded = function() {

  console.log("stationsDayTripsLoaded");

  this.usingCalendarDayData = true;

  if (this.dataManager_.stationsDayTrips[this.calendarDay] == undefined) {
    alert("No trip data for the selected date. Try another date between 07/01/2013 and 08/31/2014.");
    return;
  }


  this.dataManager_.getDayActivity(this, this.calendarDay);
  
  // if (!this.stationsTripsLoadedBefore) {
  //   this.setVariablesList();
  //   this.createColorScales();  
  //   this.stationsTripsLoadedBefore = true; 
  //   this.globalMinValue = 0.0;
  //   this.globalMaxValue = 1.0;
  //   this.actualMinValue = 0.0;
  //   this.actualMaxValue = 1.0;
  //   this.updateRangeSliderLimits = true;
  // }

  // this.usingCalendarDayData = true;
  // this.usingPeriodDayOfWeekData = false;  

  // this.createMatrix(); 
  
  
}

TripsViewMatrixViewer.prototype.stationsPeriodTripsLoaded = function() {

  console.log("stationsPeriodTripsLoaded");

  this.usingCalendarDayData = false;

  console.log(this.dataManager_.stationsPeriodTrips[this.period]);

  this.dataManager_.getStationsDayOfWeekModels(this, this.period);
  
  // if (!this.stationsTripsLoadedBefore) {
  //   this.setVariablesList();
  //   this.createColorScales();  
  //   this.stationsTripsLoadedBefore = true; 
  //   this.globalMinValue = 0.0;
  //   this.globalMaxValue = 1.0;
  //   this.actualMinValue = 0.0;
  //   this.actualMaxValue = 1.0;
  //   this.updateRangeSliderLimits = true;
  // }

  // this.usingCalendarDayData = true;
  // this.usingPeriodDayOfWeekData = false;  

  // this.createMatrix(); 
  
  
}


TripsViewMatrixViewer.prototype.stationsDayOfWeekModelLoaded = function() {
  // console.log(this.dataManager_.stationsTripsView);
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

  // console.log(this.dataManager_.stationsDayOfWeekModels);
  // console.log(this.dataManager_.stationsPeriodTrips[this.period][0]);

  this.dataManager_.stationsPeriodTrips[this.period][0] = this.processPeriodData(this.dataManager_.stationsPeriodTrips, this.period, 0);
  this.dataManager_.stationsPeriodTrips[this.period][1] = this.processPeriodData(this.dataManager_.stationsPeriodTrips, this.period, 1);
  this.dataManager_.stationsPeriodTrips[this.period][2] = this.processPeriodData(this.dataManager_.stationsPeriodTrips, this.period, 2);
  this.dataManager_.stationsPeriodTrips[this.period][3] = this.processPeriodData(this.dataManager_.stationsPeriodTrips, this.period, 3);
  this.dataManager_.stationsPeriodTrips[this.period][4] = this.processPeriodData(this.dataManager_.stationsPeriodTrips, this.period, 4);
  this.dataManager_.stationsPeriodTrips[this.period][5] = this.processPeriodData(this.dataManager_.stationsPeriodTrips, this.period, 5);
  this.dataManager_.stationsPeriodTrips[this.period][6] = this.processPeriodData(this.dataManager_.stationsPeriodTrips, this.period, 6);
  this.dataManager_.stationsPeriodTrips[this.period][7] = this.processPeriodData(this.dataManager_.stationsPeriodTrips, this.period, 7);
  this.dataManager_.stationsPeriodTrips[this.period][8] = this.processPeriodData(this.dataManager_.stationsPeriodTrips, this.period, 8);

  // console.log(this.dataManager_.stationsPeriodTrips[this.period][0]);
  
  this.createMatrix();


  d3.select("#modeVisContainerAnalyticsTripsViewContainerMiddleContainer").style("display", "none");

  d3.select("#modeVisContainerAnalyticsTripsViewContainerLeftContainer").style("display", "none");
  // console.log(this.dataManager_.TripsView[dayOfWeek]);
  // console.log("stationsDayOfWeekModelLoaded");
}

TripsViewMatrixViewer.prototype.stationsDayActivityLoaded = function() {

  console.log("stationsDayActivityLoaded");
  
  console.log(this.dataManager_.stationsDayActivity);

  if (this.dataManager_.stationsDayActivity[this.calendarDay] == undefined) {
    alert("No balance data for the selected date. Try another date between 07/01/2013 and 08/31/2014.");
    return;
  }

  if (!this.stationsTripsLoadedBefore) {
    this.setVariablesList();
    this.createColorScales();  
    this.stationsTripsLoadedBefore = true; 
    this.globalMinValue = 0.0;
    this.globalMaxValue = 1.0;
    this.actualMinValue = 0.0;
    this.actualMaxValue = 1.0;
    this.updateRangeSliderLimits = true;
  }

  this.usingCalendarDayData = true;
  this.usingPeriodDayOfWeekData = false;

  // this.updateRangeSliderLimits = true;
  this.dataManager_.stationsDayTrips[this.calendarDay] = this.processDayData(this.dataManager_.stationsDayTrips[this.calendarDay]);
  this.createMatrix(); 
  // console.log(this.dataManager_.TripsView[dayOfWeek]);
  
}

TripsViewMatrixViewer.prototype.toLocalTime = function(time) {
  var newTime = time;
  newTime.setHours(newTime.getHours() - 6);
  return newTime;
}

TripsViewMatrixViewer.prototype.updateColorScale = function() {

  var that = this;

  d3.select("#TripsViewColorScale").selectAll(".TripsViewColorScaleSample").remove();

  var resolution = 10;
  var colorScaleSample = [];
  for (var colorScaleSampleIndex = 0; colorScaleSampleIndex <= resolution; colorScaleSampleIndex++) {
    colorScaleSample.push(colorScaleSampleIndex/resolution);
  }

  // console.log(colorScaleSample);

  var colorScaleWidth = 220;
  var colorScaleHeight = 10;

  d3.select("#TripsViewColorScale").selectAll(".TripsViewColorScaleSample").data(colorScaleSample).enter()
  .append("div")
    .attr("class", "TripsViewColorScaleSample")
    .style("width", ((colorScaleWidth - 10)/(resolution + 1))  + "px")
    .style("height", colorScaleHeight + "px")
    .style("float", "left")
    .style("background", function(d,i) { return that.actualPropertyColorScale(d);});

  this.createMatrix();
}

TripsViewMatrixViewer.prototype.updateMatrix = function() {
  this.createMatrix();
}

TripsViewMatrixViewer.prototype.getFormatedValue = function(value, variableName) {


  // this.variableKeyToNameMap["isp"] = "Incoming spread"; 
  // this.variableKeyToNameMap["osp"] = "Outgoing spread"; 
  // this.variableKeyToNameMap["gsp"] = "General spread"; 
  // this.variableKeyToNameMap["tdi"] = "Trips distance";
  // this.variableKeyToNameMap["tdu"] = "Trips duration";
  // this.variableKeyToNameMap["ior"] = "In/out difference";
  // this.variableKeyToNameMap["spd"] = "Deviation from shortest path";  
  // this.variableKeyToNameMap["nc"] = "Number of cyclic trips";
  // this.variableKeyToNameMap["ni"] = "Number of incoming trips"; 
  // this.variableKeyToNameMap["no"] = "Number of outgoing trips"; 
  // this.variableKeyToNameMap["nt"] = "Number of trips"; 
  // this.variableKeyToNameMap["out"] = "Number of outages"; 
  // this.variableKeyToNameMap["fout"] = "Number of full outages"; 
  // this.variableKeyToNameMap["eout"] = "Number of empty outages"; 
  // this.variableKeyToNameMap["b"] = "Balance"; 

  if (variableName == "Number of cyclic trips" ||
    variableName == "Number of incoming trips" ||
    variableName == "Number of outgoing trips" ||
    variableName == "Number of trips" ||
    variableName == "Number of outages" ||
    variableName == "Number of full outages" ||
    variableName == "Number of empty outages" ||
    variableName == "Balance") {
    return value.toFixed(2);
  }  

  if (variableName == "In/out difference" ||    
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

TripsViewMatrixViewer.prototype.updateValuesRange = function() {

  var that = this;

  if (that.lastPointedStationOrder >= 0 && !that.useGlobalNormalization) {
    var min = d3.min(that.ts[that.lastPointedStationOrder]);
    var max = d3.max(that.ts[that.lastPointedStationOrder]);
    d3.select("#TripsViewMinValueLabel")
      .text(that.getFormatedValue(min, that.variable));
    d3.select("#TripsViewMaxValueLabel")
      .text(that.getFormatedValue(max, that.variable));
  } else {
    // d3.select("#TripsViewMinValueLabel")
    //   .text(that.getFormatedValue(that.globalMinValue, that.variable));
    // d3.select("#TripsViewMaxValueLabel")
    //   .text(that.getFormatedValue(that.globalMaxValue, that.variable));    
  }
}

TripsViewMatrixViewer.prototype.updateCursorSelectionInfo = function(orderIndex) {
  var that = this;

  if (orderIndex < 0) {
    d3.select("#tripsDaysOfWeekModelsInfoCursorId")
      .text("Id:");
    d3.select("#tripsDaysOfWeekModelsInfoCursorNumber")
      .text("Number:");
    d3.select("#tripsDaysOfWeekModelsInfoCursorName")
      .text("Name:");
    d3.select("#tripsDaysOfWeekModelsInfoCursorRank")
      .text("Rank:");
    d3.select("#tripsDaysOfWeekModelsInfoCursorRankingValue")
      .text("Ranking value:");
  } else {
    d3.select("#tripsDaysOfWeekModelsInfoCursorId")
      .text("Id: " + that.actualOrderingList.orderedStations[orderIndex].id);
    d3.select("#tripsDaysOfWeekModelsInfoCursorNumber")
      .text("Number:" + that.actualOrderingList.orderedStations[orderIndex].number);
    d3.select("#tripsDaysOfWeekModelsInfoCursorName")
      .text("Name: " + that.actualOrderingList.orderedStations[orderIndex].name);
    d3.select("#tripsDaysOfWeekModelsInfoCursorRank")
      .text("Rank:" + orderIndex);
    d3.select("#tripsDaysOfWeekModelsInfoCursorRankingValue")
      .text("Ranking value:" + that.getFormatedValue(that.actualOrderingList.orderedStations[orderIndex].orderingValue, that.ordering));
  }
}

TripsViewMatrixViewer.prototype.scrollMatrixToLine = function(orderIndex) {
  console.log(this.cellHeight);
  $("#tripsTableCanvasDiv").scrollTop(orderIndex * this.cellHeight);
}

TripsViewMatrixViewer.prototype.pointedStation = function(orderIndex) {

  // return;

  d3.selectAll(".tripsViewTripSvgPointer").remove();  
  d3.selectAll(".tripsViewStationSvgCyclicTripSvgPointer").remove();

  var that = this;

  this.unpointedStation(this.lastPointedStationOrder);
  if (this.actualOrderingList.orderedStations[orderIndex] == undefined) {
    return;
  }
  var thisId = this.actualOrderingList.orderedStations[orderIndex].id; 
  d3.select("#TripsViewStationRepresentationShadow"+thisId)
    .attr("opacity", 1.0); 
  d3.select("#TripsViewStationRepresentation"+thisId)
    .attr("opacity", 1.0)
    // .attr("r", 9);
    .attr("stroke",  "black")
    .attr("stroke-width",  "2.5px");
  this.lastPointedStationOrder = orderIndex;
  this.updateValuesRange();  

  d3.select("#TripsViewTopStationsListLabel"+orderIndex)
    .style("font-size", "14px") 
    .style("font-weight", "bold");
  d3.select("#TripsViewLastStationsListLabel"+orderIndex)
    .style("font-size", "14px") 
    .style("font-weight", "bold");

  d3.select("#TripsViewStationInAreaListLabel"+orderIndex)
    .style("font-size", "14px") 
    .style("font-weight", "bold");

    // console.log(d3.select("#tripsViewStationSvg"+thisId).attr("x"));


  // console.log(that.matrixPointedColumn);

 

  // d3.selectAll("#TripsViewStationRepresentationText" + this.actualOrderingList.orderedStations[orderIndex].id)
  //   .attr("fill-opacity", "1.0");

  that.updateCursorSelectionInfo(orderIndex);

  if (!that.cursorOverMatrix) {
    // return;
    that.scrollMatrixToLine(orderIndex);
    d3.select("#tripsPointedLineRect")            
      .attr("y", that.cellHeight * orderIndex)      
      .attr("opacity", 1);
    that.updatedMatrixPointedLine(this.lastPointedStationOrder);
    
  }

  return;


  var originStationNumber = this.actualOrderingList.orderedStations[orderIndex].number;

  if (that.dataManager_.stationsDayTrips[that.calendarDay][originStationNumber][that.matrixPointedColumn] == undefined) {
    return;
  }

  var trips = [];  
  var cyclicTrips = [];
  var pointSet = [[originStationNumber, 0]];

  // for (tripIndex in that.dataManager_.stationsDayTrips[that.calendarDay][originStationNumber][that.matrixPointedColumn]["trips"]) {
  for (tripIndex in that.ts[orderIndex][that.matrixPointedColumn]["trips"]) {    
    // console.log(tripIndex);
    var destStationNumber = that.ts[orderIndex][that.matrixPointedColumn]["trips"][tripIndex][0];
    if (that.dataManager_.stationsIndexedByNumber[destStationNumber] != undefined
      && that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destStationNumber]] != undefined){
                

      if (originStationNumber != destStationNumber) {

        var directionDistanceArray = that.dataManager_.stationsDirectionDistanceMatrix[originStationNumber][destStationNumber];
                  
        if (directionDistanceArray == undefined || directionDistanceArray.length < 3) {
          continue;
        }
        if (that.viewOutgoingTrips) {
          trips.push(that.ts[orderIndex][that.matrixPointedColumn]["trips"][tripIndex]);
          pointSet.push(that.ts[orderIndex][that.matrixPointedColumn]["trips"][tripIndex]);
        }
      } else {
       var duration = that.ts[orderIndex][that.matrixPointedColumn]["trips"][tripIndex][1];
       var zoom = that.mapViewer.map_.getZoom();
       var lat = that.mapViewer.map_.getCenter().lat();

       var metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);

       var distance = duration * 2.7; //2.7m/s

       var radius = (distance/metersPerPixel)/2;

       if (that.viewCyclicTrips) {
        cyclicTrips.push([that.ts[orderIndex][that.matrixPointedColumn]["trips"][tripIndex][0], radius]);
       }

      }
    }
  }

  var incomingTrips = [];

  // ok, here the destStation is the origin, and originStation is the destination, a mess, but it doesnt matter right now

  for (tripIndex in that.ts[orderIndex][that.matrixPointedColumn]["it"]) {    
    var destStationNumber = that.ts[orderIndex][that.matrixPointedColumn]["it"][tripIndex][0];
    if (that.dataManager_.stationsIndexedByNumber[destStationNumber] != undefined
      && that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destStationNumber]] != undefined){

      var directionDistanceArray = that.dataManager_.stationsDirectionDistanceMatrix[originStationNumber][destStationNumber];
                  
      if (directionDistanceArray == undefined || directionDistanceArray.length < 3) {
        continue;
      }
      if (that.viewIncomingTrips) {
        incomingTrips.push(that.ts[orderIndex][that.matrixPointedColumn]["it"][tripIndex]);
        pointSet.push(that.ts[orderIndex][that.matrixPointedColumn]["it"][tripIndex]);
      }

    }
  }

  console.log(incomingTrips);

  // var trips = that.dataManager_.stationsDayTrips[that.calendarDay][originStationNumber][that.matrixPointedColumn]["trips"];

  if (trips.length == 0 && cyclicTrips.length == 0 && incomingTrips.length == 0) {
    return;
  }  

  // pointSet.push([originStationNumber, 0]);

  // console.log(d3.select(".tripsViewStationSvg"));

  var svgMinX = d3.min(pointSet, function(trip) {
    var destNumber = trip[0];
    var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

    // console.log(d3.select("#tripsViewStationSvg"+destId)[0][0]);

    return Number(d3.select("#tripsViewStationSvg"+destId).attr("x"));
  });

  var svgMaxX = d3.max(pointSet, function(trip) {
    var destNumber = trip[0];
    var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

    return Number(d3.select("#tripsViewStationSvg"+destId).attr("x"));
  });

  var svgMinY = d3.min(pointSet, function(trip) {
    var destNumber = trip[0];
    var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

    return Number(d3.select("#tripsViewStationSvg"+destId).attr("y"));
  });

  var svgMaxY = d3.max(pointSet, function(trip) {
    var destNumber = trip[0];
    var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

    return Number(d3.select("#tripsViewStationSvg"+destId).attr("y"));
  });

  svgMinY -= 40;
  svgMinX -= 40;
  svgMaxY += 40;
  svgMaxX += 40;
  
  var tripsViewStationSvgCyclicTripSvg = that.mapViewer.mapLayer.selectAll("#tripsViewStationSvgCyclicTripSvgPointer"+originStationNumber).data(["selectedStationCyclic"])  
    .enter().append("svg:svg");  

  var maxDistance = d3.max(cyclicTrips, function(trip) {
    return trip[1];
  })

  tripsViewStationSvgCyclicTripSvg
    .attr("class", "tripsViewStationSvgCyclicTripSvgPointer")
    .style("position", "absolute")
    .style("left", function(trip) {
      return d3.select("#tripsViewStationSvg"+thisId).attr("x") - maxDistance;
    })
    .style("top", function(trip) {
      return d3.select("#tripsViewStationSvg"+thisId).attr("y") - maxDistance;
    })    
    .style("width", function(trip) {
      return 2*maxDistance;
    })
    .style("height", function(trip) {
      return 2*maxDistance;
    })
    .attr("id", function(d) {
      return "tripsViewStationSvgCyclicTripSvgPointer" + originStationNumber;
    });

  tripsViewStationSvgCyclicTripSvg.selectAll(".tripsViewStationSvgTripCircle")
    .data(cyclicTrips).enter().append("circle")
    .attr("fill", "black")
    .attr("stroke",  "none")
    .attr("fill-opacity",  0.15)
    .attr("cx", maxDistance)
    .attr("cy", maxDistance)
    .attr("r", function(trip) {      
       var radius = trip[1];
       return radius;     
     }); 

  var tripsViewStationSvg = that.mapViewer.mapLayer.selectAll("#tripsViewTripSvgPointer"+originStationNumber).data(["selectedStationOutgoing"])
  .enter().append("svg:svg");  

  var frameWidth =  Math.abs(svgMaxX - svgMinX);        
  var frameHeight =  Math.abs(svgMaxY - svgMinY);  

  // var frameWidth =  200;        
  // var frameHeight =  200;  

  // console.log(svgMinX + "   " + svgMaxX);      
  // console.log(svgMinY  + "   " +  svgMaxY);      

  // console.log(frameWidth, frameHeight);      

  tripsViewStationSvg
    .attr("class", "tripsViewTripSvgPointer")
    .style("position", "absolute")
    .style("left", d3.select("#tripsViewStationSvg"+thisId).attr("x") - (d3.select("#tripsViewStationSvg"+thisId).attr("x") - svgMinX))
    .style("top", d3.select("#tripsViewStationSvg"+thisId).attr("y") - (d3.select("#tripsViewStationSvg"+thisId).attr("y") - svgMinY))
    // .style("left", d3.select("#tripsViewStationSvg"+thisId).attr("x"))
    // .style("top", d3.select("#tripsViewStationSvg"+thisId).attr("y"))
    // .style("left", 0)
    // .style("top", 0)
    .style("width", frameWidth + "px")
    .style("height", frameHeight + "px")
    // .style("width", 200)
    // .style("height", 200)
    .attr("id", function(d) {
      return "tripsViewTripSvgPointer" + originStationNumber;
    });




  tripsViewStationSvg.selectAll(".tripsViewStationSvgIncomingTripLine")
      .data(incomingTrips).enter().append("path")
       .attr("class", "tripsViewStationSvgIncomingTripLine")       
        .attr("d", function(trip) {
          var destNumber = trip[0];
          var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

          var sourcex = d3.select("#tripsViewStationSvg"+destId).attr("x") - svgMinX;
          var sourcey = d3.select("#tripsViewStationSvg"+destId).attr("y") - svgMinY;
          var targetx = (d3.select("#tripsViewStationSvg"+thisId).attr("x") - svgMinX);
          var targety = (d3.select("#tripsViewStationSvg"+thisId).attr("y") - svgMinY);
        
          var dx = targetx - sourcex,
              dy = targety - sourcey,
              dr = Math.sqrt(dx * dx + dy * dy);
          return "M" + sourcex + "," + sourcey + "A" + dr + "," + dr + " 0 0,1 " + targetx + "," + targety;
        })       
       .attr("opacity", 0.3)
       .attr("fill", "none")       
       .attr("stroke-width", 3)
       .attr("stroke", "red");


    tripsViewStationSvg.selectAll(".tripsViewStationSvgOutgoingTripLine")
      .data(trips).enter().append("path")
       .attr("class", "tripsViewStationSvgOutgoingTripLine")       
        .attr("d", function(trip) {
          var destNumber = trip[0];
          var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

          var targetx = d3.select("#tripsViewStationSvg"+destId).attr("x") - svgMinX;
          var targety = d3.select("#tripsViewStationSvg"+destId).attr("y") - svgMinY;
          var sourcex = (d3.select("#tripsViewStationSvg"+thisId).attr("x") - svgMinX);
          var sourcey = (d3.select("#tripsViewStationSvg"+thisId).attr("y") - svgMinY);
        
          var dx = targetx - sourcex,
              dy = targety - sourcey,
              dr = Math.sqrt(dx * dx + dy * dy);
          return "M" + sourcex + "," + sourcey + "A" + dr + "," + dr + " 0 0,1 " + targetx + "," + targety;
        })       
       .attr("opacity", 0.3)
       .attr("fill", "none")    
       .attr("stroke-width", 3)   
       .attr("stroke", "blue");  



  // tripsViewStationSvg.append("line")
  //  .attr("class", "tripsViewStationSvgTripLine")
  //  .attr("x1", 0)
  //  .attr("y1", 0)   
  //  .attr("x2", function(trip) {     
  //    return frameWidth;
  //  })
  //  .attr("y2", function(trip) {     
  //    return 0;
  //  })
  //  .attr("stroke-width", 2)
  //  .attr("stroke", "blue");

  //  tripsViewStationSvg.append("line")
  //  .attr("class", "tripsViewStationSvgTripLine")
  //  .attr("x1", 0)
  //  .attr("y1", 0)   
  //  .attr("x2", function(trip) {     
  //    return 0;
  //  })
  //  .attr("y2", function(trip) {
  //    return frameHeight;
  //  })
  //  .attr("stroke-width", 2)
  //  .attr("stroke", "blue");

  

  // var svg = d3.selectAll('#daysOfWeekModelsTableSvg');
  // svg.select("#TripsViewOrderHistoryLine").remove();
  // svg.select("#TripsViewOrderHistoryLineShadow").remove();
  
  // var lineFunc = d3.svg.line()
  // .x(function(d) {
  //   return that.xScale(d[0]);
  // })
  // .y(function(d) {
  //   return that.yScale(d[1]);
  // })
  // .interpolate('monotone');

  // var shadowLineFunc = d3.svg.line()
  // .x(function(d) {
  //   return that.xScale(d[0])+2;
  // })
  // .y(function(d) {
  //   return that.yScale(d[1])+2;
  // })
  // .interpolate('monotone');

  // svg.append('svg:path')
  // .attr('d', shadowLineFunc(that.stations[this.actualOrderingList.orderedStations[this.lastPointedStationOrder].posInStationsList].orderHistory))
  // .attr('pointer-events', 'none')
  // .attr('stroke', 'black')
  // .attr('stroke-width', 5)
  // .attr('opacity', 0.7)
  // .attr('fill', 'none')
  // .attr("id", "TripsViewOrderHistoryLineShadow");

  // svg.append('svg:path')
  // .attr('d', lineFunc(that.stations[this.actualOrderingList.orderedStations[this.lastPointedStationOrder].posInStationsList].orderHistory))
  // .attr('stroke', '#DDDDDD')
  // .attr('pointer-events', 'none')
  // .attr('stroke-width', 4)
  // .attr('opacity', 1.0)
  // .attr('fill', 'none')
  // .attr("id", "TripsViewOrderHistoryLine");

  
  // for (index in that.stations[this.actualOrderingList.orderedStations[this.lastPointedStationOrder].posInStationsList].orderHistory) {
  //   d3.select("#TripsViewOrderHistoryLine").remove();

  // }   

}

TripsViewMatrixViewer.prototype.updatedTripsInTheMap = function() {

  
  // return;

  // d3.selectAll(".tripsViewStationSvgIncomingTripLine").remove();   

  d3.selectAll(".tripsViewTripSvgFromBrush").remove();  
  d3.selectAll(".tripsViewStationSvgCyclicTripSvgFromBrush").remove();
  

  var that = this; 

  // if (that.cyclicTripsAnimInterval) {
    clearInterval(that.cyclicTripsAnimInterval);
  // }

  // if (that.brush.empty()) {
  //   return;
  // }

  // console.log(that.ts);

  for (var lineIndex = that.brushExtentNew[0][1]; lineIndex < that.brushExtentNew[1][1]; lineIndex++) { //go through the selected stations

    var originStationNumber = this.actualOrderingList.orderedStations[lineIndex].number;
    var trips = [];  
    var cyclicTrips = [];
    var pointSet = [[originStationNumber, 0]];
    var incomingTrips = [];

    for (var columnIndex = that.brushExtentNew[0][0]; columnIndex < that.brushExtentNew[1][0]; columnIndex++) { //go through the selected stations columns
      
      var thisId = this.actualOrderingList.orderedStations[lineIndex].id; 

      // if (that.dataManager_.stationsDayTrips[that.calendarDay][originStationNumber][columnIndex] == undefined) {
      //   continue;
      // }      

      // for (tripIndex in that.dataManager_.stationsDayTrips[that.calendarDay][originStationNumber][that.matrixPointedColumn]["trips"]) {
      for (tripIndex in that.ts[lineIndex][columnIndex]["trips"]) {    
        // console.log(tripIndex);
        var destStationNumber = that.ts[lineIndex][columnIndex]["trips"][tripIndex][0];
        if (that.dataManager_.stationsIndexedByNumber[destStationNumber] != undefined
          && that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destStationNumber]] != undefined){
                    

          if (originStationNumber != destStationNumber) {

            var directionDistanceArray = that.dataManager_.stationsDirectionDistanceMatrix[originStationNumber][destStationNumber];
                      
            if (directionDistanceArray == undefined || directionDistanceArray.length < 3) {
              continue;
            }

            if (that.viewOutgoingTrips) {

              var trip = that.ts[lineIndex][columnIndex]["trips"][tripIndex];

              var duration = trip[1];              

              if (!that.usingCalendarDayData) {
                duration = trip[2];
              }

              if (that.actualDurationMinValue <= duration && that.actualDurationMaxValue >= duration
               && that.actualDistanceMinValue <= directionDistanceArray[0] && that.actualDistanceMaxValue >= directionDistanceArray[0]) {
               // && that.actualDirectionMinValue <= angleDeg && that.actualDirectionMaxValue >= angleDeg) {

                

                var v = {x: -directionDistanceArray[1], y: -directionDistanceArray[2]};

                var angleRad = Math.acos( v.x / Math.sqrt(v.x*v.x + v.y*v.y) );
                var angleDeg = angleRad * 180 / Math.PI;

                if (v.y < 0) {
                  angleDeg = 360 - angleDeg;
                }              

                if (that.actualDirectionMinValue <= angleDeg && that.actualDirectionMaxValue >= angleDeg) {

                  var tripODPairIndex = -1;

                  trips.some(function (element, index, array) {
                    if (element[0] == that.ts[lineIndex][columnIndex]["trips"][tripIndex][0]) {
                      tripODPairIndex = index;
                      return true;
                    } else {
                      return false;
                    }
                  });

                  

                  if (tripODPairIndex >= 0) {
                    // console.log(trips[tripODPairIndex]);
                    var addingTripsQtt = that.ts[lineIndex][columnIndex]["trips"][tripIndex][1];
                    var addingTripsDuration = that.ts[lineIndex][columnIndex]["trips"][tripIndex][2];

                    var actualTripsQtt = trips[tripODPairIndex][1];
                    var actualTripsDuration = trips[tripODPairIndex][2];

                    trips[tripODPairIndex][2] = (actualTripsQtt*actualTripsDuration + addingTripsQtt*addingTripsDuration) / (addingTripsQtt+actualTripsQtt);
                    trips[tripODPairIndex][1] += addingTripsQtt;
                    // console.log(trips[tripODPairIndex]);
                  } else {
                    trips.push(that.ts[lineIndex][columnIndex]["trips"][tripIndex].slice());
                    pointSet.push(that.ts[lineIndex][columnIndex]["trips"][tripIndex].slice());              
                  }                
                  
                }
              }              
            }
          } else {
           var duration = that.ts[lineIndex][columnIndex]["trips"][tripIndex][1];

           if (!that.usingCalendarDayData) {
             duration = that.ts[lineIndex][columnIndex]["trips"][tripIndex][2];
           }

           var zoom = that.mapViewer.map_.getZoom();
           var lat = that.mapViewer.map_.getCenter().lat();

           var metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);

           var distance = duration * 2.7; //2.7m/s

           var radius = (distance/metersPerPixel)/2;

           // if (that.actualDurationMinValue <= duration && that.actualDurationMaxValue >= duration
               // if ( that.actualDistanceMinValue <= distance && that.actualDistanceMaxValue >= distance) {

            if (that.viewCyclicTrips) {

              var tripODPairIndex = -1;

              cyclicTrips.some(function (element, index, array) {
                if (element[0] == that.ts[lineIndex][columnIndex]["trips"][tripIndex][0]) {
                  tripODPairIndex = index;
                  return true;
                } else {
                  return false;
                }
              });

              if (tripODPairIndex >= 0) {
                // console.log(trips[tripODPairIndex]);
                var addingTripsQtt = that.ts[lineIndex][columnIndex]["trips"][tripIndex][1];
                var addingTripsDuration = that.ts[lineIndex][columnIndex]["trips"][tripIndex][2];

                var actualTripsQtt = cyclicTrips[tripODPairIndex][3];
                var actualTripsDuration = cyclicTrips[tripODPairIndex][2];

                cyclicTrips[tripODPairIndex][2] = (actualTripsQtt*actualTripsDuration + addingTripsQtt*addingTripsDuration) / (addingTripsQtt+actualTripsQtt);
                cyclicTrips[tripODPairIndex][3] += addingTripsQtt;

                duration = cyclicTrips[tripODPairIndex][2];
                distance = duration * 2.7;
                radius = (distance/metersPerPixel)/2;

                cyclicTrips[tripODPairIndex][1] = radius;
                // console.log(trips[tripODPairIndex]);
              } else {
                if (!that.usingCalendarDayData) {
                  cyclicTrips.push([that.ts[lineIndex][columnIndex]["trips"][tripIndex][0], radius, that.ts[lineIndex][columnIndex]["trips"][tripIndex][2], that.ts[lineIndex][columnIndex]["trips"][tripIndex][1]]);
                } else {
                  cyclicTrips.push([that.ts[lineIndex][columnIndex]["trips"][tripIndex][0], radius]);
                }
              }  


             // if (that.viewCyclicTrips) {
             //  if (!that.usingCalendarDayData) {
             //    cyclicTrips.push([that.ts[lineIndex][columnIndex]["trips"][tripIndex][0], radius, that.ts[lineIndex][columnIndex]["trips"][tripIndex][2], that.ts[lineIndex][columnIndex]["trips"][tripIndex][1]]);
             //  } else {
             //    cyclicTrips.push([that.ts[lineIndex][columnIndex]["trips"][tripIndex][0], radius]);
             //  }
             // }
           }

          }
        }
      }

      

      // ok, here the destStation is the origin, and originStation is the destination, a mess, but it doesnt matter right now

      for (tripIndex in that.ts[lineIndex][columnIndex]["it"]) {    
        var destStationNumber = that.ts[lineIndex][columnIndex]["it"][tripIndex][0];
        if (that.dataManager_.stationsIndexedByNumber[destStationNumber] != undefined
          && that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destStationNumber]] != undefined){

          var directionDistanceArray = that.dataManager_.stationsDirectionDistanceMatrix[originStationNumber][destStationNumber];
                      
          if (directionDistanceArray == undefined || directionDistanceArray.length < 3) {
            continue;
          }
          if (that.viewIncomingTrips) {   

            var tripODPairIndex = -1;

            incomingTrips.some(function (element, index, array) {
              if (element[0] == that.ts[lineIndex][columnIndex]["it"][tripIndex][0]) {
                tripODPairIndex = index;
                return true;
              } else {
                return false;
              }
            });

            

            if (tripODPairIndex >= 0) {
              // console.log(incomingTrips[tripODPairIndex]);
              var addingTripsQtt = that.ts[lineIndex][columnIndex]["it"][tripIndex][1];
              var addingTripsDuration = that.ts[lineIndex][columnIndex]["it"][tripIndex][2];

              var actualTripsQtt = incomingTrips[tripODPairIndex][1];
              var actualTripsDuration = incomingTrips[tripODPairIndex][2];

              incomingTrips[tripODPairIndex][2] = (actualTripsQtt*actualTripsDuration + addingTripsQtt*addingTripsDuration) / (addingTripsQtt+actualTripsQtt);
              incomingTrips[tripODPairIndex][1] += addingTripsQtt;
              // console.log(incomingTrips[tripODPairIndex]);
            } else {
              incomingTrips.push(that.ts[lineIndex][columnIndex]["it"][tripIndex].slice());
              pointSet.push(that.ts[lineIndex][columnIndex]["it"][tripIndex].slice());              
            }
          }

        }
      }
    }

    // var trips = that.dataManager_.stationsDayTrips[that.calendarDay][originStationNumber][that.matrixPointedColumn]["trips"];

    if (trips.length == 0 && cyclicTrips.length == 0 && incomingTrips.length == 0) {
      continue;
    }  

    var svgMinX = d3.min(pointSet, function(trip) {
      var destNumber = trip[0];
      var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

      // console.log(d3.select("#tripsViewStationSvg"+destId)[0][0]);

      return Number(d3.select("#tripsViewStationSvg"+destId).attr("x"));
    });

    var svgMaxX = d3.max(pointSet, function(trip) {
      var destNumber = trip[0];
      var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

      return Number(d3.select("#tripsViewStationSvg"+destId).attr("x"));
    });

    var svgMinY = d3.min(pointSet, function(trip) {
      var destNumber = trip[0];
      var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

      return Number(d3.select("#tripsViewStationSvg"+destId).attr("y"));
    });

    var svgMaxY = d3.max(pointSet, function(trip) {
      var destNumber = trip[0];
      var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

      return Number(d3.select("#tripsViewStationSvg"+destId).attr("y"));
    });

    svgMinY -= 70;
    svgMinX -= 70;
    svgMaxY += 70;
    svgMaxX += 70;

    

    var tripsViewStationSvgCyclicTripSvg = that.mapViewer.mapLayer.selectAll("#tripsViewStationSvgCyclicTripSvgFromBrush"+originStationNumber).data(["selectedStationCyclic"])  
      .enter().append("svg:svg");  

    var maxDistance = d3.max(cyclicTrips, function(trip) {
      return trip[1];
    })

    tripsViewStationSvgCyclicTripSvg
      .attr("class", "tripsViewStationSvgCyclicTripSvgFromBrush")
      .style("position", "absolute")
      .style("left", function(trip) {
        return d3.select("#tripsViewStationSvg"+thisId).attr("x") - maxDistance;
      })
      .style("top", function(trip) {
        return d3.select("#tripsViewStationSvg"+thisId).attr("y") - maxDistance;
      })    
      .style("width", function(trip) {
        return 2*maxDistance;
      })
      .style("height", function(trip) {
        return 2*maxDistance;
      })
      .attr("id", function(d) {
        return "tripsViewStationSvgCyclicTripSvgFromBrush" + originStationNumber;
      });

    tripsViewStationSvgCyclicTripSvg.selectAll(".tripsViewStationSvgTripCircle")
      .data(cyclicTrips).enter().append("circle")
      .attr("class", "tripsViewStationSvgTripCircle")
      .attr("fill", "black")
      .attr("stroke",  "black")
      // .attr("stroke-width",  4)
      .attr("stroke-opacity",  function(d) {
        
        if (!that.usingCalendarDayData && (d[3] < that.actualFlowMinValue || d[3] > that.actualFlowMaxValue)) {
          return 0.0;
        } else {
          return 0.10 + Math.log(d[3]) * 0.10;
        }
      })
      .attr("fill-opacity",  function(d) {

        if (!that.usingCalendarDayData && (d[3] < that.actualFlowMinValue || d[3] > that.actualFlowMaxValue)) {
          return 0.0;
        } else {
          return 0.10 + Math.log(d[3]) * 0.10;
        }
      })
      // .attr("opacity", function(d) {
      //     return (d[1] >= that.actualFlowMinValue && d[1] <= that.actualFlowMaxValue) ? 0.3 : 0.0;
      //  })
      .attr("cx", maxDistance)
      .attr("cy", maxDistance)
      // .attr("r", function(trip) {      
      //    var radius = trip[1];
      //    return radius;     
      //  }); 
      .attr("r", 1)    
        .transition()
          .attr("r", function(trip) {      
           var radius = trip[1];
           return radius;     
         })
        .duration(2000);

      that.cyclicTripsAnimInterval = setInterval(function(){
          d3.selectAll(".tripsViewStationSvgTripCircle")
            .attr("r", 1)
            .transition()
              .attr("r", function(trip) {      
                 var radius = trip[1];
                 return radius;     
                 })
              .duration(2000);
        },3000);

    var tripsViewStationSvg = that.mapViewer.mapLayer.selectAll("#tripsViewTripSvgFromBrush"+originStationNumber).data(["selectedStationOutgoing"])
    .enter().append("svg:svg");  

    var frameWidth =  Math.abs(svgMaxX - svgMinX);        
    var frameHeight =  Math.abs(svgMaxY - svgMinY); 
    

    tripsViewStationSvg
      .attr("class", "tripsViewTripSvgFromBrush")
      .style("position", "absolute")
      .style("left", d3.select("#tripsViewStationSvg"+thisId).attr("x") - (d3.select("#tripsViewStationSvg"+thisId).attr("x") - svgMinX))
      .style("top", d3.select("#tripsViewStationSvg"+thisId).attr("y") - (d3.select("#tripsViewStationSvg"+thisId).attr("y") - svgMinY))
      
      .style("width", frameWidth + "px")
      .style("height", frameHeight + "px")
      
      .attr("id", function(d) {
        return "tripsViewTripSvgFromBrush" + originStationNumber;
      });    

    var defs = tripsViewStationSvg.selectAll("defs")
      .data(["defs"]).enter().append("defs")
      .attr("id", "defsUpdatedTripsInTheMap");    

    var linearGradient = defs.selectAll("linearGradient")
      .data(["linearGradientBlue", "linearGradientRed"]).enter().append("linearGradient")        
      .attr("id", function(d) {
        return d;
      });
      
   defs.selectAll("#linearGradientBlue").append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "cyan");

    defs.selectAll("#linearGradientBlue").append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "blue");

    defs.selectAll("#linearGradientRed").append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "yellow");

    defs.selectAll("#linearGradientRed").append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "red");

    tripsViewStationSvg.selectAll(".tripsViewStationSvgIncomingTripLine")
      .data(incomingTrips).enter().append("path")
       .attr("class", "tripsViewStationSvgIncomingTripLine")       
        .attr("d", function(trip) {
          var destNumber = trip[0];
          var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

          var sourcex = d3.select("#tripsViewStationSvg"+destId).attr("x") - svgMinX;
          var sourcey = d3.select("#tripsViewStationSvg"+destId).attr("y") - svgMinY;
          var targetx = (d3.select("#tripsViewStationSvg"+thisId).attr("x") - svgMinX);
          var targety = (d3.select("#tripsViewStationSvg"+thisId).attr("y") - svgMinY);
        
          var dx = targetx - sourcex,
              dy = targety - sourcey,
              dr = Math.sqrt(dx * dx + dy * dy);
          return "M" + sourcex + "," + sourcey + "A" + dr + "," + dr + " 0 0,1 " + targetx + "," + targety;
        })       
       .attr("opacity", function(d) {
          return (d[1] >= that.actualFlowMinValue && d[1] <= that.actualFlowMaxValue) ? 0.3 : 0.0;
       })
       .attr("fill", "none") 
       .attr("stroke-width", function(trip) {       
          if (!that.usingCalendarDayData) {
            return 1 + trip[1]/2.0;
          } else {
            return 1;
          }          
        })    
       .attr("stroke", function(trip, index) {

          var destNumber = trip[0];
          var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

          var targetx = d3.select("#tripsViewStationSvg"+destId).attr("x") - svgMinX;
          var targety = d3.select("#tripsViewStationSvg"+destId).attr("y") - svgMinY;
          var sourcex = (d3.select("#tripsViewStationSvg"+thisId).attr("x") - svgMinX);
          var sourcey = (d3.select("#tripsViewStationSvg"+thisId).attr("y") - svgMinY);

          defs.selectAll("#linearRed"+index)
            .data(["linearRed"+index]).enter().append("linearGradient")
            .attr("xlink:href", "#linearGradientRed")
            .attr("x1", (sourcex / frameWidth * 100) + "%")
            .attr("x2", (targetx / frameWidth * 100) + "%")
            .attr("y1", (sourcey / frameHeight * 100) + "%")
            .attr("y2", (targety / frameHeight * 100) + "%")
            .attr("id", function(d) {
              return d;
            });

          return "url(#linearRed"+index+")"; 
        });

    tripsViewStationSvg.selectAll(".tripsViewStationSvgIncomingTripLine")
      .append("svg:title")
        .text(function(d, i) { return "Trips: " + d[1] + "\nAvg Duration: " + Math.floor(d[2]/60) + " min"; });

    

    tripsViewStationSvg.selectAll(".tripsViewStationSvgOutgoingTripLine")
      .data(trips).enter().append("path")
       .attr("class", "tripsViewStationSvgOutgoingTripLine")       
        .attr("d", function(trip) {
          var destNumber = trip[0];
          var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

          var targetx = d3.select("#tripsViewStationSvg"+destId).attr("x") - svgMinX;
          var targety = d3.select("#tripsViewStationSvg"+destId).attr("y") - svgMinY;
          var sourcex = (d3.select("#tripsViewStationSvg"+thisId).attr("x") - svgMinX);
          var sourcey = (d3.select("#tripsViewStationSvg"+thisId).attr("y") - svgMinY);
        
          var dx = targetx - sourcex,
              dy = targety - sourcey,
              dr = Math.sqrt(dx * dx + dy * dy);
          return "M" + sourcex + "," + sourcey + "A" + dr + "," + dr + " 0 0,1 " + targetx + "," + targety;
        })       
       .attr("opacity", function(d) {
          return (d[1] >= that.actualFlowMinValue && d[1] <= that.actualFlowMaxValue) ? 0.3 : 0.0;
       })
       .attr("fill", "none")  
       .attr("stroke-width", function(trip) {
          if (!that.usingCalendarDayData) {
            return 1 + trip[1]/2.0;
          } else {
            return 1;
          }          
        })              
       .attr("stroke", function(trip, index) {

          var destNumber = trip[0];
          var destId = that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[destNumber]].id;

          var targetx = d3.select("#tripsViewStationSvg"+destId).attr("x") - svgMinX;
          var targety = d3.select("#tripsViewStationSvg"+destId).attr("y") - svgMinY;
          var sourcex = (d3.select("#tripsViewStationSvg"+thisId).attr("x") - svgMinX);
          var sourcey = (d3.select("#tripsViewStationSvg"+thisId).attr("y") - svgMinY);

          defs.selectAll("#linearBlue"+index)
            .data(["linearBlue"+index]).enter().append("linearGradient")
            .attr("xlink:href", "#linearGradientBlue")
            .attr("x1", (sourcex / frameWidth * 100) + "%")
            .attr("x2", (targetx / frameWidth * 100) + "%")
            .attr("y1", (sourcey / frameHeight * 100) + "%")
            .attr("y2", (targety / frameHeight * 100) + "%")
            .attr("id", function(d) {
              return d;
            });

          return "url(#linearBlue"+index+")"; 
        });    

    tripsViewStationSvg.selectAll(".tripsViewStationSvgOutgoingTripLine")
      .append("svg:title")
        .text(function(d, i) { return "Trips: " + d[1] + "\nAvg Duration: " + Math.floor(d[2]/60) + " min"; });
    
  }
}

TripsViewMatrixViewer.prototype.updatedMatrixPointedLine = function(orderIndex) {

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

TripsViewMatrixViewer.prototype.unpointedStation = function(orderIndex) {

  // return;

  var that = this;

  d3.selectAll(".daysOfWeekModelsMatrixPointedStationLine").remove();    

  if (this.actualOrderingList.orderedStations[orderIndex] == undefined) {
    return;
  }

  // d3.selectAll("#TripsViewStationRepresentationText" + this.actualOrderingList.orderedStations[orderIndex].id)
  //   .attr("fill-opacity", "0.0");

  var thisId = this.actualOrderingList.orderedStations[orderIndex].id;  
  d3.select("#TripsViewStationRepresentationShadow"+thisId)
    .attr("opacity", function(d){return (d.selected || that.brushExtent == undefined) ? 1.0 : 0.0;});
        
  d3.select("#TripsViewStationRepresentation"+thisId)
    .attr("opacity", function(d){return (d.selected || that.brushExtent == undefined) ? 1.0 : 0.1;})
    // .attr("r", 4.5);
    .attr("stroke",  "gray")
    .attr("stroke-width",  "1.5px");

  d3.select("#TripsViewTopStationsListLabel"+orderIndex)
    .style("font-size", "11px") 
    .style("font-weight", "normal");
  d3.select("#TripsViewLastStationsListLabel"+orderIndex)
    .style("font-size", "11px") 
    .style("font-weight", "normal");

  d3.select("#TripsViewStationInAreaListLabel"+orderIndex)
    .style("font-size", "11px") 
    .style("font-weight", "normal");

  this.lastPointedStationOrder = -1;
  that.updateCursorSelectionInfo(-1);
  this.updateValuesRange();
}

TripsViewMatrixViewer.prototype.updateRankingLists = function() {

  // return;

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

  d3.select("#tripsDaysOfWeekModelsTopStationsList").selectAll(".TripsViewStationinTop10List").remove();

  d3.select("#tripsDaysOfWeekModelsTopStationsList").selectAll(".TripsViewStationinTop10List").data(topStations).enter()
  .append("div")
    .attr("class", "TripsViewStationinTop10List")
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
            return 3 + 7 * Math.sqrt((21-i) / (10.0) /3.1416);
            // return 5;
          })
          // .attr("fill", function(d) {
          //   var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
          //   return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
          // })
          .attr("fill", function(d) {

            // var value = (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);

            // return that.actualPropertyColorScale(value);        
            //var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
            //return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";

            // var value = ((that.brushExtent[1][1] - that.brushExtent[0][1]) - i) / (that.brushExtent[1][1] - that.brushExtent[0][1]);
            var value = 1.0 - (d - that.brushExtent[0][1]) / (that.brushExtent[1][1] - that.brushExtent[0][1]);

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
        .attr("id", "TripsViewTopStationsListLabel" + d)
        .attr("class", "TripsViewTopStationsListLabel")
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
      that.unpointedStation(that.brushExtent[0][1] + i);
    });


  var lastStations = [];

  var len = Math.min(10, this.brushExtent[1][1] - this.brushExtent[0][1]); 

  for (var i = this.brushExtent[1][1] - 1; i > this.brushExtent[1][1] - 1 - len; i--) {
    lastStations.push(i);    
  }

  lastStations.reverse();

  d3.select("#tripsDaysOfWeekModelsLastStationsList").selectAll(".TripsViewStationinLast10List").remove();

  d3.select("#tripsDaysOfWeekModelsLastStationsList").selectAll(".TripsViewStationinLast10List").data(lastStations).enter()
  .append("div")
    .attr("class", "TripsViewStationinLast10List")
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
            // return 3 + 7 * Math.sqrt((that.actualOrderingList.orderedStations[d].capacity - that.minCapacity) / (that.maxCapacity - that.minCapacity)/3.1416);
            
            return 3 + 7 * Math.sqrt((11-i) / (21.0) /3.1416);
          })
          // .attr("fill", function(d) {
          //   var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
          //   return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";
          // })
          .attr("fill", function(d) {

            // var value = (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);

            // // var sat = 100 * (that.actualOrderingList.orderedStations[d].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
            // // return "hsl(" + (0.1 * 360) + ", " + sat + "%, 50%)";

            // return that.actualPropertyColorScale(value); 

            var value = 1.0 - (d - that.brushExtent[0][1]) / (that.brushExtent[1][1] - that.brushExtent[0][1]);

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
        .attr("id", "TripsViewLastStationsListLabel" + d)                       
        .attr("class", "TripsViewLastStationsListLabel")
        .text(function(d,i) {
          
          var thisOrderingValue = that.actualOrderingList.orderedStations[d].orderingValue;

          
          return that.getFormatedValue(thisOrderingValue, that.ordering) + " - " + that.actualOrderingList.orderedStations[d].name;
        }); 
    }).on("mouseover", function(d,i){
      that.pointedStation(d);
    })
    .on("mouseout", function(d,i){
      that.unpointedStation(that.brushExtent[0][1] + i);
    });
  
}

TripsViewMatrixViewer.prototype.updateStationsInAreaList = function() {

  var that = this;

  if (this.mapViewer == undefined || this.mapViewer.stationsInAreaList == undefined) {
    return;
  }

  d3.select("#TripsViewAreaStationsList").selectAll(".TripsViewStationInAreaList").remove();

  d3.select("#TripsViewAreaStationsList").selectAll(".TripsViewStationInAreaList").data(this.mapViewer.stationsInAreaList).enter()
  .append("div")
    .attr("class", "TripsViewStationInAreaList")
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
        .attr("id", "TripsViewStationInAreaListLabel" + d)
        .attr("class", "TripsViewStationInAreaListLabel")
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

TripsViewMatrixViewer.prototype.createMatrixsetOfTimeseries = function() {  
  var that = this;

  var ts = [];

  // var sampleCount = 97;
  var stationCount = that.actualOrderingList.orderedStations.length;
  
  var minValue = 999999;
  var maxValue = 0;

  // console.log(that.usingCalendarDayData);

  if (that.usingCalendarDayData) {
    that.actualOrderingList.orderedStations.forEach(function(station, index) {

      var stationOrderingPos = station.number;   

      // console.log(that.calendarDay);
      // console.log(that.dataManager_.stationsDayTrips);
      
      if (station.orderinValue == -1 || that.dataManager_.stationsDayTrips[that.calendarDay][stationOrderingPos] == undefined) {
        ts[index] = [];
      } else {        
        ts[index] = that.dataManager_.stationsDayTrips[that.calendarDay][stationOrderingPos];
        // ts[index]["it"] = [];
      }

      Object.keys(ts[index]).forEach(function(key) {
        ts[index][key]["it"] = [];
      });      
      
    });


    // this.dataManager_.stationsPeriodTrips[that.period][that.tripsDayOfWeek][d.number][]["c"]

    // d3.selectAll(".TripsViewStationRepresentation")

    //  + that.actualOrderingList.orderedStations[i].id

    //   .attr("r", function(d) {
    //     return 3 + 7 * Math.sqrt(((that.brushExtent[1][1] - that.brushExtent[0][1]) -  (i - that.brushExtent[0][1])) / (that.brushExtent[1][1] - that.brushExtent[0][1]) /3.1416);
        
    //   })
      
    //   .attr("fill", function(d) {

    //     if (!that.actualOrderingList.orderedStations[i].selected) {
    //       return "hsl(" + (0.1 * 360) + ", 0%, 50%)";
    //     }

    //     // var value = (that.actualOrderingList.orderedStations[i].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
    //     var value = ((that.brushExtent[1][1] - that.brushExtent[0][1]) - (i - that.brushExtent[0][1])) / (that.brushExtent[1][1] - that.brushExtent[0][1]);

    //     return that.actualPropertyColorScale(value);        
        
    //   }); 


    // minValue = d3.min(ts, function(s) {return d3.min(s);});
    // maxValue = d3.max(ts, function(s) {return d3.max(s);});
    
  } else {

    that.actualOrderingList.orderedStations.forEach(function(station, index) {

      var stationOrderingPos = station.number;   

      // console.log(that.calendarDay);
      // console.log(that.dataManager_.stationsDayTrips);
      
      if (station.orderinValue == -1 || that.dataManager_.stationsPeriodTrips[that.period][that.tripsDayOfWeek][stationOrderingPos] == undefined) {
        ts[index] = [];
      } else {        
        ts[index] = that.dataManager_.stationsPeriodTrips[that.period][that.tripsDayOfWeek][stationOrderingPos];
        // ts[index]["it"] = [];
      }

      Object.keys(ts[index]).forEach(function(key) {
        ts[index][key]["it"] = [];
      });      
      
    });

    // for (var forDayOfWeek = 0; forDayOfWeek < 7; forDayOfWeek++) {

    //   var ts = [];
    
    //   that.actualOrderingList.orderedStations.forEach(function(station, index) {

    //     var stationOrderingPos = station.number;   

    
        
    //     if (station.orderingValue == -1 || that.dataManager_.stationsTripsView[that.period][stationOrderingPos][forDayOfWeek][that.variable] == undefined) {
    //       ts[index] = [];
    //     } else {
    //       ts[index] = that.dataManager_.stationsTripsView[that.period][stationOrderingPos][forDayOfWeek][that.variable]["a"];
    //     }
        
    //   });

    
    //   if (minValue > d3.min(ts, function(s) {return d3.min(s);})) {
    //     minValue = d3.min(ts, function(s) {return d3.min(s);});
    //   }

    //   if (maxValue < d3.max(ts, function(s) {return d3.max(s);})) {
    //     maxValue = d3.max(ts, function(s) {return d3.max(s);});
    //   }
      
    // }   

    // that.actualOrderingList.orderedStations.forEach(function(station, index) {

    //   var stationOrderingPos = station.number;   

    
      
    //   if (station.orderingValue == -1 || that.dataManager_.stationsTripsView[that.period][stationOrderingPos][that.dayOfWeek][that.variable] == undefined) {
    //     ts[index] = [];
    //   } else {
    //     ts[index] = that.dataManager_.stationsTripsView[that.period][stationOrderingPos][that.dayOfWeek][that.variable]["a"];
    //   }
      
    // });
  }

  

  that.ts = ts;
}

TripsViewMatrixViewer.prototype.createMatrix = function() {  

  var that = this;  

  var sampleCount = 24;
  var stationCount = that.actualOrderingList.orderedStations.length;

  this.createMatrixsetOfTimeseries();

  var ts = this.ts;

  // var minValue = that.globalMinValue;
  // var maxValue = that.globalMaxValue;  

  // if (that.updateRangeSliderLimits) {
    
  //   $( "#dayOFWeekValueRangeSlider" ).slider( "option", "step", (that.actualMaxValue - that.actualMinValue)/100.0 );
  //   $( "#dayOFWeekValueRangeSlider" ).slider( "option", "min" , that.actualMinValue);
  //   $( "#dayOFWeekValueRangeSlider" ).slider( "option", "max" , that.actualMaxValue);    
         
  //   $( "#dayOFWeekValueRangeSlider" ).slider( "option", "values" , [that.actualMinValue, that.actualMaxValue]);
    
  //   $('#dayOFWeekValueRangeSlider').slider("value", $('#dayOFWeekValueRangeSlider').slider("value"));
  //   $( "#TripsViewMinValueLabel" ).text( $( "#dayOFWeekValueRangeSlider" ).slider( "values", 0 ));
  //   $( "#TripsViewMaxValueLabel" ).text( $( "#dayOFWeekValueRangeSlider" ).slider( "values", 1 )); 

    
  // }

  // that.updateRangeSliderLimits = false;
  
         
  /**
   * Updates filter table using an array of stations, and
   * an array of timeseries, indexed by station.id.
   */
  var updateFilterTable = function(lines, ts, colorScale) {

    // console.log("updateFilterTable");

    var sampleCount = 24;
    var stationCount = that.actualOrderingList.orderedStations.length;

    // Creates svg container.
    var svgWidth = d3.select('#modeVisContainerAnalyticsTripsViewContainerMiddleContainer')[0][0].clientWidth - that.matrixLeft;    
    var svgHeight = d3.select('#modeVisContainerAnalyticsTripsViewContainerMiddleContainer')[0][0].clientHeight - that.matrixTop;
    // var svgHeight = (svgWidth / sampleCount) *  stationCount / 2;    

    var canvasWidth = svgWidth - 20;    
    var canvasHeight = (svgWidth / sampleCount) *  stationCount / 2;    
    
    // console.log(svgWidth);
    // console.log(svgHeight);

    var parentDiv = d3.select("#modeVisContainerAnalyticsTripsViewContainerMiddleContainer");
    // parentDiv.selectAll('#tableCanvasDiv').remove();

    
    var tableCanvasDiv = parentDiv.selectAll('#tripsTableCanvasDiv').data(['TripsViewTableCanvasDiv']).enter().append('div');
    tableCanvasDiv
      .attr("id", "tripsTableCanvasDiv") 
      .style("position", "relative")      
      .style("height", svgHeight + "px")
      .style("width", svgWidth + "px")
      .style("left", that.matrixLeft + "px")       
      .style("overflow-y", "scroll")      
      // .style("top", "-20px")      
      // .style("top", (-svgHeight) + "px");
      .style("top", (that.matrixTop - 20) + "px");
   
    tableCanvasDiv.selectAll('canvas').remove();
    var tableCanvas = tableCanvasDiv.selectAll('canvas').data(['TripsViewTableCanvas']).enter().append('canvas');
    tableCanvas
      .attr("id", "TripsViewTableCanvas")
      .attr("height", (canvasHeight) + "px")
      .attr("width", canvasWidth + "px");    

    var canvas=document.getElementById('TripsViewTableCanvas');
    var ctx=canvas.getContext('2d');
    // Store the current transformation matrix
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    ctx.restore();
    
    // console.log(lines);
    // console.log(ts);

    var cellWidth = canvasWidth / (sampleCount);
    var cellHeight = canvasHeight / (lines.length); 

    that.cellWidth = cellWidth;
    that.cellHeight = cellHeight;

    var distanceMod = 0.0025;    
    var durationMod = 0.005;    

    lines.forEach(function(station, lineIndex) {          

      samples = ts[lineIndex];
      // if (!that.useGlobalNormalization) {
      //   minValue = d3.min(samples);
      //   maxValue = d3.max(samples);
      // } else {
      //   minValue = that.actualMinValue;
      //   maxValue = that.actualMaxValue;        
      // }

      if (samples instanceof Array) {
        return;
      }

      // console.log(station);

      Object.keys(samples).forEach(function (key) {

        // ctx.strokeStyle = 'rgba(255,255,255,1.0)';

        if (that.viewOutages) {

          // var avgBalance = 0.0;

          // for (var i = 0; i < 4; i++) {
          //   avgBalance += that.dataManager_.stationsDayActivity[that.calendarDay][station["number"]]["b"][key*4+i];
          // }

          // avgBalance = avgBalance/4.0;

          // ctx.strokeStyle=colorScale(avgBalance);        
          // ctx.strokeStyle = 'rgba(255,255,255,1.0)';
          if (samples[key]["fout"] > 0) {
            ctx.strokeStyle = 'rgba(255,0,0,0.5)';
            ctx.strokeRect(3 + key*cellWidth-2, 3 + lineIndex*cellHeight-2,cellWidth-2,cellHeight-2);          
          } else if (samples[key]["eout"] > 0) {
            ctx.strokeStyle = 'rgba(0,0,255,0.5)';
            ctx.strokeRect(3 + key*cellWidth-2, 3 + lineIndex*cellHeight-2,cellWidth-2,cellHeight-2);          
          }
          

        }

        // ctx.strokeStyle = 'rgba(255,255,255,1.0)';

        if (samples[key]["trips"] == undefined) {
          return;
        }

        samples[key]["trips"].forEach(function(trip) { 

          var originStationNumber = trip[0];
          var numTrips = 1;
          var duration = trip[1];

          if (!that.usingCalendarDayData) {
            numTrips = trip[1];
            duration = trip[2]/numTrips;
          }

          var zoom = that.mapViewer.map_.getZoom();
           var lat = that.mapViewer.map_.getCenter().lat();

           var metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);

           var distance = duration * 2.7; //2.7m/s           

          if (originStationNumber == station["number"]) {

            if (that.viewCyclicTrips) {

              if (that.actualDurationMinValue <= duration && that.actualDurationMaxValue >= duration
                && that.actualFlowMinValue <= numTrips && that.actualFlowMaxValue >= numTrips
                && that.actualDistanceMinValue <= distance && that.actualDistanceMaxValue >= distance) {
            
                var centerX = key*cellWidth + cellWidth*0.5;
                var centerY = lineIndex*cellHeight + cellHeight*0.5;
                // var radius = trip[1]*0.0025;
                var radius = Math.max(Math.log(duration)*3 - 12,1);
                var angle = 2 * Math.PI;
                // var radius = 10;
                // var angle = Math.max(Math.log(trip[1])*3 - 12,1)*0.05 * 2 * Math.PI;
                var opacity = 0.15 + (Math.log((numTrips))) * 0.15;

                ctx.beginPath();            
                ctx.arc(centerX, centerY, radius, 0, angle, false);
                ctx.fillStyle = 'rgba(0,0,0,' + (opacity) + ')';
                ctx.fill();            
                // ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                // ctx.stroke();
              }
            }
            
          } else {

            var directionDistanceArray = that.dataManager_.stationsDirectionDistanceMatrix[station["number"]][trip[0]];
                
            if (directionDistanceArray == undefined || directionDistanceArray.length < 3) {
              return;
            }

            
            var destinationStation =  that.dataManager_.stations[that.dataManager_.stationsIndexedByNumber[trip[0]]];

            if (destinationStation == undefined) {
              return;
            }


            // console.log(angleDeg);

            var defaultLength = that.cellHeight / 2;

            var length = defaultLength;

            if (that.viewTripsDistance) {
              length = (directionDistanceArray[0] * distanceMod);
            }

            if (that.viewTripsDuration) {
              length = (duration * durationMod);
            }            

            if (that.actualDurationMinValue <= duration && that.actualDurationMaxValue >= duration
              // && that.actualFlowMinValue <= numTrips && that.actualFlowMaxValue >= numTrips
             && that.actualDistanceMinValue <= directionDistanceArray[0] && that.actualDistanceMaxValue >= directionDistanceArray[0]) {
             // && that.actualDirectionMinValue <= angleDeg && that.actualDirectionMaxValue >= angleDeg) {

              if (that.viewIncomingTrips) {

                var v = {x: -directionDistanceArray[1], y: -directionDistanceArray[2]};

                var angleRad = Math.acos( v.x / Math.sqrt(v.x*v.x + v.y*v.y) );
                var angleDeg = angleRad * 180 / Math.PI;

                if (v.y < 0) {
                  angleDeg = 360 - angleDeg;
                }              

                if (that.actualDirectionMinValue <= angleDeg && that.actualDirectionMaxValue >= angleDeg) {


                  var directionIncomingArray = that.dataManager_.stationsDirectionDistanceMatrix[originStationNumber][station["number"]];

                  if (that.actualFlowMinValue <= numTrips && that.actualFlowMaxValue >= numTrips) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255,0,0,0.35)';
                    // ctx.lineWidth = Math.max(numTrips/2, 1);          
                    ctx.moveTo(key*cellWidth + cellWidth*0.5,destinationStation["order"]*cellHeight + cellHeight*0.5);
                    ctx.lineTo(key*cellWidth + cellWidth*0.5 + directionIncomingArray[1] * length,destinationStation["order"]*cellHeight + cellHeight*0.5 - directionIncomingArray[2] * length);
                    ctx.stroke();
                  }
                  
                  // station["number"]
                  if (that.ts[destinationStation["order"]][key] == undefined) {
                    that.ts[destinationStation["order"]][key] = [];                                        
                  }

                  if (that.ts[destinationStation["order"]][key]["it"] == undefined) {                    
                    that.ts[destinationStation["order"]][key]["it"] = [];                    
                  }

                  if (!that.usingCalendarDayData) {
                    that.ts[destinationStation["order"]][key]["it"].push([station["number"], numTrips, duration]);
                  } else {
                    that.ts[destinationStation["order"]][key]["it"].push([station["number"], duration]);
                  }
                }
              }

              // draw outgoing trip
              if (that.viewOutgoingTrips) {

                var v = {x: directionDistanceArray[1], y: directionDistanceArray[2]};

                var angleRad = Math.acos( v.x / Math.sqrt(v.x*v.x + v.y*v.y) );
                var angleDeg = angleRad * 180 / Math.PI;

                if (v.y < 0) {
                  angleDeg = 360 - angleDeg;
                }                   

                if (that.actualDirectionMinValue <= angleDeg && that.actualDirectionMaxValue >= angleDeg
                  && that.actualFlowMinValue <= numTrips && that.actualFlowMaxValue >= numTrips) {                              

                  ctx.beginPath();          
                  ctx.strokeStyle = 'rgba(0,0,255,0.35)'; 
                  // ctx.lineWidth = Math.max(numTrips/2, 1);                     
                  ctx.moveTo(key*cellWidth + cellWidth*0.5,(lineIndex)*cellHeight + cellHeight*0.5);
                  ctx.lineTo(key*cellWidth + cellWidth*0.5 + directionDistanceArray[1] * length,(lineIndex)*cellHeight + cellHeight*0.5 - directionDistanceArray[2] * length);          
                  ctx.stroke();            

                }
              }

            }
          }
        });

        // ctx.fillStyle=colorScale(samples[key].length/10.0);        
        // ctx.fillRect(key*cellWidth,lineIndex*cellHeight,cellWidth+1,cellHeight+1);
      });

      // samples.forEach(function(sample, index) {            
      //   ctx.fillStyle=colorScale(sample.length/10.0);        
      //   ctx.fillRect(index*cellWidth,lineIndex*cellHeight,cellWidth+1,cellHeight+1);        
      // });

      that.matrixCellWidth = cellWidth;
      that.matrixCellHeight = cellHeight;
      
    });

    

    // parentDiv.selectAll('#TripsViewSvgDiv').remove();

    var svgDiv = parentDiv.selectAll('#TripsViewSvgDiv').data(['TripsViewSvgDiv']).enter().append('div');
    svgDiv
      .attr("id", "TripsViewSvgDiv")      
      .style("position", "relative")      
      // .style("height", (svgHeight + that.matrixTop) + "px")
      .style("height" , "20px")
      // .style("width", svgWidth + "px")
      .style("width" , canvasWidth + "px")
      .style("left", that.matrixLeft + "px")      
      .style("top", (-(svgHeight-(that.matrixTop-40))) + "px");
      // .style("top", (that.matrixTop) + "px");

    var svg = svgDiv.selectAll('svg').data(['svg']);
    svg.enter().append('svg')
    .style("height" , "20px")
      // .style("height" , "960px")
      // .style("width" , "955px")
      .style("width" , canvasWidth + "px")
      .style("visibility", "inherit");       

    var g = svg.selectAll('#TripsViewSvgGroup').data(['g']);
    g.enter().append('g')
      .style("visibility", "inherit") 
      .attr("id", "TripsViewSvgGroup")
      .attr('transform', 'translate(' + 0 + ',' + 0 + ')');
    
    var beginDate = new Date(1374292800000);  
    beginDate.setHours(0);
    var endDate = new Date(1374379200000);
    endDate.setHours(0);

    
    var xScale = d3.time.scale().domain([beginDate, endDate]).range([0, canvasWidth]);      
    
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

    var tableCanvasDivSvg = tableCanvasDiv.selectAll('svg').data(['svg']);
    tableCanvasDivSvg.enter().append('svg')
      .style("position", "absolute")
      .style("top", (0) + "px")
      .style("left", (0) + "px")
      .style("height" , canvasHeight + "px")
      // .style("width" , "955px")
      .style("width" , canvasWidth + "px")
      .style("visibility", "inherit");       

    // var matrixGroup = tableCanvasDivSvg.selectAll('#TripsViewSvgGroup').data(['g']);
    // matrixGroup.enter().append('g')
    //   .style("visibility", "inherit") 
    //   .attr("id", "TripsViewSvgGroup")
    //   .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

    // var matrixGroup = g.selectAll('#matrixGroup').data(['matrixGroup']);
    // matrixGroup.enter().append('g')
    //   .style("visibility", "inherit")
    //   .attr("id", "matrixGroup")
    //   .attr('transform', 'translate(' + 0 + ',' + 20 + ')');

    var tableSvg = tableCanvasDivSvg.selectAll('#daysOfWeekModelsTableSvg').data(['tableSvg']);
    // var tableSvg = tableCanvasDiv.selectAll('#daysOfWeekModelsTableSvg').data(['tableSvg']);
    tableSvg
      .enter().append('g')
      .style("visibility", "inherit")
      // .attr('width', svgWidth)
      .attr('id', "daysOfWeekModelsTableSvg");
      // .attr('height', svgHeight); 

    tableSvg.append('rect')
      .attr("id", "tripsPointedLineRect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", that.cellWidth * 24)
      .attr("height", that.cellHeight)
      .attr("stroke", "black")
      .attr("stroke-width", "2")
      .attr("opacity", 0)
      .attr("fill", "none");
    


    updateFilterTableBrush(tableSvg, canvasWidth, canvasHeight);

  };
   
  var updateFilterTableBrush = function(svg, width, height) {
    

    console.log("updateFilterTableBrush");

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

                    
          that.reorderLines();
          that.updateRankingLists();       
          that.updateMatrix(); 
          // that.updatedTripsInTheMap();         
          // that.updatedTripsInTheMap();
          // console.log(brush.extent());
        }

        

      });

    that.brush = brush;
    
    // svg.selectAll('.brush').remove();
    var gBrush = svg.selectAll('.brush').data(['brush']);
    gBrush.enter().append("g")           
      .classed('brush', true)
      .attr("id", "TripsViewBrush")   
      .on("mousemove", function(){      

        var thisLineId = Math.floor(d3.mouse(this)[1]/that.matrixCellHeight);
        var thisColumn = Math.floor(d3.mouse(this)[0]/that.matrixCellWidth);
        that.matrixPointedColumn = thisColumn;

        
        that.pointedStation(thisLineId);
        that.cursorOverMatrix = true;
      })
      .on("mouseout", function(){
        
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

        
        // that.reorderLines();
        // that.createMatrix();
      });
  

    gBrush.call(brush);

      
    function brushed() {
      // console.log("brushed");
      var extent0 = brush.extent(),
          extent1;
        
      extent1 = extent0.map(function(corner) {
          return corner.map(Math.round);
      });   


      // console.log(extent0);
      // console.log(extent1);

      // if (extent1[0][0] == extent1[1][0] && extent1[0][1] == extent1[1][1]) {
      //   extent1[0] = [0,0];
      //   extent1[1] = [24,that.actualOrderingList.orderedStations.length];
      // }
      // console.log(extent1);

      that.brushExtentNew = extent1;

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

      that.updatedTripsInTheMap();


      var timeWindowBegin = new Date();
      timeWindowBegin.setHours(0);
      timeWindowBegin.setSeconds(0);
      timeWindowBegin.setMinutes(extent1[0][0]*60);
      
      var timeWindowEnd = new Date();
      timeWindowEnd.setHours(0);
      timeWindowEnd.setSeconds(0);
      timeWindowEnd.setMinutes((extent1[1][0])*60);

      for (var i = that.brushExtent[0][1]; i < that.brushExtent[1][1]; i++) {

        d3.select("#TripsViewStationRepresentation" + that.actualOrderingList.orderedStations[i].id)          
          .attr("fill", function(d) {

            if (!that.actualOrderingList.orderedStations[i].selected) {
              return "hsl(" + (0.1 * 360) + ", 0%, 50%)";
            }

            // var value = (that.actualOrderingList.orderedStations[i].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
            var value = ((that.brushExtent[1][1] - that.brushExtent[0][1]) - (i - that.brushExtent[0][1])) / (that.brushExtent[1][1] - that.brushExtent[0][1]);

            return that.actualPropertyColorScale(value);        
            
          }) ; 
      }     

      d3.select("#tripsDaysOfWeekModelsInfoBrushTimeWindow").text("Time window: " + timeWindowBegin.toTimeString().split(" ")[0] + " <-> " + timeWindowEnd.toTimeString().split(" ")[0]);
      d3.select("#tripsDaysOfWeekModelsInfoBrushRowRange").text("Row range: " + that.brushExtent[0][1] + " <-> " + (that.brushExtent[1][1]-1));
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
      d3.select("#TripsViewStationRepresentation" + that.actualOrderingList.orderedStations[i].id)
        
        .attr("fill", function(d) {
          
          // var value = (that.actualOrderingList.orderedStations[i].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);

          // return that.actualPropertyColorScale(value);        

          if (!that.actualOrderingList.orderedStations[i].selected) {
            return "hsl(" + (0.1 * 360) + ", 0%, 50%)";
          }

          // var value = (that.actualOrderingList.orderedStations[i].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
          var value = ((that.brushExtent[1][1] - that.brushExtent[0][1]) - (i - that.brushExtent[0][1])) / (that.brushExtent[1][1] - that.brushExtent[0][1]);

          return that.actualPropertyColorScale(value);  
          
        }) ; 
    }
      
  };    
  
  updateFilterTable(that.actualOrderingList.orderedStations, ts, that.actualPropertyColorScale);
  // this.updateValuesRange();

  // that.updatedTripsInTheMap();

  if (!this.playing) {
    return;
  }

  setTimeout(function() {
    that.updateBrushExtentPlaying(that);
  }, 500)
};

TripsViewMatrixViewer.prototype.updateBrushExtentPlaying = function(obj) {
  
  // console.log("updateBrushExtentPlaying");

  // console.log(obj.brushExtent);

  if (new Date(obj.brushExtent[1][0] + 1) > obj.xScale.domain()[1]) {
    return;
  }

  obj.brushExtent = [[new Date(obj.brushExtent[0][0] + 1),obj.brushExtent[0][1]], [new Date(obj.brushExtent[1][0] + 1),obj.brushExtent[1][1]]];
  
  // console.log(obj.brushExtent);

  obj.brush.extent(obj.brushExtent);
  obj.brush(d3.select("#TripsViewBrush"));
  obj.brush.event(d3.select("#TripsViewBrush"));

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
TripsViewMatrixViewer.prototype.isActive = function() {
  return this.active_;
};

/**
 * Activates/deactivates viewer.
 */
TripsViewMatrixViewer.prototype.setActive = function(active) {
  var mustUpdate = active && !this.active_;
  this.active_ = active;

  // Show/hide containers.
  utils.setVisibility(this.visibleContainersId_, this.active_);
  
};

TripsViewMatrixViewer.prototype.update = function() {
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