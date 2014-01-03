var appServer = (function() {
  String.prototype.replaceArray = function(find, replace) {
    var replaceString = this;
    for (var i = 0; i < find.length; i++) {
      replaceString = replaceString.replace(find[i], replace[i]);
    }
    return replaceString;
  };
  var http = require('http'),
    fs = require('fs'),
    colors = require('colors'),
    sqlite3 = require('sqlite3').verbose(),
    events = require('events'),
    url = require('url'),
    request = require('request'),
    Buffer = require('buffer').Buffer,
    iconv  = require('iconv-lite'),
    moment = require('moment'),
    _ = require('underscore'),
    path = require('path'),
    eventEmitter = new events.EventEmitter(),
    config,
    replaceable;
    
  config = {
    listen: 9000,
    paths: {
      ddbb: __dirname + '/../data/locations.sqlite'
    }
  };
  
  replaceable = {
    weirdCharacters: ['á', 'é', 'í', 'ó', 'ú', 'ü', 'à', 'è', 'ì', 'ò', 'ù', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ü', 'À', 'È', 'Ì', 'Ò', 'Ù'],
    safeCharacters:  ['a', 'e', 'i', 'o', 'u', 'u', 'a', 'e', 'i', 'o', 'u', 'a', 'e', 'i', 'o', 'u', 'u', 'a', 'e', 'i', 'o', 'u']
  }

  colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
    success: 'green'
  });

  
  
  var server = {
    db: null,
    getFileType: function (pathname) {
      var extension = _.last(pathname.split('.')).split('?')[0],
        extensions = {
          css: 'text/css',
          js: 'text/javascript',
          jpg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          svg: 'image/svg+xml',
          ico: 'image/x-icon',
          json: 'text/json',
          txt: 'text/plain',
          xml: 'text/xml',
          html: 'text/html',
          woff: 'application/x-font-woff',
          defaultExtension: 'text/html'
        };
     
      return (extensions[extension] !== undefined) ? extensions[extension] : extensions.defaultExtension;
    },
    getLocation: function (req, res, params) {
      eventEmitter.on('queryComplete', function (stream) {
        res.writeHead(200, {'Content-Type': 'text/json'});
        res.end(stream);
      });
      server.queryDb(params.location_name);
    },
    nowData: function (type, location, language, geolocationParam, baseObject, req, res, params) {
      var openweathermapsApiKey = null,
        geolocation = geolocationParam.split(','),
        baseUrl = 'http://api.openweathermap.org/data/2.5/weather/',
        url,
        urlParams;
        
        if (type === 'detail') {
          urlParams = '?q=' + location + ',es&units=metric&mode=json&lang=' + language + '&APPID=' + openweathermapsApiKey;
        } else {
          urlParams = '?lat=' + geolocation[0] + '&lon=' + geolocation[1] + '&units=metric&mode=json&lang=' + language + '&APPID=' + openweathermapsApiKey;
        }
        url = baseUrl + urlParams;
        console.log(url.yellow)
        
        
        request({uri: url}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          nowJson = JSON.stringify(_.extend({}, baseObject, {now: JSON.parse(body)}));
          res.writeHead(200, {'Content-Type': 'text/json; charset=ISO-8859-15'});
          res.end(nowJson);
        }
      });
    },
    getNowAndHere: function (req, res, params) {
      server.nowData('index', null, 'en', params.geolocation, {}, req, res, params);
    },
    getDetail: function (req, res, params) {
      var hour = moment().utc().hour() - (moment().zone() / 60),
        detailJson;
        
      if (hour === 24) {
        hour = 0;
      }
      
      detailJson = {
        hour: hour,
        day: moment().date()
      };
      
      server.nowData('detail', params.location_name, 'en', '0,0', detailJson, req, res, params);
    },
    serveXml: function (req, res, params) {
      //var url = 'http://localhost/borrasca_v2/localidad_49050.xml';
      var url = 'http://www.aemet.es/xml/municipios/localidad_' + params.xml + '.xml';
      //console.log('XML url: ' + url + ''.info);

      request({uri: url, encoding: 'binary'}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var buffer = new Buffer(body, 'binary'),
          xml = iconv.decode(buffer, 'utf8');
          res.writeHead(200, {'Content-Type': 'application/xml'});
          res.end(xml);
        }
      })
     
    },
    serveFile: function (req, res, pathname) {
      pathname = path.join(path.dirname(require.main.filename).replace('node', 'app'), pathname.substr(1));
      console.log(pathname)
      fs.readFile(pathname, function (err, data) {
        if (err) {
          res.writeHead(404);
        } else {
          res.writeHead(200, {'Content-Type': server.getFileType(pathname)});
        }
        res.end(data);
      });
    },
    fixUserInput: function (query) {
      console.log('SEARCHED: ' + query.toLowerCase().replaceArray(replaceable.weirdCharacters, replaceable.safeCharacters))
      return query.toLowerCase().replaceArray(replaceable.weirdCharacters, replaceable.safeCharacters);
    },
    queryDb: function (userQuery) {
      var queryResult = [],
        comma,
        query = server.fixUserInput(userQuery),
        limit = 10;

      server.db.each("SELECT id_region, id_location, name_location FROM locations WHERE name_searchable LIKE '%" + query +"%' LIMIT " + limit, function(err, row) {
        if (err !== null) {
          console.log('Query database error!!!'.error.bold);
        } else {
          queryResult.push({name: row.name_location, link: row.id_region + row.id_location}); //row.id_region + row.id_location + ": " + row.name_location + '\n';
          comma = ',';
        }
      }, function (err, num) {
        var result = {result: "OK", searched: query, result_message: "Results fetched", "locations": queryResult};
        if (num > 0) {
          console.log('Search: ' + num + ' results fetched'.info)
          console.log(result)
        } else {
          console.log('Search: No results fetched'.info)
        }
        
        eventEmitter.emit('queryComplete', JSON.stringify(result));
      });
      
    },
    initializeDb: function () {
      console.log('sqlite3...'.data);
      server.db = new sqlite3.Database(config.paths.ddbb, 'OPEN_READONLY', function (err) {
        if (err !== null) {
          console.log('Database error!!!'.error.bold);
        } else {
          console.log('Database loaded.'.info);
        }
      });
    },
    createServer: function () {
      server.initializeDb();
      http.createServer(function (req, res) {
        req.setEncoding('utf8');
        var urlParsed = url.parse(req.url, true),
          params = url.parse(req.url, true).query;
          //console.log(urlParsed);
          
        if (typeof params === 'object' && params.location_name !== undefined && params.detail === undefined) {
          server.getLocation(req, res, params);
        } else if (typeof params === 'object' && params.detail !== undefined) {
          server.getDetail(req, res, params);
        } else if (typeof params === 'object' && params.xml !== undefined) {
          server.serveXml(req, res, params);
        } else if (typeof params === 'object' && params.geolocation !== undefined) {
          server.getNowAndHere(req, res, params);
        } else if (urlParsed.pathname === '/index.html' || urlParsed.pathname === '/') {
          console.log('Load index.html...'.info)
          server.serveFile(req, res, '/index.html');
        } else {
          server.serveFile(req, res, urlParsed.pathname);
          console.log('Load ' + urlParsed.pathname.info)
        }
      }).listen(config.listen);
      serverLog = 'Server running at http://127.0.0.1:' + config.listen + '/';
      console.log(serverLog.success.bold);
    }
  };
  
  return {
    initialize: function () {
      server.createServer();
    }
  }
})();
appServer.initialize();