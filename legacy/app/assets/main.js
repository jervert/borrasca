window.$Q = {};
var $Q = window.$Q;

// Globalize culture
Globalize.culture('es-ES');

// Underscore templating options
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g,
  evaluate: /\[\[(.+?)\]\]/g
};

// Native app or webapp
//$Q.apiPath = (document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1) ? 'http://borrasca.digitalpapyrus.es/' : '';
$Q.apiPath = (document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1) ? 'http://digitalpapyrus.eu/borrasca-legacy/' : '';

// Mixins
_.mixin({
  tmpl: function (id, context) {
    var html = $.trim($(id).html());
    return _.template(html, context);
  },

  support_html5_storage: function () {
    try {
      //return 'localStorage' in window && window['localStorage'] !== null;
      return window.localStorage && window.localStorage !== null;
    } catch (e) {
      return false;
    }
  },
  iframe_resize: function () {
    if (window.parent) {
      //$(window).off('resize.frame').on('resize.frame', function () {
        var appHeight = $(document.body).outerHeight();
        $(window.parent).find('iframe').attr({
          height: appHeight
        }).css({
          height: appHeight
        });
      //});
    }
  },
  getStorageLocations: function () {
    return JSON.parse(localStorage.getItem('appData')).locations;
  },
  getStorageLocationsName: function () {
    return JSON.parse(localStorage.getItem('appData')).locationsName;
  },
  positionTo: function (element) {
    $(_.tmpl('#tmpl-link-to-detail', {element: element})).sliceAnchor().trigger('click');
  }
});

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

// Remove navigation from jquery mobile
$.mobile.ajaxEnabled = false;
$.mobile.linkBindingEnabled = false;
$.mobile.hashListeningEnabled = false;
$.mobile.pushStateEnabled = false;


// Slice anchor
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

// AEMET XML parser
$Q.xml = (function () {
  var json = {},
    fn = {
      dayForecastByHours: function ($dia, currentHour, dayIndex) {
        var hours = [],
          realIndex = 0,
          dataElement =  $dia.find('prob_precipitacion'),
          dataElementLength = dataElement.length;
        $dia.find('prob_precipitacion').each(function (index, hour) {
          if ((dataElementLength === 7 && index > 2) || (dataElementLength === 3 && index > 0) || dataElementLength === 1) {
            var periodAttrSelector = ($(hour).attr('periodo')) ? '[periodo="' + $(hour).attr('periodo') + '"]' : '',
              period = $(hour).attr('periodo') || '0-24',
              lastHourInPeriod = parseInt(period.split('-')[1], 10);
            if (dayIndex !== 0 || lastHourInPeriod > currentHour) {
              hours.push({
                hour: period,
                rainfallProbability: $dia.find('prob_precipitacion' + periodAttrSelector).text(),
                snowLevel: $dia.find('cota_nieve_prov' + periodAttrSelector).text(),
                skyStatus: {
                  text: $dia.find('estado_cielo' + periodAttrSelector).attr('descripcion'),
                  img: $dia.find('estado_cielo' + periodAttrSelector).text()
                },
                wind: {
                  direction: $dia.find('viento' + periodAttrSelector).find('direccion').text(),
                  speed: $dia.find('viento' + periodAttrSelector).find('velocidad').text()
                },
                // racha_max
                temperature: $dia.find('temperatura').find('dato').eq(realIndex).text() || '-'
                // sens_termica = temp
                // humedad_relativa = temp
              });
            }
            realIndex += 1;
          }
        });
        return hours;
      },
      dayForecastSnowLevel: function ($dia) {
        var snowLevelProv = $dia.find('cota_nieve_prov[periodo="00-24"], cota_nieve_prov:not([periodo])').text();
        return (!_.isEmpty(snowLevelProv)) ? snowLevelProv : null;
      },
      dayForecastMaxUv: function ($dia) {
        return $dia.find('uv_max').text();
      },
      dayForecastMinAndMax: function ($dia, tag) {
        var $temperatura = $dia.find(tag);
        return {
          min: $temperatura.find('minima').text(),
          max: $temperatura.find('maxima').text()
        };
      },
      dayForecast: function ($dia, currentHour, dayIndex) {
        return {
          temperatureMinMax: fn.dayForecastMinAndMax($dia, 'temperatura'),
          maxUv: fn.dayForecastMaxUv($dia),
          hours: fn.dayForecastByHours($dia, currentHour, dayIndex),
          snowLevel: fn.dayForecastSnowLevel($dia),
          humidityMinMax: fn.dayForecastMinAndMax($dia, 'humedad_relativa')
        };
      },
      days: function (currentDate) {
        var days = [],
          currentIndex = 0;
        fn.$xml.find('dia').each(function (index, dia) {
          var date = $(dia).attr('fecha'),
            slicedDate = date.split('-');
          if (index > 0 || parseInt(slicedDate[2], 10) === currentDate.currentDay) {
            days.push({
              date: date,
              formattedDate: Globalize.format(new Date(parseInt(slicedDate[0], 10), (parseInt(slicedDate[1], 10) - 1), parseInt(slicedDate[2], 10)), "dddd d 'de' MMMM"),
              forecast: fn.dayForecast($(dia), currentDate.currentHour, currentIndex)
            });
            currentIndex += 1;
          }
        });
        return days;
      },
      about: function () {
        var $origen = fn.$xml.find('origen');
        return {
          author: $origen.find('productor').text(),
          link: $origen.find('enlace').text()
        };
      },
      created: function () {
        var elaborated = fn.$xml.find('elaborado').text().split('T'),
          elaboratedDate = elaborated[0].split('-'),
          elaboratedHour = elaborated[1].split(':'),
          date = new Date(elaboratedDate[0], parseInt(elaboratedDate[1], 10) - 1, elaboratedDate[2], parseInt(elaboratedHour[0], 10), parseInt(elaboratedHour[1], 10), parseInt(elaboratedHour[2], 10));

        return Globalize.format(date, "HH:mm (d 'de' MMMM 'de' yyyy)");
      },
      create: function (xml, currentDate) {
        fn.$xml = xml;
        json.days = fn.days(currentDate);
        json.locationName = $(xml).find('nombre').text();
        json.regionName = $(xml).find('provincia').text();
        //json.created = Globalize.format($(xml).find('elaborado').text().replace('T', ' '), "HH:mm (d 'de' MMMM 'de' yyyy)");
        json.created = fn.created();
        json.about = fn.about();
        return json;
      }
    };
  return {
    parse: function (xml, currentDate) {
      return fn.create(xml, currentDate);
    }
  };
}());


