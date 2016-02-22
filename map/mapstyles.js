/**
 * Definition of multiple map styles and some utility functions to load them.
 */ 

/**
 * @param <google.maps.Map> map google maps object.
 */
var MapStyles = function(map) {
  this.createStyles(map);
};


/**
 * Initializes available styles for a given map.
 * @param <google.maps.Map> map google maps object.
 */
MapStyles.prototype.createStyles = function(map) {
  // Creates styles for map
  map.mapTypes.set(MapStyles.MAP_STYLE_BRIGHT_NAME, 
    new google.maps.StyledMapType(MapStyles.MAP_STYLE_BRIGHT,
      { name: MapStyles.MAP_STYLE_BRIGHT_NAME }));
  map.mapTypes.set(MapStyles.MAP_STYLE_BRIGHT_BLUE_NAME, 
    new google.maps.StyledMapType(MapStyles.MAP_STYLE_BRIGHT_BLUE,
      { name: MapStyles.MAP_STYLE_BRIGHT_BLUE_NAME }));

  map.mapTypes.set(MapStyles.MAP_STYLE_DARK_NAME, 
    new google.maps.StyledMapType(MapStyles.MAP_STYLE_DARK,
      { name: MapStyles.MAP_STYLE_DARK_NAME }));
  map.mapTypes.set(MapStyles.MAP_STYLE_DARK_GRAY_NAME, 
    new google.maps.StyledMapType(MapStyles.MAP_STYLE_DARK_GRAY,
      { name: MapStyles.MAP_STYLE_DARK_GRAY_NAME }));

  map.mapTypes.set(MapStyles.MAP_STYLE_WHITE_PURPLE_NAME, 
    new google.maps.StyledMapType(MapStyles.MAP_STYLE_WHITE_PURPLE,
      { name: MapStyles.MAP_STYLE_WHITE_PURPLE_NAME }));
  map.mapTypes.set(MapStyles.MAP_STYLE_PURPLE_WHITE_NAME, 
    new google.maps.StyledMapType(MapStyles.MAP_STYLE_PURPLE_WHITE,
      { name: MapStyles.MAP_STYLE_PURPLE_WHITE_NAME }));
  map.mapTypes.set(MapStyles.MAP_STYLE_WHITE_LIGHTER_NAME, 
    new google.maps.StyledMapType(MapStyles.MAP_STYLE_WHITE_LIGHTER,
      { name: MapStyles.MAP_STYLE_WHITE_LIGHTER_NAME }));
  map.mapTypes.set(MapStyles.MAP_STYLE_WHITE_LIGHTER_NO_LABELS_NAME, 
    new google.maps.StyledMapType(MapStyles.MAP_STYLE_WHITE_LIGHTER_NO_LABELS,
      { name: MapStyles.MAP_STYLE_WHITE_LIGHTER_NO_LABELS_NAME }));
  map.mapTypes.set(MapStyles.MAP_STYLE_WHITE_LIGHTER_SIMPLE_NAME, 
    new google.maps.StyledMapType(MapStyles.MAP_STYLE_WHITE_LIGHTER_SIMPLE,
      { name: MapStyles.MAP_STYLE_WHITE_LIGHTER_SIMPLE_NAME }));
};

MapStyles.MAP_STYLE_WHITE_LIGHTER_SIMPLE = [
  {
    "featureType": "administrative",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "off" },
      // { "saturation": -100 },
      // { "lightness": 0 }
    ]
  },{
    "featureType": "road",
    "stylers": [
      // { "visibility": "off" },
      { "saturation": -100 },
      { "lightness": -35 }
    ]
  },{
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "visibility": "on" },
      // { "lightness": 40 },
      // { "hue": 39 }
    ]
  },{
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      {"visibility": "off"},
      { "lightness": 100 },
      { "saturation": -100 },
      { "hue": 100 }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "on" },
      { "saturation": -100 },
      { "lightness": -30 }
    ]
  }
];

/**
 * White/Purple map style name.
 * No roads, buildings or transit lines.
 * Keeps color for water, terrain and parks.
 * @private
 */
