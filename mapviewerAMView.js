/**
 * Created by jl on 30/05/15.
 */
var MapViewerAnalyticsAMView = function(dataManager, mapContainerId, opt_mapStyle) {
    dataManager.addListener(this);
    // Lazy initialization.
    this.initialized_ = false;

    this.dataManager_ = dataManager;
    this.mapContainerId_ = mapContainerId;
    this.opt_mapStyle_ = opt_mapStyle;

    // this.mapGLRenderer =  new MapGLRendererStationsUsage(dataManager);

    // These containers must be shown/hidden on activation.
    this.visibleContainersId_ = [
        '#' + this.mapContainerId_
    ];

    this.stationsOverlayCreated = false;

};

MapViewerAnalyticsAMView.prototype.setActive = function(active) {
    var mustUpdate = active && !this.active_;
    this.active_ = active;

    // Show/hide containers.
    utils.setVisibility(this.visibleContainersId_, this.active_);

    // Updates map.
    if (mustUpdate) {
        this.update();
    }
};

MapViewerAnalyticsAMView.prototype.update = function() {
    if (!this.dataManager_.hasData() || !this.active_) {
        //return;
    }

    if (!this.initialized_) {
        this.initMap_(this.mapContainerId_, this.opt_mapStyle_);
        //this.mapGLRenderer.initialize(this.map_);
        this.initialized_ = true;
    }

    // TODO Load initial view options based on filters and selections.

    //console.log(this.dataManager_.stationsActivities);

    // this.mapGLRenderer.update();
};

MapViewerAnalyticsAMView.prototype.mouseMove = function(event) {
    // this.getStationFromCoords(event.latLng);
    //console.log(this.selectedStations);
}

MapViewerAnalyticsAMView.prototype.mouseClicked = function(event) {
    //this.getStationFromCoords(event.latLng);
    // this.getSelectedStationsInfo();
}

MapViewerAnalyticsAMView.prototype.initMap_ = function(mapContainerId, opt_mapStyle) {

    var that = this;

    // Creates map.
    var mapOptions = {
        center: new google.maps.LatLng(40.731508, -73.991246),
        zoom: 13,
        //mapTypeId: google.maps.MapTypeId.ROADMAP,
        // mapTypeId: opt_mapStyle ||
        //   MapStyles.MAP_STYLE_BRIGHT_BLUE_NAME,
        mapTypeId: MapStyles.MAP_STYLE_WHITE_LIGHTER_NAME,
        mapTypeControl: false,
        panControl: false,
        streetViewControl: false,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
    };

    this.map_ = new google.maps.Map(
        document.getElementById(mapContainerId), mapOptions);

    var thisMap = this;

    google.maps.event.addListener(this.map_, 'click', function (event) {
        thisMap.mouseClicked(event);
    });

    google.maps.event.addListener(this.map_, 'mousemove', function (event) {
        thisMap.mouseMove(event);
    });

   /* google.maps.event.addListener(this.map_, 'bounds_changed', function() {
        // 3 seconds after the center of the map has changed, pan back to the
        // marker.
        //that.matrixViewer.updatedTripsInTheMap();
    });*/

    // Creates styles for map
    new MapStyles(this.map_);

    // this.distanceWidget = new DistanceWidget(this.map_, this);
    // this.distanceWidget.set('position', new google.maps.LatLng(40.68869765262219, -74.01943203772277));

};

