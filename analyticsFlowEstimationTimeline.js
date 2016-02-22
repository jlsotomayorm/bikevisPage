function AnalyticsFlowEstimationTimeline(dataManager, divId, day){

  this.day = day;
  this.dataManager_ = dataManager;

  this.divId = "#" + divId;

  var that = this; //cant see 'this' in nested functions

  this.parentNode = $("#"+divId);  

  // console.log(this.parentNode);
    
  // this.margin = {top: 30, bottom: 30, left: 70, right: 50};  
  this.margin = {top: 30, bottom: 30, left: 10, right: 10};  
  
  this.width = this.parentNode.width() - this.margin.left - this.margin.right;

  this.height = 100 - this.margin.top - this.margin.bottom;    

   
    
  this.yScale = d3.scale.linear()
    .range([this.height + this.margin.top, this.margin.top]);
    
   
  this.svg = d3.select(this.divId)
    .append("svg:svg")
    .attr("id", "analyticsFlowEstimationTimeline")       
    .attr("width", this.width+this.margin.left+this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom);
    

  this.title = this.svg.append("text")
    .attr("id", "analyticsFlowEstimationTimelineTitle")   
    .attr("transform", "translate(" +  this.margin.left + ", " + this.margin.top/2 + ")") 
    .text("Trips");

  this.add();
};

AnalyticsFlowEstimationTimeline.prototype.add = function() {
  
  if (!this.dataManager_.circulationData) {
    return;
  }

  var that = this;
      
  var count = 0;
  
  
  // var beginDate = new Date(data.data[0].time);  
  // var endDate = new Date(data.data[data.data.length - 1].time); 

  // var stationData = data.st;
  // var beginDate = new Date(data.bTime);  
  // var endDate = new Date(data.eTime); 
  // console.log(data.bTime);
  // console.log(data.eTime);

  // var thisDayDate = new Date(this.day.split('-')[0], this.day.split('-')[2]-1, this.day.split('-')[1]);

  // this.svg.select("#analyticsFlowEstimationTimelineTitle").text("Timeline " + thisDayDate.toDateString());

  // var originalData = this.dataManager_.circulationData["All"];  

  // console.log(originalData);  

  // console.log(Object.keys(originalData['deltasAndFrequencySum']));
  
  // if (originalData != undefined && originalData['deltasAndFrequencySum'] != undefined) {

  //   data = Object.keys(originalData['deltasAndFrequencySum']).map(function(d) {
  //     var date = new Date(thisDayDate);
  //     date.setHours(d.split(':')[0]);
  //     date.setMinutes(d.split(':')[1]);
  //     date.setSeconds(d.split(':')[2]);
  //     return {t: date, bikes: originalData['deltasAndFrequencySum'][d].b, frequency: originalData['deltasAndFrequencySum'][d].a};
  //   });
  // } else {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    data = d3.range(0,96).map(function(d) {      
      var date2 = new Date(date.getTime() + d*15*60000);
      // console.log(date2);      
      return {t: date2, bikes: 1, frequency: 1};
    });
  // }

  // console.log(data);

  
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

  this.maxBikes = d3.max(data, function(d) {
    return d.bikes;
  });

  this.maxFrequency = d3.max(data, function(d) {
    return d.frequency;
  });
  
  this.yDomain = [0, this.maxBikes];

  this.beginDate = data[0].t;
  this.endDate = data[data.length - 1].t;
  
  this.xScale = d3.time.scale().domain([data[0].t, data[data.length - 1].t]).range([0, this.width]);  
  
  this.yScale = d3.scale.linear().domain(this.yDomain).range([0, this.height]);
  
  
  this.xAxis = d3.svg.axis()
    .scale(that.xScale)
    .tickFormat(d3.time.format('%H'))
    .orient("bottom");
  
  this.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + that.margin.left + "," + (that.margin.top + that.height) + ")")
    .call(that.xAxis);   
  

  
  var bars = this.svg.append("g") 
    .attr("id", "analyticsFlowEstimationTimelineBars")   
    .attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")");

  
  this.colorScale = d3.scale.linear().domain([0.0,0.4,0.85,1.0]).range([d3.rgb(150, 0, 0),
      d3.rgb(255, 0, 0),
      d3.rgb(255, 255, 0),
      d3.rgb(255, 255, 255)]);

  var barWidth = 6;
  
  /* stacked bar charts */
  var barsSamples = bars.selectAll(".analyticsFlowEstimationTimelineBarsSample")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", function(d,i) {         
        return that.xScale(d.t) - barWidth/2;
      })
      .attr("y", function(d,i) { return that.height - that.height * (d.bikes/that.maxBikes);})
      .attr("height", function(d,i) {return that.height * (d.bikes/that.maxBikes) - 2;})      
      
      .attr("width", 4)
      .attr("class", "analyticsFlowEstimationTimelineBarsSample")      
      .attr("fill", d3.rgb(200,200,200))      //orange 1          
      .attr("stroke-width", 0);
      

  var brush = d3.svg.brush()      
      .x(that.xScale)
      .y(that.yScale)
      .on('brush', brushed)
      .on('brushend', brushend);

  that.brush = brush;

  function brushend() {
    // console.log("brushend");   
    
    // console.log(that.brushExtent);

    // var beginTime = new Date(that.brushExtent[0][0]);
    // var endTime = new Date(that.brushExtent[1][0]);

    // that.mapGLRenderer.timeString1 = beginTime.toTimeString().split(' ')[0];
    // that.mapGLRenderer.timeString2 = endTime.toTimeString().split(' ')[0];    

    // that.mapGLRenderer.timeIndex1 = that.mapGLRenderer.timeStringToIndex(that.mapGLRenderer.timeString1);        
    // that.mapGLRenderer.timeIndex2 = that.mapGLRenderer.timeStringToIndex(that.mapGLRenderer.timeString2);        
    // console.log(that.mapGLRenderer.timeIndex1 + "   " + that.mapGLRenderer.timeIndex2);
    // that.mapGLRenderer.timeWindowChanged = true;
    // that.mapGLRenderer.createStationRolesRepresentations_();
    // that.mapGLRenderer.createStreetsFlowRepresentations_();
    // that.mapGLRenderer.render_();

    // if (brush.empty()) {
    //   d3.select("#flowEstimationInfoBrushTimeWindow").text("Time window:");
    // } else {
    //   d3.select("#flowEstimationInfoBrushTimeWindow").text("Time window: " + that.mapGLRenderer.timeString1 + " <-> " + that.mapGLRenderer.timeString2);
    // }

    that.mapGLRenderer.mapViewer.updateStationsLayer();
    that.mapGLRenderer.createStreetsFlowRepresentations_();
    that.mapGLRenderer.render_();

    // if (that.mapGLRenderer.playing) {
    //   console.log("playing");
      
    //   that.updateBrushExtentPlaying();      
    // }

  };

  function brushed() {
    
    // console.log("brushed");
    var extent0 = brush.extent(),
        extent1;
      
    // console.log(extent0);

    extent1 = extent0.map(function(corner) {
      // console.log(corner);      
      corner[0].setMinutes(Math.round(corner[0].getMinutes() / 15) * 15)      
      // console.log(corner);
      corner[0].setSeconds(0);
      // corner[1] = 0;
      return corner;      
    }); 

    extent1[0][1] = 0;
    extent1[1][1] = 1;

    that.brushExtent = extent1;

    var beginTime = new Date(that.brushExtent[0][0]);
    var endTime = new Date(that.brushExtent[1][0]);

    that.mapGLRenderer.timeString1 = beginTime.toTimeString().split(' ')[0];
    that.mapGLRenderer.timeString2 = endTime.toTimeString().split(' ')[0];

    if (brush.empty()) {
      d3.select("#flowEstimationInfoBrushTimeWindow").text("Time window:");
    } else {
      d3.select("#flowEstimationInfoBrushTimeWindow").text("Time window: " + that.mapGLRenderer.timeString1 + " <-> " + that.mapGLRenderer.timeString2);
    }  

    d3.select(this).call(brush.extent(extent1));

    if (that.mapGLRenderer.timeIndex1 == that.mapGLRenderer.timeStringToIndex(that.mapGLRenderer.timeString1)
      && that.mapGLRenderer.timeIndex2 == that.mapGLRenderer.timeStringToIndex(that.mapGLRenderer.timeString2)) {      
      return;
    }   
    
    that.mapGLRenderer.timeIndex1 = that.mapGLRenderer.timeStringToIndex(that.mapGLRenderer.timeString1);        
    that.mapGLRenderer.timeIndex2 = that.mapGLRenderer.timeStringToIndex(that.mapGLRenderer.timeString2);        
    // console.log(that.mapGLRenderer.timeIndex1 + "   " + that.mapGLRenderer.timeIndex2);
    that.mapGLRenderer.timeWindowChanged = true;
    // that.mapGLRenderer.createStationRolesRepresentations_();

    // that.mapGLRenderer.mapViewer.updateStationsLayer();
    // that.mapGLRenderer.createStreetsFlowRepresentations_();
    // that.mapGLRenderer.render_(); 


    
  };

  var gBrush = bars.append("g")          
    .classed('brush', true) 
    .attr("id", "flowTimelineBrush")   
    .call(brush);  
  
};

