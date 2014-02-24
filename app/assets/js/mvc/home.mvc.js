(function() {
  $Q.HomeView = $Q.extendView.extend({
    el: '#page-area',
    tmpl: '#tmpl-home',
    searchResults: '#results-area',
    searchResultsTmpl: '#tmpl-home-search-results',
    searchInput: '#c-home-search',
    events: {
      'click [data-link]': 'navigate',
      'submit [data-search-form]': 'doSearch',
      'click [data-search-button]': 'doSearch'
    },
    afterInitialize: function () {
      var self = this;
      this.model = new $Q.ExtendViewModel();
      this.model.url = $Q.services.main + 'null';
      if (!_.isNull($Q.geolocation)) {
        this.model.url = $Q.services.main + $Q.geolocation.latitude + ',' + $Q.geolocation.longitude + _.avoidCacheParam();
        this.loadPage();
      } else {
        this.model.set({now: null}, {silent: true});
        this.pageLoaded();
      }
    },
    beforeRender: function () {
      $(document.body).addClass('home').addClass('variant-' + _.randomInInterval(1, 6));
      this.setStorageLocationsToModel();
    },
    afterRender: function () {},
    getModelUrl: function () {
      this.model.url = $Q.services.search + $(this.searchInput).val() + _.avoidCacheParam();
    },
    doSearch: function (ev) {
      ev.preventDefault();
      var self = this;
      this.$el.find(this.searchResults).html(_.c_loading());
      this.getModelUrl();
      this.model.fetch({
        success: function (model, response) {
          self.$el.find(self.searchResults).html(_.tmpl(self.searchResultsTmpl, {locations: self.model.get('locations')}));
        },
        error: function () {
          self.$el.find(self.searchResults).html(_.c_message_error());
        }
      });
    },
  });
}());