function StationTodayUsageChart(dataManager, parentNode, xlabel, ylabel, margin, onBrushFunc){

  console.log("StationTodayUsageChart");

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

  this.created = false;   
    
  this.yScale = d3.scale.linear()
    .range([this.height + this.margin.top, this.margin.top]);
  
  // this.parentNode
  //   .append("div")
  //   .attr("class", "stationtodauUsegeChartUpdateButton")
  //   .attr("id", "stationtodauUsegeChartUpdateButton")         
  //   .on("click", function (d) {   
  //     that.dataManager_.loadStationTodayHistory(that.stationId, that);        
  //   })        
  //   .text("update");
   
  this.svg = this.parentNode
  // .select("#selectedStationTodayUseChartContainer")
    .append("svg:svg")
      .attr("class", "stationTodayUsageChartSvg")  
      //.attr("transform", "translate(" + that.margin.left + ",0)") 
      .attr("width", this.width+this.margin.left+this.margin.right)
      .attr("height", this.height + margin.top + margin.bottom);
    

  this.title = this.svg.append("text")
    .attr("class", "stationTodayUsageChartTitle")   
    .attr("transform", "translate(" +  margin.left/2 + ", " + margin.top/2 + ")") 
    .text("");

  this.svg
    .append("text")
    .attr("class", "stationtodauUsegeChartUpdateButton")
    .attr("id", "stationtodauUsegeChartUpdateButton")  
    // .style("pointer-events", "none")       
    .attr("transform", "translate(" +  (margin.left/2  + this.width) + ", " + margin.top/2 + ")") 
    .on("click", function (d) {   
      that.dataManager_.loadStationTodayHistory(that.stationId, that);        
    })        
    .text("update");




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
  

  this.beginDate = new Date();  
  this.beginDate.setHours(0);
  this.beginDate.setMinutes(0);
  this.beginDate.setSeconds(0);
  this.endDate = new Date(this.beginDate); 

  this.endDate.setDate(this.endDate.getDate()+1);

  this.svg.select(".stationTodayUsageChartTitle").text("Today: " + this.beginDate.toDateString());


  this.xScale = d3.time.scale().domain([this.beginDate, this.endDate]).range([0, this.width]);    
  
  var that = this;

  this.xAxis = d3.svg.axis()
    .scale(that.xScale)
    .tickFormat(d3.time.format('%H'))
    .orient("bottom");
  
  this.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + that.margin.left + "," + (that.margin.top + that.height) + ")")
    .call(that.xAxis);

  this.bars = this.svg.append("g") 
    .attr("id", "stationTodayUsageChartBars")   
    .attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")");
};

StationTodayUsageChart.prototype.update = function() {
  //this.add(this.dataManager_.stationActivity);
}

StationTodayUsageChart.prototype.toLocalTime = function(time) {
  var newTime = time;
  newTime.setHours(newTime.getHours() - 6);
  return newTime;
}

StationTodayUsageChart.prototype.stationTodayHistoryLoaded = function(loadedData) {
  if (this.created) {
    // this.updateChart(loadedData);
  } else {
    this.createChart(loadedData);
  }
}