AnalyticsFlowEstimationTimeline.prototype.updateBrushExtentPlaying = function(obj) {

  // if (!obj.mapGLRenderer.playing) {
  //   return;
  // }

  console.log("updateBrushExtentPlaying");

  console.log(obj.brushExtent);

  obj.brushExtent = [[new Date(obj.brushExtent[0][0].getTime() + 15*60000),0], [new Date(obj.brushExtent[1][0].getTime() + 15*60000),1]];
  // this.brushExtent[1][0] = new Date(this.brushExtent[1][0].getTime() + 15*60000);

  console.log(obj.brushExtent);

  obj.brush.extent(obj.brushExtent);
  obj.brush(d3.select("#flowTimelineBrush"));
  obj.brush.event(d3.select("#flowTimelineBrush"));

  // d3.select("#flowTimelineBrush").extent(this.brushExtent);
  // d3.select("#flowTimelineBrush").brush();

  // setTimeout(function() {
  //   obj.updateBrushExtentPlaying(obj);
  // }, 2000)
}

AnalyticsFlowEstimationTimeline.prototype.updateBrushExtent = function() {
  this.brush.extent(this.brushExtent);
  this.brush(d3.select("#flowTimelineBrush"));
  this.brush.event(d3.select("#flowTimelineBrush"));
  // d3.select("#flowTimelineBrush").extent(this.brushExtent);
  // d3.select("#flowTimelineBrush").brush();
}