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
    
    onRefreshPage: function () {
      this.pageLoaded();
    },

    installFirefoxOS: function (ev) {
      var self = this;
      ev.preventDefault();
      var installLocFind = navigator.mozApps.install($Q.platforms.firefoxOS.url);
      installLocFind.onsuccess = function (data) {
        // App is installed, do something
        alert('Installed!')
      };
      installLocFind.onerror = function () {
        var errorName = installLocFind.error.name;
        self.$el.find('[data-content]').html(_.c_message_error({
          text: $Q.literals.install.firefoxOS.error[errorName] + ' ('+ $Q.literals.install.errorCode +': ' + errorName + ').',
          reloadButton: true
        }));
      };
    }
  }); 
}());