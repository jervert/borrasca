/*function install(ev) {
  ev.preventDefault();
  // define the manifest URL
  // install the app
  var installLocFind = navigator.mozApps.install(manifest_url);
  installLocFind.onsuccess = function(data) {
    // App is installed, do something
  };
  installLocFind.onerror = function() {
    // App wasn't installed, info is in
    // installapp.error.name
    alert(installLocFind.error.name);
  };
}*/

(function() {
  $Q.InstallView = $Q.extendView.extend({
    tmpl: '#tmpl-install',
    el: '#content-area',
    events: {
      'click [data-install-firefox-os]': 'installFirefoxOS'
    },
    afterInitialize: function () {
      this.model = new $Q.ExtendViewModel();
      this.model.set({platform: this.options.platform}, {silent: true});
      this.pageLoaded();
    },

    installFirefoxOS: function (ev) {
      ev.preventDefault();
      // define the manifest URL
      // install the app
      var installLocFind = navigator.mozApps.install($Q.platforms.firefoxOS.url);
      installLocFind.onsuccess = function(data) {
        // App is installed, do something
        alert('Installed!')
      };
      installLocFind.onerror = function() {
        // App wasn't installed, info is in
        // installapp.error.name
        alert(installLocFind.error.name);
      };
    }
  }); 
}());