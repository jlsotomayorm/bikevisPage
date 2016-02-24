var modes = ["Analytics"];
// var modesVisTabs = [["Stations Usage", "Day Of Week Models", "Flow Estimation"]];
// var modesVisTabs = [["Calendar View", "Day Of Week Models", "Flow Estimation"]];
var modesVisTabs = [["Calendar View", "Day Of Week Models", "Trips View","ODM View"]];
//var modesVisTabs = [["Trips View","AM View"]];

var createTabScheme = function(dataManager) {

  var that = this;

  /** Creating 1st tab scheme level: modes
  First the div that will contain a button for each mode
  */
  var modeButtonsContainer = d3.select("#mode_buttons_container"); 

  /*
  Now, for each mode button, we add a div that will contain the buttons for the vis options that mode
  has (2nd tab level)
  */
  var modesVisButtonsContainer = modeButtonsContainer.selectAll(".mode_vis_buttons_container")
    .data(modes)
    .enter()
      .append("div")
      .attr("id", function (d) {return "modeVisButtonContainer" + d.split(" ").join("");})
      .attr("class","mode_vis_buttons_container")
      .style("display", function (d,i) {return (i == 0) ? "block" : "none";});

  /*
  Adding the vis buttons for each mode option
  */
  for (var modeIndex in modes) {    
    var tempModesVisButtonsContainer = modeButtonsContainer.select("#modeVisButtonContainer" + modes[modeIndex].split(" ").join(""));    
    tempModesVisButtonsContainer.selectAll(".mode_vis_button")
      .data(modesVisTabs[modeIndex])
      .enter()
        .append("div")
        .attr("id", function (d) {return "modeVisButton" + modes[modeIndex].split(" ").join("") + d.split(" ").join("");})
        .attr("class","mode_vis_button") 
        .attr("mode",modes[modeIndex])
        .on("click", function (d) {

          // if (that.dataManager.stationsCalendarViewData == undefined) {
          //   return;
          // }    

          var thisMode = d3.select("#"+this.id).attr("mode");          

          // toggle colors
          d3.select("#modeVisButtonContainer" + thisMode.split(" ").join("")).selectAll(".mode_vis_button")
            .style("background", "rgba(200, 200, 200, 1)");      
          d3.select("#"+this.id)          
            .style("background", "rgba(255, 255, 255, 1)");

          
          bottomContainer.select("#modeContainer" + thisMode.split(" ").join("")).selectAll(".mode_vis_container")
            .style("visibility", "hidden");
          bottomContainer.selectAll(".canvas_container")
            .style("visibility", "inherit");            
          bottomContainer.select("#modeVisContainer" + thisMode.split(" ").join("") + d.split(" ").join(""))
            .style("visibility", "inherit"); 

          // console.log(d);

          if (d == "Calendar View") {  
            // console.log("Calendar View");
            // d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer").select("#svgDiv").style("display", "none");
            // d3.select("#modeVisContainerAnalyticsCalendarViewContainerMiddleContainer").select("#calendarViewSvgDiv").style("display", "block");
            d3.select("#modeVisContainerAnalyticsCalendarViewContainerMiddleContainer").style("display", "block");                        
            d3.select("#modeVisContainerAnalyticsCalendarViewContainerLeftContainer").style("display", "block");                        
            d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsTripsViewContainerMiddleContainer").style("display", "none");            
            d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerLeftContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsTripsViewContainerLeftContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsAMViewContainerMiddleContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsAMViewContainerLeftContainer").style("display", "none");
          } else if (d == "Day Of Week Models") { 
            // console.log("Day Of Week Models");
            // d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer").select("#svgDiv").style("display", "block");
            // d3.select("#modeVisContainerAnalyticsCalendarViewContainerMiddleContainer").select("#calendarViewSvgDiv").style("display", "none");
            d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer").style("display", "block");
            d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerLeftContainer").style("display", "block");
            d3.select("#modeVisContainerAnalyticsTripsViewContainerMiddleContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsCalendarViewContainerMiddleContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsTripsViewContainerLeftContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsCalendarViewContainerLeftContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsAMViewContainerMiddleContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsAMViewContainerLeftContainer").style("display", "none");
          }  else if (d== "Trips View") {
            d3.select("#modeVisContainerAnalyticsTripsViewContainerMiddleContainer").style("display", "block");
            d3.select("#modeVisContainerAnalyticsTripsViewContainerLeftContainer").style("display", "block");
            d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer").style("display", "none");            
            d3.select("#modeVisContainerAnalyticsCalendarViewContainerMiddleContainer").style("display", "none");          
            d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerLeftContainer").style("display", "none");            
            d3.select("#modeVisContainerAnalyticsCalendarViewContainerLeftContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsAMViewContainerMiddleContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsAMViewContainerLeftContainer").style("display", "none");
          } else
          {
            d3.select("#modeVisContainerAnalyticsAMViewContainerMiddleContainer").style("display", "block");
            d3.select("#modeVisContainerAnalyticsAMViewContainerLeftContainer").style("display", "block");
            d3.select("#modeVisContainerAnalyticsTripsViewContainerMiddleContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsTripsViewContainerLeftContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsCalendarViewContainerMiddleContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerLeftContainer").style("display", "none");
            d3.select("#modeVisContainerAnalyticsCalendarViewContainerLeftContainer").style("display", "none");

          }
          

        })  
        .style("background", function (d,i) {return (i == 0) ? "rgba(255, 255, 255, 1)" : "rgba(200, 200, 200, 1)";})             
        .text(String);
      
  }

  /*
  Adding a div in the "#bot_container" as a container for each mode (mode pages).
  */
  var bottomContainer = d3.select("#bot_container");
  bottomContainer.selectAll(".mode_container")
      .data(modes)
      .enter()
        .append("div")
        .attr("class", "mode_container")
        .attr("id", function (d) {return "modeContainer" + d.split(" ").join("");})
        //.style("background", function (d,i) {return "rgba("+(i+1) * 100+ ", 0, 0, 1)";})
        .style("visibility", function (d,i) {return (i == 0) ? "visible" : "hidden";})
      .style("margin-top","25px");

  // d3.select("#modeVisContainerAnalyticsCalendarViewContainerMiddleContainer").style("display", "block");                        
  // d3.select("#modeVisContainerAnalyticsDayOfWeekModelsContainerMiddleContainer").style("display", "none");
  // d3.select("#modeVisContainerAnalyticsTripsViewContainerMiddleContainer").style("display", "none");

  /* 
  Now call the functions that will configure the page of each mode.
  Including adding the second level of pages (one for each vis option in that mode)
  */
  AnalyticsMode.createAnalyticsPanel(dataManager); 

               
}