MapStyles.MAP_STYLE_WHITE_LIGHTER_SIMPLE_NAME =
  'MAP_STYLE_WHITE_LIGHTER_SIMPLE_NAME';

/**
 * White/Purple map style.
 * @private
 */
MapStyles.MAP_STYLE_WHITE_LIGHTER_NO_LABELS = [
  {
    "featureType": "administrative",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "on" },
      // { "saturation": -100 },
      // { "lightness": 0 }
    ]
  },{
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road",
    "stylers": [
      // { "visibility": "off" },
      { "saturation": -100 },
      { "lightness": 0 }
    ]
  },{
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "visibility": "on" },
      // { "lightness": -85 },
      // { "hue": 39 }
    ]
  },{
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      {"visibility": "off"},
      { "lightness": 100 },
      { "saturation": -100 },
      { "hue": 100 }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "on" },
      { "saturation": -100 },
      { "lightness": 0 }
    ]
  }
];

/**
 * White/Purple map style name.
 * No roads, buildings or transit lines.
 * Keeps color for water, terrain and parks.
 * @private
 */
MapStyles.MAP_STYLE_WHITE_LIGHTER_NO_LABELS_NAME =
  'MAP_STYLE_WHITE_LIGHTER_NO_LABELS';

/**
 * White/Purple map style.
 * @private
 */
MapStyles.MAP_STYLE_WHITE_LIGHTER = [
  {
    "featureType": "administrative",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "on" },
      // { "saturation": -100 },
      // { "lightness": 0 }
    ]
  },{
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "road",
    "stylers": [
      // { "visibility": "off" },
      { "saturation": -100 },
      { "lightness": 0 }
    ]
  },{
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "visibility": "on" },
      // { "lightness": -85 },
      // { "hue": 39 }
    ]
  },{
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      {"visibility": "off"},
      { "lightness": 100 },
      { "saturation": -100 },
      { "hue": 100 }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "on" },
      { "saturation": -100 },
      { "lightness": 0 }
    ]
  }
];

/**
 * White/Purple map style name.
 * No roads, buildings or transit lines.
 * Keeps color for water, terrain and parks.
 * @private
 */
MapStyles.MAP_STYLE_WHITE_LIGHTER_NAME =
  'MAP_STYLE_WHITE_LIGHTER_NAME';

/**
 * White/Purple map style.
 * @private
 */
MapStyles.MAP_STYLE_WHITE_PURPLE = [
  {
    "featureType": "administrative",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "on" },
      { "saturation": -100 },
      { "lightness": 0 }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "visibility": "on" },
      { "saturation": -100 },
      { "lightness": 0 }
    ]
  },{
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "visibility": "on" },
      { "lightness": -85 },
      { "hue": 39 }
    ]
  },{
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      {"visibility": "on"},
      { "lightness": 100 },
      { "saturation": -100 },
      { "hue": 100 }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "on" },
      { "saturation": -100 },
      { "lightness": 0 }
    ]
  }
];

/**
 * White/Purple map style name.
 * No roads, buildings or transit lines.
 * Keeps color for water, terrain and parks.
 * @private
 */
MapStyles.MAP_STYLE_WHITE_PURPLE_NAME =
  'MAP_STYLE_WHITE_PURPLE_NAME';

/**
 * Purple/White map style.
 * @private
 */
MapStyles.MAP_STYLE_PURPLE_WHITE = [
  {
    "featureType": "administrative",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "on" },
      { "saturation": -80 },
      { "lightness": -85 },
      { "hue": 200 }
    ]
  },{
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [
      { "visibility": "on" },
      { "lightness": 50 },
      { "saturation": -200 },
      { "hue": 100 }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "visibility": "on" },
      { "saturation": 20 },
      { "lightness": -75 },
      { "hue": 230 }
    ]
  },{
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {"visibility": "off"},
      { "lightness": 100 },
      { "saturation": -100 },
      { "hue": 100 }
    ]
  }, {
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "visibility": "on" },
      { "saturation": -100 },
      { "lightness": 0 },
      { "hue": 0 }
    ]
  },{
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      {"visibility": "on"},
      { "lightness": -100 },
      { "saturation": -100 },
      { "hue": 100 }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "on" },
      { "saturation": 80 },
      { "lightness": -90 },
      { "hue": 230 }
    ]
  }
];

