/**
 * @fileoverview Manager for data used in visualizations.
 *
 * @author (guilherme.n.oliveira@gmail.com) Guilherme Oliveira
 */

/**
 * Manages filters and data that change in response to filters and user
 * interaction.
 *
 * @param citibikeData object that fetches data from citi bike stations
 */
var DataManager = function() {
    
  this.listeners_ = [];  
  this.stationsActivities = [];
  this.selectedStations = [];
  this.stationsModel = [];
  this.dayOfWeekModels = [];
  this.stationsDayOfWeekModels = [];
  this.circulationData = [];
  this.stationsDayActivity = [];
  this.stationsDayTrips = [];
  this.stationsPeriodTrips = [];

  this.stationsActivityCountChanged = false;
  this.stationsAlreadyLoaded = false;

  this.useServer = false;
};


/**
 * Invokes update on trips renderer on response of user input.
 */
DataManager.prototype.addListener = function(listener) {
  this.listeners_.push(listener);
};

DataManager.prototype.stationsLoaded = function(data, dataManager, callback) {
  // console.log(data);  

  if (this.stationsAlreadyLoaded) {
    return;
  }

  var loadedStations = JSON.parse(data);
  // console.log(loadedStations);  
  var stationNumbers = {};
  dataManager.stations = [];
  dataManager.stationsIndexedById = [];
  dataManager.stationsIndexedByNumber = [];
  for (var si in loadedStations)  {
    var station = loadedStations[si];
    if (!(station.number in stationNumbers) && (station.number < 3000)) {
      dataManager.stationsIndexedById[station.id] = dataManager.stations.length;
      dataManager.stationsIndexedByNumber[station.number] = dataManager.stations.length;
      dataManager.stations.push(station);
      stationNumbers[station.number] = '';
    }
    // if (station.id == 163) {
    //   console.log(station);
    // }
  }
  this.stationsAlreadyLoaded = true;
  // console.log("stationsLoaded");
  //dataManager.update(false);

};

// DataManager.prototype.stationsLoadedNoServer = function(error, parsedJson) {
//   console.log("stationsLoadedNoServer");
//   console.log(parsedJson);
// };



/**
* Do something with the loaded streets graph
*/
DataManager.prototype.streetsGraphLoaded = function(data, dataManager) { 

  // console.log("streetsGraphLoaded");

  // dataManager.streetsGraph = JSON.parse(data);   
  dataManager.streetsGraph = data;   
  // console.log(dataManager.streetsGraph);
    
};

/**
 * Loads a graph with the streets and the stations 
 * 
 */
DataManager.prototype.loadStreetsGraph = function(listener) {   
  
  dataManager = this;

  var cb = function(data) {
    dataManager.streetsGraphLoaded(data, dataManager);

    listener.streetsGraphLoaded();
  };

  if (dataManager.streetsGraph == undefined) {
    this.loadData('streetsGraph', cb);
  } else {
    listener.streetsGraphLoaded();
  }

  // $.post(
  //   'http://localhost:8080/getGraph',
  //   {},
  //   function(data) {dataManager.streetsGraphLoaded(data, dataManager); listener.streetsGraphLoaded();}
  // );  
};    

/**
 * Loads a json file with stations information. 
 * 
 */
DataManager.prototype.loadStations = function(listener) {   
  
  dataManager = this;

  var cb = function(data) {
    dataManager.stationsLoaded(data, dataManager);

    listener.stationsLoaded();
  };

  if (!this.stationsAlreadyLoaded) {
    this.loadData('stations', cb);
  } else {
    listener.stationsLoaded();
  }
};

DataManager.prototype.loadData = function(queryName, cb) {
  if (this.useServer) {    
    $.post('http://localhost:8080/' + queryName, {}, cb);  
  } else {
    var file = 'data/' + queryName + '.json';
    // console.log(file);    
    d3.json(file, cb);
  }
};

DataManager.prototype.loadDataPerPeriod = function(queryName, cb, period) {
  if (this.useServer) {
      $.post('http://localhost:8080/' + queryName, {}, cb);  
  } else {
    var file = 'data/' + queryName + '.json';
    // console.log(file);    
    d3.json(file, function(error, data) { cb(data, period); });
  }
};

