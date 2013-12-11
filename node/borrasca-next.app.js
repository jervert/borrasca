var http = require('http'),
  fs = require('fs'),
  colors = require('colors'),
  sqlite3 = require('sqlite3').verbose(),
  events = require('events'),
  url = require('url'),
  request = require('request'),
  Buffer = require('buffer').Buffer,
  Iconv  = require('iconv').Iconv,
  moment = require('moment'),
  _ = require('underscore'),
  eventEmitter = new events.EventEmitter(),
  initializeDb,
  queryDb,
  getLocation,
  serveXml,
  db,
  server,
  serveFile,
  getFileType,
  getDetail,
  config;
  
config = {
  listen: 9000
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





initializeDb = function () {
  console.log('sqlite3...'.data);
  db = new sqlite3.Database('services/locations.sqlite', 'OPEN_READONLY', function (err) {
    if (err !== null) {
      console.log('Database error!!!'.error.bold);
    } else {
      console.log('Database loaded.'.info);
    }
  });
};

queryDb = function (query) {
  var queryResult = [],
    comma,
    limit = 10;
  db.each("SELECT id_region, id_location, name_location FROM locations WHERE name_location LIKE '%" + query +"%' LIMIT " + limit, function(err, row) {
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
  
};

getLocation = function (req, res, params) {
  eventEmitter.on('queryComplete', function (stream) {
    res.writeHead(200, {'Content-Type': 'text/json'});
    res.end(stream);
  });
  queryDb(params.location_name);
};

getFileType = function (pathname) {
  var extension = _.last(pathname.split('.')).split('?')[0],
    mimeType;
  
  switch (extension) {
    case 'css':
      mimeType = 'text/css';
      break;
    case 'js':
      mimeType = 'text/javascript';
      break;
    case 'jpg':
      mimeType = 'image/jpeg';
      break;
    case 'png':
      mimeType = 'image/png';
      break;
    case 'gif':
      mimeType = 'image/gif';
      break;
    case 'ico':
      mimeType = 'image/x-icon';
      break;
    case 'json':
      mimeType = 'text/json';
      break;
    case 'txt':
      mimeType = 'text/plain';
      break;
    case 'xml':
      mimeType = 'text/xml';
      break;
    default:
      mimeType = 'text/html';
      break;
  }
  return mimeType;
}

serveFile = function (req, res, pathname) {
  pathname = pathname.substr(1);
  fs.readFile(pathname, function (err, data) {
    if (err) throw err;
    res.writeHead(200, {'Content-Type': getFileType(pathname)});
    res.end(data);
  });
};

serveXml = function (req, res, params) {
  //var url = 'http://localhost/borrasca_v2/localidad_49050.xml';
  var url = 'http://www.aemet.es/xml/municipios/localidad_' + params.xml + '.xml';
  console.log('XML url: ' + url + ''.info);

  request({uri: url, encoding: 'binary'}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var buffer = new Buffer(body, 'binary'),
        iconv = new Iconv('iso-8859-15', 'utf-8'),
	xml = iconv.convert(buffer).toString('UTF-8').replace('ISO-8859-15','UTF-8');
      res.writeHead(200, {'Content-Type': 'application/xml'});
      res.end(xml);
    }
  })
 
}


getDetail = function (req, res, params) {
  var hour = moment().utc().hour() - (moment().zone() / 60),
    detailJson;
    
  if (hour === 24) {
    hour = 0;
  }
  detailJson = JSON.stringify({
    hour: hour,
    day: moment().date()
  });
  res.writeHead(200, {'Content-Type': 'text/json; charset=ISO-8859-15'});
  res.end(detailJson);
};


initializeDb();

http.createServer(function (req, res) {
  req.setEncoding('utf8');
  var urlParsed = url.parse(req.url, true),
    params = url.parse(req.url, true).query;
    //console.log(urlParsed);
    
  if (typeof params === 'object' && params.location_name !== undefined) {
    getLocation(req, res, params);
  } else if (typeof params === 'object' && params.detail !== undefined) {
    getDetail(req, res, params);
  } else if (typeof params === 'object' && params.xml !== undefined) {
    serveXml(req, res, params);
  } else if (urlParsed.pathname === '/index.html' || urlParsed.pathname === '/') {
    console.log('Load index.html...'.info)
    serveFile(req, res, '/index.html');
  } else {
    serveFile(req, res, urlParsed.pathname);
    console.log('Load ' + urlParsed.pathname.info)
  }
}).listen(config.listen);
server = 'Server running at http://127.0.0.1:' + config.listen + '/';
console.log(server.success.bold);