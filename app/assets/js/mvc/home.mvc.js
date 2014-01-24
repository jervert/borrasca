(function() {
  $Q.HomeView = $Q.extendView.extend({
    el: '#page-area',
    tmpl: '#tmpl-home',
    searchResults: ''
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
    afterRender: function () {},
    doSearch: function (ev) {
      var self = this;
      this.$el.find(this.searchResults).html(_.c_loading());
      this.getModelUrl();
      this.model.fetch({
        success: function (model, response) {
          //self.render();
        },
        error: function () {
          self.$el.find(self.searchResults).html(_.c_message_error());
        }
      });
    },
  });
}());