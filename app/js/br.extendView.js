(function() {
  $Q.ExtendViewModel = Backbone.Model.extend({
    defaults: {}
  });
  $Q.extendView = Backbone.View.extend({
    coreEvents: {
      'click [data-refresh]': 'refreshPage'
    },
    initialize: function (options) {
      this.options = options || {};
      $Q.utils.mergeEvents(this);
      if (_.isFunction(this.afterInitialize)) {
        this.afterInitialize();
      }
    },
    refreshPage: function () {
      this.$el.html(_.c_loading());
      if (_.isFunction(this.onRefreshPage)) {
        this.onRefreshPage();
      } else {
        this.loadPage();
      }
    },
    remove: function() {
      this.$el.empty();
      this.undelegateEvents();
      return this;
    },
    navigate: function (ev) {
      $Q.utils.navigate(ev);
    },
    loadPage: function () {
      var self = this;
      this.model.fetch({
        success: function (model, resp) {
          if (_.isFunction(self.onSuccess)) {
            self.onSuccess();
          } else {
            self.pageLoaded();
          }
        },
        error: function (model, resp) {
          if (_.isFunction(self.onError)) {
            self.onError();
          } else {
            self.$el.html(_.c_message_error({
              reloadButton: true
            }));
          }
        }
      });
    },
    pageLoaded: function () {
      this.render();
    },
    render: function () {
      if (_.isFunction(this.beforeRender)) {
        this.beforeRender();
      }

      this.$el.html(_.tmpl(this.tmpl, this.model.toJSON()));
      if (this.$el.find('.adsbygoogle.borrasca-next').length > 0 && $Q.adsense.enabled) {
        (adsbygoogle = window.adsbygoogle || []).push({});
      }
      this.removeLoading();

      if (_.isFunction(this.afterRender)) {
        this.afterRender();
      }
      return this;
    },
    removeLoading: function () {
      if ($('#initial-loading').length > 0) {
        $('#initial-loading').remove();
        $('#page-area').removeClass('hidden');
      }
      this.$el.find('.loading').remove();
    }
  });
}());
