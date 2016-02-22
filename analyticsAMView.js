/**
 * Created by jl on 30/05/15.
 */
var AnalyticsAMView = {


    createAnalyticsAMViewPanel: function (dataManager) {

        var thisModeVisContainer = d3.select("#modeVisContainerAnalyticsAMView")
            .style("width","100%")
            .style("height","100%");
        var modeContainerUseLeft = thisModeVisContainer.append("div")
            .style("visibility", "inherit")
            .attr("id", "modeVisContainerAnalyticsAMViewContainerLeftContainer");

        modeContainerUseLeft
            .append("div")
            .attr("class", "canvases_container")
            .style("visibility", "inherit")
            .style("height", "99%")
            .append("div")
            .attr("id", "AMView_map_container")
            .style("visibility", "inherit")
            .attr("class", "canvas_container");

        var modeContainerUseMiddle = thisModeVisContainer.append("div")
            .style("visibility", "inherit")
            // .style("background", d3.rgb(30,25,53,1))
            .attr("id", "modeVisContainerAnalyticsAMViewContainerMiddleContainer");


  /*  var timelineControlsDiv = modeContainerUseMiddle.append("div")
            .style("float", "left")
            .style("position", "relative")
            .style("top", "-20px")
            .style("height", "20px");
*/
   /*     timelineControlsDiv.append("div")
            .style("float", "left")
            // 	.style("position", "relative")
            // .style("top", "-20px")
            .text("Timeline");*/

      /*  timelineControlsDiv
            .append("span")
            .style("float", "left")
            // .style("position", "relative")
            // .style("left", "10")
            // .style("top", "-20px")
            .attr("id", "AMViewTimelinePlayStopIcon")
            .attr("class", "ui-icon ui-icon-play")
            .on("click", function() {

                if (d3.select(this).attr("class") == "ui-icon ui-icon-play") {
                    that.matrixViewer.playing = true;
                    d3.select(this).attr("class", "ui-icon ui-icon-stop");
                    that.matrixViewer.updateBrushExtentPlaying(that.matrixViewer);
                } else {
                    that.matrixViewer.playing = false;
                    d3.select(this).attr("class", "ui-icon ui-icon-play");

                }
            });
*/
        var modeContainerUseRight = thisModeVisContainer.append("div")
            .style("visibility", "inherit")
            .attr("id", "modeVisContainerAnalyticsAMViewContainerRightContainer");

        var analyticsContainer = modeContainerUseRight
            .append("div")
            .attr("id", "modeVisContainerAnalyticsAMViewAnalyticsContainer");

        //Load Matrices


        //  Map viewer.
        this.mapContainerId = 'AMView_map_container';
        this.mapViewer =
            new MapViewerAnalyticsAMView(dataManager, this.mapContainerId, MapStyles.MAP_STYLE_DARK_NAME);

        this.mapViewer.setActive(true);
        this.mapViewer.analyticsContainer = analyticsContainer;

        this.matrixViewer = new AMViewMatrixViewer(dataManager, 'modeVisContainerAnalyticsAMViewContainerMiddleContainer');
        this.matrixViewer.setActive(true);

        this.mapViewer.matrixViewer = this.matrixViewer;
        this.matrixViewer.mapViewer = this.mapViewer;
        this.matrixViewer.analyticsContainer = analyticsContainer;




        modeContainerUseLeft.select(".canvas_container")
            .style("visibility", "inherit");
        modeContainerUseMiddle
            .style("visibility", "inherit");



        //Middle side stuff


        // Creates svg container.
        var svgWidth = d3.select('#modeVisContainerAnalyticsAMViewContainerMiddleContainer')[0][0].clientWidth - this.matrixViewer.matrixLeft;

        var canvasWidth = svgWidth - 20;

        var svgDiv = modeContainerUseMiddle.selectAll('#AMViewSvgDiv').data(['AMViewSvgDiv']).enter().append('div');
        svgDiv
            .attr("id", "AMViewSvgDiv")
            .style("position", "relative")
            // .style("height", (svgHeight + that.matrixTop) + "px")
            .style("height" , "20px")
            // .style("width", svgWidth + "px")
            .style("width" , "100%")
            .style("left", this.matrixViewer.matrixLeft + "px")
            .style("top", "20px");

        var timeSvg = svgDiv.append('div')
            .attr("id","timeSVG")
            .attr("width","100%");


        var otherSvg = svgDiv.append('svg')
                .attr("height" , "20px")
                // .style("height" , "960px")
                // .style("width" , "955px")
                .attr("width" , "100%")
            ;


        var g = otherSvg.selectAll('#AMViewSvgGroup').data(['g']);
        g.enter().append('g')
            .style("visibility", "inherit")
            .attr("id", "AMViewSvgGroup")
            .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

        var beginDate = new Date(1374292800000);
        beginDate.setHours(0);
        var endDate = new Date(1374379200000);
        endDate.setHours(0);


        var xScale = d3.time.scale().domain([beginDate, endDate]).range([0, canvasWidth]);

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .tickFormat(d3.time.format('%H'))
            .orient("bottom");

        var matrixAxis = g.selectAll('.AMmatrixAxis').data(['matrixAxis']);
        matrixAxis.enter().append("g")
            .attr("class", "AMmatrixAxis")
            .attr("transform", "translate(0, 0)");
        matrixAxis
            .call(xAxis);

        //Setting axis style
        matrixAxis.selectAll("path")
            .style({"stroke":"black","stroke-width":"1px","fill":"none"});



        var slider = svgDiv
            .append('div')
            .attr("id", "AMslider")
            .style("width", "98%");

        var that = this;

        $(function() {
            $( "#AMslider" ).slider({
                range: true,
                min: 0,
                max: 24,
                values: [ 0, 24 ],
                stop: function( event, ui ) {

                    that.matrixViewer.startHour = ui.values[0];
                    that.matrixViewer.endHour = ui.values[1];

                    that.matrixViewer.createMatrix();
                    // console.log(ui.values[ 0 ]);
                    // that.mapViewer.mapGLRenderer.upSelectedMin = ui.values[ 0 ];
                    // that.mapViewer.mapGLRenderer.upSelectedMax = ui.values[ 1 ];


                    //     that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
                    // that.mapViewer.mapGLRenderer.render_();
                    // console.log("stop");
                },

                slide: function(event,ui)
                {


                }
            });
            // $( "#calendarViewMinValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 0 ], that.matrixViewer.variable));
            // $( "#calendarViewMaxValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 1 ], that.matrixViewer.variable));
            // that.mapViewer.mapGLRenderer.upSelectedMin = $( "#upRangeSlider" ).slider( "values", 0 );
            // that.mapViewer.mapGLRenderer.upSelectedMax = $( "#upRangeSlider" ).slider( "values", 1 );
        });




        // right side stuff

        var that = this;

        var toggleamDayOfWeek = function (day, dayNumber) {
            // console.log("toggleamDayOfWeek: " + day);
            d3.select("#amDaysOfTheWeekPeriodLabel").style("font-weight", "bold");
            d3.select("#amDaysOfTheWeekDayLabel").style("font-weight", "normal");
            // $("#amViewMatrixDatepicker").setDate(null);
            that.matrixViewer.tripsDayOfWeek = dayNumber;

            // that.matrixViewer.reorderLines();
            // that.matrixViewer.updateRankingLists();

            that.matrixViewer.updateMatrix();
        }

        var div = analyticsContainer.append("div")
            .style("border", "1px solid rgb(190, 190, 190)")
            .style("height", "300px")
            .style("margin", "10px")
            .style("padding", "10px");

        var div2 = div.append("div")
            .style("float", "left")
            .style("height", "20px");

        div2
            .append("label")
            // .style("color", "gray")
            .style("float", "left")
            .attr("id", "amDaysOfTheWeekPeriodLabel")
            // .style("font-weight", "bold")
            .text("Period: ");

        var variableOptions = div2.append("select")
            .attr("name", "period")
            .style("position", "relative")
            // .attr("disabled", true)
            .style("left", "5px")
            .style("top", "-3px")
            .attr("id", "analyticsAMViewPeriod")
            .on("change", function() {
                d3.select("#amDaysOfTheWeekPeriodLabel").style("font-weight", "bold");
                d3.select("#amDaysOfTheWeekDayLabel").style("font-weight", "normal");

                // that.matrixViewer.period = this.value.split(" ")[0];
                that.matrixViewer.period = this.value;
                that.matrixViewer.dataManager_.getStationsPeriodTrips(that.matrixViewer, that.matrixViewer.period);
            });





        div2 = div.append("div")
            .style("float", "right")
            .style("height", "20px");

        div2
            .append("label")
            .style("color", "black")
            .style("float", "left")
            .attr("id", "amDaysOfTheWeekDayLabel")
            .style("font-weight", "bold")
            .text("Day: ");

        var datepicker = div2.append("input")
            .style("position", "relative")
            .style("left", "5px")
            .style("top", "-3px")
            .attr("id", "amViewMatrixDatepicker");

        $(function() {
            $( "#amViewMatrixDatepicker" ).datepicker({
                dateFormat: "mm/dd/yy",
                defaultDate: "08/01/2013",
                onClose: function( selectedDate ) {
                    // console.log(selectedDate);
                    that.matrixViewer.calendarDay = selectedDate.split("/").join("-");
                    // that.matrixViewer.dataManager_.getDayActivity(that.matrixViewer, selectedDate.split("/").join("-"));
                    that.matrixViewer.dataManager_.getStationsDayTrips(that.matrixViewer, selectedDate.split("/").join("-"));

                    d3.select("#amDaysOfTheWeekPeriodLabel").style("font-weight", "normal");
                    d3.select("#amDaysOfTheWeekDayLabel").style("font-weight", "bold");
                    d3.selectAll(".amDayOfWeekButtom").style("font-weight", "normal");
                }
            });
        });

        // var periodOptions = ["06 2013", "08 2013", "09 2013", "10 2013", "11 2013", "12 2013", "01 2014", "02 2014", "Summer 2013", "Fall 2013", "Winter 2013", "All"];

        // d3.select("#analyticsAMViewPeriod").selectAll(".periodOption").data(periodOptions).enter()
        //   .append("option")
        //     .attr("class", "variableOption")
        //     .attr("value", function(d) {return d;})
        //     .text(function(d) {return d;});

        div2 = div.append("div")
            .style("clear", "both")
            .style("height", "20px");

        div2
            .append("label")
            // .style("color", "gray")
            .style("float", "left")
            .attr("id", "amTripOrderLabel")
            // .style("font-weight", "bold")
            .text("Order By: ");





        var orderValues = ["name","capacity","latitude","longitude","out_trips","in_trips","n_trips","cyclic_trips","n_origins","n_destionations","n_origins_dest","outages","full_outages","empty_outages","trip_duration","balance"];
        var orderOptions = div2.append("select")
            .attr("name", "order")
            .style("position", "relative")
            // .attr("disabled", true)
            .style("left", "5px")
            .style("top", "-3px")
            .attr("id", "analyticsAMViewTripsOrder")
            .on("change", function() {
                // clearTimeout(timeout);

                that.matrixViewer.ordersValue = this.value;
                that.matrixViewer.orderMatrix();
            });;

        orderOptions.selectAll("option")
            .data(orderValues)
            .enter()
            .append("option")
            .text(function(d){return d;})
            .attr("value",function(d){return d;});



        //Display variable



        div2 = div.append("div")
            // .style("position", "relative")
            // .style("left", "5px")
            // .style("top", "8px")
            .style("clear", "both")
            .style("height", "10px")

            .style("padding", "5px");

        div2
            .append("label")
            // .style("color", "gray")
            .style("float", "left")
            .attr("id", "amTripOrderLabel")
            // .style("font-weight", "bold")
            .text("Display Variable: ");

        var displayValues = ["ntrips","tripDuration","outages_diff","full_outages_diff","empty_outages_diff","balance_diff","capacity_diff"];
        var displayOptions = div2.append("select")
            .attr("name", "order")
            .style("position", "relative")
            // .attr("disabled", true)
            .style("left", "5px")
            .style("top", "-3px")
            .attr("id", "analyticsAMViewTripsDisplay")
            .on("change",function (){
                that.matrixViewer.displayProperty = this.value;
                that.matrixViewer.createMatrix();
            });

        displayOptions.selectAll("option")
            .data(displayValues)
            .enter()
            .append("option")
            .text(function(d){return d;})
            .attr("value",function(d){return d;});

        div2 = div.append("div")
            // .style("position", "relative")
            // .style("left", "5px")
            // .style("top", "8px")
            .style("clear", "both")
            .style("height", "10px")

            .style("padding", "5px");




        //ColorScale divs
        var colorScaleWidth = 220;
        var colorScaleHeight = 10;

        var div2 = div.append("div")
            .style("position", "relative")
            // .style("top", "-8px")
            .style("left", "-5px")
            .style("width", colorScaleWidth + "px");

        div2.append("label")
            .style("position", "relative")
            // .style("top", "-20px")
            .style("float", "left")
            .style("color", "black")
            .attr("id", "amViewMinValueLabel")
            .attr("for", "minValue")
            .text("0");

        div2.append("label")
            .style("position", "relative")
            // .style("top", "-20px")
            .style("float", "right")
            .style("color", "black")
            .attr("id", "amViewMaxValueLabel")
            .attr("for", "maxValue")
            .text("100");





        var colorScale = div
            .append("div")
            .attr("id", "AMViewColorScale")
            .style("float", "left")
            .style("height", colorScaleHeight + "px")
            .style("width", "100%");


        var colorScaleOptions = colorScale.append("select")
            // var colorScaleOptions = div.append("select")
            .style("clear", "both")
            .style("position", "relative")
            .style("top", "-8px")
            .style("left", "10px")
            .attr("name", "colorScale")
            .attr("id", "analyticsAMViewColorScaleOptions")
            .on("change", function() {
                // console.log(this.value);
                that.matrixViewer.actualPropertyColorScale = that.matrixViewer.colorScales[this.value];
                that.matrixViewer.updateColorScale();
            });


        div2 = div.append("div")
            .style("clear", "both")
            .style("height", "15px");


        div2 = div
            .append("label")
            // .style("color", "gray")
            .style("float", "left")
            .attr("id", "amSelectLabel")
            // .style("font-weight", "bold")
            .text("AutoSelection: ");

        div2 = div
            .append("input")
            // .style("color", "gray")
            .attr("id", "amSelectCheckbox")
            .attr("type","checkbox")
            .on("click",function(event){

                if(this.checked)
                {
                    that.matrixViewer.autoSelection = true;

                    d3.select(".amSliderDiv").style("visibility","visible");
                }
                else
                {
                    that.matrixViewer.autoSelection = false;
                    d3.select(".amSliderDiv").style("visibility","hidden");
                    console.log("clicked");
                }

                that.matrixViewer.createMatrix();

            });




        div2 = div.append("div")
            .style("clear", "both")
            .style("height", "10px");

        var div2 = div.append("div")
            .classed("amSliderDiv",true)
            .style("visibility","hidden")
            .style("position", "relative")
            .style("height","20px")
            .style("left", "-5px")
            .style("width", colorScaleWidth + "px");

        div2.append("label")
            .style("position", "relative")
            // .style("top", "-20px")
            .style("float", "left")
            .style("color", "black")
            .style("visibility", "inherit")
            .attr("id", "amSelectMinValueLabel")
            .attr("for", "minValue")
            .text("80%");

        div2.append("label")
            .style("position", "relative")
            // .style("top", "-20px")
            .style("float", "right")
            .style("color", "black")
            .style("visibility", "inherit")
            .attr("id", "amSelectMaxValueLabel")
            .attr("for", "maxValue")
            .text("100%");

      div2.append("div")
          .style("clear", "both")
            .style("height", "10px");

        var colorScaleRangeSlider = div2
            .append("div")
            .style("clear", "both")
            .style("visibility", "inherit")
            .style("width", "208px")
            // .style("position", "relative")
            // .style("top", "8px")
            .attr("id", "amSelectSlider");

        $(function() {
            $( "#amSelectSlider" ).slider({
                range: true,
                min: 0,
                step:10,
                max: 100,
                values: [ 80, 100 ],
                slide: function( event, ui ) {

                    $( "#amSelectMinValueLabel" ).text( ui.values[ 0 ])+"%";
                    $( "#amSelectMaxValueLabel" ).text( ui.values[ 1 ]+"%");

                },
                stop: function( event, ui ) {

                    var minValue = ui.values[ 0 ];
                    var maxValue =  ui.values[ 1 ];
                    $( "#amSelectMinValueLabel" ).text(minValue +"%");
                    $( "#amSelectMaxValueLabel" ).text(maxValue+"%");

                    that.matrixViewer.selectionMinValue = minValue;
                    that.matrixViewer.selectionMaxValue = maxValue;

                    that.matrixViewer.updateAutoSelection();


                }
            });

        });







        div2 = div.append("div")
            .style("height", "10px")
            .style("clear", "both");



        div2 = div.append("div")
            // .style("position", "relative")
            // .style("left", "5px")
            // .style("top", "8px")
            .style("clear", "both")
            .style("height", "60px")
            .style("padding", "10px");

        div2.selectAll(".amDayOfWeekButtom").data(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
            "Saturday", "Sunday", "Weekdays", "Weekend"])
            .enter().append("div")
            .attr("id", function (d) { return d + "Button";})
            .attr("class", "amDayOfWeekButtom")
            .style("background", "white")
            .style("font-weight", function (d) {
                if (d == "Monday") {
                    return "bold";
                } else {
                    return "normal";
                }
            })
            // .style("border", "1px double")
            // .style("border-color", "gray")
            .style("cursor", "pointer")
            .style("padding", "5px")
            .style("float", "left")
            .style("text-align", "center")
            // .style("color", "gray")
            .on("click", function (d,i) {

                // return;

                if (d == "Weekdays") {
                    d3.select("#MondayButton").style("font-weight", "bold");
                    d3.select("#TuesdayButton").style("font-weight", "bold");
                    d3.select("#WednesdayButton").style("font-weight", "bold");
                    d3.select("#ThursdayButton").style("font-weight", "bold");
                    d3.select("#FridayButton").style("font-weight", "bold");
                    d3.select("#SaturdayButton").style("font-weight", "normal");
                    d3.select("#SundayButton").style("font-weight", "normal");
                } else if (d == "Weekend") {
                    d3.select("#MondayButton").style("font-weight", "normal");
                    d3.select("#TuesdayButton").style("font-weight", "normal");
                    d3.select("#WednesdayButton").style("font-weight", "normal");
                    d3.select("#ThursdayButton").style("font-weight", "normal");
                    d3.select("#FridayButton").style("font-weight", "normal");
                    d3.select("#SaturdayButton").style("font-weight", "bold");
                    d3.select("#SundayButton").style("font-weight", "bold");
                } else {
                    // if (d3.select(this).style("font-weight") == "bold") {
                    // 	return;
                    // } else {
                    d3.selectAll(".amDayOfWeekButtom").style("font-weight", "normal");
                    d3.select(this).style("font-weight", "bold");
                    // };
                }
                toggleamDayOfWeek(d, i);
            })
            .text(function (d) { return d;});





        div2 = div.append("div")
            // .style("position", "relative")
            // .style("left", "5px")
            // .style("top", "8px")
            .style("clear", "both")
            .style("height", "5px")
            .style("padding", "5px");

             div2
            .append("label")
            // .style("color", "gray")
            .style("float", "left")
            .attr("id", "amResLabel")
            // .style("font-weight", "bold")
            .text("Resolution: ");


        div2 = div.append("div")
            // .style("position", "relative")
            // .style("left", "5px")
            // .style("top", "8px")
            .style("clear", "both")
            .style("height", "10px")
            .style("padding", "10px");


        var slider = div2
            .append('div')
            .attr("id", "resSlider")
            .style("width", "100%");

        //Calculate aprox res

        var smin = 512, smax =6144;
        var width = modeContainerUseMiddle.style("width");
        /*var pow2 = Math.trunc(Math.log(parseInt(width,10))/Math.LN2);
        var sliderValue = pow2<smin || pow2>smax ? smin : pow2;*/

        $(function() {
            $( "#resSlider" ).slider({

                min: smin,
                max: smax,
                step: 256,
                value: parseInt(width,10),
                stop: function( event, ui ) {


                    that.matrixViewer.matrixWidth = ui.value;
                    that.matrixViewer.createMatrix();
                    // console.log(ui.values[ 0 ]);
                    // that.mapViewer.mapGLRenderer.upSelectedMin = ui.values[ 0 ];
                    // that.mapViewer.mapGLRenderer.upSelectedMax = ui.values[ 1 ];


                    //     that.mapViewer.mapGLRenderer.createStreetsFlowRepresentations_();
                    // that.mapViewer.mapGLRenderer.render_();
                    // console.log("stop");
                },

                slide: function(event,ui)
                {


                }
            });
            // $( "#calendarViewMinValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 0 ], that.matrixViewer.variable));
            // $( "#calendarViewMaxValueLabel" ).text( that.matrixViewer.getFormatedValue(ui.values[ 1 ], that.matrixViewer.variable));
            // that.mapViewer.mapGLRenderer.upSelectedMin = $( "#upRangeSlider" ).slider( "values", 0 );
            // that.mapViewer.mapGLRenderer.upSelectedMax = $( "#upRangeSlider" ).slider( "values", 1 );
        });






        div = analyticsContainer.append("div")
            .style("border", "1px solid rgb(190, 190, 190)")
            .style("margin", "10px")
            .style("clear", "both")
            .style("height", "640px")
            .style("padding", "10px");



        div = div.append("div")
            .style("padding", "10px");

        div2 = div.append("div")
            .style("border", "1px solid rgb(230, 230, 230)")
            // .style("margin-top", "5px")
            // .style("margin-top", "10px")
            .style("clear", "both")
            .style("height", "230px")
            .style("padding", "5px");
        // .style("padding-top", "10px");

        div3 = div2.append("div")
            .style("height", "20px");

      /*  div3
            .append("label")
            .style("color", "black")
            .style("float", "left")
            .attr("for", "variables")
            .text("Display:");

        div3 = div3.append("div")
            .style("clear", "both")
            .style("padding", "10px")
            .style("height", "150px");

        var div4 = div3.append("div")
            .style("float", "left")
            // .style("clear", "both")
            .style("width", "150px")
            .style("height", "20px");

        var viewIncomingamOption = div4.append("input")
            .attr("name", "incomingam")
            .attr("type", "checkbox")
            .style("float", "left")
            .attr("checked", true)
            .attr("id", "incomingam");

        $( "#incomingam" ).on( "click", function( event ) {
            // console.log(event.currentTarget.checked);
            that.matrixViewer.viewIncomingam = event.currentTarget.checked;
            that.matrixViewer.createMatrix();
            that.matrixViewer.updatedTripsInTheMap();
        });

        div4
            .append("label")
            .style("color", "red")
            .style("float", "left")
            .attr("for", "incomingam")
            .text("Incoming Trip");

        div4 = div3.append("div")
            .style("float", "left")
            .style("width", "150px")
            .style("height", "20px");

        var viewOutgoingamOption = div4.append("input")
            .attr("name", "outgoingam")
            .attr("type", "checkbox")
            .style("float", "left")
            .attr("checked", true)
            .attr("id", "outgoingam");

        $( "#outgoingam" ).on( "click", function( event ) {
            // console.log(event.currentTarget.checked);
            that.matrixViewer.viewOutgoingam = event.currentTarget.checked;
            that.matrixViewer.createMatrix();
            that.matrixViewer.updatedTripsInTheMap();
        });

        div4
            .append("label")
            .style("color", "blue")
            .style("float", "left")
            .attr("for", "outgoingam")
            .text("Outgoing trip");



        div4 = div3.append("div")
            .style("float", "left")
            .style("width", "150px")
            .style("height", "20px");

        var viewCyclicamOption = div4.append("input")
            .attr("name", "cyclicam")
            .attr("type", "checkbox")
            .style("float", "left")
            .attr("checked", true)
            .attr("id", "cyclicam");

        $( "#cyclicam" ).on( "click", function( event ) {
            // console.log(event.currentTarget.checked);
            that.matrixViewer.viewCyclicam = event.currentTarget.checked;
            that.matrixViewer.createMatrix();
            that.matrixViewer.updatedTripsInTheMap();
        });

        div4
            .append("label")
            .style("color", "black")
            .style("float", "left")
            .attr("for", "cyclicam")
            .text("Cyclic am");

        div4 = div3.append("div")
            .style("float", "left")
            .style("width", "150px")
            .style("height", "20px");

        var viewamDurationOption = div4.append("input")
            .attr("id", "amDuration")
            .attr("type", "checkbox")
            // .attr("disabled", true)
            .style("float", "left");

        div4
            .append("label")
            .style("color", "black")
            .style("float", "left")
            .attr("for", "amDuration")
            .text("Trip duration");

        $( "#amDuration" ).on( "click", function( event ) {
            // console.log(event.currentTarget.checked);
            that.matrixViewer.viewamDuration = event.currentTarget.checked;
            if (that.matrixViewer.viewamDuration) {
                that.matrixViewer.viewamDistance = false;
                $( "#amDistance" ).attr("checked", false);
            }

            that.matrixViewer.createMatrix();
        });

        div4 = div3.append("div")
            .style("float", "left")
            .style("width", "150px")
            .style("height", "20px");

        var viewamDistanceOption = div4.append("input")
            .attr("id", "amDistance")
            .attr("type", "checkbox")
            .attr("checked", true)
            // .attr("disabled", true)
            .style("float", "left");

        $( "#amDistance" ).on( "click", function( event ) {
            // console.log(event.currentTarget.checked);
            that.matrixViewer.viewamDistance = event.currentTarget.checked;
            if (that.matrixViewer.viewamDistance) {
                that.matrixViewer.viewamDuration = false;
                $( "#amDuration" ).attr("checked", false);
            }
            that.matrixViewer.createMatrix();
        });

        div4
            .append("label")
            // .style("color", "gray")
            .style("float", "left")
            .attr("for", "amDistance")
            .text("am distance");

        div4 = div3.append("div")
            .style("float", "left")
            .style("width", "150px")
            .style("height", "20px");

        var viewOutagesOption = div4.append("input")
            .attr("name", "outages")
            .attr("type", "checkbox")
            .style("float", "left")
            .attr("checked", true)
            .attr("id", "outages");

        $( "#outages" ).on( "click", function( event ) {
            // console.log(event.currentTarget.checked);
            that.matrixViewer.viewOutages = event.currentTarget.checked;
            that.matrixViewer.createMatrix();
        });

        div4
            .append("label")
            .style("color", "black")
            .style("float", "left")
            .attr("for", "outagesam")
            .text("Outages");*/

        div3 = div2.append("div")
            .style("clear", "both")
            // .style("padding", "10px")
            .style("height", "20px");

    /*    div3
            .append("label")
            .style("color", "black")
            .style("float", "left")
            .style("position", "relative")
            // .style("top", "-2px")
            .attr("for", "ordering")
            .text("Order:");*/

        var orderingOptions = div3.append("select")
            .attr("name", "ordering")
            .style("float", "left")
            .style("position", "relative")
            .style("left", "10px")
            .style("visibility","hidden")
            .attr("id", "analyticsAMViewOrdering")
            .on("change", function() {

                that.matrixViewer.ordering = this.value;

                if (that.matrixViewer.displayAndOrderLocked && that.matrixViewer.ordering.split(':')[0] != "Station") {
                    that.matrixViewer.variable = that.matrixViewer.variableNametoKeyMap[that.matrixViewer.ordering.split(':')[0]];
                    // 		that.matrixViewer.reorderLines();
                    // that.matrixViewer.updateRankingLists();
                }

                for (stationIndex in that.matrixViewer.stations) {
                    that.matrixViewer.stations[stationIndex].orderHistory = [];
                }

                // if (that.matrixViewer.ordering.split(':')[0] != that.matrixViewer.variableKeyToNameMap[that.matrixViewer.variable]) {
                // 	that.matrixViewer.displayAndOrderLocked = false;
                // 	d3.select("#amDaysOfWeekModelsDisplayAndOrderLockIcon").attr("class", "ui-icon ui-icon-unlocked");
                // }

                that.matrixViewer.reorderLines();

                // that.matrixViewer.actualOrderingList = that.matrixViewer.orderLists[that.matrixViewer.ordering];

                that.matrixViewer.updateRankingLists();
                that.matrixViewer.updateMatrix();
                that.matrixViewer.updatedamInTheMap();
            });

/*

        div3 = div2.append("div")
            .style("clear", "both")
            // .style("padding", "10px")
            .style("height", "20px");

        div3
            .append("label")
            .style("color", "black")
            .style("float", "left")
            .style("position", "relative")
            // .style("top", "-2px")
            .text("Filter:");

        div3 = div2.append("div")
            .style("clear", "both")
            // .style("padding", "10px")
            .style("height", "25px");

        div3.append("label")
            .style("position", "relative")
            .style("left", "10px")
            .style("float", "left")
            .style("color", "black")
            .text("Trip distance:");

        div4 = div3.append("div")
            // .style("clear", "both")
            .style("left", "60px")
            .style("float", "left")
            .style("width", "250px")
            .style("height", "20px");

        div4.append("label")
            .style("position", "relative")
            // .style("top", "-15px")
            // .style("float", "left")
            .style("left", "-70px")
            .style("color", "black")
            .attr("id", "AMViewFilterDistanceMinValueLabel")
            .attr("for", "minValue")
            .text("0 m");

        var filterDistanceRangeSlider = div4
            .append("div")
            .style("width", "100px")
            .style("position", "relative")
            // .style("top", "10px")
            .style("left", "90px")
            .style("float", "left")
            .attr("id", "amDayOfWeekFilterDistanceValueRangeSlider");

        $(function() {
            $( "#amDayOfWeekFilterDistanceValueRangeSlider" ).slider({
                range: true,
                min: 0,
                max: 14000,
                values: [ 0, 14000 ],
                slide: function( event, ui ) {

                    $( "#AMViewFilterDistanceMinValueLabel" ).text( ui.values[ 0 ] + " m");
                    $( "#AMViewFilterDistanceMaxValueLabel" ).text( ui.values[ 1 ] + " m");
                    that.matrixViewer.actualDistanceMinValue = ui.values[ 0 ];
                    that.matrixViewer.actualDistanceMaxValue = ui.values[ 1 ];
                    // that.matrixViewer.updateMatrix();
                },
                stop: function( event, ui ) {

                    $( "#AMViewFilterDistanceMinValueLabel" ).text( ui.values[ 0 ] + " m");
                    $( "#AMViewFilterDistanceMaxValueLabel" ).text( ui.values[ 1 ] + " m");
                    that.matrixViewer.actualDistanceMinValue = ui.values[ 0 ];
                    that.matrixViewer.actualDistanceMaxValue = ui.values[ 1 ];
                    that.matrixViewer.updateMatrix();
                    that.matrixViewer.updatedamInTheMap();

                    // that.matrixViewer.updateRangeSliderLimits = false;
                    // that.matrixViewer.createMatrix();


                }
            });

        });


        div4.append("label")
            .style("position", "relative")
            .style("left", "85px")
            // .style("float", "right")
            .style("color", "black")
            .attr("id", "AMViewFilterDistanceMaxValueLabel")
            .attr("for", "maxValue")
            .text("14000 m");



        div3 = div2.append("div")
            .style("clear", "both")
            // .style("padding", "10px")
            .style("height", "25px");

        div3.append("label")
            .style("position", "relative")
            .style("left", "10px")
            .style("float", "left")
            .style("color", "black")
            .text("Trip duration:");

        div4 = div3.append("div")
            // .style("clear", "both")
            .style("left", "60px")
            .style("float", "left")
            .style("width", "250px")
            .style("height", "20px");

        div4.append("label")
            .style("position", "relative")
            // .style("top", "-15px")
            // .style("float", "left")
            .style("left", "-70px")
            .style("color", "black")
            .attr("id", "AMViewFilterDurationMinValueLabel")
            .attr("for", "minValue")
            .text("0 min");



        var filterDistanceRangeSlider = div4
            .append("div")
            .style("width", "100px")
            .style("position", "relative")
            // .style("top", "10px")
            .style("left", "90px")
            .style("float", "left")
            .attr("id", "amDayOfWeekFilterDurationValueRangeSlider");

        $(function() {
            $( "#amDayOfWeekFilterDurationValueRangeSlider" ).slider({
                range: true,
                min: 0,
                max: 7200,
                values: [ 0, 7200 ],
                slide: function( event, ui ) {

                    $( "#AMViewFilterDurationMinValueLabel" ).text( Math.floor(ui.values[ 0 ]/60) + " min");
                    $( "#AMViewFilterDurationMaxValueLabel" ).text( Math.floor(ui.values[ 1 ]/60) + " min");
                    that.matrixViewer.actualDurationMinValue = ui.values[ 0 ];
                    that.matrixViewer.actualDurationMaxValue = ui.values[ 1 ];
                    // that.matrixViewer.updateMatrix();
                },
                stop: function( event, ui ) {

                    $( "#AMViewFilterDurationMinValueLabel" ).text( Math.floor(ui.values[ 0 ]/60) + " min");
                    $( "#AMViewFilterDurationMaxValueLabel" ).text( Math.floor(ui.values[ 1 ]/60) + " min");
                    that.matrixViewer.actualDurationMinValue = ui.values[ 0 ];
                    that.matrixViewer.actualDurationMaxValue = ui.values[ 1 ];
                    that.matrixViewer.updateMatrix();
                    that.matrixViewer.updatedamInTheMap();

                    // that.matrixViewer.updateRangeSliderLimits = false;
                    // that.matrixViewer.createMatrix();


                }
            });

        });

        div4.append("label")
            .style("position", "relative")
            // .style("top", "-15px")
            .style("left", "75px")
            .style("color", "black")
            .attr("id", "AMViewFilterDurationMaxValueLabel")
            .attr("for", "maxValue")
            .text("120 min");

        div3 = div2.append("div")
            .style("clear", "both")
            // .style("padding", "10px")
            .style("height", "25px");

        div3.append("label")
            .style("position", "relative")
            .style("left", "10px")
            .style("float", "left")
            .style("color", "black")
            .text("Trip direction:");

        div4 = div3.append("div")
            // .style("clear", "both")
            .style("left", "60px")
            .style("float", "left")
            .style("width", "250px")
            .style("height", "20px");

        div4.append("label")
            .style("position", "relative")
            // .style("top", "-15px")
            // .style("float", "left")
            .style("left", "-70px")
            .style("color", "black")
            .attr("id", "AMViewFilterDirectionMinValueLabel")
            .attr("for", "minValue")
            .text("0 °");



        var filterDistanceRangeSlider = div4
            .append("div")
            .style("width", "100px")
            .style("position", "relative")
            // .style("top", "10px")
            .style("left", "90px")
            .style("float", "left")
            .attr("id", "amDayOfWeekFilterDirectionValueRangeSlider");

        $(function() {
            $( "#amDayOfWeekFilterDirectionValueRangeSlider" ).slider({
                range: true,
                min: 0,
                max: 360,
                values: [ 0, 360 ],
                slide: function( event, ui ) {

                    $( "#AMViewFilterDirectionMinValueLabel" ).text( ui.values[ 0 ] + " °");
                    $( "#AMViewFilterDirectionMaxValueLabel" ).text( ui.values[ 1 ] + " °");
                    that.matrixViewer.actualDirectionMinValue = ui.values[ 0 ];
                    that.matrixViewer.actualDirectionMaxValue = ui.values[ 1 ];
                    // that.matrixViewer.updateMatrix();
                },
                stop: function( event, ui ) {

                    $( "#AMViewFilterDirectionMinValueLabel" ).text( ui.values[ 0 ] + " °");
                    $( "#AMViewFilterDirectionMaxValueLabel" ).text( ui.values[ 1 ] + " °");
                    that.matrixViewer.actualDirectionMinValue = ui.values[ 0 ];
                    that.matrixViewer.actualDirectionMaxValue = ui.values[ 1 ];
                    that.matrixViewer.updateMatrix();
                    that.matrixViewer.updatedamInTheMap();

                    // that.matrixViewer.updateRangeSliderLimits = false;
                    // that.matrixViewer.createMatrix();


                }
            });

        });

        div4.append("label")
            .style("position", "relative")
            // .style("top", "-15px")
            .style("left", "95px")
            .style("color", "black")
            .attr("id", "AMViewFilterDirectionMaxValueLabel")
            .attr("for", "maxValue")
            .text("360°");

        div3 = div2.append("div")
            .style("clear", "both")
            // .style("padding", "10px")
            .style("height", "25px");

        div3.append("label")
            .style("position", "relative")
            .style("left", "10px")
            .style("float", "left")
            .style("color", "black")
            .text("OD Flow:");

        div4 = div3.append("div")
            // .style("clear", "both")
            .style("left", "60px")
            .style("float", "left")
            .style("width", "250px")
            .style("height", "20px");

        div4.append("label")
            .style("position", "relative")
            // .style("top", "-15px")
            // .style("float", "left")
            .style("left", "-43px")
            .style("color", "black")
            .attr("id", "AMViewFilterFlowMinValueLabel")
            .attr("for", "minValue")
            .text("0");



        var filterDistanceRangeSlider = div4
            .append("div")
            .style("width", "100px")
            .style("position", "relative")
            // .style("top", "10px")
            .style("left", "120px")
            .style("float", "left")
            .attr("id", "amDayOfWeekFilterFlowValueRangeSlider");

        $(function() {
            $( "#amDayOfWeekFilterFlowValueRangeSlider" ).slider({
                range: true,
                min: 0,
                max: 1000,
                values: [ 0, 1000 ],
                slide: function( event, ui ) {

                    $( "#AMViewFilterFlowMinValueLabel" ).text( ui.values[ 0 ]);
                    $( "#AMViewFilterFlowMaxValueLabel" ).text( ui.values[ 1 ]);
                    that.matrixViewer.actualFlowMinValue = ui.values[ 0 ];
                    that.matrixViewer.actualFlowMaxValue = ui.values[ 1 ];
                    // that.matrixViewer.updateMatrix();
                },
                stop: function( event, ui ) {

                    $( "#AMViewFilterFlowMinValueLabel" ).text( ui.values[ 0 ]);
                    $( "#AMViewFilterFlowMaxValueLabel" ).text( ui.values[ 1 ]);
                    that.matrixViewer.actualFlownMinValue = ui.values[ 0 ];
                    that.matrixViewer.actualFlowMaxValue = ui.values[ 1 ];
                    that.matrixViewer.updateMatrix();
                    that.matrixViewer.updatedamInTheMap();

                    // that.matrixViewer.updateRangeSliderLimits = false;
                    // that.matrixViewer.createMatrix();


                }
            });

        });

        div4.append("label")
            .style("position", "relative")
            // .style("top", "-15px")
            .style("left", "132px")
            .style("color", "black")
            .attr("id", "AMViewFilterFlowMaxValueLabel")
            .attr("for", "maxValue")
            .text("1000");
*/



        div = div.append("div")
            .style("border", "1px solid rgb(230, 230, 230)")
            .style("margin-top", "10px")
            .style("height", "360px")
            .style("clear", "both")
            .style("padding", "5px")
            .style("padding-top", "20px");

      /*  div
            .append("label")
            .style("color", "black")
            .text("Ranking");

        div = div.append("div")
            .style("clear", "both")
            .style("padding-top", "20px");

        var divLeft = div.append("div")
            .style("padding", "5px")
            .style("background", function() {
                // var scaleColor = that.matrixViewer.actualPropertyColorScale(
                // 	that.matrixViewer.actualPropertyColorScale.domain()[that.matrixViewer.actualPropertyColorScale.domain().length - 1]
                // );
                // var newColor = d3.hsl(scaleColor);
                // newColor.l = 0.9;
                // return newColor;
                return "white";
            })
            .style("float", "left")
            .style("width", "45%");
        // .style("padding-top", "20px");

        divLeft
            .append("label")
            .style("color", "black")
            .text("Top: ");

        divLeft
            .append("div")
            .attr("id", "amDaysOfWeekModelsTopStationsList")
            .style("padding", "5px")
            .style("height", "280px")
            .style("overflow-y", "scroll")
            .style("background", function() {
                // var scaleColor = that.matrixViewer.actualPropertyColorScale(
                // 	that.matrixViewer.actualPropertyColorScale.domain()[that.matrixViewer.actualPropertyColorScale.domain().length - 1]
                // );
                // var newColor = d3.hsl(scaleColor);
                // newColor.l = 0.9;
                // return newColor;
                return "white";
            });

        var divRight = div.append("div")
            .style("padding", "5px")
            .style("background", function() {
                // var scaleColor = that.matrixViewer.actualPropertyColorScale(
                // 	that.matrixViewer.actualPropertyColorScale.domain()[0]
                // );
                // var newColor = d3.hsl(scaleColor);
                // newColor.l = 0.9;
                // return newColor;
                return "white";
            })
            .style("float", "right")
            .style("width", "45%");
        // .style("padding-top", "20px");

        divRight
            .append("label")
            .style("color", "black")
            .text("Last: ");

        divRight
            .append("div")
            .attr("id", "amDaysOfWeekModelsLastStationsList")
            .style("padding", "5px")
            .style("height", "280px")
            .style("overflow-y", "scroll")
            .style("background", function() {
                // var scaleColor = that.matrixViewer.actualPropertyColorScale(
                // 	that.matrixViewer.actualPropertyColorScale.domain()[0]
                // );
                // var newColor = d3.hsl(scaleColor);
                // newColor.l = 0.9;
                // return newColor;
                return "white";
            });

        div = analyticsContainer.append("div")
            .style("border", "1px solid rgb(190, 190, 190)")
            .style("margin", "10px")
            .style("height", "160px")
            .style("clear", "both")
            .style("padding", "0px");

        // div
        // 	.append("label")
        // 	.style("color", "black")
        // 	.text("Selection information");

        div = div.append("div");
        // .style("border", "1px solid rgb(190, 190, 190)")
        // .style("margin", "10px")
        // .style("height", "240px")
        // .style("clear", "both")
        // .style("padding", "10px");

        divLeft = div.append("div")
            .style("float", "left")
            .style("height", "130px")
            .style("width", "30%")
            .style("padding", "5px");

        var divInfoCursor = divLeft.append("div")
            .style("height", "130px")
            .style("padding", "0px");

        divInfoCursor
            .append("label")
            .style("color", "black")
            .attr("for", "selectInfoCursor")
            .text("Cursor:");

        var list = divInfoCursor.append("ul")
            .style("position", "relative")
            .style("left", "-20px");

        list
            .append("li")
            .style("color", "black")
            .style("padding-left", "0px")
            .attr("id", "amDaysOfWeekModelsInfoCursorId")
            .text("Id:");

        list
            .append("li")
            .style("color", "black")
            .style("padding-left", "0px")
            .attr("id", "amDaysOfWeekModelsInfoCursorNumber")
            .text("Number:");

        list
            .append("li")
            .style("color", "black")
            .style("padding-left", "0px")
            .attr("id", "amDaysOfWeekModelsInfoCursorName")
            .text("Name:");

        list
            .append("li")
            .style("color", "black")
            .style("padding-left", "0px")
            .attr("id", "amDaysOfWeekModelsInfoCursorRank")
            .text("Rank:");

        list
            .append("li")
            .style("color", "black")
            .style("padding-left", "0px")
            .attr("id", "amDaysOfWeekModelsInfoCursorRankingValue")
            .text("Ranking value:");

        divRight = div.append("div")
            .style("float", "right")
            .style("width", "60%")
            .style("height", "240px")
            .style("padding", "0px");

        divRight
            .append("label")
            .style("color", "black")
            .text("Brush:");

        // divRight
        //  .append("div")
        //  	.attr("id", "AMViewAreaStationsList")
        //  	.style("padding", "5px")
        //  	.style("overflow-y", "scroll")
        // .style("height", "200px");

        // var divInfoBrush = divLeft.append("div")
        // 	.style("height", "100px")
        // 	.style("width", "300px")
        // 	.style("padding", "0px");

        // divInfoBrush
        // 	.append("label")
        // 	.style("color", "black")
        // 	.attr("for", "selectInfoBrush")
        // 	.text("Brush:");

        list = divRight.append("ul")
            .style("position", "relative")
            .style("left", "-20px");

        list
            .append("li")
            .style("color", "black")
            .style("padding-left", "0px")
            .attr("id", "amDaysOfWeekModelsInfoBrushTimeWindow")
            .text("Time window:");

        list
            .append("li")
            .style("color", "black")
            .style("padding-left", "0px")
            .attr("id", "amDaysOfWeekModelsInfoBrushRowRange")
            .text("Row range:");
*/







    }

}