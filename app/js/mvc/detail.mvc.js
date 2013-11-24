(function() {
  $Q.DetailView = $Q.extendView.extend({
    tmpl: '#tmpl-detail',
    el: '#content-area',
    tmplGraphic: '#tmpl-detail-graphic',
    elGraphicBox: '#detail-graphic',
    elGraphic: '.graphic',
    events: {
      'click [data-add-bookmark]': 'addBookmark',
      'click [data-remove-bookmark]': 'removeBookmark'
    },
    locationName: null,
    afterInitialize: function () {
      this.model = new $Q.ExtendViewModel();
      this.model.url = $Q.services.detail + this.options.locationUrl;
      this.refreshPage();
    },
    evolutionGraphic: function (parsedXml) {
      var self = this,
        $graphicFigure = $(self.$el).find(this.elGraphicBox),
        graphicParam = this.getGraphicParam(parsedXml);

        $.when($graphicFigure.html(_.tmpl(this.tmplGraphic, {
        external: graphicParam.external,
        series: graphicParam.hightcharts.series
      }))).then($graphicFigure.children(this.elGraphic).first().highcharts(graphicParam.hightcharts));
    },
    getGraphicParam: function (parsedXml) {
      var self = this;
      return {
        external: {
          title: $Q.literals.detail.graphic.temperatureEvolution,
          subtitle: $Q.literals.detail.graphic.sourceOfInfo + ': Aemet.es'
        },
        hightcharts: {
          title: {
            text: null
          },
          subtitle: {
            text: null
          },
          credits: {
            enabled: false
          },
          xAxis: [{
            categories: self.getParsedXmlDays(parsedXml),
            labels: {
              rotation: 0
            }
          }],
          yAxis: [
            {
              labels: {
                formatter: function() {
                  return this.value +'°C';
                },
                style: {
                  color: '#000'
                }
              },
              title: {
                text: $Q.literals.detail.graphic.temperature,
                style: {
                  color: '#000'
                }
              }
            }
          ],
          tooltip: {
            shared: true
          },
          legend: {
            enabled: false
          },
          series: [{
            name: $Q.literals.detail.graphic.minTemperature,
            color: '#0383b3',
            type: 'spline',
            data: self.getParsedXmlTemp(parsedXml, 'min'),
            tooltip: {
              valueSuffix: ' °C'
            }
          },
          {
            name: $Q.literals.detail.graphic.maxTemperature,
            color: '#a71717',
            type: 'spline',
            data: self.getParsedXmlTemp(parsedXml, 'max'),
            tooltip: {
              valueSuffix: ' °C'
            }
          }]
        }
      };
    },
    getParsedXmlDays: function (parsedXml) {
      var days = [];
      _.each(parsedXml.days, function (day) {
        days.push(day.formattedDay);
      });
      return days;
    },
    getParsedXmlTemp: function (parsedXml, type) {
      var temps = [];
      _.each(parsedXml.days, function (day) {
        var temperature = day.forecast.temperatureMinMax[type];
        temps.push(((!_.isNull(temperature)) ? parseInt(temperature) : temperature));
      });
      return temps;
    },
    initSlides: function () {
      var self = this,
        repairPagination,
        repairPaginationIntervalNum;
      $.fn.sliceSlide({
        templatesUrl: 'js/libs/slice-slide/templates.html?' + $Q.version,
        templatesCultureUrl: 'js/libs/slice-slide/cultures/templates_cultures_##CULTURE##.json?' + $Q.version,
        slidesBoxSlideActive: '.active',
        classesActive: 'active',
        autoStart: false,
        loop: false,
        culture: $Q.culture
      });
      repairPagination = setInterval(function () {
        if (self.$el.find('.number-list').length || repairPaginationIntervalNum > 600) {
          clearInterval(repairPagination);
          self.$el.find('.number-list').getChildrenTextNodes().remove();
        }
      }, 50);
    },
    onSuccess: function () {
      var self = this;
      this.model.toJSON();
      $.ajax({
        type: "GET",
        url: $Q.services.xml + this.options.id,
        dataType: "xml",
        success: function (xml) {
          var parsedXml = $Q.aemet.parse($(xml), {currentHour: parseInt(self.model.get('hour'), 10), currentDay: parseInt(self.model.get('day'), 10)}),
            now = self.model.get('now'),
            model = $.extend(true, {}, parsedXml, {locationName: parsedXml.locationName, now: now, isBookmarked: self.isBookmarked(), abbrDays: self.getParsedXmlDays(parsedXml)});

          self.model.set(model, {silent: true});
          self.locationName = parsedXml.locationName;
          self.pageLoaded();
        }
      });
    },
    afterRender: function () {
      var now = this.model.get('now');
      if (!_.isNull (now) && (_.isUndefined(now.message) || (now.message && now.message.indexOf("Error") !== -1))) {
        $Q.ui.locationMap({
          mapElement: $('#location-map'),
          heightElement: $('.current-weather-content'),
          coordinates: [now.coord.lat, now.coord.lon],
          autoStart: $Q.maps.autoStart
        }, this.$el);
      }
      this.initSlides();
      this.evolutionGraphic(this.model.toJSON());
    },
    isBookmarked: function () {
      if ($Q.supported.html5.storage) {
        return _.contains(_.getStorageLocations(), this.options.id);
      } else {
        return false;
      }
    },
    addBookmark: function () {
      if ($Q.supported.html5.storage) {
        var locations = JSON.parse(localStorage.getItem('appData')).locations.concat([this.options.id]),
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
          indexLocation = locations.indexOf(this.options.id),
          json;

        locations.splice(indexLocation, 1);
        locationsName.splice(indexLocation, 1);
        json = JSON.stringify({locations: locations, locationsName: locationsName});
        localStorage.setItem('appData', json);
        this.changeBookmark();
      }
    },
    changeBookmark: function () {
      this.$el.find('[data-bookmark]').html(_.tmpl('#tmpl-bookmarks-buttons', {isBookmarked: this.isBookmarked()}));
      $Q.views.bookmarks.render();
    }
  }); 
}());