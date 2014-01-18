(function() {
  $Q.HomeView = $Q.extendView.extend({
    el: $('#page-area'),
    tmpl: '#tmpl-home',
    events: {
      'click [data-link]': 'navigate'
    },
    afterInitialize: function () {
      var self = this;
      this.model = new $Q.ExtendViewModel();
      this.pageLoaded();
    },
    afterRender: function () {}
  });
}());