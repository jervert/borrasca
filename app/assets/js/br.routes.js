(function() {
  $Q.AppRouter = Backbone.Router.extend({
    routes: {
      "localidad/:id/:locationUrl": "locationDetail",
      "aqui-y-ahora": "nowAndHere",
      "instalar/:platform": "install",
      "iconos": "icons",
      "inicio": "defaultRoute",
      "*actions": "defaultRoute"
    },

    createMainView: function (callback) {
      if (_.isEmpty($Q.views.mainView)) {
        Q((function () {
          if (!_.isEmpty($Q.views.home)) {
            $Q.views.home.remove();
            $Q.views.home = null;
          }
          $Q.views.mainView = new $Q.MainView();
        }())).then(callback());
      } else {
        callback();
      }
    },
    destroyMainView: function (callback) {
      if (!_.isEmpty($Q.views.mainView)) {
        Q((function () {
          $Q.views.mainView.remove();
          $Q.views.mainView = null;
        }())).then(callback());
      } else {
        callback();
      }
    },

    locationDetail: function (id, locationUrl) {
      this.createMainView(function () {
        if (!_.isEmpty($Q.views.detail)) {
          $Q.views.detail.undelegateEvents();
        }
        $Q.views.detail = new $Q.DetailView({
          id: id,
          locationUrl: locationUrl
        });
      });
    },
    icons: function () {
      this.createMainView(function () {
        $Q.views.icons = new $Q.IconsView();
      });
    },
    install: function (platform) {
      this.createMainView(function () {
        $Q.views.install = new $Q.InstallView({
          platform: platform
        });
      });
    },
    nowAndHere: function () {
      //return false;
      this.createMainView(function () {
        if (!_.isNull($Q.geolocation)) {
          Q($("#content-area").html(_.tmpl('#tmpl-now-and-here-container'))).then($Q.views.nowAndHere = new $Q.NowAndHereView());
        }
      });
    },
    defaultRoute: function (actions) {
      this.destroyMainView(function () {
        $Q.views.home = new $Q.HomeView();
      });
    }
  });
}());