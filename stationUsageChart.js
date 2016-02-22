function StationUsageChart(dataManager, parentNode, xlabel, ylabel, margin, onBrushFunc){

  dataManager.addListener(this);

  this.dataManager_ = dataManager;

  var that = this; //cant see 'this' in nested functions
  
  this.parentNode = d3.select(parentNode[0]);
  //this.parentNode = parentNode;
  this.onBrushFunc = onBrushFunc;
  
  this.data = [];
  this.rects = {};
  
  if (margin == null)
    margin = {top: 30, bottom: 30, left: 70, right: 50};
  this.margin = margin;
  
  this.width = parentNode.width() - this.margin.left - this.margin.right;

  this.height = 100 - margin.top - margin.bottom;    

   
    
  this.yScale = d3.scale.linear()
    .range([this.height + this.margin.top, this.margin.top]);
    
   
  this.svg = this.parentNode.select("#selectedStationUseChartDaysContainer")
    .insert("svg:svg", ".stationUsageChartSvg")
    .attr("class", "stationUsageChartSvg")  
    //.attr("transform", "translate(" + that.margin.left + ",0)") 
    .attr("width", this.width+this.margin.left+this.margin.right)
    .attr("height", this.height + margin.top + margin.bottom);
    

  this.title = this.svg.append("text")
    .attr("class", "stationUsageChartTitle")   
    .attr("transform", "translate(" +  margin.left/2 + ", " + margin.top/2 + ")") 
    .text("");
};

StationUsageChart.prototype.update = function() {
  //this.add(this.dataManager_.stationActivity);
}

StationUsageChart.prototype.toLocalTime = function(time) {
  var newTime = time;
  newTime.setHours(newTime.getHours() - 6);
  return newTime;
}