MapViewerAnalyticsAMView.prototype.createStationsLayer = function(stationsInfo) {

    var that = this;

    // that.distanceWidget = new DistanceWidget(that.map_, that);
    // that.distanceWidget.set('position', new google.maps.LatLng(40.68869765262219, -74.01943203772277));

    var overlay = new google.maps.OverlayView();
    // var overlay = that.distanceWidget;

    // console.log("MapViewerAnalyticsTripsView.prototype.createStationsLayer");

    //var data = dataManager.stations;

    // console.log(stationsInfo);

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {

        // console.log("onAdd");

        var data = stationsInfo;

        // var layer = d3.select(this.getPanes().overlayLayer).append("div")
        //   // .attr("position", "absolute")
        //   // .attr("position", "absolute")
        //   // .attr("width", "60px")
        //   // .attr("height", "20px")
        //   // .attr("padding-right", "100px")
        //   // .attr("font", "10px sans-serif")
        //   // .attr('z-index', '10000')
        //   .attr("class", "stations");


        that.mapLayer = d3.select(this.getPanes().overlayImage).append("div").attr("class", "amViewMapTrips");
        var layer = d3.select(this.getPanes().overlayImage).append("div").attr("class", "amViewMapStations");
        // that.mapLayer = layer;

        // Draw each marker as a separate SVG element.
        // We could use a single SVG, but what size would it have?
        overlay.draw = function() {
            var projection = this.getProjection(),
                padding = 10;

            var marker = layer.selectAll("svg")
                .data(data)
                .each(transform) // update existing markers
                .enter().append("svg:svg")
                .each(transform)
                .style("position", "absolute")
                .style("width", "20px")
                .style("height", "20px")
                // .style("padding-right", "100px")
                // .style("font", "10px sans-serif")
                .attr("id", function(d) {
                    return "amViewStationSvg" + d.id;
                })
                .attr("class", "amViewStationSvg");

            // Add shadow
            var shadow = marker.append("svg:circle")
                .attr("class", "AMViewStationRepresentationShadow")
                .attr("id", function(d) {
                    return "AMViewStationRepresentationShadow" + d.id;
                })
                .attr("r", function(d) {
                    // return 4 + 7 * Math.sqrt((d.capacity - that.matrixViewer.minCapacity) / (that.matrixViewer.maxCapacity - that.matrixViewer.minCapacity)/3.1416);
                    return 4;
                })
                .attr("fill", "hsl(" + (0.1 * 360) + ", 0%, 0%)")
                .attr("cx", function(d) {
                    return padding + 1;
                })
                .attr("cy", function(d) {
                    return padding + 1;
                });

            // Add a circle.
            var circle = marker.append("svg:circle")
                .attr("class", "AMViewStationRepresentation")
                .attr("id", function(d) {
                    return "AMViewStationRepresentation" + d.id;
                })
                .attr("r", function(d) {
                    return 4;
                })
                .attr("fill", "hsl(" + (0.1 * 360) + ", 70%, 70%)")
                .attr("stroke",  "gray")
                .attr("stroke-width",  "1.5px")
                .attr("cx", padding)
                .attr("cy", padding);
                /*.on("mouseover", function(d){
                    // console.log(d);
                    for (stationIndex in that.matrixViewer.actualOrderingList.orderedStations) {
                        if (that.matrixViewer.actualOrderingList.orderedStations[stationIndex].id == d.id) {
                            that.matrixViewer.stationPointedInMapId = d.id;
                            that.matrixViewer.pointedStation(stationIndex);
                            return;
                        }
                    }
                });*/

            circle
                .append("svg:title")
                .text(function(d, i) { return d.name; });

            // Add a label.
            // marker.append("svg:text")
            //     .attr("id", function(d) {
            //       return "TripsViewStationRepresentationText" + d.id;
            //     })
            //     .attr("x", padding + 7)
            //     .attr("y", padding)
            //     .attr("dy", ".31em")
            //     .attr("fill-opacity", "0.0")
            //     .text(function(d) { return d.name; });

            function transform(d) {
                d = new google.maps.LatLng(d.latitude, d.longitude);
                d = projection.fromLatLngToDivPixel(d);
                d3.select(this).attr("x", (d.x));
                d3.select(this).attr("y", (d.y));
                return d3.select(this)
                    .style("left", (d.x - padding) + "px")
                    .style("top", (d.y - padding) + "px");
            }
        };

    }

    // console.log(this);

    overlay.setMap(this.map_);

}

