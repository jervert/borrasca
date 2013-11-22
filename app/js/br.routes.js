(function() {
  $Q.AppRouter = Backbone.Router.extend({
    routes: {
      "localidad/:id/:locationUrl": "locationDetail",
      "aqui-y-ahora": "defaultRoute",
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
    defaultRoute: function (actions) {
      //return false;
      if (!_.isNull($Q.geolocation)) {
        $.when($("#content-area").html(_.tmpl('#tmpl-now-and-here-container'))).then($Q.views.nowAndHere = new $Q.NowAndHereView());
      }
    }
  });
}());