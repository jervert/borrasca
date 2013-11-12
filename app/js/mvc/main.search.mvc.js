$Q.SearchViewModel = Backbone.Model.extend({
  defaults: {}
});
$Q.SearchView = Backbone.View.extend({
  el: $('#search-area'),
  events: {
    'click [data-button-search]': 'doSearch',
    'click [data-result]': 'hideSearchResultsAndNavigate',
    'keyup #c_location_search': 'beforeDoSearch',
    'click [data-button-clear]': 'emptySearchInput',
    'submit form': 'avoidSubmit'
  },
  searchInput: '#c_location_search',
  searchResults: '#search-results',
  isSearching: false,
  queuedSearching: false,
  initialize: function () {
    this.model = new $Q.SearchViewModel();
  },
  loadPage: function () {
    var self = this;
    this.$el.find(this.searchResults).html(_.c_loading());
    this.getModelUrl();
    this.model.fetch({
      success: function (model, response) {
        self.render();
      },
      error: function () {
        self.$el.find(self.searchResults).html(_.c_message_error());
      }
    });
  },
  render: function () {
    var model = this.model.toJSON(),
      template,
      searchResults = this.$el.find(this.searchResults);
    if (this.$el.find('#search').length) {
      searchResults.html(_.tmpl('#tmpl-search-results', {locations: this.model.get('locations')}));
      this.isSearching = false;
    } else {
      this.$el.append(_.tmpl('#tmpl-search', {}));
    }
    
  },
  getModelUrl: function () {
    this.model.url = $Q.services.search + $(this.searchInput).val() + _.avoidCacheParam();
  },
  avoidSubmit: function (ev) {
    ev.preventDefault();
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
  emptySearchInput: function (ev) {
    this.$el.find(this.searchInput).val('');
    this.emptySearch(ev);
  },
  emptySearch: function (ev) {
    this.$el.find(this.searchResults).empty();
  },
  hideSearchResultsAndNavigate: function (ev) {
    ev.preventDefault();
    var url = $(ev.currentTarget).attr('data-href');
		$Q.loading();
    $Q.ui.menuCollapse();
    this.emptySearchInput();
    $(ev.currentTarget).closest('.list-group').remove();
    $Q.app_router.navigate(url, {trigger: true});
  }
});