/**
 * Purple/White map style name.
 * No roads, buildings or transit lines.
 * Keeps color for water, terrain and parks.
 * @private
 */
MapStyles.MAP_STYLE_PURPLE_WHITE_NAME =
  'MAP_STYLE_PURPLE_WHITE_NAME';

/**
 * Brigh map style.
 * No roads, buildings or transit lines.
 * Keeps color for water, terrain and parks.
 * @private
 */
MapStyles.MAP_STYLE_BRIGHT = [
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "visibility": "simplified" }
    ]
  },{
    "featureType": "poi.business",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape.man_made",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.neighborhood",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.province",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "lightness": 39 }
    ]
  },{
    "stylers": [
      { "gamma": 2.19 }
    ]
  }
];


/**
 * Brigh map style name.
 * No roads, buildings or transit lines.
 * Keeps color for water, terrain and parks.
 * @private
 */
MapStyles.MAP_STYLE_BRIGHT_NAME =
  'MAP_STYLE_BRIGHT_NAME';


/**
 * Bright blue map style.
 * No roads, buildings or transit lines.
 * Color for water, terrain and parks are bluesh.
 * @private
 */
MapStyles.MAP_STYLE_BRIGHT_BLUE = [
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "visibility": "simplified" }
    ]
  },{
    "featureType": "poi.business",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape.man_made",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.neighborhood",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.province",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "stylers": [
      { "hue": "#0077ff" }
    ]
  },{
  }
];


/**
 * Bright blue map style name.
 * No roads, buildings or transit lines.
 * Color for water, terrain and parks are bluesh.
 */
MapStyles.MAP_STYLE_BRIGHT_BLUE_NAME =
  'MAP_STYLE_BRIGHT_BLUE_NAME';


/**
 * Dark map style.
 * No roads, buildings, transit lines or terrain color.
 * Almost completely black.
 * @private
 */
MapStyles.MAP_STYLE_DARK = [
  {
    stylers: [{
        lightness: -80  // was -89
    }, {
        saturation: -100
    }]
}, {
    featureType: "landscape",
    elementType: "labels",
    stylers: [{
        visibility: "off"
    }]
}, {
    featureType: "administrative",
    elementType: "labels",
    stylers: [{
        visibility: "off"
    }]
}, {
    featureType: "poi",
    elementType: "labels",
    stylers: [{
        visibility: "off"
    }]
}, {
    featureType: "transit.station",
    elementType: "all",
    stylers: [{
        visibility: "off"
    }]
}, {
    featureType: "road",
    elementType: "geometry",
    stylers: [{
        lightness: -95
    }, {
        visibility: "off"
    }]
}, {
    featureType: "water",
    elementType: "labels",
    stylers: [{
        visibility: "off"
    }]
}, {
    featureType: "road",
    elementType: "labels",
    stylers: [{
        visibility: "off"
    }]
}];


/**
 * Dark map style name.
 * No roads, buildings, transit lines or terrain color.
 * Almost completely black.
 * @private
 */
MapStyles.MAP_STYLE_DARK_NAME =
  'MAP_STYLE_DARK_NAME';


/**
 * Dark gray style.
 * No roads, buildings or transit lines.
 * @private
 */
MapStyles.MAP_STYLE_DARK_GRAY = [
  {
    "featureType": "administrative",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "lightness": -100 }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "visibility": "on" },
      { "saturation": -100 },
      { "lightness": -90 }
    ]
  }
];


/**
 * Dark gray style name.
 * No roads, buildings or transit lines.
 * @private
 */
MapStyles.MAP_STYLE_DARK_GRAY_NAME =
  'MAP_STYLE_DARK_GRAY_NAME';
