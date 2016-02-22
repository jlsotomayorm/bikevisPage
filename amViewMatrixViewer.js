/**
 * Created by jl on 30/05/15.
 */
var AMViewMatrixViewer = function(dataManager, viewerContainerId) {
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
    this.matrixLeft = 10;

    this.matrixWidth = 0;

    this.colorScales = [];

    this.ordersValue = "name";

    this.displayProperty = "ntrips";


    this.startHour = 0;

    this.endHour = 23;

    this.dayOfWeek = 0;
    this.tripsDayOfWeek = 0;
    this.variable = "b";
    this.variablesList = [];
    this.stations = [];
    this.orderLists = [];

    this.autoSelection = false;

    this.selectionMinValue = 80;
    this.selectionMaxValue = 100;

    this.maxLimit = 0;
    this.minLimit = 0;

    this.mapStationIdToOrderIndex = [];

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

AMViewMatrixViewer.prototype.setActive = function(active) {
    var mustUpdate = active && !this.active_;
    this.active_ = active;

    // Show/hide containers.
    utils.setVisibility(this.visibleContainersId_, this.active_);

};

AMViewMatrixViewer.prototype.setVariablesList = function() {

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

    d3.select("#analyticsAMViewVariables").selectAll(".AMViewVariableOption").data(this.variablesList).enter()
        .append("option")
        .attr("class", "AMViewVariableOption")
        .attr("value", function(d) {return d;})
        .text(function(d) {return d;});

    this.variable = "nt";

    // return;



    this.createOrderLists();
    this.reorderLines();
}

AMViewMatrixViewer.prototype.reorderLines = function() {

    var that = this;

    var orderingVariable = this.variableNametoKeyMap[that.ordering.split(": ")[0]];
    var orderingStat = that.ordering.split(": ")[1];

    var element = document.getElementById('analyticsAMViewOrdering');

    if (orderingVariable == "out" ||
        orderingVariable == "fout" ||
        orderingVariable == "eout") {

        orderingStat = "sum";

        element.value = this.variableKeyToNameMap[orderingVariable];
    } else {
        element.value = this.variableKeyToNameMap[orderingVariable] + ": " + orderingStat;
    }



    orderingStat = "Id";

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

    var that = this;
    newOrderingList.forEach(function (station,index){
        that.mapStationIdToOrderIndex[station.id] = index
;
    })




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
AMViewMatrixViewer.prototype.createOrderLists = function() {

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

    d3.select("#analyticsAMViewOrdering").selectAll(".AMViewNonStationOrderingOption").data(orderingNames).enter()
        .append("option")
        .attr("class", "AMViewNonStationOrderingOption")
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
AMViewMatrixViewer.prototype.stationsLoaded = function() {
    // console.log(this.dataManager_.stations);
    // this.dataManager_.getStationsTripsView(this);

    var periodOptions = ["06 2013", "07 2013", "08 2013", "09 2013", "10 2013", "11 2013", "12 2013", "01 2014", "02 2014", "03 2014", "04 2014", "05 2014", "06 2014", "07 2014", "08 2014", "09 2014", "Summer 2013", "Fall 2013", "Winter 2013", "Spring 2014", "Summer 2014", "All"];

    d3.select("#analyticsAMViewPeriod").selectAll(".AMViewPeriodOption").data(periodOptions).enter()
        .append("option")
        .attr("class", "AMViewVariableOption")
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


    // No selection at the beginning
    this.brushExtent = [];
    this.brushExtent[0] = [];
    this.brushExtent[1] = [];
    this.brushExtent[0][1] = 0;
    this.brushExtent[1][1] = -1;
    this.brushExtent[0][0] = 0;
    this.brushExtent[1][0] = -1;
}

AMViewMatrixViewer.prototype.stationsDirectionDistanceMatrixLoaded = function() {

    console.log("stationsDirectionDistanceMatrixLoaded");

    console.log(this.dataManager_.stationsDirectionDistanceMatrix);

    // this.dataManager_.getStationsDayTrips(this, this.calendarDay);
    // this.calendarDay = 0;
    this.dataManager_.getStationsPeriodTrips(this, this.period);

}

AMViewMatrixViewer.prototype.stationsPeriodTripsLoaded = function() {

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

AMViewMatrixViewer.prototype.createColorScales = function() {

    var that = this;

    this.colorScales["White/Orange"] = d3.scale.linear().domain([0.0,0.3,0.5,0.8,1.0]).range([
        d3.rgb(255,255,212),
       d3.rgb(254,217,142),
        d3.rgb(254,153,41),
        d3.rgb(217,95,14),
        d3.rgb(153,52,4)
    ]).clamp(true);;   // white to orange


    this.colorScales["Blue/White/Red"] = d3.scale.linear().domain(
        [0.0, 0.5, 1.0]).range([

            d3.rgb(0.129412 * 255, 0.4 * 255, 0.67451 * 255),
            d3.rgb(0.968627 * 255, 0.968627 * 255, 0.968627 * 255),
            d3.rgb(0.698039 * 255, 0.0941176 * 255, 0.168627 * 255),
        ]).clamp(true);;   // blue to white to red

    this.colorScales["Black/White"] = d3.scale.linear().domain(
        [0.0, 1.0]).range([
            d3.rgb(0,0,0),
            d3.rgb(255,255,255)
        ]).clamp(true);;   // grayScale



    this.colorScales["Orange/White/Purple"] = d3.scale.linear().domain([0.0,0.3,0.5,0.8,1.0]).range([
        d3.rgb(230,97,1),
        d3.rgb(253,184,99),
        d3.rgb(247,247,247),
        d3.rgb(178,171,210),
        d3.rgb(94,60,153)
    ]).clamp(true);;

    this.colorScales["White/Purple"] = d3.scale.linear().domain([1.0,0.0]).range([
        d3.hsl(264,1,1),
        d3.hsl(264,1.0,0.2)
    ]).clamp(true);

    this.colorScales["Heat"] = d3.scale.linear().domain([0.0,0.5,1.0]).range([
        d3.rgb(0, 0, 0),
        d3.rgb(255, 0, 0),
        d3.rgb(246, 255, 0)]).clamp(true);

    var colorScaleNames = [];
    for (colorScaleIndex in Object.keys(this.colorScales)) {
        colorScaleNames.push(Object.keys(this.colorScales)[colorScaleIndex]);
    }

    // console.log(colorScaleNames);

    d3.select("#analyticsAMViewColorScaleOptions").selectAll(".AMViewColorScaleOption").data(colorScaleNames).enter()
        .append("option")
        .attr("class", "AMViewColorScaleOption")
        .attr("value", function(d) {return d;})
        .text(function(d) {return d;});



    this.actualPropertyColorScale = this.colorScales["White/Orange"];

    d3.select("#AMViewColorScale").selectAll(".AMViewColorScaleSample").remove();

    var resolution = 10;
    var colorScaleSample = [];
    for (var colorScaleSampleIndex = 0; colorScaleSampleIndex <= resolution; colorScaleSampleIndex++) {
        colorScaleSample.push(colorScaleSampleIndex/resolution);
    }

    var colorScaleWidth = 220;
    var colorScaleHeight = 10;

    d3.select("#AMViewColorScale").selectAll(".AMViewColorScaleSample").data(colorScaleSample).enter()
        .append("div")
        .attr("class", "AMViewColorScaleSample")
        .style("width", ((colorScaleWidth - 10)/(resolution + 1))  + "px")
        .style("height", colorScaleHeight + "px")
        .style("float", "left")
        .style("background", function(d,i) { return that.actualPropertyColorScale(d);});

}

AMViewMatrixViewer.prototype.stationsDayOfWeekModelLoaded = function() {
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
    // console.log(this.dataManager_.TripsView[dayOfWeek]);
    // console.log("stationsDayOfWeekModelLoaded");
}

AMViewMatrixViewer.prototype.processPeriodData = function(data, period, weekday) {

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
/*
                                d3.selectAll("#AMViewStationRepresentation" + stationId)
                                    .attr("r", function(d) {
                                        var minCapacity = 5;
                                        var maxCapacity = 65;
                                        var capacity = thisStationCapacity;
                                        // console.log(capacity);
                                        // return 3 + 4 * Math.log(that.actualOrderingList.orderedStations[i].capacity);
                                        return 4 + 7 * Math.sqrt((capacity - minCapacity) / (maxCapacity - minCapacity)/3.1416);

                                    });

                                d3.selectAll("#AMViewStationRepresentationShadow" + stationId)
                                    .attr("r", function(d) {
                                        var minCapacity = 5;
                                        var maxCapacity = 65;
                                        var capacity = thisStationCapacity;
                                        // console.log(capacity);
                                        // return 3 + 4 * Math.log(that.actualOrderingList.orderedStations[i].capacity);
                                        return 4 + 7 * Math.sqrt((capacity - minCapacity) / (maxCapacity - minCapacity)/3.1416);

                                    });*/
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

AMViewMatrixViewer.prototype.createMatrix = function() {

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
        var svgWidth = d3.select('#modeVisContainerAnalyticsAMViewContainerMiddleContainer')[0][0].clientWidth - that.matrixLeft;
        var svgHeight = d3.select('#modeVisContainerAnalyticsAMViewContainerMiddleContainer')[0][0].clientHeight - that.matrixTop;
        // var svgHeight = (svgWidth / sampleCount) *  stationCount / 2;

        var canvasWidth = svgWidth - 20;
        var canvasHeight = (svgWidth / sampleCount) *  stationCount / 2;

        // console.log(svgWidth);
        // console.log(svgHeight);

        var parentDiv = d3.select("#modeVisContainerAnalyticsAMViewContainerMiddleContainer");

















        parentDiv.select("#amMatrix").remove();


        // parentDiv.selectAll('#TripsViewSvgDiv').remove();

        that.tripMatrix = [];

        var nStations = lines.length;



        var stationObj = [];

        lines.forEach(function (station, lineIndex) {

            var samples = ts[lineIndex];
            var currentStationId = station.id;


            if( stationObj[currentStationId]=== undefined)
            {
                stationObj[currentStationId]={};
            }


            stationObj[currentStationId].name = station.name;
            stationObj[currentStationId].cap = station.capacity;
            stationObj[currentStationId].lat = station.latitude;
            stationObj[currentStationId].lng = station.longitude;
            stationObj[currentStationId].out_trips = 0;
            stationObj[currentStationId].n_trips = 0;
            stationObj[currentStationId].cyclic_trips = 0;
            stationObj[currentStationId].in_origins = 0;
            stationObj[currentStationId].out_destionations = 0;
            stationObj[currentStationId].origins_dest = 0;
            stationObj[currentStationId].outages = 0;
            stationObj[currentStationId].full_outages = 0;
            stationObj[currentStationId].empty_outages = 0;
            stationObj[currentStationId].trip_duration = 0;
            stationObj[currentStationId].balance = 0;
            stationObj[currentStationId].capacity = 0;


            var nMaxId = that.dataManager_.stationsIndexedById.length;



            that.tripMatrix[currentStationId]=d3.range(nMaxId).map(function(j){ return {x: j, y: currentStationId,ntrips:0, tripDuration:0, outages_diff:0,full_outages_diff:0,empty_outages_diff:0,balance_diff:0,capacity_diff:0};});

            Object.keys(samples).forEach(function (key) {

                if(key>= that.startHour && key<= that.endHour) {


                    stationObj[currentStationId].in_origins += samples[key]["isp"];
                    stationObj[currentStationId].out_destionations+= samples[key]["osp"];
                    stationObj[currentStationId].origins_dest += samples[key]["gsp"];
                    stationObj[currentStationId].outages += samples[key]["out"];
                    stationObj[currentStationId].full_outages += samples[key]["fout"];
                    stationObj[currentStationId].empty_outages+= samples[key]["eout"];
                    stationObj[currentStationId].trip_duration+= samples[key]["tdu"];
                    stationObj[currentStationId].balance += samples[key]["b"];
                    stationObj[currentStationId].capacity += samples[key]["c"];

                    samples[key]["trips"].forEach(function(trip) {

                        var otherStationNumber,tripsNumber,tripsTotalDuration;

                        otherStationNumber   = trip[0];
                        if(that.usingCalendarDayData)
                        {
                            tripsNumber = 1;
                            tripsTotalDuration = trip[1];
                        }
                        else
                        {


                            tripsNumber = trip[1];

                            tripsTotalDuration = trip[2];

                        }



                        var otherStationId = that.dataManager_.stationsIndexedByNumber[otherStationNumber];
                        if(otherStationId == undefined)
                            return;


                       var otherIndex = that.mapStationIdToOrderIndex[otherStationId];

                        var otherSample = ts[otherIndex];


                        //Incoming trips
                        if( stationObj[otherStationId]=== undefined)
                        {
                            stationObj[otherStationId]= {};
                            stationObj[otherStationId].in_trips = 0;
                            stationObj[otherStationId].n_trips = 0;

                        }

                        //Cyclic trips

                        if(currentStationId==otherStationId)
                            stationObj[currentStationId].cyclic_trips+= tripsNumber;


                        that.tripMatrix[currentStationId][otherStationId].ntrips +=tripsNumber;

                        //Trip duration
                        that.tripMatrix[currentStationId][otherStationId].tripDuration +=tripsTotalDuration/tripsNumber;

                        stationObj[currentStationId].out_trips += tripsNumber;
                        stationObj[otherStationId].in_trips += tripsNumber;


                        //Total trips
                        stationObj[currentStationId].n_trips += tripsNumber;
                        stationObj[otherStationId].n_trips += tripsNumber;


                    });
                }



            });

            stationObj[currentStationId].trip_duration /= (that.endHour- that.startHour+1);

            stationObj[currentStationId].balance /= (that.endHour- that.startHour+1);
            stationObj[currentStationId].capacity /= (that.endHour- that.startHour+1);



        });



        stationObj.forEach(function(obj,i){

            if (that.tripMatrix[i] !== undefined){

                stationObj.forEach(function(obj2,j){


                    that.tripMatrix[i][j].outages_diff =  Math.abs(obj.outages-obj2.outages);
                    that.tripMatrix[i][j].full_outages_diff =  Math.abs(obj.full_outages-obj2.full_outages);
                    that.tripMatrix[i][j].empty_outages_diff =  Math.abs(obj.empty_outages-obj2.empty_outages);
                    that.tripMatrix[i][j].balance_diff =  obj2.balance-obj.balance;
                    that.tripMatrix[i][j].capacity_diff =  obj2.capacity-obj.capacity;
                });
            }


        });


       /* var displayValues = [];
        tripMatrix.forEach(function (row){
                row.forEach(function(d){
                    displayValues.push (d[that.displayProperty]);
                });

        });

        displayValues.sort(function(a,b){return b-a});*/



        var maxValue = d3.max(that.tripMatrix, function(array){
            if(typeof array != "undefined")
                return d3.max(array,function(d){ return d[that.displayProperty]})
        });

        var minValue = d3.min(that.tripMatrix, function(array){
            if(typeof array != "undefined")
                return d3.min(array,function(d){ return d[that.displayProperty]})
        });








        var margin = {top: 80, right: 0, bottom: 10, left: 50},
            //width = parseInt(parentDiv.style("width"),10),
            width = that.matrixWidth==0?parseInt(parentDiv.style("width"),10) : that.matrixWidth ;
            height =width;
            //height =parseInt(parentDiv.style("height"),10);


        that.actualMaxValue = maxValue;

        that.actualMinValue = minValue;

        var colorDivisions = that.actualPropertyColorScale.range().length;
        var step = (that.actualMaxValue-that.actualMinValue)/(colorDivisions-1);
        var cDomain = [];


        for(var i=0;i<colorDivisions-1;i++)
        {

            cDomain[i]=i*step+that.actualMinValue;
        }

        cDomain.push(that.actualMaxValue);

        //Rounding to 2 decimals places
        d3.select("#amViewMaxValueLabel").text(Math.round(that.actualMaxValue*100)/100);
        d3.select("#amViewMinValueLabel").text(Math.round(that.actualMinValue*100)/100);

        //Update UI

        //amSelectMinValueLabel
        //amSelectMaxValueLabel
        //amSelectSlider

        that.x = d3.scale.ordinal().rangeBands([50, width]);
        var x = that.x;
            z = d3.scale.linear().domain([0, 4]).clamp(true),
            c = that.actualPropertyColorScale.domain(cDomain);
           /* c = d3.scale.linear().domain([0.0,maxValue.ntrips]).range([
                d3.rgb(255,255,21200),
                d3.rgb(153,52,4)
            ]).clamp(true)*/;


        var test1= that.actualPropertyColorScale(that.actualMaxValue);
        var test2= that.actualPropertyColorScale(that.actualMinValue);




        var svg = parentDiv.append("svg")
            .attr("id","amMatrix")
            //.attr("width", "100%")
            //.attr("height", "100%")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("margin-left", -margin.left + "px")
            .append("g")
            .attr("id","amMatrixGroup")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");





        var undefinedBalance = -100;

        that.orders = {
            name: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.ascending(stationObj[a]!== undefined ?stationObj[a].name:undefined, stationObj[b]!== undefined ?stationObj[b].name:undefined); }),
            capacity: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined ?stationObj[a].cap:undefined, stationObj[b]!== undefined ?stationObj[b].cap:undefined); }),
            latitude: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined && stationObj[a].lat !== undefined?stationObj[a].lat:0, stationObj[b]!== undefined && stationObj[b].lat !== undefined?stationObj[b].lat:0); }),
            longitude: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined && stationObj[a].lng !== undefined?stationObj[a].lng:0, stationObj[b]!== undefined && stationObj[b].lng !== undefined?stationObj[b].lng:0); }),
            out_trips: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined ?stationObj[a].out_trips:undefined, stationObj[b]!== undefined ?stationObj[b].out_trips:undefined); }),
            in_trips: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined ?stationObj[a].in_trips:undefined, stationObj[b]!== undefined ?stationObj[b].in_trips:undefined); }),
            cyclic_trips: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined ?stationObj[a].cyclic_trips:undefined, stationObj[b]!== undefined ?stationObj[b].cyclic_trips:undefined); }),
            n_origins: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined ?stationObj[a].in_origins:undefined, stationObj[b]!== undefined ?stationObj[b].in_origins:undefined); }),
            n_destionations: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined ?stationObj[a].out_destionations:undefined, stationObj[b]!== undefined ?stationObj[b].out_destionations:undefined); }),
            n_origins_dest: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined ?stationObj[a].origins_dest:undefined, stationObj[b]!== undefined ?stationObj[b].origins_dest:undefined); }),
            outages: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined ?stationObj[a].outages:undefined, stationObj[b]!== undefined ?stationObj[b].outages:undefined); }),
            full_outages: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined ?stationObj[a].full_outages:undefined, stationObj[b]!== undefined ?stationObj[b].full_outages:undefined); }),
            empty_outages: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined ?stationObj[a].empty_outages:undefined, stationObj[b]!== undefined ?stationObj[b].empty_outages:undefined); }),
            n_trips: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined  && stationObj[a].n_trips !== undefined? (stationObj[a].n_trips):0, stationObj[b]!== undefined && stationObj[b].n_trips !== undefined?(stationObj[b].n_trips):0); }),
            trip_duration: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined ? (stationObj[a].trip_duration):undefined, stationObj[b]!== undefined ?(stationObj[b].trip_duration):undefined); }),
            balance: d3.range(that.tripMatrix.length).sort(function(a, b) { return d3.descending(stationObj[a]!== undefined && stationObj[a].balance !== undefined ? (stationObj[a].balance):undefinedBalance, stationObj[b]!== undefined && stationObj[b].balance !== undefined  ?(stationObj[b].balance):undefinedBalance); })


        };
       that.x.domain(that.orders[that.ordersValue]);
        svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 50)
            .attr("y", 50);


        var row = svg.selectAll(".row")
            .data(that.tripMatrix)
            .enter().append("g")
            .attr("class", "row")
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
            .each(row);

       // row.append("line")
         //   .attr("x2", width);

        row.append("text")
            .attr("x", 44)
            .attr("y", x.rangeBand() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .attr("font-size","3")
            .text(function(d, i) { return stationObj[i]!== undefined ?stationObj[i].name:undefined; });

        var column = svg.selectAll(".column")
            .data(that.tripMatrix)
            .enter().append("g")
            .attr("class", "column")
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

        var test = x.rangeBand();

     /*   column.append("line")
            .attr("x1", -width);*/

        column.append("text")
            .attr("x", -44)
            .attr("y", x.rangeBand() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "start")
            .attr("font-size","3")
            .text(function(d, i) { return  stationObj[i]!== undefined ?stationObj[i].name:undefined;});




        function row(row) {

            if(typeof row != "undefined")
            {

                var cell = d3.select(this).selectAll(".cell")
                    .data(row.filter(function(d) { return d[that.displayProperty]; }))
                    //.data(row)
                    .enter().append("rect")
                    .attr("class", "cell")
                    .attr("x", function(d) { return x(d.x); })
                    .attr("width", x.rangeBand())
                    .attr("height", x.rangeBand())
                    .style("fill-opacity", function(d) { return cellOpacity(d[that.displayProperty]); })
                    .style("fill", function(d) { return  c(d[that.displayProperty]) ;})
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout);
            }

        }

        function mouseover(p) {

          // console.log('px '+ p.x+' '+ p.y);
            d3.selectAll(".row text").classed("active", function(d, i) {

                return i == p.y; });
            d3.selectAll(".column text").classed("active", function(d, i) {
                return i == p.x; });

          //  that.pointedStation(p.x, p.y);
        }

        function mouseout() {
            d3.selectAll("text").classed("active", false);
        }





        var range = that.actualMaxValue -that.actualMinValue;
        that.maxLimit = range * (that.selectionMaxValue/100) +that.actualMinValue;
        that.minLimit = range * (that.selectionMinValue/100) +that.actualMinValue;

        function cellOpacity(element){


            //Selection max value is given in percentage


            if(!that.autoSelection) {
                return 1;
            }
            else{

                if(element>= that.minLimit && element <= that.maxLimit){
                    return 1;
                }

                return 0.2;
            }

        }


        if(that.autoSelection){



            that.mapAutoSelect();



        }
        else
        {
            updateFilterTableBrush(svg,width,height);

        }




    };

    var updateFilterTableBrush = function(svg, width, height) {


        console.log("updateFilterTableBrush");

        // console.log("updateFilterTableBrush");
        // console.log(width);
        // console.log(height);

        var nMaxId = that.dataManager_.stationsIndexedById.length;

        var xScale = d3.scale.linear().domain([0, nMaxId-1]).range([50, width]);
        var yScale = d3.scale.linear().domain([0, nMaxId-1]).range([50, height]);

        that.xScale = xScale;
        that.yScale = yScale;





        var brush = d3.svg.brush()
            .x(xScale)
            .y(yScale)
          //  .on('brush', brushed)
            .on('brushend', function() {

                // console.log("brushend");


                var orderedStations = that.x.domain();


                var extent0 = brush.extent(),
                    extent1;

                var start = new Date();

                var oldExtent = that.brushExtent;

                //Unpoint stations on map
                that.unpointAllStations();
                var end = new Date() - start;

                console.log("Unpoint Time: %dms",end);


                extent1 = extent0.map(function(corner) {
                    return corner.map(Math.round);
                });

                // console.log(brush.empty());

                /*if (that.brushExtent[0][0] != extent1[0][0] ||
                    that.brushExtent[1][0] != extent1[1][0]
                    || brush.empty()) {*/


                    that.brushExtent = extent1;


                    // point stations on map
                     start = new Date();

                    var originIds = [];
                    var destinationsIds = [];
                    for (var i = that.brushExtent[0][0]; i <=that.brushExtent[1][0];i++){
                        for (var j = that.brushExtent[0][1]; j <=that.brushExtent[1][1];j++){
                                //From j to i

                            //if(that.tripMatrix[i][j][that.displayProperty]|)
                            //that.pointedStation(orderedStations[j],orderedStations[i]);

                            if(that.tripMatrix[orderedStations[j]][orderedStations[i]][that.displayProperty] >0 )
                            {
                                if(originIds.indexOf(orderedStations[j])==-1)
                                    originIds.push(orderedStations[j]);

                                if(destinationsIds.indexOf(orderedStations[i])==-1)
                                    destinationsIds.push(orderedStations[i]);
                            }
                        }
                    }


                that.pointMultipleStations(originIds,destinationsIds);


                end = new Date() - start;

                console.log(" Point Time: %dms",end);
               // }



            });

        that.brush = brush;

        // svg.selectAll('.brush').remove();
        var gBrush = svg.selectAll('.brush').data(['brush']);
        gBrush.enter().append("g")
            .classed('brush', true)
            .attr("id", "AMViewBrush");
           /* .on("mousemove", function(){

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
            });*/


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

           /* that.brushExtent[0][1] = extent1[0][1];
           that.brushExtent[1][1] = extent1[1][1];*/
            /*  that.actualOrderingList.orderedStations.forEach(function(station, order) {
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

                d3.select("#AMViewStationRepresentation" + that.actualOrderingList.orderedStations[i].id)
                    .attr("fill", function(d) {

                        if (!that.actualOrderingList.orderedStations[i].selected) {
                            return "hsl(" + (0.1 * 360) + ", 0%, 50%)";
                        }

                        // var value = (that.actualOrderingList.orderedStations[i].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue) / (that.actualOrderingList.orderedStations[that.brushExtent[0][1]].orderingValue - that.actualOrderingList.orderedStations[that.brushExtent[1][1]-1].orderingValue);
                        var value = ((that.brushExtent[1][1] - that.brushExtent[0][1]) - (i - that.brushExtent[0][1])) / (that.brushExtent[1][1] - that.brushExtent[0][1]);

                        return that.actualPropertyColorScale(value);

                    }) ;
            }

            d3.select("#amDaysOfWeekModelsInfoBrushTimeWindow").text("Time window: " + timeWindowBegin.toTimeString().split(" ")[0] + " <-> " + timeWindowEnd.toTimeString().split(" ")[0]);
            d3.select("#amDaysOfWeekModelsInfoBrushRowRange").text("Row range: " + that.brushExtent[0][1] + " <-> " + (that.brushExtent[1][1]-1));
            d3.select(this).call(brush.extent(extent1));*/




        }



    };

    updateFilterTable(that.actualOrderingList.orderedStations, ts, that.actualPropertyColorScale);
    // this.updateValuesRange();

    // that.updatedTripsInTheMap();

    if (!this.playing) {
        return;
    }

   /* setTimeout(function() {
        that.updateBrushExtentPlaying(that);
    }, 500)*/
};