DataManager.prototype.loadDataPerPeriodAndDayOfWeek = function(queryName, cb, period, dayOfWeek) {
  if (this.useServer) {
      $.post('http://localhost:8080/' + queryName, {}, cb);  
  } else {
    var file = 'data/' + queryName + '.json';
    // console.log(file);    
    d3.json(file, function(error, data) { cb(data, period, dayOfWeek); });
  }
};

DataManager.prototype.loadDataPerDay = function(queryName, cb, day) {
  if (this.useServer) {
      $.post('http://localhost:8080/' + queryName, {}, cb);  
  } else {
    var file = 'data/' + queryName + '.json';
    console.log(file);    
    d3.json(file, function(error, data) { /*console.log(error)*/; cb(data, day); });
  }
};

DataManager.prototype.getDayActivity = function(listener, selectedDate) {   
  
  dataManager = this;

  console.log(selectedDate); 

  // return;

  var cb = function(data, day) {
    // console.log("stationsWeekModels loaded");    
    // console.log(data);
    // dataManager.stationsDayOfWeekModels = JSON.parse(data);
    dataManager.stationsDayActivity[day] = data;
    console.log(day);
    console.log(dataManager.stationsDayActivity);
    listener.stationsDayActivityLoaded();
    $("div").css("cursor", "default");
    $("body").css("cursor", "default");
  };

  if (dataManager.stationsDayActivity[selectedDate] == undefined) {
    console.log("entrou");    
    $("div").css("cursor", "progress");
    $("body").css("cursor", "progress");
    this.loadDataPerDay("balanceDaysData/"+ selectedDate, cb, selectedDate);
  } else {
    listener.stationsDayActivityLoaded();
  }  
};

DataManager.prototype.getStationsDayOfWeekModels = function(listener, period) {   
  
  dataManager = this;

  var cb = function(data, period) {
    // console.log("stationsWeekModels loaded");    
    // console.log(data);
    // dataManager.stationsDayOfWeekModels = JSON.parse(data);
    dataManager.stationsDayOfWeekModels[period] = data;
    // console.log(period);
    // console.log(dataManager.stationsDayOfWeekModels);
    listener.stationsDayOfWeekModelLoaded();
    $("div").css("cursor", "default");
    $("body").css("cursor", "default");
  };

  if (dataManager.stationsDayOfWeekModels[period] == undefined) {
    // console.log("entrou");    
    $("div").css("cursor", "progress");
    $("body").css("cursor", "progress");
    this.loadDataPerPeriod("stationsWeekModels"+ period, cb, period);
  } else {
    listener.stationsDayOfWeekModelLoaded();
  }  
};

DataManager.prototype.getStationsTripsView = function(listener, period) {   
  
  dataManager = this;

  var cb = function(data, period) {
    // console.log("stationsWeekModels loaded");    
    // console.log(data);
    // dataManager.stationsDayOfWeekModels = JSON.parse(data);
    dataManager.stationsTrips[period] = data;
    // console.log(period);
    // console.log(dataManager.stationsDayOfWeekModels);
    listener.stationsTripsLoaded();
    $("div").css("cursor", "default");
    $("body").css("cursor", "default");
  };

  if (dataManager.stationsTrips[period] == undefined) {
    // console.log("entrou");    
    $("div").css("cursor", "progress");
    $("body").css("cursor", "progress");
    this.loadDataPerPeriod("stationsWeekModels"+ period, cb, period);
  } else {
    listener.stationsTripsLoaded();
  }  
};

DataManager.prototype.getStationsPeriodTrips = function(listener, period) {   
  
  dataManager = this;

  console.log(period); 

  // return;

  var cb = function(data, day) {
    // console.log("stationsWeekModels loaded");    
    // console.log(data);
    // dataManager.stationsDayOfWeekModels = JSON.parse(data);
    // dataManager.stationsDayTrips[day] = listener.processDayData(data);
    dataManager.stationsPeriodTrips[period] = data;
    // console.log(day);
    // console.log(dataManager.stationsDayTrips);
    listener.stationsPeriodTripsLoaded();
    $("div").css("cursor", "default");
    $("body").css("cursor", "default");
  };

  if (dataManager.stationsPeriodTrips[period] == undefined) {
    console.log("entrou");    
    $("div").css("cursor", "progress");
    $("body").css("cursor", "progress");
    this.loadDataPerPeriod("tripsByPeriod/"+ period, cb, period);
  } else {
    listener.stationsPeriodTripsLoaded();
  }  
};

