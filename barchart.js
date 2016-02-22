function BarChart(dataManager, parentNode, xlabel, ylabel, margin, onBrushFunc){

  dataManager.addListener(this);

  this.dataManager_ = dataManager;

  var that = this; //cant see this in nested functions
  
  this.parentNode = d3.select(parentNode[0]);
  this.onBrushFunc = onBrushFunc;
  
  this.data = [];
  this.rects = {};
  
  if (margin == null)
    margin = {top: 10, bottom: 30, left: 50, right: 20};
  this.margin = margin;
  
  this.width = parentNode.width() - this.margin.left - this.margin.right;
  this.height = parentNode.height() - this.margin.bottom - this.margin.top;

    

  //this.xScale = d3.scale.ordinal()
    //.rangeBands([this.margin.left, this.width+this.margin.left]);
    
    
  this.yScale = d3.scale.linear()
    .range([this.height + this.margin.top, this.margin.top]);
    

  // this.xAxis = d3.svg.axis()
  //   .scale(this.xScale)
  //   .tickSize(-this.height)
  //   .tickValues([1, 15, 30, 45, 59])
  //   .orient("bottom");
    
  // this.yAxis = d3.svg.axis()
  //   .scale(this.yScale)
  //   .tickSize(-this.width)
  //   .ticks(5)
  //   .orient("left");
  
  this.svg = this.parentNode
    .append("svg:svg")
    .attr("width", this.width+this.margin.left+this.margin.right)
    .attr("height", 100);

  
    //.attr("height", this.height+this.margin.bottom+this.margin.top);
    

  // this.svg.append("svg:g")
  //   .attr("class", "xAxis")
  //   .attr("transform", "translate("+(0)+"," + (this.height+this.margin.top) + ")")
  //   .attr("display", "none")
  //   .call(this.xAxis);
  
  // this.svg.append("svg:g")
  //   .attr("class", "yAxis")
  //   .attr("transform", "translate(" + (this.margin.left ) + ", 0)")
  //   .attr("display", "none")
  //   .call(this.yAxis);
  
  
  // this.svg.append("svg:g")
  //   .attr("class", "grid")
  //   .attr("transform", "translate(" + (this.margin.left ) + ", "+ this.margin.top +")");
    
  // this.svg.append("text")
  //   .attr("class", "x_label")
  //   .attr("text-anchor", "middle")
  //   .attr("x", this.width)
  //   .attr("y", this.height + this.margin.top + 30)
  //   .attr("transform", "translate(-"+this.width/2+")")
  //   .text(xlabel);
    
  // this.svg.append("text")
  //   .attr("class", "y_label")
  //   .attr("text-anchor", "middle")
  //   .attr("y", 6)
  //   .attr("dy", ".75em")
  //   .attr("transform", "rotate(-90) translate(-"+this.height/2+")")
  //   .text(ylabel);
};

BarChart.prototype.update = function() {
  this.add(this.dataManager_.stationActivity);
}


BarChart.prototype.add = function(data) {

  if (!data) {
    return;
  }

  console.log(data);

  var that = this;
    
  var count = 0;
  
  //this.xDomain = d3.range(0,data.length,1);
  var beginDate = new Date(data.data[0].time);
  var endDate = new Date(data.data[data.data.length - 1].time);
  //this.xDomain = [beginDate,endDate];
  //this.data = this.data.data;
  this.yDomain = [0, data.data[0].bikes + data.data[0].free];
  
  //this.xScale.domain(this.xDomain);
  console.log(beginDate);
  console.log(endDate);
  this.xScale = d3.time.scale().domain([beginDate, endDate]).range([0, this.width]);  
  //this.yScale.domain(this.yDomain).range([0, this.height]);
  this.yScale = d3.scale.linear().domain(this.yDomain).range([0, this.height]);
  
  //this.xAxis.scale(this.xScale);
  //this.yAxis.scale(this.yScale);
  //this.svg.select(".xAxis").call(this.xAxis);
  //this.svg.select(".yAxis").call(this.yAxis);
  
  that.data = data;
  
  //console.log(that.xScale.rangeBand());
  console.log(1);

  this.svg.selectAll("teste")
      .data(that.data.data)
      .enter()
      .append("rect")
      .attr("x", function(d,i) { return that.xScale(new Date(d.time));})
      .attr("y", function(d,i) { return d.bikes;})
      .attr("height", function(d,i) {return 100 - d.bikes;})
      .attr("width", 3)
      .attr("fill", 'yellow')
      .attr("stroke", 'black')
      .attr("stroke-width", 1);
  
  // this.svg.selectAll("rect")
  //     .data(that.data.data)
  //     //.attr("x", function(d,i) { return that.xScale(i);})
  //     .attr("x", function(d,i) { return that.xScale(new Date(d.time))*300;})
  //     .attr("y", function(d,i) { return d.bikes;})
  //     .attr("height", function(d,i) {return 100 - d.bikes;})
  //     //.attr("width", that.xScale.rangeBand())
  //     .attr("width", 3)
  //     .enter()
  //     .append("rect")
  //     //.attr("x", function(d,i) { return that.xScale(i);})
  //     .attr("x", function(d,i) { return that.xScale(new Date(d.time))*300;})
  //     .attr("y", function(d,i) { return d.bikes;})
  //     .attr("height", function(d,i) {return 100 - d.bikes;})
  //     //.attr("width", that.xScale.rangeBand())
  //     .attr("width", 3)
  //     .attr("fill", 'yellow')
  //     .attr("stroke", 'yellow')
  //     .attr("stroke-width", 1)
  //     .attr("class", "bars");

  // console.log(2);
  // this.svg.selectAll("rect").data(data).exit().remove();
};