_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g,
  evaluate: /\[\[(.+?)\]\]/g
};

_.mixin({
  tmpl: function (id, context) {
    var html = $.trim($(id).html());
    return _.template(html, context);
  },
  support_html5_storage: function () {
    try {
      //return 'localStorage' in window && window['localStorage'] !== null;
      return window.localStorage && window.localStorage !== null;
    } catch (e) {
      return false;
    }
  },
  support_geolocation: function () {
    return ("geolocation" in navigator) ? true : false;
  },
  getStorageLocations: function () {
    return JSON.parse(localStorage.getItem('appData')).locations;
  },
  getStorageLocationsName: function () {
    return JSON.parse(localStorage.getItem('appData')).locationsName;
  },
  positionTo: function (element) {
    $(_.tmpl('#tmpl-link-to-detail', {element: element})).sliceAnchor().trigger('click');
  },
  abbr: function (str, settings) {
    var defaults = {
      abbrLength: 3
    },
    op = $.extend(true, {}, defaults, settings),
    firstWord = str.split(' ')[0],
    firstWordLength = firstWord.length,
    lastStr = str.substr(firstWordLength),
    firstStr = firstWord.substr(0, op.abbrLength),
    secondStr = firstWord.substr(op.abbrLength);
    
    return [firstStr, secondStr, lastStr];
  },
	hour: function (time) {
		return Globalize.format(new Date(time * 1000), 't');
	},
  windFrom: function (deg) {
    var directionFrom;

    if ((deg >= 0 && deg < 22.5) || deg >= 337.5) {
      directionFrom = [$Q.literals.wind.directions.n, $Q.literals.wind.directionsAbbr.n];
    } else if (deg >= 22.5 && deg < 67.5) {
      directionFrom = [$Q.literals.wind.directions.nw, $Q.literals.wind.directionsAbbr.nw];
    } else if (deg >= 67.5 && deg < 112.5) {
      directionFrom = [$Q.literals.wind.directions.w, $Q.literals.wind.directionsAbbr.w];
    } else if (deg >= 112.5 && deg < 157.5) {
      directionFrom = [$Q.literals.wind.directions.sw, $Q.literals.wind.directionsAbbr.sw];
    } else if (deg >= 157.5 && deg < 202.5) {
      directionFrom = [$Q.literals.wind.directions.s, $Q.literals.wind.directionsAbbr.s];
    } else if (deg >= 202.5 && deg < 247.5) {
      directionFrom = [$Q.literals.wind.directions.se, $Q.literals.wind.directionsAbbr.se];
    } else if (deg >= 247.5 && deg < 292.5) {
      directionFrom = [$Q.literals.wind.directions.e, $Q.literals.wind.directionsAbbr.e];
    } else if (deg >= 292.5 && deg < 337.5) {
      directionFrom = [$Q.literals.wind.directions.ne, $Q.literals.wind.directionsAbbr.ne];
    }
    return {
      direction: directionFrom[0],
      directionAbbr: directionFrom[1]
    };
  },
  windMsToKms: function (speed) {
    return Globalize.format((parseFloat(speed) * 3.6), "n1" );
  },
  avoidCacheParam: function () {
    return '&version=' + Date.now();
  }
});