DataManager.prototype.getStationsDayTrips = function(listener, selectedDate) {   
  
  dataManager = this;

  console.log(selectedDate); 

  // return;

  var cb = function(data, day) {
    // console.log("stationsWeekModels loaded");    
    // console.log(data);
    // dataManager.stationsDayOfWeekModels = JSON.parse(data);
    // dataManager.stationsDayTrips[day] = listener.processDayData(data);
    dataManager.stationsDayTrips[day] = data;
    // console.log(day);
    // console.log(dataManager.stationsDayTrips);
    listener.stationsDayTripsLoaded();
    $("div").css("cursor", "default");
    $("body").css("cursor", "default");
  };

  if (dataManager.stationsDayTrips[selectedDate] == undefined) {
    console.log("entrou");    
    $("div").css("cursor", "progress");
    $("body").css("cursor", "progress");
    this.loadDataPerDay("tripsDaysData/"+ selectedDate, cb, selectedDate);
  } else {
    listener.stationsDayTripsLoaded();
  }  
};

DataManager.prototype.getStationsCalendarViewData = function(listener) {   
  
  // console.log("getStationsCalendarViewData");    

  dataManager = this;

  var cb = function(data) {
    // console.log("stationsCalendarViewData loaded");    
    // console.log(data);
    // dataManager.stationsDayOfWeekModels = JSON.parse(data);
    dataManager.stationsCalendarViewData = data;
    // console.log(period);
    console.log(dataManager.stationsCalendarViewData);

   // Preprocessing.filterData(data,"biOF","me");
    listener.stationsCalendarViewDataLoaded();
    $("div").css("cursor", "default");
    $("body").css("cursor", "default");
  };

  if (dataManager.stationsCalendarViewData == undefined) {
    // console.log("entrou");    
    // $("div").css("cursor", "progress");
    // $("body").css("cursor", "progress");
    this.loadData("stationsCalendarViewData", cb);
  } else {
    listener.stationsCalendarViewDataLoaded();
  }  
};

DataManager.prototype.getDailyCirculation = function(queryName, listener) { 
  console.log("getDailyCirculation");
  
  dataManager = this;

  if (dataManager.circulationData["Days"] == undefined) {
    dataManager.circulationData["Days"] = [];
  }

  var cb = function(data, queryName) { 
    if (dataManager.circulationData["Days"] == undefined) {
      dataManager.circulationData["Days"] = [];
    }   
    console.log(queryName);
    dataManager.circulationData["Days"][queryName] = data;    
    console.log(dataManager.circulationData);
    // dataManager.circulationData[queryName] = data;
    $("div").css("cursor", "default");      
    listener.weekCirculationLoaded(queryName, "Days");
    if (this.notFirstLoadingWeekCirculation != undefined) {
      $("div").css("cursor", "default");      
    } else {
      this.notFirstLoadingWeekCirculation = true;
    }     
  };

  if (!this.circulationData["Days"][queryName]) {
    $("div").css("cursor", "progress");
    this.loadDataPerDay("flow/Days/"+queryName, cb, queryName);
  } else {
    listener.weekCirculationLoaded(queryName, "Days");
  }
}

/**
 * Loads a json file with stations information. 
 * 
 */
DataManager.prototype.getWeekCirculation = function(queryName, period, listener) {   
  
  // console.log("getWeekCirculation");
  // console.log(period);
  // console.log(queryName);

  dataManager = this;

  var cb = function(data, period, queryName) {
    // console.log(period);
    // console.log(queryName);
    if (period in dataManager.circulationData) {
      dataManager.circulationData[period][queryName] = data;
    } else {
      dataManager.circulationData[period] = [];
      dataManager.circulationData[period][queryName] = data;
    }
    // console.log(dataManager.circulationData);
    // dataManager.circulationData[queryName] = data;

    listener.weekCirculationLoaded(queryName, period);
    if (this.notFirstLoadingWeekCirculation != undefined) {
      $("div").css("cursor", "default");      
    } else {
      this.notFirstLoadingWeekCirculation = true;
    }     
  };

  if (!this.circulationData[period] || !this.circulationData[period][queryName]) {
    $("div").css("cursor", "progress");
    this.loadDataPerPeriodAndDayOfWeek("flow/"+period+"/"+queryName, cb, period, queryName);
  } else {
    listener.weekCirculationLoaded(queryName, period);
  }
    
};

