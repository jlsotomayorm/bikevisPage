/**
 * @fileoverview Citi Bike app manager.
 *
 * @author (guilherme.n.oliveira@gmail.com) Guilherme Oliveira
 */

/**
 * Initializes used classes throughout the application.
 */
var CitiBikeAPP = function() {    

  // Nasty way of making Utils instance available to whole app.
  utils = new Utils;

  // Containers
  var plotContainerId = '#plot_container';  
  
  var dataManager = new DataManager();

  createTabScheme(dataManager);
  // // Map viewer.  
  // var mapContainerId = 'map_container';
  // var mapViewer = 
  //   new MapViewer(dataManager, mapContainerId, MapStyles.MAP_STYLE_DARK_NAME);    

  // mapViewer.setActive(true);

  // var analyticsViewer = new AnalyticsViewer(dataManager, 'modeVisContainerAnalyticsStationsUsageAnalyticsContainer');
  // analyticsViewer.setActive(true);

  //dataManager.loadStations();
  // dataManager.loadStreetsGraph();
  // dataManager.loadStationsModel();
  //dataManager.loadStationActivity(216, '2013-11-17', '2013-11-19');
  // dataManager.loadStationsActivityCount('2013-01-10 06:00:00', '2013-11-19 06:00:00');

  // console.log("Done");
};