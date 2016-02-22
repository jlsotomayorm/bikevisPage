function ModelChartCalendar(dataManager, parentNode, xlabel, ylabel, margin, onBrushFunc){
  this.dataManager_ = dataManager; 
  
  this.parentNodeParam = parentNode;
  // console.log("this.parentNodeName:" + this.parentNodeName);

  this.parentNode = d3.select(parentNode[0]);
  this.onBrushFunc = onBrushFunc;

  if (margin == null)
    margin = {top: 5, bottom: 5, left: 10, right: 10};
  this.margin = margin;
  
  this.width = parentNode.width() - this.margin.left - this.margin.right;

  this.height = 120 - margin.top - margin.bottom;

  this.svg1 = this.parentNode
    .insert("svg:svg", "svg") 
    .style("clear", "both")     
    .attr("width", this.width+this.margin.left+this.margin.right)
    .attr("height", this.height + margin.top + margin.bottom);

  // this.colorScale = d3.scale.linear().domain([0.0,0.4,0.85,1.0]).range([d3.rgb(150, 0, 0),
  //   d3.rgb(255, 0, 0),
  //   d3.rgb(255, 255, 0),
  //   d3.rgb(255, 255, 255)]);

  // this.colorScale = d3.scale.linear().domain(
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

  this.colorScale = d3.scale.linear().domain([0.0,0.25,0.5,0.75,1.0]).range([
    // this.colorScale = d3.scale.linear().domain([1.0,0.75,0.5,0.25,0.0]).range([
    d3.rgb(255,255,255),
    d3.rgb(254,217,142),
    d3.rgb(254,153,41),
    d3.rgb(217,95,14),
    d3.rgb(153,52,4)
  ]);   // white to orange


   
};

ModelChartCalendar.prototype.update = function() {
  
};

ModelChartCalendar.prototype.toLocalTime = function(time) {
  var newTime = time;
  newTime.setHours(newTime.getHours() - 6);
  return newTime;
};