AMViewMatrixViewer.prototype.mapAutoSelect = function() {

    var originStationsId = [];
    var destinationStationsId = [];
    var nMaxId = this.dataManager_.stationsIndexedById.length;

   for(var i =0; i< nMaxId;i++){

        if (this.tripMatrix[i] !== undefined){

            for(var j =0; j< nMaxId;j++){

                if(this.tripMatrix[i][j][this.displayProperty]>= this.minLimit && this.tripMatrix[i][j][this.displayProperty] <= this.maxLimit) {
                    originStationsId.push(this.tripMatrix[i][j].y);
                    destinationStationsId.push(this.tripMatrix[i][j].x);
                }
            };
        }


    };

    this.pointMultipleStations(originStationsId,destinationStationsId);

}

AMViewMatrixViewer.prototype.updateAutoSelection = function() {


    this.unpointAllStations();


    var range = this.actualMaxValue -this.actualMinValue;
    this.maxLimit = range * (this.selectionMaxValue/100) +this.actualMinValue;
    this.minLimit = range * (this.selectionMinValue/100) +this.actualMinValue;

    this.mapAutoSelect();

    var that = this;

    function cellOpacity(element){


        //Selection max value is given in percentage


        if(!that.autoSelection) {
            return 1;
        }
        else{

            if(element>= that.minLimit && element <= that.maxLimit){
                return 1;
            }

            return 0.2;
        }

    }


   var row = d3.selectAll(".row")
        .data(this.tripMatrix)
        .each(row);

    function row(row) {

        if(typeof row != "undefined")
        {

            var cell = d3.select(this).selectAll(".cell")
                .data(row.filter(function(d) { return d[that.displayProperty]; }))
                .style("fill-opacity", function(d) { return cellOpacity(d[that.displayProperty]); })

        }

    }



        /*.data()
        .style("fill-opacity", function(d) { return cellOpacity(d[this.displayProperty]); })*/



}
AMViewMatrixViewer.prototype.orderMatrix = function()
{


        this.x.domain(this.orders[this.ordersValue]);

        var that = this;
        var svg = d3.select("#amMatrix");

        var delayFactor = 1;

        var tDuration = 100;

        var t = svg.transition().duration(tDuration);

        svg.selectAll(".row")
            //.delay(function(d, i) { return x(i) * delayFactor; })
            .attr("transform", function(d, i) { return "translate(0," + that.x(i) + ")"; })
            .selectAll(".cell")
            //.delay(function(d) { return x(d.x) * delayFactor; })
            .attr("x", function(d) { return that.x(d.x); });

        svg.selectAll(".column")
            //.delay(function(d, i) { return x(i) * delayFactor; })
            .attr("transform", function(d, i) { return "translate(" + that.x(i) + ")rotate(-90)"; });


}

