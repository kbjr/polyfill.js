var

sys = require('sys'),
url = require('url'),
http = require('http'),
path = require('path'),

// Create the http server
server = http.createServer(function(req, res) {



});

// Start listening
var port = process.env.PORT || 3000;
server.listen(port, function() {
	sys.puts('Listening on port ' + port);
});

/* End of file server.js */