DataManager.prototype.getStationsDirectionDistanceMatrix = function(listener) {   
  
  // console.log("getPathMatrix");
  // console.log(queryName);

  dataManager = this;

  var cb = function(data) {
    dataManager.stationsDirectionDistanceMatrix = data;
    // console.log(data);
    listener.stationsDirectionDistanceMatrixLoaded();    
    // $("div").css("cursor", "default");          
  };

  if (!this.stationsDirectionDistanceMatrix) {
    // $("div").css("cursor", "progress");
    this.loadData("stationsDirectionDistanceMatrix", cb);
  } else {
    listener.stationsDirectionDistanceMatrixLoaded();
  }
    
};

DataManager.prototype.getPathMatrix = function(listener) {   
  
  // console.log("getPathMatrix");
  // console.log(queryName);

  dataManager = this;

  var cb = function(data) {
    dataManager.pathMatrix = data;
    // console.log(data);
    listener.pathMatrixLoaded();    
    // $("div").css("cursor", "default");          
  };

  if (!this.pathMatrix) {
    // $("div").css("cursor", "progress");
    this.loadData("pathMatrix", cb);
  } else {
    listener.pathMatrixLoaded();
  }
    
};

DataManager.prototype.loadCirculationFilesforVisualizationFromFile = function(date, listener) {   
  
  dataManager = this;

  // console.log(listener);
  
  $.post(
    'http://localhost:8080/getCirculationFilesforVisualizationFromFile',
    {date: date},
    function(data) {dataManager.circulationData = JSON.parse(data); listener.circulationLoaded();}
  );  
  
};

DataManager.prototype.stationsActualStateLoaded = function(data, dataManager) {   
  // console.log(data);
  dataManager.stationsActualState = JSON.parse(data);
  // console.log("stationsActualStateLoaded");
  
};

/**
 * Get the actual state of the stations from the web
 * 
 */
DataManager.prototype.loadStationsActualState = function(listener) {  

  // this.stationsActualState = $("#citibikeStationsStateFeed");  
  // console.log(this.stationsActualState);

  // $.getJSON('http://api.citybik.es/citibikenyc.json', function(data){
  //   // do something with your JSON data
  //   console.log(data);
  // })

  // $( "#modeVisContainerUseCitibikeNowContainerRightContainer" ).load( "http://api.citybik.es/citibikenyc.json", function() {
  //   console.log( "Load was performed." );
  // });

  
  // dataManager = this;

  // var xhr = this.createCORSRequest('GET', 'http://api.citybik.es/citibikenyc.json');


  // if (!xhr) {
  //   throw new Error('CORS not supported');
  // }

  // xhr.onload = function() {
  //  var responseText = this.responseText;
  //  console.log("xhr.onload");
  //  // process the response.
  // };
  // xhr.onerror = function() {
  //   console.log('There was an error!');
  // };

  // xhr.send();

  $.post(
    'http://localhost:8080/getStationsActualStateFeed',
    {},
    function(data) {dataManager.stationsActualStateLoaded(data, dataManager); listener.stationsActualStateLoaded();}
  );  
};

/**
* Do something with the loaded activity of a station
*/
// DataManager.prototype.stationActivityLoaded = function(data, dataManager, station, beginTime, endTime) {  
//   dataManager.stationsActivities[station.id] = {st: station, bTime: beginTime, eTime: endTime, data: JSON.parse(data)};
//   dataManager.lastStationActivityIndex = station.id;  

//   dataManager.update(false);


// }

/**
 * Loads a json file with the activity of a station between two dates 
 * 
 */
DataManager.prototype.loadStationActivity = function(station, bTime, eTime) {   
  
  dataManager = this;

  // $.post(
  //   'http://localhost:8080/stationActivity',
  //   {stationNumber: station.id, beginTime: bTime, endTime: eTime},
  //   function(data) {dataManager.stationActivityLoaded(data, dataManager, station, bTime, eTime)}
  // );  
  $.post(
    'http://localhost:8080/stationActivity',
    {stationNumber: station.id, beginTime: bTime, endTime: eTime},
    function(data) {dataManager.stationActivityLoaded(data, dataManager, station, bTime, eTime)}
  ); 
};

