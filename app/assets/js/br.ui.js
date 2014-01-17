(function() {
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
  $Q.ui.locationMap = function (options, $viewEl) {
    if (!_.isNull($Q.geolocation)) {
      var tilesOpacity = 0.7,
        defaults = {
          autoStart: true,
          mapLink: '[data-map-view-button]',
          mapLinkAttr: 'data-map-view-button',
          mapLinkContainer: '[data-map-view-button-container]',
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
        },
        map,
        icon,
        marker,
        tiles,
        isMapRendered = false;
        renderMap = function (ev) {
          ev.preventDefault();
          if (!isMapRendered) {
            isMapRendered = true;
            var $target = $(ev.currentTarget),
              mapLayer = false;
            $target.off('click.map').removeAttr('mapLinkAttr');
            if (!$target.is(options.mapLayerControlSelector)) {
              $target.hide();
            } else if ($target.is(options.mapLayerControlSelector)) {
              mapLayer = true;
            }

            map = L.map(options.mapElement.attr('id')).setView(options.coordinates, options.initialZoom);
            icon = L.icon({
              iconUrl: 'assets/css/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12.5, 41],
              iconRetinaUrl: 'assets/css/images/marker-icon.png',
              shadowUrl: 'assets/css/images/marker-shadow.png',
              shadowSize: [41, 41],
              shadowAnchor: [10.5, 41],
              shadowRetinaUrl: 'assets/css/images/marker-shadow.png',
            });
            marker = L.marker(options.coordinates, {icon: icon}).addTo(map);
            tiles = options.mapTiles[options.selectedMapTiles];
            
            $mapControlsLayers.off('click.mapLayers').on('click.mapLayers', addLayer);
            L.tileLayer(tiles[0], tiles[1]).addTo(map);
            if (mapLayer) {
              addLayer(ev);
            }
          }
        };

      if (!_.isNull(options.heightElement)) {
        var sumHeight = (options.heightElement.height() - $mapContainer.outerHeight()),
          mapLinkHeight = $viewEl.find(options.mapLinkContainer).outerHeight(),
          topSpacing = Math.floor((sumHeight - mapLinkHeight) / 2);

        options.mapElement.css({
          height: sumHeight
        });
        $(options.mapLinkContainer).css({
          paddingTop: topSpacing
        });
      }

      if (options.autoStart) {
        renderMap();
      } else {
        $viewEl.find(options.mapLink).off('click.map').on('click.map', renderMap);
      } 
    }
  };
  $Q.ui.weatherFontIcon = function (code, icon) {
    var arrowGlyphicon = 'glyphicon glyphicon-arrow-down rot-',
      equivalence = {
        // Thunderstorm
        200: { // thunderstorm with light rain
          d: 'wi-storm-showers',
          n: 'wi-storm-showers'
        },
        201: { // thunderstorm with rain
          d: 'wi-day-thunderstorm',
          n: 'wi-night-thunderstorm'
        },
        202: { // thunderstorm with heavy rain
          d: 'wi-day-thunderstorm',
          n: 'wi-night-thunderstorm'
        },
        210: { // light thunderstorm
          d: 'wi-day-lightning',
          n: 'wi-night-lightning'
        },
        211: { // thunderstorm
          d: 'wi-day-lightning',
          n: 'wi-night-lightning'
        },
        212: { // heavy thunderstorm
          d: 'wi-lightning',
          n: 'wi-lightning'
        },
        221: { // ragged thunderstorm
          d: 'wi-day-storm-showers ',
          n: 'wi-night-storm-showers '
        },
        230: { // thunderstorm with light drizzle
          d: 'wi-storm-showers',
          n: 'wi-storm-showers'
        },
        231: { // thunderstorm with drizzle
          d: 'wi-storm-showers',
          n: 'wi-storm-showers'
        },
        232: { // thunderstorm with heavy drizzle
          d: 'wi-storm-showers',
          n: 'wi-storm-showers'
        },

        // Drizzle
        300: { // light intensity drizzle
          d: 'wi-rain-mix',
          n: 'wi-rain-mix'
        },
        301: { // drizzle
          d: 'wi-rain-mix',
          n: 'wi-rain-mix'
        },
        302: { // heavy intensity drizzle
          d: 'wi-rain',
          n: 'wi-rain'
        },
        310: { // light intensity drizzle rain
          d: 'wi-rain',
          n: 'wi-rain'
        },
        311: { // drizzle rain
          d: 'wi-rain',
          n: 'wi-rain'
        },
        312: { // heavy intensity drizzle rain
          d: 'wi-rain',
          n: 'wi-rain'
        },
        321: { // shower drizzle
          d: 'wi-rain',
          n: 'wi-rain'
        },

        // Rain
        500: { // light rain
          d: 'wi-day-sprinkle',
          n: 'wi-night-sprinkle'
        },
        501: { // moderate rain
          d: 'wi-day-showers',
          n: 'wi-night-showers'
        },
        502: { // heavy intensity rain
          d: 'wi-day-rain',
          n: 'wi-night-rain'
        },
        503: { // very heavy rain
          d: 'wi-rain',
          n: 'wi-rain'
        },
        504: { // extreme rain
          d: 'wi-rain',
          n: 'wi-rain'
        },
        511: { // freezing rain
          d: 'wi-hail',
          n: 'wi-hail'
        },
        520: { // light intensity shower rain
          d: 'wi-day-sprinkle',
          n: 'wi-night-sprinkle'
        },
        521: { // shower rain
          d: 'wi-sprinkle',
          n: 'wi-sprinkle'
        },
        522: { // heavy intensity shower rain
          d: 'wi-sprinkle',
          n: 'wi-sprinkle'
        },
        
        // Snow
        600: { // light snow
          d: 'wi-day-snow',
          n: 'wi-night-snow'
        },
        601: { // snow
          d: 'wi-snow',
          n: 'wi-snow'
        },
        602: { // heavy snow
          d: 'wi-snow',
          n: 'wi-snow'
        },
        611: { // sleet
          d: 'wi-day-snow',
          n: 'wi-night-snow'
        },
        621: { // shower snow
          d: 'wi-snow',
          n: 'wi-snow'
        },

        // Atmosphere
        701: { // mist
          d: 'wi-day-fog',
          n: 'wi-night-fog'
        },
        711: { // smoke
          d: 'wi-fog',
          n: 'wi-fog'
        },
        721: { // haze
          d: 'wi-day-fog',
          n: 'wi-night-fog'
        },
        731: { // Sand/Dust Whirls
          d: '',
          n: ''
        },
        741: { // Fog
          d: 'wi-fog',
          n: 'wi-fog'
        },

        // Clouds
        800: { // sky is clear
          d: 'wi-day-sunny ',
          n: 'wi-night-clear'
        },
        801: { // few clouds
          d: 'wi-day-cloudy',
          n: 'wi-night-cloudy'
        },
        802: { // scattered clouds
          d: 'wi-cloudy',
          n: 'wi-cloudy'
        },
        803: { // broken clouds
          d: 'wi-cloudy',
          n: 'wi-cloudy'
        },
        804: { // overcast clouds
          d: 'wi-cloudy',
          n: 'wi-cloudy'
        },

        // Extreme
        900: { // tornado
          d: 'wi-tornado',
          n: 'wi-tornado'
        },
        901: { // tropical storm
          d: '',
          n: ''
        },
        902: { // hurricane
          d: 'wi-windy',
          n: 'wi-windy'
        },
        903: { // cold
          d: '',
          n: ''
        },
        904: { // hot
          d: '',
          n: ''
        },
        905: { // windy
          d: 'wi-strong-wind',
          n: 'wi-strong-wind'
        },
        906: { // hail
          d: 'wi-hail',
          n: 'wi-hail'
        },
        N: {d: arrowGlyphicon + '0'},
        NE: {d: arrowGlyphicon + '45'},
        E: {d: arrowGlyphicon + '90'},
        SE: {d: arrowGlyphicon + '135'},
        S: {d: arrowGlyphicon + '180'},
        SO: {d: arrowGlyphicon + '225'},
        O: {d: arrowGlyphicon + '270'},
        NO: {d: arrowGlyphicon + '315'},
        C: {d: 'fa fa-minus'}
      },
      timeOfDay = function () {
        return (!_.isUndefined(icon) && icon.substr(-1) === 'n') ? 'n' : 'd';
      };
    return equivalence[code][timeOfDay()];
  };
}());