$Q.Search = Backbone.Model.extend({
  defaults: {
    locations: null
  }
});

$Q.Detail = Backbone.Model.extend({
  defaults: {
    locations: null
  }
});

$Q.DetailView = Backbone.View.extend({
  events: {
    'click [data-add-bookmark]': 'addBookmark',
    'click [data-remove-bookmark]': 'removeBookmark'
  },
  locationName: null,
  initialize: function () {
    this.model = new $Q.Detail();
    this.model.url = $Q.apiPath + 'api/detail.php';
    this.loadPage();
  },
  loadPage: function () {
    var self = this;
    this.model.fetch({
      success: function (model, response) {
        self.render();
      },
      error: function () {
        //alert('error!!')
      }
    });
  },
  render: function () {
    var self = this;
    this.model.toJSON();
    self.$el.html(_.tmpl('#tmpl-loading'));
    $.ajax({
      type: "GET",
      url: $Q.apiPath + "api/xml.php?location_id=" + this.id,
      dataType: "xml",
      success: function (xml) {
      //console.log($Q.xml.parse($(xml)))
        var parsedXml = $Q.xml.parse($(xml), {currentHour: parseInt(self.model.get('hour'), 10), currentDay: parseInt(self.model.get('day'), 10)}),
          template = _.tmpl('#tmpl-detail', $.extend(true, {}, parsedXml, {isBookmarked: self.isBookmarked()}));
        self.locationName = parsedXml.locationName;
        $(self.$el).html(template).trigger('create');
        _.positionTo('#page-content');
      }
    });
  },
  isBookmarked: function () {
    if ($Q.supported.html5.storage) {
      return _.contains(_.getStorageLocations(), this.id);
    } else {
      return false;
    }
  },
  addBookmark: function () {
    if ($Q.supported.html5.storage) {
      var locations = JSON.parse(localStorage.getItem('appData')).locations.concat([this.id]),
        locationsName = JSON.parse(localStorage.getItem('appData')).locationsName.concat([this.locationName]),
        json = JSON.stringify({locations: locations, locationsName: locationsName});
      localStorage.setItem('appData', json);
      this.changeBookmark();
    }
  },
  removeBookmark: function () {
    if ($Q.supported.html5.storage) {
      var locations = _.getStorageLocations(),
        locationsName = _.getStorageLocationsName(),
        indexLocation = locations.indexOf(this.id),
        json;

      locations.splice(indexLocation, 1);
      locationsName.splice(indexLocation, 1);
      json = JSON.stringify({locations: locations, locationsName: locationsName});
      localStorage.setItem('appData', json);
      this.changeBookmark();
    }
  },
  changeBookmark: function () {
    this.$el.find('[data-bookmark]').html(_.tmpl('#tmpl-bookmarks', {isBookmarked: this.isBookmarked()})).trigger('create');
    $Q.views.bookmarks.render({reload: true});
  }
});