/**
 * Loads a json file with the activity of a station between two dates 
 * 
 */
DataManager.prototype.loadStationActivity2 = function(station, bTime, eTime, callback) {   
  
  dataManager = this;
   
  $.post(
    'http://localhost:8080/stationActivity',
    {stationNumber: station.id, beginTime: bTime, endTime: eTime},
    //callback(data, station, bTime, eTime)
    function(a) {callback(a, station, bTime, eTime);}
  ); 
};

/**
* Do something with the loaded activity count of the stations
*/
DataManager.prototype.stationsActivityCountLoaded = function(data, dataManager, beginTime, endTime) { 

  dataManager.stationsActivityCount = JSON.parse(data); 

  dataManager.stationsActivityCountChanged = true;
  
  dataManager.update(false);
};

/**
 * Loads a json file with the activity count of each station between two dates 
 * 
 */
DataManager.prototype.loadStationsActivityCount = function(bTime, eTime) {   
  
  dataManager = this;

  $.post(
    'http://localhost:8080/stationsActivityCount',
    {beginTime: bTime, endTime: eTime},
    function(data) {dataManager.stationsActivityCountLoaded(data, dataManager, bTime, eTime)}
  );  
};

/**
* Do something with the distance matrix
*/
DataManager.prototype.stationsDistanceMatrixLoaded = function(data, dataManager) { 

  dataManager.stationsDistanceMatrix = JSON.parse(data);   

  dataManager.stationsDistanceMatrixByIds = {};

  var minDistance = 0;
  var maxDistance = 0;
  for (var i = 0; i < dataManager.stationsDistanceMatrix.length; i++) {
    dataManager.stationsDistanceMatrixByIds["s" + dataManager.stationsDistanceMatrix[i].source 
    + "t" + dataManager.stationsDistanceMatrix[i].target] = dataManager.stationsDistanceMatrix[i].distance;

    if (i == 0 || minDistance > dataManager.stationsDistanceMatrix[i].distance) {
      minDistance = dataManager.stationsDistanceMatrix[i].distance;
    }
    if (i == 0 || maxDistance < dataManager.stationsDistanceMatrix[i].distance) {
      maxDistance = dataManager.stationsDistanceMatrix[i].distance;
    }
  }

  this.minDistance = minDistance;
  this.maxDistance = maxDistance;
   

  this.update(false);

  // console.log(dataManager.stationsDistanceMatrixByIds);
    
};

/**
 * Loads a matrix with the shortest distance between each pair of stations 
 * 
 */
DataManager.prototype.loadStationsDistanceMatrix = function() {   
  
  dataManager = this;

  $.post(
    'http://localhost:8080/getStationsDistanceMatrix',
    {},
    function(data) {dataManager.stationsDistanceMatrixLoaded(data, dataManager)}
  );  
};

/**
* Do something with the paths matrix
*/
DataManager.prototype.stationsPathMatrixLoaded = function(data, dataManager) { 

  console.log("stationsPathMatrixLoaded");

  dataManager.stationsPathMatrix = JSON.parse(data);    

  this.update(false);
    
};


/**
 * Loads a matrix with the shortest path between each pair of stations 
 * 
 */
DataManager.prototype.loadStationsPathMatrix = function() {   
  
  dataManager = this;

  $.post(
    'http://localhost:8080/getStationsPathMatrix',
    {},
    function(data) {dataManager.stationsPathMatrixLoaded(data, dataManager)}
  );  
};

DataManager.prototype.getStations = function() {
  
  return this.stations;
};

DataManager.prototype.getStationsActivityCount = function() {
  
  return this.stationsActivityCount;
};

/**
* Do something with the paths matrix
*/
DataManager.prototype.stationsModelLoaded = function(data, dataManager) { 
  
  console.log("stationsModelLoaded");

  dataManager.stationsModel = JSON.parse(data); 
  // console.log(dataManager.stationsModel);

  //console.log($.map(dataManager.stationsModel, function (value, key) { return key; }))   

  this.update(false);
    
};

/**
 * Loads the model of one station 
 * 
 */
