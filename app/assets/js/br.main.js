var $Q, $, Globalize, _, Backbone, Highcharts, L, Piwik, Q;
(function() {
  var environment = 'dev', // 'dev' (development) or 'pr' (production)
    defaultLanguage = 'en',
    guessIfIsPhonegapApp = function () {
      return (document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1)
    },
    isPhonegapApp = guessIfIsPhonegapApp(),
    getNavigatorLanguage = function () {
      var language = defaultLanguage;
      if (window.navigator) {
        language = (window.navigator.language || window.navigator.userLanguage).split('-')[0]
      }
      return language;
    },
    getCulture = function () {
      var availableLanguages = ['es', 'en'],
        clientLanguage = getNavigatorLanguage(),
        selectedLanguage = (availableLanguages.indexOf(clientLanguage) !== -1) ? clientLanguage : defaultLanguage;
      document.getElementsByTagName('html')[0].lang = selectedLanguage;
      return selectedLanguage;
    },
    getFirefoxOS = function () {
      var manifestUrl = window.location.origin + window.location.pathname + 'platforms/firefoxOS/manifest.webapp',
        installCheck,
        isInstalled = false,
        config = {
          enabled: false,
          installed: isInstalled,
          url: manifestUrl
        };
      if (navigator.mozApps !== undefined) {
        installCheck = navigator.mozApps.checkInstalled(manifestUrl);
        installCheck.onsuccess = function() {
          if(installCheck.result.installState === 'installed') {
            isInstalled = true;
          }
        };
        config = {
          enabled: true,
          installed: isInstalled,
          url: manifestUrl
        };
      }
      return config;
    };

  $Q = {
    appName: 'Borrasca',
    appTitle: 'Borrasca - ',
    isPhonegapApp: isPhonegapApp,
    version: (environment === 'pr' || isPhonegapApp) ? '2.4.1.0' : Date.now(),
    servicePath: (isPhonegapApp) ? 'http://borrasca-next.digitalpapyrus.es/' : '',
    server: (window.location.port === '9000') ? 'node' : 'php', // 'node' or 'php'
    waitOnInitialize: 60,
    culture: getCulture(),
    geolocation: null,
    templatesReady: false,
    jsLibs: {
      route: 'libs/',
      fullRoute: 'assets/js/libs',
      versions: {
        jquery: '2.0.3',
        underscore: '1.5.1',
        lodash: '2.1.0',
        backbone: '1.1.0',
        requireText: '2.0.7',
        requireAsync: '0.1.1',
        highcharts: '3.0.7',
        bootstrap: '3.0.0',
        jquery_sliceSlide: '4.0',
        leaflet: '0.7.1',
        q: '0.9',
        jqueryMobileEvents: 'noversion'
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
    maps: {
      autoStart: false
    },
    platforms: {
      firefoxOS: getFirefoxOS()
    },
    links: {
      github: 'https://github.com/jervert/borrasca-next',
      googlePlay: 'https://play.google.com/store/apps/details?id=com.phonegap.borrasca_v2'
    },
    piwik: {
      enabled: false,
      ready: false,
      url: null,
      id: '2'
    },
    adsense: {
      enabled: false
    },
    views: {},
    removableViews: ['detail', 'nowAndHere']
  };

  if (isPhonegapApp) {
    $Q.piwik.enabled = false;
    $Q.adsense.enabled = false;
  }

  $Q.alternateCulture = ($Q.culture === 'es') ? 'sp' : $Q.culture; 

  require.config({
    paths: {
      text: 'libs/require.text-' + $Q.jsLibs.versions.requireText,
      async: 'libs/require.async-' + $Q.jsLibs.versions.requireAsync,
      'jquery': $Q.jsLibs.route + 'jquery-' + $Q.jsLibs.versions.jquery,
      'jqueryMobileEvents': $Q.jsLibs.route + 'jquery.mobile-events-' + $Q.jsLibs.versions.jqueryMobileEvents,
      'globalize': 'libs/globalize',
      'globalize_culture': $Q.templates.routeCultures + 'globalize/globalize.culture.' + $Q.culture,
      'underscore': ($Q.jsLibs.equivalent.underscore === 'lodash') ? $Q.jsLibs.route + 'lodash.underscore-' + $Q.jsLibs.versions.lodash : $Q.jsLibs.route + 'underscore-' + $Q.jsLibs.versions.underscore,
      'backbone': $Q.jsLibs.route + 'backbone-' + $Q.jsLibs.versions.backbone,
      'highcharts': $Q.jsLibs.route + 'highcharts-' + $Q.jsLibs.versions.highcharts,
      'bootstrap': $Q.jsLibs.route + 'bootstrap-' + $Q.jsLibs.versions.bootstrap,
      'jquery_sliceSlide': $Q.jsLibs.route + 'slice-slide/jquery.sliceslide-' + $Q.jsLibs.versions.jquery_sliceSlide,
      'leaflet': $Q.jsLibs.route + 'leaflet-' + $Q.jsLibs.versions.leaflet,
      'q': $Q.jsLibs.route + 'q-' + $Q.jsLibs.versions.q,
      'adsense': window.location.protocol + '//pagead2.googlesyndication.com/pagead/js/adsbygoogle',
      'piwik': window.location.protocol + '//' + $Q.piwik.url + '/piwik',
      'mixins': 'br.mixins',
      'br_ui': 'br.ui',
      'br_utils': 'br.utils',
      'br_routes': 'br.routes',
      'br_extend_view': 'br.extendView',
      'mvc_main': 'mvc/main.mvc',
      'mvc_search': 'mvc/search.mvc',
      'mvc_bookmarks': 'mvc/bookmarks.mvc',
      'mvc_nowAndHere': 'mvc/nowAndHere.mvc',
      'mvc_detail': 'mvc/detail.mvc',
      'mvc_install': 'mvc/install.mvc',
      'mvc_icons': 'mvc/icons.mvc'
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
      'jqueryMobileEvents': {
        deps: ['jquery']
      },
      'globalize_culture': {
        deps: ['globalize']
      },
      'bootstrap': {
        deps: ['jquery']
      },
      'jquery_sliceSlide': {
        deps: ['jqueryMobileEvents', 'underscore']
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
        deps: ['backbone', 'q']
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
      },
      'mvc_install': {
        deps: ['mvc_main']
      },
      'mvc_icons': {
        deps: ['mvc_main']
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
    'q',
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
    'mvc_install',
    'mvc_icons',
    'br.app.aemet'
  ];
  if ($Q.adsense.enabled) {
    $Q.resourcesJs.push('adsense');
  }
  if ($Q.piwik.enabled) {
    $Q.resourcesJs.push('piwik');
  }

  $Q.resourcesText = [
    'text!' + $Q.templates.routeCultures + 'text_' + $Q.culture + '.html',
    'text!' + $Q.templates.route + 'mixin_tmpl_loading.html',
    'text!' + $Q.templates.route + 'mixin_tmpl_messages_error.html',
    'text!' + $Q.templates.route + 'mixin_tmpl_map_layers.html',
    'text!' + $Q.templates.route + 'mixin_tmpl_current_weather.html',
    'text!' + $Q.templates.route + 'mixin_tmpl_buttons_refresh.html',
    'text!' + $Q.templates.route + 'mixin_tmpl_map_container.html',
    'text!' + $Q.templates.route + 'tmpl_main.html',
    'text!' + $Q.templates.route + 'tmpl_search.html',
    'text!' + $Q.templates.route + 'tmpl_bookmarks.html',
    'text!' + $Q.templates.route + 'tmpl_now_and_here.html',
    'text!' + $Q.templates.route + 'tmpl_detail.html',
    'text!' + $Q.templates.route + 'tmpl_install.html',
    'text!' + $Q.templates.route + 'tmpl_icons.html'
  ];



  $Q.initialize = function () {
    $Q.utils.getGeolocation();
    $(document).on('geolocated', function () {
      $Q.app_router = new $Q.AppRouter();
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
    Q = arguments[6];
    for (i = 6; i < l; i += 1) {
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

    Q($('#templates-area').append(templates)).then(function () {
      $Q.templatesReady = true;
      if ($Q.piwik.enabled) {
        $Q.utils.piwikStats.start();
        $Q.utils.piwikStats.trackPageView(window.location.hash);
      }
      $Q.utils.services.set();
      $Q.initialize();
    });
  });

}());
