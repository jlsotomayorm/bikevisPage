function FlowEstimationCalendar(dataManager, parentNode, xlabel, ylabel, margin, onBrushFunc){
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

     
};

FlowEstimationCalendar.prototype.update = function() {
  
};

FlowEstimationCalendar.prototype.toLocalTime = function(time) {
  var newTime = time;
  newTime.setHours(newTime.getHours() - 6);
  return newTime;
};

FlowEstimationCalendar.prototype.add = function() { 

  

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
    cellSize = 8; // cell size

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
        // // to add leading zeros to months and days...
        var bDateString =  bDate.getFullYear() + "-" + ('0' + bDate.getDate()).slice(-2)
            + '-' + ('0' + (bDate.getMonth()+1)).slice(-2);

        // console.log(bDateString); 
        that.day = "2013-01-08";                         
        that.dataManager_.loadCirculationFilesforVisualizationFromFile(that.day, that);
        // that.dataManager_.loadStationActivity2(station, bDateString, eDateString, that.stationUsageLoaded);        
      });
      

  rect.append("title")
      .text(function(d) { return d.toDateString(); });

  svg.selectAll(".month")
      .data(function(d) { return d3.time.months(new Date(d, 0, 1, 0, 0, 0), new Date(d + 1, 0, 1, 0, 0, 0)); })
    .enter().append("path")
      .attr("class", "month")
      .attr("d", monthPath);  

  
};

FlowEstimationCalendar.prototype.circulationLoaded = function() {

  console.log("MapGLRendererFlowEstimation.circulationLoaded");
  d3.selectAll("#analyticsFlowEstimationTimeline").remove();
  this.analyticsContainer.timeline = new AnalyticsFlowEstimationTimeline(this.dataManager_, "analyticsFlowEstimationTimelineDiv", this.day);             
  this.analyticsContainer.timeline.mapGLRenderer = this.analyticsContainer.mapViewer.mapGLRenderer;
  this.analyticsContainer.mapViewer.mapGLRenderer.createStationRolesRepresentations_();
  this.analyticsContainer.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
};



