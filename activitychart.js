function ActivityChart(dataManager, parentNode, xlabel, ylabel, margin, onBrushFunc){

  dataManager.addListener(this);

  this.dataManager_ = dataManager;

  var that = this; //cant see 'this' in nested functions
  
  this.parentNode = d3.select(parentNode[0]);
  //this.parentNode = parentNode;
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
    .attr("class", "activityChartSvg")  
    //.attr("transform", "translate(" + that.margin.left + ",0)") 
    .attr("width", this.width+this.margin.left+this.margin.right)
    .attr("height", this.height + margin.top + margin.bottom);
    

  this.title = this.svg.append("text")
    .attr("class", "activityChartTitle")   
    .attr("transform", "translate(" +  margin.left + ", " + margin.top/2 + ")") 
    .text("");
};

ActivityChart.prototype.update = function() {
  //this.add(this.dataManager_.stationActivity);
}

ActivityChart.prototype.toLocalTime = function(time) {
  var newTime = time;
  newTime.setHours(newTime.getHours() - 6);
  return newTime;
}

//addActivityChart = function(svg, data) {
ActivityChart.prototype.add = function(data) {

  // console.log("ActivityChart");

  if (!data) {
    return;
  }

  var that = this;

  //this.svg = svg;
    
  var count = 0;
  
  
  // var beginDate = new Date(data.data[0].time);  
  // var endDate = new Date(data.data[data.data.length - 1].time); 

  var beginDate = new Date(data.bTime);  
  var endDate = new Date(data.eTime); 

  this.svg.select(".activityChartTitle").text(beginDate.toDateString());

  // console.log(data);
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
  
  this.yDomain = [0, data.data[0].bikes + data.data[0].free];
  
  this.xScale = d3.time.scale().domain([beginDate, endDate]).range([0, this.width]);  
  
  this.yScale = d3.scale.linear().domain(this.yDomain).range([0, this.height]);
  
  
  this.xAxis = d3.svg.axis()
    .scale(that.xScale)
    .orient("bottom");
  
  this.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + that.margin.left + "," + (that.margin.top + that.height) + ")")
    .call(that.xAxis);

    
  that.data = data;  

  var heightRatio = that.height / (data.data[0].bikes + data.data[0].free);

  
  var bars = this.svg.append("g") 
    .attr("id", "activityChartBars")   
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
      .data(that.data.data)
      .enter()
      .append("rect")
      .attr("x", function(d,i) { 
        // the time use is the time column in the database and for some reason 
        //has a difference of +6 from local time in NY
        // so we fix it here
        var tempTime = that.toLocalTime(new Date(d.time));
        return that.xScale(tempTime);
      })
      .attr("y", function(d,i) { return that.height - (heightRatio * d.bikes);})
      .attr("height", function(d,i) {return (heightRatio * d.bikes);})
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

  bars.selectAll(".freeSample")
      .data(that.data.data)
      .enter()
      .append("rect")
      .attr("x", function(d,i) { 
        // the time use is the time column in the database and for some reason 
        //has a difference of +6 from local time in NY
        // so we fix it here
        var tempTime = that.toLocalTime(new Date(d.time));
        return that.xScale(tempTime);
      })
      .attr("y", function(d,i) { return that.height - (heightRatio * (d.bikes + d.free));})
      .attr("height", function(d,i) {return (heightRatio * d.free);})
      //.attr("height", function(d,i) {return 2;})
      .attr("width", 1)
      .attr("class", "freeSample")
      //.attr("fill", "hsl(264,100%,40%)")      //purple 1 
      .attr("fill", "hsl(264,100%,20%)")      //purple 2 
      //.attr("fill", "hsl(284,0%,80%)")      //white 1
      //.attr("stroke", 'black')
      .attr("stroke-width", 0.25); 

  bars.selectAll(".barThreshold")
      .data(that.data.data)
      .enter()
      .append("rect")
      .attr("x", function(d,i) { 
        // the time use is the time column in the database and for some reason 
        //has a difference of +6 from local time in NY
        // so we fix it here
        var tempTime = that.toLocalTime(new Date(d.time));
        return that.xScale(tempTime);
      })
      .attr("y", function(d,i) { return that.height - (heightRatio * d.bikes);})
      .attr("height", 2)
      //.attr("height", function(d,i) {return 2;})
      .attr("width", 1)
      .attr("class", "barThreshold")
      //.attr("fill", "hsl(284,90%,20%)")      //purple 1
      .attr("fill", "hsl(284,0%,0%)")      //black 1
      //.attr("stroke", 'black')
      .attr("stroke-width", 0.25);    
  
};