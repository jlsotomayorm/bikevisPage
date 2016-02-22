function ModelChart(dataManager, parentNode, xlabel, ylabel, margin, onBrushFunc){

  dataManager.addListener(this);

  this.dataManager_ = dataManager;

  var that = this; //cant see 'this' in nested functions
  
  this.parentNode = d3.select(parentNode[0]);
  this.onBrushFunc = onBrushFunc;
  
  this.data = [];
  this.rects = {};
  
  if (margin == null)
    margin = {top: 20, bottom: 30, left: 50, right: 50};
  this.margin = margin;
  
  this.width = parentNode.width() - this.margin.left - this.margin.right;

  this.height = 100 - margin.top - margin.bottom;    

   
    
  this.yScale = d3.scale.linear()
    .range([this.height + this.margin.top, this.margin.top]);
    
   
  this.svg = this.parentNode
    .insert("svg:svg", "svg")
    //.attr("transform", "translate(" + that.margin.left + ",0)") 
    .attr("width", this.width+this.margin.left+this.margin.right)
    .attr("height", this.height + margin.top + margin.bottom);
    

  this.title = this.svg.append("text")
    .attr("class", "modelChartTitle")   
    .attr("transform", "translate(0," + margin.top/2 + ")") 
    .text("Teste");
};

ModelChart.prototype.update = function() {
  this.add(this.dataManager_.stationActivity);
}

ModelChart.prototype.toLocalTime = function(time) {
  var newTime = time;
  newTime.setHours(newTime.getHours() - 6);
  return newTime;
}