AMViewMatrixViewer.prototype.createMatrixsetOfTimeseries = function() {
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



AMViewMatrixViewer.prototype.pointMultipleStations = function(originIds,destinationIds) {


    var intersectionIds = [];


    originIds.forEach(function(id){
        if(destinationIds.indexOf(id)!=-1)
            intersectionIds.push(id);
    });
    function getStringFromId(id){

        return "#"+"AMViewStationRepresentation"+id;
    }


    var originIdsString =originIds.map(getStringFromId);
    var destinationIdsString = destinationIds.map(getStringFromId);
    var intersectIdsString = intersectionIds.map(getStringFromId);


    originIdsString.forEach(function (d){

        d3.select(d)
            .classed("originSelection",true);
    });


    destinationIdsString.forEach(function(d){
        d3.select(d)
            .classed("destSelection",true);
    });


    intersectIdsString.forEach(function(d){
        d3.select(d)
            .classed("destSelection",false)
            .classed("originSelection",false)
            .classed("intersectSelection",true);
    });










}
AMViewMatrixViewer.prototype.pointedStation = function(originId,destinationId) {

    // return;

    d3.selectAll(".amViewTripSvgPointer").remove();
    d3.selectAll(".amViewStationSvgCyclicTripSvgPointer").remove();

    var that = this;

    //this.unpointedStation(this.lastPointedStationOriginId,this.lastPointedStationDestinationId);


    var thisId = originId;


    var colorPalette = {red: "rgb(255,0,0)",blue: "rgb(0,34,255)",purple: "rgb(122,10,113)"};

    var colorFill = colorPalette["blue"];
    var stationRepresentation = d3.select("#AMViewStationRepresentation" + thisId);


    if(!stationRepresentation.empty()) {



        if (stationRepresentation.attr("fill") == colorPalette["red"] ||stationRepresentation.attr("fill") == colorPalette["purple"] ){

            colorFill = colorPalette["purple"];
        }


        d3.select("#AMViewStationRepresentationShadow"+thisId)
            .attr("opacity", 1.0);
        stationRepresentation
            .attr("opacity", 1.0)
            // .attr("r", 9);
            .attr("fill",  colorFill)
            .attr("stroke",  "white")
            .attr("stroke-width",  "1.5px");

    }


    var otherId = destinationId;

    colorFill = colorPalette["red"];
    var otherStationRepresentation = d3.select("#AMViewStationRepresentation" + otherId);

    if(!otherStationRepresentation.empty()) {
        if (otherStationRepresentation.attr("fill") == colorPalette["blue"] || otherStationRepresentation.attr("fill") == colorPalette["purple"]) {

            colorFill = colorPalette["purple"];
        }

        d3.select("#AMViewStationRepresentationShadow" + otherId)
            .attr("opacity", 1.0);
        otherStationRepresentation
            .attr("opacity", 1.0)
            // .attr("r", 9);
            .attr("fill", colorFill)
            .attr("stroke", "white")
            .attr("stroke-width", "1.5px");
    }


    this.lastPointedStationOriginId= thisId;
    this.lastPointedStationDestinationId= otherId;




}

AMViewMatrixViewer.prototype.unpointAllStations = function() {

    // return;

    // var that = this;

    //d3.selectAll(".daysOfWeekModelsMatrixPointedStationLine").remove();



    // d3.selectAll("#TripsViewStationRepresentationText" + this.actualOrderingList.orderedStations[orderIndex].id)
    //   .attr("fill-opacity", "0.0");



    d3.selectAll(".AMViewStationRepresentation")
        .attr("fill", "hsl(" + (0.1 * 360) + ", 70%, 70%)")
        .attr("opacity", 1)
        // .attr("r", 4.5);
        .attr("stroke",  "gray")
        .attr("stroke-width",  "1.5px")
        .classed("originSelection",false)
        .classed("intersectSelection",false)
        .classed("destSelection",false);




}

AMViewMatrixViewer.prototype.updateMatrix = function() {
    this.createMatrix();
}

AMViewMatrixViewer.prototype.updateColorScale = function() {

    var that = this;

    d3.select("#AMViewColorScale").selectAll(".AMViewColorScaleSample").remove();

    var resolution = 10;
    var colorScaleSample = [];
    for (var colorScaleSampleIndex = 0; colorScaleSampleIndex <= resolution; colorScaleSampleIndex++) {
        colorScaleSample.push(colorScaleSampleIndex/resolution*(that.actualMaxValue-that.actualMinValue)+that.actualMinValue);
    }




    var colorDivisions = that.actualPropertyColorScale.range().length;
    var step = (that.actualMaxValue-that.actualMinValue)/(colorDivisions-1);
    var cDomain = [];

    for(var i=0;i<colorDivisions-1;i++)
    {

        cDomain[i]=step*i+that.actualMinValue;
    }

    cDomain.push(that.actualMaxValue);

    that.actualPropertyColorScale.domain(cDomain);

    //var scale = that.actualPropertyColorScale.domain([0.0,that.actualMaxValue/2,that.actualMaxValue]);
    // console.log(colorScaleSample);

    var colorScaleWidth = 220;
    var colorScaleHeight = 10;

    d3.select("#AMViewColorScale").selectAll(".AMViewColorScaleSample").data(colorScaleSample).enter()
        .append("div")
        .attr("class", "AMViewColorScaleSample")
        .style("width", ((colorScaleWidth - 10)/(resolution + 1))  + "px")
        .style("height", colorScaleHeight + "px")
        .style("float", "left")
        .style("background", function(d,i) { return that.actualPropertyColorScale(d);});


    this.createMatrix();
}

AMViewMatrixViewer.prototype.updatedTripsInTheMap = function() {


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

AMViewMatrixViewer.prototype.stationsDayTripsLoaded = function() {

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

AMViewMatrixViewer.prototype.stationsDayActivityLoaded = function() {

    console.log("stationsDayActivityLoaded");

    console.log(this.dataManager_.stationsDayActivity);

    if (this.dataManager_.stationsDayActivity[this.calendarDay] == undefined) {
        alert("No balance data for the selected date. Try another date between 07/01/2013 and 08/31/2014.");
        return;
    }
/*
    if (!this.stationsTripsLoadedBefore) {
        this.setVariablesList();
        this.createColorScales();
        this.stationsTripsLoadedBefore = true;
        this.globalMinValue = 0.0;
        this.globalMaxValue = 1.0;
        this.actualMinValue = 0.0;
        this.actualMaxValue = 1.0;
        this.updateRangeSliderLimits = true;
    }*/

    this.usingCalendarDayData = true;
    this.usingPeriodDayOfWeekData = false;

    // this.updateRangeSliderLimits = true;
    this.dataManager_.stationsDayTrips[this.calendarDay] = this.processDayData(this.dataManager_.stationsDayTrips[this.calendarDay]);
    this.createMatrix();
    // console.log(this.dataManager_.TripsView[dayOfWeek]);

}


AMViewMatrixViewer.prototype.processDayData = function(dayData) {

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

