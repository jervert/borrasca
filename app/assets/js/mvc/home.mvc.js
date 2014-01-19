(function() {
  $Q.HomeView = $Q.extendView.extend({
    el: '#page-area',
    tmpl: '#tmpl-home',
    events: {
      'click [data-link]': 'navigate'
    },
    afterInitialize: function () {
      var self = this;
      this.model = new $Q.ExtendViewModel();
      this.model.url = $Q.services.main + 'null';
      if (!_.isNull($Q.geolocation)) {
        this.model.url = $Q.services.main + $Q.geolocation.latitude + ',' + $Q.geolocation.longitude + _.avoidCacheParam();
        this.loadPage();
      }
      //this.pageLoaded();
    },
    beforeRender: function () {
      $(document.body).addClass('home');
      this.setStorageLocationsToModel();
    },
    afterRender: function () {}
  });
}());