StationTodayUsageChart.prototype.updateChart = function(loadedData) {
  console.log("updateChart");

  var that = this;  
  
  this.data = [];

  // console.log(Object.keys(loadedData));
  
  var count = 0;
  for (var time in loadedData) {
    // console.log(time);    
    this.data[count] = {time: time, bikes: loadedData[time].bikes, free: loadedData[time].free};    
    count++;
  }  

  // console.log("updateChart data");
  // console.log(this.data);

  that.heightRatio = that.height / (this.data[0].bikes + this.data[0].free); 

  this.bars.select("#barNow")
    .attr("x", that.xScale(new Date()));  

  /* stacked bar charts */
  this.bars.selectAll(".bikesSample")
      .data(that.data)
      .enter()
      .insert("rect", ".bikesSample")
        // .append("rect")
          .attr("x", function(d,i) {             
            var tempTime = new Date(d.time);
            return that.xScale(tempTime);
          })
          .attr("y", function(d,i) { return that.height - (that.heightRatio * d.bikes);})
          .attr("height", function(d,i) {return (that.heightRatio * d.bikes);})          
          .attr("width", 1)
          .attr("class", "bikesSample")          
          .attr("fill", "hsl(284,0%,80%)")      //white 1              
          .attr("stroke-width", 0.5);

  this.bars.selectAll(".freeSample")
      .data(that.data)
      .enter()
        .insert("rect", ".freeSample")
          .attr("x", function(d,i) {             
            var tempTime = new Date(d.time);
            return that.xScale(tempTime);
          })
          .attr("y", function(d,i) { return that.height - (that.heightRatio * (d.bikes + d.free));})
          .attr("height", function(d,i) {return (that.heightRatio * d.free);})          
          .attr("width", 1)
          .attr("class", "freeSample")          
          .attr("fill", "hsl(264,100%,20%)")      //purple 2           
          .attr("stroke-width", 0.25); 

  this.bars.selectAll(".barThreshold")
      .data(that.data)
      .enter()
        .insert("rect", ".barThreshold")
          .attr("x", function(d,i) {             
            var tempTime = new Date(d.time);
            return that.xScale(tempTime);
          })
          .attr("y", function(d,i) { return that.height - (that.heightRatio * d.bikes);})
          .attr("height", 2)          
          .attr("width", 1)
          .attr("class", "barThreshold")          
          .attr("fill", "hsl(284,0%,0%)")      //black 1          
          .attr("stroke-width", 0.25);   
}

