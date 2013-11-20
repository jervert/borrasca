var $Q, $, Globalize, _, Backbone, Highcharts, L;
(function() {
  var environment = 'dev', // 'dev' (development) or 'pr' (production)
  getCulture = function () {
    var defaultLanguage = 'en',
      availableLanguages = ['es', 'en'],
      clientLanguage = (window.navigator) ? window.navigator.language.split('-')[0] : defaultLanguage,
      selectedLanguage = (availableLanguages.indexOf(clientLanguage) !== -1) ? clientLanguage : defaultLanguage;
    document.getElementsByTagName('html')[0].lang = selectedLanguage;
    return selectedLanguage;
  };

  $Q = {
    appName: 'Borrasca',
    appTitle: 'Borrasca-Next - ',
    version: (environment === 'pr') ? '2.2.1.0' : Date.now(),
    servicePath: (document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1) ? 'http://borrasca-next.digitalpapyrus.es/' : '',
    server: (window.location.port === '9000') ? 'node' : 'php', // 'node' or 'php'
    waitOnInitialize: 40,
    culture: getCulture(),
    compressed: false,
    legacy: true,
    geolocation: null,
    templatesReady: false,
    jsLibs: {
      route: (!this.compressed) ? 'libs/': 'libs/min/',
      versions: {
        jquery: (this.legacy) ? '1.10.2' : '2.0.3',
        underscore: '1.5.1',
        lodash: '2.1.0',
        backbone: '1.0.0',
        requireText: '2.0.7',
        requireAsync: '0.1.1',
        highcharts: '3.0.2',
        bootstrap: '3.0.0',
        jquery_sliceSlide: '4.0',
        leaflet: '0.6.4'
      },
      equivalent: {
        underscore: 'lodash' // 'lodash' or 'underscore'
      }
    },
    templates: {
      route: '../tmpl/',
      routeCultures: '../cultures/'
    },
    images: {
      route: 'img'
    },
    piwik: {
      enabled: false,
      ready: false,
      url: null,
      id: '2'
    },
    views: {},
    removableViews: ['detail', 'nowAndHere']
  };

  $Q.alternateCulture = ($Q.culture === 'es') ? 'sp' : $Q.culture;

  $Q.services = {
    main: ($Q.server === 'php') ? $Q.servicePath + 'services/main.php?lang=' + $Q.alternateCulture + '&geolocation=' : $Q.servicePath + '?lang=' + $Q.alternateCulture + '&geolocation=',
    search: ($Q.server === 'php') ? $Q.servicePath + 'services/search.php?location_name=' : $Q.servicePath + '?location_name=',
    detail: ($Q.server === 'php') ? $Q.servicePath + 'services/detail.php?lang=' + $Q.alternateCulture + '&location_name=' : $Q.servicePath + '?detail=true&lang=' + $Q.alternateCulture + '&location_name=',
    xml: ($Q.server === 'php') ? $Q.servicePath + 'services/xml.php?location_id=' : $Q.servicePath + '?xml='
  }


  require.config({
    paths: {
      text: 'libs/require.text-' + $Q.jsLibs.versions.requireText,
      async: 'libs/require.async-' + $Q.jsLibs.versions.requireAsync,
      'jquery': $Q.jsLibs.route + 'jquery-' + $Q.jsLibs.versions.jquery,
      'globalize': 'libs/globalize',
      'globalize_culture': $Q.templates.routeCultures + 'globalize/globalize.culture.' + $Q.culture,
      'underscore': ($Q.jsLibs.equivalent.underscore === 'lodash') ? $Q.jsLibs.route + 'lodash.underscore-' + $Q.jsLibs.versions.lodash : $Q.jsLibs.route + 'underscore-' + $Q.jsLibs.versions.underscore,
      'backbone': $Q.jsLibs.route + 'backbone-' + $Q.jsLibs.versions.backbone,
      'highcharts': $Q.jsLibs.route + 'highcharts-' + $Q.jsLibs.versions.highcharts,
      'bootstrap': $Q.jsLibs.route + 'bootstrap-' + $Q.jsLibs.versions.bootstrap,
      'jquery_sliceSlide': $Q.jsLibs.route + 'slice-slide/jquery.sliceslide-' + $Q.jsLibs.versions.jquery_sliceSlide,
      'leaflet': $Q.jsLibs.route + 'leaflet-' + $Q.jsLibs.versions.leaflet,
      'mixins': 'br.mixins',
      'br_ui': 'br.ui',
      'br_utils': 'br.utils',
      'br_routes': 'br.routes',
      'br_extend_view': 'br.extendView',
      'mvc_main': 'mvc/main.mvc',
      'mvc_search': 'mvc/search.mvc',
      'mvc_bookmarks': 'mvc/bookmarks.mvc',
      'mvc_nowAndHere': 'mvc/nowAndHere.mvc',
      'mvc_detail': 'mvc/detail.mvc'
    },
    shim: {
      'underscore': {
        deps: [],
        exports: '_'
      },
      'backbone': {
        deps: ['jquery', 'underscore'],
        exports: 'Backbone'
      },
      'highcharts': {
        deps: ['jquery'],
        exports: 'Highcharts'
      },
      'globalize': {
        deps: ['jquery'],
        exports: 'Globalize'
      },
      'globalize_culture': {
        deps: ['globalize']
      },
      'bootstrap': {
        deps: ['jquery']
      },
      'jquery_sliceSlide': {
        deps: ['jquery', 'underscore']
      },
      'leaflet': {
        exports: 'L'
      },
      'mixins': {
        deps: ['jquery', 'underscore']
      },
      'br_ui': {
        deps: ['jquery', 'underscore']
      },
      'br_utils': {
        deps: ['jquery', 'underscore']
      },
      'br_routes': {
        deps: ['backbone']
      },
      'br_extend_view': {
        deps: ['br_utils', 'br_routes', 'globalize', 'mixins', 'br_ui', 'bootstrap']
      },
      'mvc_main': {
        deps: ['br_extend_view']
      },
      'mvc_search': {
        deps: ['mvc_main']
      },
      'mvc_bookmarks': {
        deps: ['mvc_main']
      },
      'mvc_nowAndHere': {
        deps: ['mvc_main']
      },
      'mvc_detail': {
        deps: ['mvc_main', 'leaflet']
      }
    },
    waitSeconds: 40,
    urlArgs: $Q.version
  });


  $Q.resourcesJs = [
    'jquery',
    'globalize',
    'underscore',
    'backbone',
    'highcharts',
    'leaflet',
    'jquery_sliceSlide',
    'globalize_culture',
    'mixins',
    'br_ui',
    'br_utils',
    'br_routes',
    'br_extend_view',
    'mvc_main',
    'mvc_search',
    'mvc_bookmarks',
    'mvc_nowAndHere',
    'mvc_detail',
    'br.app.aemet'
  ];
  $Q.resourcesText = [
    'text!' + $Q.templates.routeCultures + 'text_' + $Q.culture + '.html',
    'text!' + $Q.templates.route + 'mixin_tmpl_loading.html',
    'text!' + $Q.templates.route + 'mixin_tmpl_messages_error.html',
    'text!' + $Q.templates.route + 'mixin_tmpl_map_layers.html',
    'text!' + $Q.templates.route + 'mixin_tmpl_current_weather.html',
    'text!' + $Q.templates.route + 'mixin_tmpl_buttons_refresh.html',
    'text!' + $Q.templates.route + 'tmpl_main.html',
    'text!' + $Q.templates.route + 'tmpl_search.html',
    'text!' + $Q.templates.route + 'tmpl_bookmarks.html',
    'text!' + $Q.templates.route + 'tmpl_now_and_here.html',
    'text!' + $Q.templates.route + 'tmpl_detail.html'
  ];


  $Q.initialize = function () {
    $Q.utils.getGeolocation();
    $(document).on('geolocated', function () {
      $Q.app_router = new $Q.AppRouter();
      $Q.views.mainView = new $Q.MainView();
      Backbone.history.start();
    });
  }

  define($Q.resourcesJs.concat($Q.resourcesText), function () {
    var templates = '',
      l = arguments.length,
      i;
    $ = arguments[0];
    Globalize = arguments[1];
    _ = arguments[2];
    Backbone = arguments[3];
    Highcharts = arguments[4];
    L = arguments[5];
    for (i = 5; i < l; i += 1) {
      if (typeof arguments[i] === 'string') {
        templates += arguments[i];
      }
    }

    Globalize.culture($Q.culture);
    $('title').text($Q.appTitle + $Q.version);
    
    $Q.supported = {
      html5: {
        storage: _.support_html5_storage()
      }
    };
    if ($Q.supported.html5.storage) {
      if (_.isEmpty(localStorage.getItem('appData'))) {
        localStorage.setItem('appData', JSON.stringify({locations: [], locationsName: []}));
      }
    }

    $.when($('#templates-area').append(templates)).then(function () {
      $Q.templatesReady = true;
      if ($Q.piwik.enabled) {
        require(['async!' + $Q.utils.piwikStats.getScriptUrl() +'!callback']);
        var piwikIntervalCount = 0,
          piwikInterval = setInterval(function () {
            $Q.piwik.ready = _.isObject(Piwik);
            if (piwikIntervalCount > 80 || $Q.piwik.ready) {
              $Q.utils.piwikStats.start();
              $Q.utils.piwikStats.trackPageView(window.location.hash);
              $Q.initialize();
              clearInterval(piwikInterval);
            }
            piwikIntervalCount += 1;
          }, 500);
      } else {
        $Q.initialize();
      }
    });
  });

}());