ModelChart.prototype.add = function(stationId) {

  //console.log("ModelChart");

  var dayOfTheWeek = 6;

  if (!stationId) {
    return;
  }

  station = this.dataManager_.stations[dataManager.stationsIndexedById[stationId]];

  //console.log(station);

  this.title.text(station.name);

  //var data = this.dataManager_.stationsModel[stationId]["0"]["groupModel"];

  //console.log(data); 
    
  //var count = 0;
  
  
  // var beginDate = new Date(data.data[0].time);  
  // var endDate = new Date(data.data[data.data.length - 1].time); 

  // var beginDate = new Date(data.bTime);  
  // var endDate = new Date(data.eTime); 
  
  // console.log(beginDate);
  // console.log(endDate);
  //console.log(this.toLocalTime(beginDate));
  //console.log(this.toLocalTime(endDate));

  // the time use is the time column in the database and for some reason 
  //has a difference of +6 from local time in NY
  // so we fix it here
  // beginDate = this.toLocalTime(beginDate);  
  // endDate = this.toLocalTime(endDate);  

  // console.log(beginDate);
  // console.log(endDate);

  this.beginDate = new Date("2013-10-29 00:00:01"); // set one second so 3d dont show the month name in the axis
  this.endDate = new Date("2013-10-29 23:59:59");  
  
  
  // we need to get the indexes of the samples in the groupmodel, as d3 need data as an array, not an object
  this.data = $.map(this.dataManager_.stationsModel[stationId][dayOfTheWeek]["groupModel"]["samples"], function (value, key) { return key; });
  
  //console.log(this.data);

  this.xScale = d3.time.scale().domain([this.beginDate, this.endDate]).range([0, this.width]);

  this.beginDate = new Date("2013-10-29 00:00:00");
  
  //this.xScale = d3.scale.linear().domain([0, this.data.length - 1]).range([0, this.width]);  
  
  this.yScale = d3.scale.linear().domain([0, this.height]).range([0, this.height]);
  
  var that = this;

  this.xAxis = d3.svg.axis()
    .scale(that.xScale)
    //.ticks(d3.time.hours, 3)  
    .tickFormat("")  
    .orient("bottom");
  
  this.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + that.margin.left + "," + (that.margin.top + that.height) + ")")
    .call(that.xAxis);  

  //var heightRatio = that.height / (data.data[0].bikes + data.data[0].free);

  var bars = this.svg.append("g")    
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
  // bars.selectAll(".bikesSample")
  //     .data(that.data.data)
  //     .enter()
  //     .append("rect")
  //     .attr("x", function(d,i) { 
  //       // the time use is the time column in the database and for some reason 
  //       //has a difference of +6 from local time in NY
  //       // so we fix it here
  //       var tempTime = that.toLocalTime(new Date(d.time));
  //       return that.xScale(tempTime);
  //     })
  //     .attr("y", function(d,i) { return that.height - (heightRatio * d.bikes);})
  //     .attr("height", function(d,i) {return (heightRatio * d.bikes);})
  //     //.attr("height", function(d,i) {return 2;})
  //     .attr("width", 1)
  //     .attr("class", "bikesSample")
  //     //.attr("fill", 'yellow') 
  //     //.attr("fill", "hsl(264,100%,40%)")      //purple 1 
  //     .attr("fill", "hsl(284,0%,80%)")      //white 1    
  //     //.attr("fill", "hsl(60,100%,60%)")      //yellow 1    
  //     //.attr("fill", function(d,i) {return that.colorScale(d.bikes / (d.bikes + d.free));})  //blackbody scale
  //     //.attr("stroke", 'black')
  //     .attr("stroke-width", 0.5);

  that.bars = bars;

  // that.samplesAmountInInterval = []

  // for (var samplingIndex in that.dataManager_.stationsModel[stationId]["0"]["groupModel"]) {
  //   that.samplesAmountInInterval.push(that.dataManager_.stationsModel[stationId]["0"]["groupModel"][samplingIndex].length);
  // }   

  //console.log(that.dataManager_.stationsModel[stationId]["0"]["groupModel"]);  

  that.data.pop();

  // create a line function that can convert data[] into x and y points
  var line = d3.svg.line()
    .interpolate("cardinal")
    // assign the X function to plot our line as we wish
    .x(function(d,i) { 
      var tempTime = new Date(that.beginDate.getTime() + (Number(d) + 0.5) * 1000 * Number(that.dataManager_.stationsModel["samplingInterval"]));
      return that.xScale(tempTime);
    })
    .y(function(d,i) { 
      return (that.height - (that.height * that.dataManager_.stationsModel[stationId][dayOfTheWeek]["groupModel"]["means"][Number(d)]));
    })    

  bars.append("svg:path")  
    .attr("d", line(that.data))
    .attr("stroke", 'yellow')
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.7)
    //.attr("stroke-dasharray", "9, 5")
    .attr("fill", 'none');  

  bars.selectAll(".samplingBar")
      .data(that.data)
      .enter()
        //.append("rect")          
        .append("line")          
          .attr("x1", function(d,i) {
            
            var tempTime = new Date(that.beginDate.getTime() + (Number(d) + 0.5) * 1000 * Number(that.dataManager_.stationsModel["samplingInterval"]));
            
            return that.xScale(tempTime);                    
          }) 
          .attr("x2", function(d,i) {
            
            var tempTime = new Date(that.beginDate.getTime() + (Number(d) + 0.5) * 1000 * Number(that.dataManager_.stationsModel["samplingInterval"]));
            
            return that.xScale(tempTime);                    
          })          
          .attr("y1", 0)
          .attr("y2", that.height)
          //.attr("height", that.height)      
          //.attr("width", 1)
          .attr("stroke-width", function(d,i) {
            //return 50 * that.dataManager_.stationsModel[stationId][dayOfTheWeek]["groupModel"]["meansDeviations"][Number(d)];                    
            return that.dataManager_.stationsModel[stationId][dayOfTheWeek]["groupModel"]["frequencyMeans"][Number(d)] * 1.0 ;                    
            //return 1;
          })     
          .attr("class", "samplingBar")
          //.attr("fill", "hsl(264,100%,40%)")      //purple 1 
          //.attr("fill", "hsl(264,100%,20%)")      //purple 2 
          .attr("stroke", "hsl(264,100%,20%)")      //purple 2 
          //.attr("fill", "hsl(284,0%,80%)")      //white 1
          //.attr("stroke", 'black')
          //.attr("stroke-width", 0.25)          
          .each(function(samplingIntervalData,samplingIntervalIndex) {

              // that.bars.append("rect")                
              //   .attr("x", function(d,i) {
              //     var tempTime = new Date(that.beginDate.getTime() + (Number(samplingIntervalData) + 0.5) * 1000 * Number(that.dataManager_.stationsModel["samplingInterval"]));
              //     return that.xScale(tempTime) - 1;                    
              //   }) 
              //   .attr("y", (that.height - (that.height * that.dataManager_.stationsModel[stationId][dayOfTheWeek]["groupModel"]["means"][Number(samplingIntervalData)])))
              //   .attr("height", 2)                
              //   .attr("width", 2)
              //   .attr("class", "meanEntry")
              //   .attr("fill", 'yellow')                 
              //   .attr("stroke-width", 0.5);                        

              for (index in that.dataManager_.stationsModel[stationId][dayOfTheWeek]["groupModel"]["samples"][Number(samplingIntervalData)]) {
                //console.log("sample");
                that.bars.append("rect")
                  //.attr("x", that.xScale(Number(samplingIntervalIndex)))
                  //.attr("x", that.xScale(new Date(that.beginDate.getTime() + samplingIntervalIndex * 1000 * that.dataManager_.stationsModel[stationId]["samplingInterval"])))
                  .attr("x", function(d,i) {
                    var tempTime = new Date(that.beginDate.getTime() + (Number(samplingIntervalData) + 0.5) * 1000 * Number(that.dataManager_.stationsModel["samplingInterval"]));
                    //return that.xScale(tempTime) - that.dataManager_.stationsModel[stationId][dayOfTheWeek]["groupModel"]["samples"][Number(samplingIntervalData)].length/2 + (Math.random() * that.dataManager_.stationsModel[stationId][dayOfTheWeek]["groupModel"]["samples"][Number(samplingIntervalData)].length);                    
                    return that.xScale(tempTime);                    
                  }) 
                  .attr("y", (that.height - (that.height * that.dataManager_.stationsModel[stationId][dayOfTheWeek]["groupModel"]["samples"][Number(samplingIntervalData)][index])))
                  .attr("height", 1)                
                  .attr("width", 1)
                  .attr("class", "sampleEntry")
                  //.attr("fill", 'yellow') 
                  //.attr("fill", "hsl(264,100%,40%)")      //purple 1 
                  .attr("fill", "hsl(284,0%,80%)")      //white 1    
                  //.attr("fill", "hsl(60,100%,60%)")      //yellow 1    
                  //.attr("fill", function(d,i) {return that.colorScale(d.bikes / (d.bikes + d.free));})  //blackbody scale
                  //.attr("stroke", 'black')
                  .attr("stroke-width", 0.5);
              }              
            
          });


  // bars.selectAll(".barThreshold")
  //     .data(that.data.data)
  //     .enter()
  //     .append("rect")
  //     .attr("x", function(d,i) { 
  //       // the time use is the time column in the database and for some reason 
  //       //has a difference of +6 from local time in NY
  //       // so we fix it here
  //       var tempTime = that.toLocalTime(new Date(d.time));
  //       return that.xScale(tempTime);
  //     })
  //     .attr("y", function(d,i) { return that.height - (heightRatio * d.bikes);})
  //     .attr("height", 2)
  //     //.attr("height", function(d,i) {return 2;})
  //     .attr("width", 1)
  //     .attr("class", "barThreshold")
  //     //.attr("fill", "hsl(284,90%,20%)")      //purple 1
  //     .attr("fill", "hsl(284,0%,0%)")      //black 1
  //     //.attr("stroke", 'black')
  //     .attr("stroke-width", 0.25);    
  
};