ModelChartCalendar.prototype.add = function(stationId) { 

  this.stationId = stationId;

  // console.log(this.stationId);

  var that = this; //cant see 'this' in nested functions

  that.stationUsageLoaded = function(data, station, beginTime, endTime) {
    // console.log("stationUsageLoaded");
    // console.log(station);
    // console.log(beginTime);
    // console.log(endTime); 

    // console.log(data);

    var chartData = {st: station, bTime: beginTime, eTime: endTime, data: JSON.parse(data)};

    // console.log(chartData.data);
// 
    // console.log(that.parentNode.select(".stationUsageChartSvg"));

    var stationUsageChart = new StationUsageChart(that.dataManager_, that.parentNodeParam);
    stationUsageChart.add(chartData);

    //addActivityChart(that.parentNode.select("#activityChartSvg"), chartData);
    //console.log(d3.select(that.parentNode[0]).select("#activityChartSvg"));
  }

  // this.dayOfTheWeek = 1;

  var width = this.width,
    height = this.height,
    cellSize = 10; // cell size

  var day = d3.time.format("%w"),
      week = d3.time.format("%U"),
      percent = d3.format(".1%"),
      format = d3.time.format("%Y-%m-%d");

  // var color = d3.scale.quantize()
  //     .domain([-.05, .05])
  //     .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));



  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = +day(t0), w0 = +week(t0),
        d1 = +day(t1), w1 = +week(t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z";
  }

  var svg = this.svg1.selectAll("svg")
  //this.svg.selectAll("svg")
      .data([2013, 2014])
    .enter().append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "RdYlGn")
    .append("g")
      .attr("transform", function(d,i) {
        return "translate(" + (that.margin.left + ((i + 0.5)*width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 20) + ")";
      });
      //.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  svg.append("text")
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .style("stroke", "#000")
      .text(function(d) { return d; });

  var rect = svg.selectAll(".day")
      .data(function(d) { return d3.time.days(new Date(d, 0, 1, 0, 0, 0), new Date(d + 1, 0, 1, 0, 0, 0)); })
    .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function(d) { return week(d) * cellSize; })
      .attr("y", function(d) { return day(d) * cellSize; })
      .on("click", function(d) {               

        var bDate = new Date(d);
        bDate.setHours(6);
        var eDate = new Date(bDate);
        eDate.setDate(eDate.getDate() + 1);

        //console.log(d);
        

        // to add leading zeros to months and days...
        var bDateString =  bDate.getFullYear() + "-" + ('0' + (bDate.getMonth()+1)).slice(-2)
            + '-' + ('0' + bDate.getDate()).slice(-2) + ' 06:00:00';
        // to add leading zeros to months and days...
        var eDateString =  eDate.getFullYear() + '-' + ('0' + (eDate.getMonth()+1)).slice(-2)
            + "-" + ('0' + eDate.getDate()).slice(-2) + ' 06:00:00';

        //console.log(bDateString);
        //console.log(eDateString);


        station = that.dataManager_.stations[that.dataManager_.stationsIndexedById[that.stationId]];
        that.dataManager_.loadStationActivity2(station, bDateString, eDateString, that.stationUsageLoaded);        
      })
      .on("mouseover", function(d) {

        var dateString =  d.getFullYear() + "-" + ('0' + d.getDate()).slice(-2) + '-'
             + ('0' + (d.getMonth()+1)).slice(-2) + ' 00:00:00';   
        
        dayOfTheWeek = d.getDay() - 1;  // 0 is sunday...
        if (dayOfTheWeek < 0) {
          dayOfTheWeek = 6;
        }
        

        d3.selectAll(".stationsUsageStationRepresentation")
          .each(function(station) {

            var color = "hsl(" + (0.76 * 360) + ", 100%, 50%)";

            if (that.dataManager_.stationsModel[station.id] != undefined
              && that.dataManager_.stationsModel[station.id][dayOfTheWeek]["dayModels"] != undefined
              && !that.dataManager_.stationsModel[station.id][dayOfTheWeek]["dayModels"]["noActivity"]
              && that.dataManager_.stationsModel[station.id][dayOfTheWeek]["dayModels"][dateString] != undefined) {
              color = that.colorScale(that.dataManager_.stationsModel[station.id][dayOfTheWeek]["dayModels"][dateString]["meansDistance"]/that.dataManager_.stationsModel[station.id][dayOfTheWeek]["maxMeansDistance"]);
            }

            
            d3.select(this).attr("fill", color);
            // console.log(color);
          });          
        
      });
      

  rect.append("title")
      .text(function(d) { return d.toDateString(); });

  svg.selectAll(".month")
      .data(function(d) { return d3.time.months(new Date(d, 0, 1, 0, 0, 0), new Date(d + 1, 0, 1, 0, 0, 0)); })
    .enter().append("path")
      .attr("class", "month")
      .attr("d", monthPath);  

  // that.dataManager_.stationsModel
  
  this.beginDate = new Date(that.dataManager_.stationsModel["beginTime"]);
  this.beginDate = this.toLocalTime(this.beginDate);
  
  this.endDate = new Date(that.dataManager_.stationsModel["endTime"]);
  this.endDate = this.toLocalTime(this.endDate);

  stationActivityPerDay = [];

  newDate = this.beginDate;

  count = 0;
  while (newDate.getTime() <= this.endDate.getTime()) {
    var tempDate = new Date(newDate);
    //stationActivityPerDay[count] = {date: tempDate, Frequency: 0.5};
    stationActivityPerDay[tempDate] = count * 0.1;
    newDate.setDate(newDate.getDate()+1);   
    count++;
  }
  
  // console.log(stationActivityPerDay);

  // var data = d3.nest()
  //     .key(function(d) { return d.date; })
  //     .rollup(function(d) { return d[0].Frequency; })
  //     .map(stationActivityPerDay);

  data = stationActivityPerDay;

  //console.log(data);

  rect.filter(function(d) { 
        
        var ok = data[d] != undefined;
        // console.log(data[d]);
        //console.log(ok);
        // var found = d.getTime() in data;
        // if (found) {
        //   console.log("found!");
        // }
        //console.log("not found!");
        return ok;
      })
      //.attr("class", function(d) { return "day " + color(data[d]); })
      // .style("fill", function(d,i) {return that.colorScale(data[d]);})  //blackbody scale
      .style("fill", function(d,i) {
                
        // to add leading zeros to months and days...
        // var dateString =  d.getFullYear() + "-" + ('0' + d.getDate()).slice(-2) + '-'
        //      + ('0' + (d.getMonth()+1)).slice(-2) + ' 00:00:00';

        // var dayOfTheWeek = d.getDay() - 1;  // 0 is sunday...
        // if (dayOfTheWeek < 0) {
        //   dayOfTheWeek = 6;
        // }
        
        // if (that.dataManager_.stationsModel[that.stationId][dayOfTheWeek]["dayModels"][dateString] != undefined) {
        //   //console.log(dateString + ":  " + that.dataManager_.stationsModel[that.stationId][dayOfTheWeek]["dayModels"][dateString]["meansDistance"]);
        //   return that.colorScale(that.dataManager_.stationsModel[that.stationId][dayOfTheWeek]["dayModels"][dateString]["meansDistance"]/that.dataManager_.stationsModel[that.stationId][dayOfTheWeek]["maxMeansDistance"]);
        // } else {
        //   // return d3.rgb(37,0,95);
        //   return d3.rgb(127,127,127);
        // }
        

      })  //blackbody scale
      //.style("fill", "#aaa") 
    .select("title")
      .text(function(d) { return d.toDateString(); });
      // .text(function(d) { return d.toDateString(); });

  // d3.csv("dji.csv", function(error, csv) {
  //   var data = d3.nest()
  //     .key(function(d) { return d.Date; })
  //     .rollup(function(d) { return (d[0].Close - d[0].Open) / d[0].Open; })
  //     .map(csv);

  //   rect.filter(function(d) { return d in data; })
  //       .attr("class", function(d) { return "day " + color(data[d]); })
  //     .select("title")
  //       .text(function(d) { return d + ": " + percent(data[d]); });
  // });

    // d3.select(self.frameElement).style("height", "2910px");
};



