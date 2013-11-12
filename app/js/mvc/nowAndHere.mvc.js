(function() {
  $Q.NowAndHereView = $Q.extendView.extend({
    el: '#now-and-here',
    tmpl: '#tmpl-now-and-here',
    events: {
      'click [data-bookmark]': 'navigate'
    },
    afterInitialize: function () {
      var self = this;
      this.model = new $Q.ExtendViewModel();
      this.model.url = $Q.services.main + 'null';
      if (!_.isNull($Q.geolocation)) {
        this.model.url = $Q.services.main + $Q.geolocation.latitude + ',' + $Q.geolocation.longitude + _.avoidCacheParam();
        this.loadPage();
      }
    },
    afterRender: function () {
      $Q.ui.locationMap({
        mapElement: $('#now-and-here-map'),
        heightElement: $('.now-and-here-content')
      });
    }
  });
}());