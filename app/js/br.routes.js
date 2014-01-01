(function() {
  $Q.AppRouter = Backbone.Router.extend({
    routes: {
      "localidad/:id/:locationUrl": "locationDetail",
      "aqui-y-ahora": "defaultRoute",
      "instalar/:platform": "install",
      "iconos": "icons",
      "*actions": "defaultRoute"
    },

    locationDetail: function (id, locationUrl) {
      if (!_.isEmpty($Q.views.detail)) {
        $Q.views.detail.undelegateEvents();
      }
      $Q.views.detail = new $Q.DetailView({
        id: id,
        locationUrl: locationUrl
      });
    },
    icons: function () {
      $Q.views.icons = new $Q.IconsView();
    },
    install: function (platform) {
      $Q.views.install = new $Q.InstallView({
        platform: platform
      });
    },
    defaultRoute: function (actions) {
      //return false;
      if (!_.isNull($Q.geolocation)) {
        $.when($("#content-area").html(_.tmpl('#tmpl-now-and-here-container'))).then($Q.views.nowAndHere = new $Q.NowAndHereView());
      }
    }
  });
}());