StationTodayUsageChart.prototype.createChart = function(loadedData) {

  console.log("createChart");

  var that = this;  
  
  this.data = [];

  console.log(loadedData);
  
  var count = 0;
  for (var time in loadedData) {
    // console.log(time);    
    this.data[count] = {time: time, bikes: loadedData[time].bikes, free: loadedData[time].free};  
    // console.log(this.data[count].time + "    " + this.data[count].bikes +  "    " + this.data[count].free);  
    count++;
  }                  
  
  // this.yDomain = [0, this.data[0].bikes + this.data[0].free];   

  // this.yScale = d3.scale.linear().domain(this.yDomain).range([0, this.height]);

  that.heightRatio = that.height / (this.data[0].bikes + this.data[0].free); 
    

  /* stacked bar charts */
  this.bars.selectAll(".bikesSample")
      .data(that.data)
      .enter()
        .insert("rect", ".bikesSample")
          .attr("x", function(d,i) { 
            // the time use is the time column in the database and for some reason 
            //has a difference of +6 from local time in NY
            // so we fix it here
            // console.log(d);
            var tempTime = new Date(d.time);
            return that.xScale(tempTime);
          })
          .attr("y", function(d,i) { 
            // console.log(d.time + "    " + d.bikes +  "    " + d.free);
            return that.height - (that.heightRatio * d.bikes);
          })
          .attr("height", function(d,i) {return (that.heightRatio * d.bikes);})
          //.attr("height", function(d,i) {return 2;})
          .attr("width", 1)
          .attr("class", "bikesSample")
          //.attr("fill", 'yellow') 
          //.attr("fill", "hsl(264,100%,40%)")      //purple 1 
          .attr("fill", "hsl(284,0%,80%)")      //white 1    
          //.attr("fill", "hsl(60,100%,60%)")      //yellow 1    
          //.attr("fill", function(d,i) {return that.colorScale(d.bikes / (d.bikes + d.free));})  //blackbody scale
          //.attr("stroke", 'black')
          .attr("stroke-width", 0.5);

  this.bars.selectAll(".freeSample")
      .data(that.data)
      .enter()
        .insert("rect", ".freeSample")
          .attr("x", function(d,i) { 
            // the time use is the time column in the database and for some reason 
            //has a difference of +6 from local time in NY
            // so we fix it here
            var tempTime = new Date(d.time);
            return that.xScale(tempTime);
          })
          .attr("y", function(d,i) { return that.height - (that.heightRatio * (d.bikes + d.free));})
          .attr("height", function(d,i) {return (that.heightRatio * d.free);})
          //.attr("height", function(d,i) {return 2;})
          .attr("width", 1)
          .attr("class", "freeSample")
          //.attr("fill", "hsl(264,100%,40%)")      //purple 1 
          .attr("fill", "hsl(264,100%,20%)")      //purple 2 
          //.attr("fill", "hsl(284,0%,80%)")      //white 1
          //.attr("stroke", 'black')
          .attr("stroke-width", 0.25); 

  this.bars.selectAll(".barThreshold")
      .data(that.data)
      .enter()
        .insert("rect", ".freeSample")
          .attr("x", function(d,i) { 
            // the time use is the time column in the database and for some reason 
            //has a difference of +6 from local time in NY
            // so we fix it here
            var tempTime = new Date(d.time);
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

  // that.beginDate = beginDate;
  that.dayOfTheWeek = that.beginDate.getDay() - 1;  // 0 is sunday...
  if (that.dayOfTheWeek < 0) {
    that.dayOfTheWeek = 6;
  }

  // create a line function that can convert data[] into x and y points
  var meanLine = d3.svg.line()
    .interpolate("cardinal")
    // assign the X function to plot our line as we wish
    .x(function(d,i) { 
      var tempTime = new Date(that.beginDate.getTime() + (Number(d) + 0.5) * 1000 * Number(that.dataManager_.stationsModel["samplingInterval"]));
      return that.xScale(tempTime);
    })
    .y(function(d,i) { 
      return (that.height - (that.height * that.dataManager_.stationsModel[that.stationId][that.dayOfTheWeek]["groupModel"]["means"][Number(d)]));
    });  

  // we need to get the indexes of the samples in the groupmodel, as d3 need data as an array, not an object
  // that.modelMeans = $.map(this.dataManager_.stationsModel[that.stationId][that.dayOfTheWeek]["groupModel"]["samples"], function (value, key) { return key; });  
  that.modelMeansIndexes = $.map(this.dataManager_.stationsModel[that.stationId][that.dayOfTheWeek]["groupModel"]["means"], function (value, key) { return key; });  

  // console.log(that.modelMeansIndexes);

  this.bars.append("svg:path")  
    .attr("d", meanLine(that.modelMeansIndexes))
    .attr("id", 'meanLine')
    .attr("stroke", 'yellow')
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 1.0)
    .attr("fill", 'none');
    //.attr("stroke-dasharray", "9, 5")
     

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
  
  that.deviationIndexes = that.modelMeansIndexes.slice();
  var tempReverse = that.modelMeansIndexes.slice();
  tempReverse.reverse();  
  that.deviationIndexes = that.deviationIndexes.concat(tempReverse);

  // console.log(that.deviationIndexes); 

  this.bars.append("svg:path")  
    .attr("d", deviationArea(that.deviationIndexes))
    .attr("stroke", 'yellow')
    .attr("id", 'deviationArea')
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.15)
    //.attr("stroke-dasharray", "9, 5")
    .attr("fill", 'yellow')
    .attr("fill-opacity", 0.20);  
  
  this.bars.append("rect")
    .attr("x", that.xScale(new Date()))
    .attr("y", -10)
    .attr("height", that.height + 20)
    //.attr("height", function(d,i) {return 2;})
    .attr("width", 1)
    .attr("id", "barNow")
    //.attr("fill", "hsl(284,90%,20%)")      //purple 1
    .attr("fill", "#d95f0e")      //black 1
    //.attr("stroke", 'black')
    .attr("stroke-width", 0.25);  

  that.created = true;
}

//addActivityChart = function(svg, data) {
StationTodayUsageChart.prototype.add = function(id) {
  // console.log("StationTodayUsageChart.add");

  this.stationId = id;

  this.dataManager_.loadStationTodayHistory(id, this);    
  
};