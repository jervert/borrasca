(function() {
  $Q.NowAndHereView = $Q.extendView.extend({
    el: '#now-and-here',
    tmpl: '#tmpl-now-and-here',
    afterInitialize: function () {
      var self = this;
      this.model = new $Q.ExtendViewModel();
      this.model.url = $Q.services.main + 'null';
      if (!_.isNull($Q.geolocation)) {
        this.model.url = $Q.services.main + $Q.geolocation.latitude + ',' + $Q.geolocation.longitude + _.avoidCacheParam();
        this.refreshPage();
      }
    },
    afterRender: function () {
      if ($('#now-and-here-map').length) {
        $Q.ui.locationMap({
          mapElement: $('#now-and-here-map'),
          heightElement: $('.now-and-here-content'),
          autoStart: $Q.maps.autoStart
        }, this.$el);
      }
    }
  });
}());