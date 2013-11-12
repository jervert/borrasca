$Q.ui = {};

/*
 * SliceAnchor - jQuery plugin for fake anchors
 *
 * Copyright (c) 2012 Antonio Rodríguez Ruiz
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://outbook.es
 *
 * Version:  1.0.0
 *
 * params:
 *  options {
 *    attrSelector: [String with anchor selector attribute]
 *    animateTime: [Integer with animation time in miliseconds]
 * }
 *
 * html:
 * <span role="link" tabindex="0" data-navigate-anchor="#destination-selector">[...]</span>
 *
 * initialize:
 *  $('.fake-link-selector').sliceAnchor({attrSelector: 'data-navigate-anchor', animateTime: 1000})
 *
 */
$.fn.extend({
  sliceAnchor: function (data) {
    var defaults = {
      attrSelector: 'data-navigate-anchor',
      animationTime: 50
    },
      options = $.extend(true, defaults, data),
      navigateAnchor = function (event) {
        var destinationSelector = $(event.currentTarget).attr(options.attrSelector),
          $destination = $(destinationSelector);
        $('html, body').animate({
          scrollTop: $destination.offset().top
        }, options.animationTime, function () {
          $destination.focus();
        });
      };
    return this.each(function () {
      $(this).on('click.navigateAnchor', navigateAnchor);
    });
  }
});

/*
 * GetChildrenTextNodes - jQuery plugin for children text nodes
 *
 * Copyright (c) 2013 Antonio Rodríguez Ruiz
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://outbook.es
 *
 * Version:  1.0.0
 *
 *
 * initialize:
 *  $('.fake-selector').getChildrenTextNodes()
 *
 */
$.fn.extend({
  getChildrenTextNodes: function () {
    return $(this).contents().filter(function() {
      return this.nodeType === 3;
    });
  }
});


// Loading
$Q.loading = function (options) {
	var defaults = {
		element: $('#content-area')
	},
	options = $.extend({}, defaults, options);
	
	options.element.html(_.c_loading());
}

// Collapse header menu
$Q.ui.menuCollapse = function (options) {
  var defaults = {
    menuCollapseButton: $('[data-target=".navbar-ex1-collapse"]')
  },
    options = $.extend({}, defaults, options);
  if (options.menuCollapseButton.is(':visible')) {
    options.menuCollapseButton.trigger('click');
  }
};


// Location map
$Q.ui.locationMap = function (options) {
  if (!_.isNull($Q.geolocation)) {
    var tilesOpacity = 0.7,
      defaults = {
        coordinates: [$Q.geolocation.latitude, $Q.geolocation.longitude],
        mapElement: null,
        mapContainerSelector: '[data-map-container]',
        mapControlsSelector: '[data-map-controls]',
        mapLayerControlSelector: '[data-map-layer]',
        selectedControlClass: 'btn-primary',
        mapLayerControlAttr: 'data-map-layer',
        selectedLayerAttr: 'data-map-selected-layer',
        heightElement: null,
        selectedMapTiles: 'OpenStreetMap_Mapnik',
        initialZoom: 7,
        mapTiles: {
          Stamen_Toner: ['http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20
          }],
          Stamen_Watercolor: ['http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            subdomains: 'abcd',
            minZoom: 3,
            maxZoom: 16
          }],
          OpenStreetMap_Mapnik: ['http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            maxZoom: 18
          }],
          
          // openweathermap layers
          // http://openweathermap.org/hugemaps
          OpenWeatherMap_clouds: ['http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png', {
            attribution: 'Map data © OpenWeatherMap',
            maxZoom: 18,
            opacity: tilesOpacity
          }],
          OpenWeatherMap_precipitation: ['http://{s}.tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png', {
            attribution: 'Map data © OpenWeatherMap',
            maxZoom: 18,
            opacity: tilesOpacity
          }],
          OpenWeatherMap_wind: ['http://{s}.tile.openweathermap.org/map/wind/{z}/{x}/{y}.png', {
            attribution: 'Map data © OpenWeatherMap',
            maxZoom: 18,
            opacity: tilesOpacity
          }],
          OpenWeatherMap_temperature: ['http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png', {
            attribution: 'Map data © OpenWeatherMap',
            maxZoom: 18,
            opacity: tilesOpacity
          }]
        }
      },
      options = $.extend(true, {}, defaults, options),
      $mapContainer = options.mapElement.closest(options.mapContainerSelector),
      $mapControls = $mapContainer.find(options.mapControlsSelector),
      $mapControlsLayers = $mapControls.find(options.mapLayerControlSelector),
      activeLayer = null,
      addLayer = function (ev) {
        ev.preventDefault();
        var $target = $(ev.currentTarget),
          newLayer = $target.attr(options.mapLayerControlAttr),
          oldLayer = $mapContainer.attr(options.selectedLayerAttr);
        
        if (!_.isNull(activeLayer)) {
          map.removeLayer(activeLayer);
          $mapControlsLayers.removeClass(options.selectedControlClass);
          $mapContainer.removeAttr(options.selectedLayerAttr);
        }
        if (newLayer !== oldLayer) {
          $target.addClass(options.selectedControlClass);
          $mapContainer.attr(options.selectedLayerAttr, newLayer);
          activeLayer = L.tileLayer(options.mapTiles[newLayer][0], options.mapTiles[newLayer][1]).addTo(map);
        }
      };

    if (!_.isNull(options.heightElement)) {
      options.mapElement.css({
        height: (options.heightElement.height() - $mapContainer.outerHeight())
      });
    }

      map = L.map(options.mapElement.attr('id')).setView(options.coordinates, options.initialZoom),
      icon = L.icon({
        iconUrl: 'css/leaflet/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12.5, 41],
        iconRetinaUrl: 'css/leaflet/images/marker-icon.png',
        shadowUrl: 'css/leaflet/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [10.5, 41],
        shadowRetinaUrl: 'css/leaflet/images/marker-shadow.png',
      }),
      marker = L.marker(options.coordinates, {icon: icon}).addTo(map),
      tiles = options.mapTiles[options.selectedMapTiles];
    
    $mapControlsLayers.off('click.mapLayers').on('click.mapLayers', addLayer)
     L.tileLayer(tiles[0], tiles[1]).addTo(map);
    
  }
};