//addActivityChart = function(svg, data) {
StationUsageChart.prototype.add = function(data) {

  // console.log("ActivityChart");

  if (!data) {
    return;
  }

  var that = this;

  //this.svg = svg;
    
  var count = 0;
  
  
  // var beginDate = new Date(data.data[0].time);  
  // var endDate = new Date(data.data[data.data.length - 1].time); 

  var stationData = data.st;
  var beginDate = new Date(data.bTime);  
  var endDate = new Date(data.eTime); 
  // console.log(data.bTime);
  // console.log(data.eTime);

  this.svg.select(".stationUsageChartTitle").text(beginDate.toDateString());

  var originalData = data.data

  console.log(originalData);

  // data = originalData['originalActivity']['activity'].map(function(d) {
  //   return {bikes: d.b, free: d.f, time: d.t, operation: d.o};
  // });
  data = originalData['activity'].map(function(d) {
    return {bikes: d.b, free: d.f, time: d.t, operation: d.o};
  });
  // console.log(beginDate);
  // console.log(endDate);
  //console.log(this.toLocalTime(beginDate));
  //console.log(this.toLocalTime(endDate));

  // the time use is the time column in the database and for some reason 
  //has a difference of +6 from local time in NY
  // so we fix it here
  beginDate = this.toLocalTime(beginDate);  
  endDate = this.toLocalTime(endDate);  

  // console.log(beginDate);
  // console.log(endDate);
  
  this.yDomain = [0, data[0].bikes + data[0].free];
  
  this.xScale = d3.time.scale().domain([beginDate, endDate]).range([0, this.width]);  
  
  this.yScale = d3.scale.linear().domain(this.yDomain).range([0, this.height]);
  
  
  this.xAxis = d3.svg.axis()
    .scale(that.xScale)
    .tickFormat(d3.time.format('%H'))
    .orient("bottom");
  
  this.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + that.margin.left + "," + (that.margin.top + that.height) + ")")
    .call(that.xAxis);

    
  that.data = data;  

  that.stationId = stationData.id;

  that.heightRatio = that.height / (data[0].bikes + data[0].free);

  
  var bars = this.svg.append("g") 
    .attr("id", "stationUsageChartBars")   
    .attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")");

  // this.colorScale = d3.scale.linear().domain([0.0,0.4,0.75,1.0]).range([d3.rgb(0, 0, 0),
  //   d3.rgb(255, 0, 0),
  //   d3.rgb(255, 255, 0),
  //   d3.rgb(255, 255, 255)]);

  this.colorScale = d3.scale.linear().domain([0.0,0.4,0.85,1.0]).range([d3.rgb(150, 0, 0),
      d3.rgb(255, 0, 0),
      d3.rgb(255, 255, 0),
      d3.rgb(255, 255, 255)]);


  // this.colorScale = d3.scale.linear().domain([0.0,0.6,0.85,1.0]).range([d3.rgb(52, 11, 17),
  //   d3.rgb(126, 42, 6),
  //   d3.rgb(237, 208, 148),
  //   d3.rgb(255, 255, 255)]);

  /* stacked bar charts */
  bars.selectAll(".bikesSample")
      .data(that.data)
      .enter()
      .append("rect")
      .attr("x", function(d,i) { 
        // the time use is the time column in the database and for some reason 
        //has a difference of +6 from local time in NY
        // so we fix it here
        var tempTime = that.toLocalTime(new Date(d.time));
        return that.xScale(tempTime);
      })
      .attr("y", function(d,i) { return that.height - (that.heightRatio * d.bikes);})
      .attr("height", function(d,i) {return (that.heightRatio * d.bikes);})
      //.attr("height", function(d,i) {return 2;})
      .attr("width", 1)
      .attr("class", "bikesSample")
      //.attr("fill", 'yellow') 
      // .attr("fill", "hsl(264,100%,40%)")      //purple 1 
      // .attr("fill", "hsl(284,0%,80%)")      //white 1    
      // .attr("fill", "#ca0020")      //red 1    
      .attr("fill", "#b35806")      //orange 1    
      //.attr("fill", "hsl(60,100%,60%)")      //yellow 1    
      //.attr("fill", function(d,i) {return that.colorScale(d.bikes / (d.bikes + d.free));})  //blackbody scale
      //.attr("stroke", 'black')
      .attr("stroke-width", 0.5);

  bars.selectAll(".freeSample")
      .data(that.data)
      .enter()
      .append("rect")
      .attr("x", function(d,i) { 
        // the time use is the time column in the database and for some reason 
        //has a difference of +6 from local time in NY
        // so we fix it here
        var tempTime = that.toLocalTime(new Date(d.time));
        return that.xScale(tempTime);
      })
      .attr("y", function(d,i) { return that.height - (that.heightRatio * (d.bikes + d.free));})
      .attr("height", function(d,i) {return (that.heightRatio * d.free);})
      //.attr("height", function(d,i) {return 2;})
      .attr("width", 1)
      .attr("class", "freeSample")
      //.attr("fill", "hsl(264,100%,40%)")      //purple 1 
      // .attr("fill", "hsl(264,100%,20%)")      //purple 2 
      .attr("fill", "hsl(284,0%,80%)")      //gray 1    
      // .attr("fill", "#5e3c99")      //purple 3    
      //.attr("fill", "hsl(284,0%,80%)")      //white 1
      //.attr("stroke", 'black')
      .attr("stroke-width", 0.25); 

  bars.selectAll(".barThreshold")
      .data(that.data)
      .enter()
      .append("rect")
      .attr("x", function(d,i) { 
        // the time use is the time column in the database and for some reason 
        //has a difference of +6 from local time in NY
        // so we fix it here
        var tempTime = that.toLocalTime(new Date(d.time));
        return that.xScale(tempTime);
      })
      .attr("y", function(d,i) { return that.height - (that.heightRatio * d.bikes);})
      .attr("height", 2)
      //.attr("height", function(d,i) {return 2;})
      .attr("width", 1)
      .attr("class", "barThreshold")
      //.attr("fill", "hsl(284,90%,20%)")      //purple 1
      .attr("fill", "hsl(284,0%,0%)")      //black 1
      //.attr("stroke", 'black')
      .attr("stroke-width", 0.25);  

  var operationRectHeight = 5.0;
  var operationRectWidth = 1.0;

  bars.selectAll(".operation")
      .data(that.data)
      .enter()
      .append("rect")
      .attr("x", function(d,i) { 
        // the time use is the time column in the database and for some reason 
        //has a difference of +6 from local time in NY
        // so we fix it here
        var tempTime = that.toLocalTime(new Date(d.time));
        var mod = Math.abs(d.operation) * operationRectWidth / 2.0;
        return that.xScale(tempTime) - mod;
      })
      .attr("y", function(d,i) { 
        if (d.operation > 0) {
          return 4 + that.height;
          // return - operationRectHeight
        } else if (d.operation < 0) {
          return 4 + that.height  + operationRectHeight;
          // return 0
        }
      })
      .attr("height", function(d) {return (Math.abs(d.operation) == 0) ? 0 : operationRectHeight;})
      //.attr("height", function(d,i) {return 2;})
      .attr("width", function(d) {return Math.max(1,(Math.abs(d.operation) == 0) ? 0 : Math.abs(d.operation) * operationRectWidth);})
      .attr("class", "barThreshold")
      //.attr("fill", "hsl(284,90%,20%)")      //purple 1
      // .attr("fill", "hsl(284,0%,0%)")      //black 1
      .attr("fill", function(d,i) { 
        if (d.operation > 0) {
          return "#b35806";
        } else if (d.operation < 0) {
          return "hsl(284,0%,80%)";
        }
      })      //black 1
      //.attr("stroke", 'black')
      .attr("stroke-width", 0.25);  

  that.beginDate = beginDate;
  that.dayOfTheWeek = that.beginDate.getDay() - 1;  // 0 is sunday...
  if (that.dayOfTheWeek < 0) {
    that.dayOfTheWeek = 6;
  }

  // create a line function that can convert data[] into x and y points
  var line = d3.svg.line()
    .interpolate("cardinal")
    // assign the X function to plot our line as we wish
    .x(function(d,i) { 
      var tempTime = new Date(that.beginDate.getTime() + (Number(d) + 0.5) * 1000 * Number(that.dataManager_.stationsModel["samplingInterval"]));
      return that.xScale(tempTime);
    })
    .y(function(d,i) { 
      return (that.height - (that.height * that.dataManager_.stationsModel[that.stationId][that.dayOfTheWeek]["groupModel"]["means"][Number(d)]));
    })  

  // we need to get the indexes of the samples in the groupmodel, as d3 need data as an array, not an object
  // that.modelMeans = $.map(this.dataManager_.stationsModel[that.stationId][that.dayOfTheWeek]["groupModel"]["samples"], function (value, key) { return key; });  
  that.modelMeans = $.map(this.dataManager_.stationsModel[that.stationId][that.dayOfTheWeek]["groupModel"]["means"], function (value, key) { return key; });  

  bars.append("svg:path")  
    .attr("d", line(that.modelMeans))
    // .attr("stroke", 'orange')
    .attr("stroke", 'black')
    .attr("id", 'meansLine')
    .attr("stroke-width", 1.0)
    .attr("stroke-opacity", 0.8)
    //.attr("stroke-dasharray", "9, 5")
    .attr("fill", 'none'); 


  var deviationArea = d3.svg.line()
    .interpolate("cardinal")
    // assign the X function to plot our line as we wish
    .x(function(d,i) { 
      var tempTime = new Date(that.beginDate.getTime() + (Number(d) + 0.5) * 1000 * Number(that.dataManager_.stationsModel["samplingInterval"]));      return that.xScale(tempTime);
    })
    .y(function(d,i) {      

      var meanPos = (that.height - (that.height * that.dataManager_.stationsModel[that.stationId][that.dayOfTheWeek]["groupModel"]["means"][Number(d)]));     


      // console.log("i: " + i + "   length: " + that.dataManager_.stationsModel[that.stationId][that.dayOfTheWeek]["groupModel"]["meansDeviations"].length);
      var deviationMod = 0;
      if (i <= Object.keys(that.dataManager_.stationsModel[that.stationId][that.dayOfTheWeek]["groupModel"]["meansDeviations"]).length) {
        deviationMod = -((that.height * that.dataManager_.stationsModel[that.stationId][that.dayOfTheWeek]["groupModel"]["meansDeviations"][Number(d)]));
      } else {
        deviationMod = ((that.height * that.dataManager_.stationsModel[that.stationId][that.dayOfTheWeek]["groupModel"]["meansDeviations"][Number(d)]));
      }
      // console.log("deviationMod: " + deviationMod);
      return meanPos + deviationMod;
    });
  
  that.deviationIndexes = that.modelMeans.slice();
  var tempReverse = that.modelMeans.slice();
  tempReverse.reverse();  
  that.deviationIndexes = that.deviationIndexes.concat(tempReverse);

  // console.log(that.deviationIndexes); 

  bars.append("svg:path")  
    .attr("d", deviationArea(that.deviationIndexes))
    // .attr("stroke", 'orange')
    .attr("stroke", 'black')
    .attr("id", 'deviationArea')
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.05)
    //.attr("stroke-dasharray", "9, 5")
    // .attr("fill", 'orange')
    .attr("fill", 'orange')
    .attr("fill-opacity", 0.10);   
  
};