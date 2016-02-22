var AnalyticsMode = {


  createAnalyticsPanel: function(dataManager) {

    /*
    Adding a page for each vis option of this mode.
    */

    var modeContainerAnalytics = d3.select("#modeContainerAnalytics");
    modeContainerAnalytics.selectAll(".mode_vis_container")
        .data(modesVisTabs[modes.indexOf(modeContainerAnalytics.data()[0])])
        .enter()
          .append("div")
          .attr("class", "mode_vis_container")
          .attr("id", function (d) { return "modeVisContainer" + modeContainerAnalytics.data()[0].split(" ").join("") + d.split(" ").join("");})        
          .style("visibility", function (d,i) {return (i == 0) ? "visible" : "hidden";}); 
          // .style("visibility", "hidden"); 

    /*
    Now call the functions to configure each page
    */      
    // AnalyticsStationsUsage.createAnalyticsStationsUsagePanel(dataManager);  
    AnalyticsDayOfWeekModels.createAnalyticsDayOfWeekModelsPanel(dataManager);
    // AnalyticsFlowEstimation.createAnalyticsFlowEstimationPanel(dataManager);
    AnalyticsCalendarView.createAnalyticsCalendarViewPanel(dataManager);
    AnalyticsTripsView.createAnalyticsTripsViewPanel(dataManager);
    AnalyticsAMView.createAnalyticsAMViewPanel(dataManager);
    
    // AnalyticsRadialHistory.createAnalyticsRadialHistoryPanel(dataManager);
    
  }




}