$Q.BookmarksViewModel = Backbone.Model.extend({
  defaults: {}
});

$Q.BookmarksView = $Q.extendView.extend({
  tmpl: '#tmpl-bookmarks-list',
  beforeRender: function () {
    this.model = new $Q.BookmarksViewModel();
    this.model.set({
      locations: _.getStorageLocations(),
      locationsName: _.getStorageLocationsName()
    }, {silent: true});
  }
});