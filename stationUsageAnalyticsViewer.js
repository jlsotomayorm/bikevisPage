
/**
 * Class to show plots analytics about the data.
 *
 */
var StationUsageAnalyticsViewer = function(dataManager, viewerContainerId) {
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

  var that = this;

  d3.select(this.visibleContainersId_[0])
    .append("div")
    .attr("class", "stationUsageClearButton")
    .attr("id", "stationUsageClearButton")         
    .on("click", function (d) {   
      // toggle colors
      var stationsUsageContainer = d3.select(that.visibleContainersId_[0]);
      stationsUsageContainer.selectAll(".selectedStationUseChartContainer")
        .remove();
        
    })        
    .text("clear");
}

/**
 * Returns whether viewer is active.
 */
StationUsageAnalyticsViewer.prototype.isActive = function() {
  return this.active_;
};

/**
 * Activates/deactivates viewer.
 */
StationUsageAnalyticsViewer.prototype.setActive = function(active) {
  var mustUpdate = active && !this.active_;
  this.active_ = active;

  // Show/hide containers.
  utils.setVisibility(this.visibleContainersId_, this.active_);
  
};

StationUsageAnalyticsViewer.prototype.addSelectedStationUsageCharts = function(selectedStation) {  
  
    
    if (selectedStation) {

      var container = d3.select($('#' + this.containerId_)[0]);

      var selectedStationUseChartContainer = container
        .insert("div", ".selectedStationUseChartContainer")
        .datum(selectedStation)
        .style("background", d3.rgb(240,240,240))
        .style("padding", "5px")         
        .style("margin", "20px")
        .style("border", "1px solid")
        .style("clear", "both")
        .style("border-color", d3.rgb(20,20,20)) 
        .attr("class", "selectedStationUseChartContainer")                      
        .attr("id", "selectedStationUseChartContainer" + (container[0][0]["childNodes"].length - 1))
        .on("mouseover", function(d) {

          // console.log(d);                    

          d3.selectAll(".stationsUsageStationRepresentation")
            .each(function(station) {              

              if (station.id == d.id) {
                d3.select(this)
                  // .attr("fill", "orange")
                  .attr("stroke-width",  "4px")
                  .attr("stroke",  "black")
                  .attr("r", 6.5);
              } else {
                d3.select(this)
                  // .attr("fill", "hsl(" + (0.76 * 360) + ", 100%, 50%)")
                  .attr("stroke-width",  "1.5px")
                  .attr("stroke",  "white")
                  .attr("r", 4.5);
              }                  
              
            });
        });

      selectedStationUseChartContainer.append("div")
        .attr("class", "stationUsageChartStationName")   
        .attr("transform", "translate(20, 20")         
        .text(selectedStation.name);

      selectedStationUseChartContainer
        .append("div")
        .attr("class", "stationUseChartDaysClearButton")
        .attr("id", "stationUseChartDaysClearButton")         
        .on("click", function (d) {   
          // toggle colors
          var selectedStationUseChartDaysContainer = selectedStationUseChartContainer.select("#selectedStationUseChartDaysContainer");
          selectedStationUseChartDaysContainer.selectAll(".stationUsageChartSvg")
            .remove();
            
        })        
        .text("clear");
      

      //console.log(container[0][0]);
      // console.log(container[0][0]["childNodes"]);

      var modelChartCalendar = new ModelChartCalendar(this.dataManager_, $("#selectedStationUseChartContainer" + (container[0][0]["childNodes"].length - 1)));             
      modelChartCalendar.add(selectedStation.id);   

      

      // selectedStationUseChartContainer
      //   .append("div")
      //   .style("width", "100%") 
      //   // .style("height", "300px")       
      //   .attr("id", "selectedStationTodayUseChartContainer");

      // var stationTodayUsageChart = new StationTodayUsageChart(this.dataManager_, $("#selectedStationUseChartContainer" + (container[0][0]["childNodes"].length - 1)));      
      // stationTodayUsageChart.add(selectedStation.id); 

      

      selectedStationUseChartContainer
        .append("div")
        .style("max-height", "300px")
        .style("overflow-x", "hidden")
        .style("overflow-y", "auto")
        .style("width", "100%")
        .style("border", "1px solid")
        .style("border-color", "rgba(20, 20, 20, 1)")
        .style("background", "rgba(255, 255, 255, 1)")
        .attr("id", "selectedStationUseChartDaysContainer");         

      // var activityChart = new ActivityChart(this.dataManager_, $("#selectedStationUseChartContainer" + (container[0][0]["childNodes"].length - 1)));
      // activityChart.add(selectedStation);
      
      // var modelChart = new ModelChart(this.dataManager_, $("#selectedStationUseChartContainer" + (container[0][0]["childNodes"].length - 1)));
      
      // modelChart.add(selectedStation.st.id);      

      // var stationUsageChart = new StationUsageChart(this.dataManager_, $("#selectedStationUseChartContainer" + (container[0][0]["childNodes"].length - 1)));      
      // stationUsageChart.add(selectedStation.st.id); 
    }
  //}
}

StationUsageAnalyticsViewer.prototype.update = function() {
  if (!this.dataManager_.hasData() || !this.active_) {
    //return;
  }

  if (!this.initialized_) {
    
    this.initialized_ = true;
  }

  // TODO Load initial view options based on filters and selections.

  //console.log(this.dataManager_.stationsActivities);
  //this.plotSelectedStationsFrequencyCharts();
  
};