$Q.BookmarksView = Backbone.View.extend({
  events: {
    'click [data-bookmark]': 'navigate'
  },
  initialize: function () {
    this.render({reload: false});
  },
  render: function (data) {
    this.$el.empty();
    var template = _.tmpl("#tmpl-bookmarks-list", {locations: _.getStorageLocations(), locationsName: _.getStorageLocationsName()});
    this.$el.html(template)
    if (data.reload) {
      this.$el.children('[data-bookmarks-list]').trigger('create');
    }  
  },
  navigate: function (ev) {
    ev.preventDefault();
    var url = $(ev.currentTarget).attr('data-href');
    $Q.app_router.navigate(url, {trigger: true});
  },
});


$Q.SearchView = Backbone.View.extend({
  events: {
    'click input[type=button]': 'doSearch',
    'click [data-result]': 'hideSearchResultsAndNavigate',
    'keyup #search-terms': 'beforeDoSearch',
    'click .ui-input-clear': 'emptySearch',
    'submit form': 'avoidSubmit',
    'click [data-install-ff-os]': 'ffOsInstall',
    'click [data-close-install-ff-os]': 'ffOsHideInstall'

  },
  searchInput: '#search-terms',
  isSearching: false,
  queuedSearching: false,
  initialize: function () {
    this.model = new $Q.Search();
    this.render();
  },
  loadPage: function () {
    var self = this;
    this.$el.find('#quick-results').html(_.tmpl('#tmpl-loading'));
    this.getModelUrl();
    this.model.fetch({
      success: function (model, response) {
        self.render();
      },
      error: function () {
        //alert('error!!')
      }
    });
  },
  render: function () {
    var model = this.model.toJSON(),
      template;

    if (!this.$el.find('#quick-search').length) {
      template = _.tmpl("#tmpl-quick-search", model);
      this.$el.html(template).find(this.searchInput).attr('value', this.model.get('searched'));
    } else {
      this.$el.find('#quick-results').html(_.tmpl('#tmpl-quick-results', {locations: this.model.get('locations')})).trigger('create');
    }
    this.isSearching = false;
  },
  hideSearchResultsAndNavigate: function (ev) {
    ev.preventDefault();
    var url = $(ev.currentTarget).attr('data-href');
    $(ev.currentTarget).closest('ul').remove();

    $Q.app_router.navigate(url, {trigger: true});
  },
  getModelUrl: function () {
    this.model.url = $Q.apiPath + 'api/search.php?location_name=' + $(this.searchInput).val();
  },
  emptySearch: function (ev) {
    this.$el.find('#quick-results').empty();
  },
  beforeDoSearch: function (ev) {
    var self = this;
    if (!this.isSearching && $(ev.currentTarget).val().length > 2) {
      this.isSearching = true;
      this.loadPage();
    } else if (this.isSearching && !this.queuedSearching && $(ev.currentTarget).val().length > 2) {
      this.queuedSearching = true;
      setTimeout(function () {
        self.isSearching = true;
        self.queuedSearching = false;
        self.loadPage();
      }, 250)
    } else {
      this.emptySearch();
    }
  },
  doSearch: function (ev) {
    this.loadPage();
  },
  avoidSubmit: function (ev) {
    ev.preventDefault();
    this.beforeDoSearch();
  },
  ffOsInstall: function (ev) {
    var request = window.navigator.mozApps.install(window.location.protocol + '//' + window.location.host + window.location.pathname + 'manifest.webapp');
    request.onsuccess = function () {
      // Save the App object that is returned
      var appRecord = this.result;
      alert('Installation successful!');
    };
    request.onerror = function () {
      // Display the error information from the DOMError object
      alert('Install failed, error: ' + this.error.name);
    };
  },
  ffOsHideInstall: function (ev) {
    $(ev.currentTarget).closest('[data-install-ff-os-area]').remove();
  }
});


$Q.AppRouter = Backbone.Router.extend({
  routes: {
    "localidad/:id": "locationDetail",
    "*actions": "defaultRoute"
  },

  locationDetail: function (id) {
    if (!_.isEmpty($Q.views.detail)) {
      $Q.views.detail.undelegateEvents();
    }
    $Q.views.detail = new $Q.DetailView({
      id: id,
      el: $("#page-content")
    });
  },
  defaultRoute: function (actions) {
    return false;
  }
});

// Views object
$Q.views = {};

// Instantiate the router, and default views
$Q.app_router = new $Q.AppRouter();
$Q.views.search = new $Q.SearchView({
  el: $("#search-quick")
});
$Q.views.bookmarks = new $Q.BookmarksView({
  el: $("#bookmark-list")
});
Backbone.history.start();