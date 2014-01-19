(function() {
  $Q.MainView = $Q.extendView.extend({
    el: $('#page-area'),
    tmpl: '#tmpl-main',
    events: {
      'click [data-link]': 'navigate'
    },
    afterInitialize: function () {
      var self = this;
      this.model = new $Q.ExtendViewModel();
      this.pageLoaded();
    },
    beforeRender: function () {
      $(document.body).removeClass('home');
    },
    afterRender: function () {
      $Q.views.searchView = new $Q.SearchView({
        el: $('#search-area')
      });
      $Q.views.searchView.render();
      this.$el.find('[data-toggle="collapse"]').collapse();

      $Q.views.bookmarks = new $Q.BookmarksView({
        el: $("#bookmark-list")
      });
      $Q.views.bookmarks.render();
    }
  });
}());