DataManager.prototype.loadStationModel = function(stationId, listener) {   
  
  dataManager = this;

  // console.log("loadStationsModel");

  $.post(
    'http://localhost:8080/getStationModel',
    {id: stationId},
    function(data) {
      dataManager.stationsModel[stationId] = JSON.parse(data);
      dataManager.stationsModel["beginTime"] = "2013-06-01 06:00:00";
      dataManager.stationsModel["endTime"] = "2013-12-31 06:00:00";
      dataManager.stationsModel["samplingInterval"] = 15 * 60;   // it is in seconds
      // console.log(dataManager.stationsModel[stationId]);
      listener.stationModelLoaded(stationId);
    }
  );  
};


/**
 * Loads a matrix with the shortest path between each pair of stations 
 * 
 */
DataManager.prototype.loadStationsModel = function() {   
  
  dataManager = this;

  // console.log("loadStationsModel");

  $.post(
    'http://localhost:8080/getStationsUsageModel',
    {},
    function(data) {dataManager.stationsModelLoaded(data, dataManager)}
  );  
};

DataManager.prototype.stationsActualFrequencyLoaded = function(data, dataManager) { 
  
  // console.log("stationsActualFrequencyLoaded");

  dataManager.stationsActualFrequency = JSON.parse(data);   
    
};


DataManager.prototype.getStationsActualFrequency = function(minutesTimeWindow) {   
  
  dataManager = this;

  // console.log("getStationsActualFrequency");

  $.post(
    'http://localhost:8080/getStationsActualFrequency',
    {timeWindow: minutesTimeWindow},
    function(data) {
      dataManager.stationsActualFrequencyLoaded(data, dataManager);
      // listener.stationsActualFrequencyLoaded();
    }
  );  
};

DataManager.prototype.loadStationTodayHistory = function(id, listener) {   
  
  dataManager = this;

  // console.log("DataManager.loadStationTodayHistory");

  $.post(
    'http://localhost:8080/loadStationTodayHistory',
    {stationId: id},
    function(data) { 
      console.log("DataManager.loadStationTodayHistory");
      console.log(data);
      listener.stationTodayHistoryLoaded(JSON.parse(data));
    }
  );  
};

DataManager.prototype.getCirculation = function(bTime, eTime, listener) {   
  
  dataManager = this;

  // console.log("DataManager.loadStationTodayHistory");

  $.post(
    // 'http://localhost:8080/getCirculation',
    'http://localhost:8080/getCirculationFromFile',
    {beginTime: bTime, endTime: eTime},
    function(data) { 
      console.log("DataManager.getCirculation");
      // console.log(data);
      
      dataManager.circulation = [];
      dataManager.circulation["beginTime"] = bTime;
      dataManager.circulation["endTime"] = eTime;
      dataManager.circulation["data"] = JSON.parse(data);
      
      listener.circulationLoaded(JSON.parse(data));
    }
  );  
};



// DataManager.prototype.getDayOfWeekModels = function(dayOfWeek, listener) {   
  
//   dataManager = this;

//   console.log("DataManager.getDayOfWeekModels");

//   $.post(
//     // 'http://localhost:8080/getCirculation',
//     'http://localhost:8080/getDayOfWeekModels',
//     {dayOfWeek: dayOfWeek},
//     function(data) { 
//       // console.log("DataManager.getDayOfWeekModels loaded");
//       // console.log(data);
      
//       dataManager.dayOfWeekModels[dayOfWeek] = JSON.parse(data);
      
//       listener.dayOfWeekModelLoaded(dayOfWeek);
//     }
//   );  
// };

DataManager.prototype.getStationsActualCapacity = function(listener) {   
  
  dataManager = this;

  console.log("DataManager.getStationsActualCapacity");

  $.post(    
    'http://localhost:8080/getStationsActualCapacity',
    {},
    function(data) {      
      dataManager.stationsActualCapacity = JSON.parse(data);
      
      listener.stationsActualCapacityLoaded();
    }
  );  
};

/**
 * Returns whether data has already been loaded.
 */
DataManager.prototype.hasData = function() {
  
  //TODO

};

/**
 * Invokes update() on listeners.
 * Flag lazyUpdate can be used to suppress update call: when true,
 * nothing is actually updated.
 */
DataManager.prototype.update = function(lazyUpdate) {  
  if (!lazyUpdate) {    
    for (var i = 0; i < this.listeners_.length; i++) {
      this.listeners_[i].update();
    }
  }
};