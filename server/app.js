
var http            = require('http');
var config          = require('../config');
var requestHandler  = require('./request-handler');

var server = http.createServer(requestHandler);

server.listen(config.port, '0.0.0.0', function() {
	console.log('Polyfill.js server listening on port ' + config.port);
});
