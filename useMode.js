var UseMode = {




  createUsePanel: function(dataManager) {

    /*
    Adding a page for each vis option of this mode.
    */

    var modeContainerUse = d3.select("#modeContainerUse");
    modeContainerUse.selectAll(".mode_vis_container")
        .data(modesVisTabs[modes.indexOf(modeContainerUse.data()[0])])
        .enter()
          .append("div")
          .attr("class", "mode_vis_container")
          .attr("id", function (d) { return "modeVisContainer" + modeContainerUse.data()[0].replace(" ", "") + d.replace(" ", "");})        
          .style("visibility", function (d,i) {return (i == 0) ? "inherit" : "hidden";}); 

    /*
    Now call the functions to configure each page
    */
    // UseCitibikeNow.createUseCitibikeNowPanel(dataManager);      
    
  }




}